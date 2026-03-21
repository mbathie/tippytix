import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const COUNTRY_CONFIG = {
  AU: { currency: 'aud', routingLabel: 'BSB' },
  US: { currency: 'usd', routingLabel: 'Routing Number' },
  GB: { currency: 'gbp', routingLabel: 'Sort Code' },
  NZ: { currency: 'nzd', routingLabel: 'Bank Code' },
  CA: { currency: 'cad', routingLabel: 'Transit/Institution' },
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.stripeOnboardingComplete) {
      return NextResponse.json({ message: 'Stripe account already connected' }, { status: 400 });
    }

    const body = await request.json();
    if (!body.acceptedTerms) {
      return NextResponse.json({ message: 'You must accept the Terms of Service' }, { status: 400 });
    }

    const country = user.country || 'AU';
    const countryConfig = COUNTRY_CONFIG[country];
    if (!countryConfig) {
      return NextResponse.json({ message: `Unsupported country: ${country}` }, { status: 400 });
    }

    const requiredFields = {
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      addressLine1: user.addressLine1,
      addressCity: user.addressCity,
      addressState: user.addressState,
      addressPostalCode: user.addressPostalCode,
      bankRoutingNumber: user.bankRoutingNumber,
      bankAccountNumber: user.bankAccountNumber,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json({ message: `Missing required fields: ${missingFields.join(', ')}` }, { status: 400 });
    }

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const dob = new Date(user.dateOfBirth);

    try {
      const account = await stripe.accounts.create({
        type: 'custom',
        country,
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        individual: {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          phone: user.phone || undefined,
          dob: {
            day: dob.getDate(),
            month: dob.getMonth() + 1,
            year: dob.getFullYear(),
          },
          address: {
            line1: user.addressLine1,
            line2: user.addressLine2 || undefined,
            city: user.addressCity,
            state: user.addressState,
            postal_code: user.addressPostalCode,
            country,
          },
        },
        business_profile: {
          mcc: '7922', // Theatrical Producers/Ticket Agencies
          name: user.organizationName || user.name || `${user.firstName} ${user.lastName}`,
          url: 'https://tippytix.app',
        },
        tos_acceptance: {
          date: Math.floor(Date.now() / 1000),
          ip: clientIp,
        },
        external_account: {
          object: 'bank_account',
          country,
          currency: countryConfig.currency,
          routing_number: user.bankRoutingNumber.replace(/[-\s]/g, ''),
          account_number: user.bankAccountNumber.replace(/\s/g, ''),
          account_holder_name: user.bankAccountName || `${user.firstName} ${user.lastName}`,
          account_holder_type: 'individual',
        },
      });

      await User.findByIdAndUpdate(session.user.id, {
        stripeAccountId: account.id,
        stripeOnboardingComplete: true,
        stripeTermsAcceptedAt: new Date(),
        stripeTermsAcceptedIp: clientIp,
        bankRoutingNumber: '',
        bankAccountNumber: '',
      });

      return NextResponse.json({
        success: true,
        message: 'Stripe account connected successfully',
        accountId: account.id,
      });
    } catch (stripeError) {
      console.error('Stripe account creation error:', stripeError);
      return NextResponse.json(
        { message: stripeError.message || 'Failed to create Stripe account', error: stripeError.code },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('POST /api/stripe/connect/setup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
