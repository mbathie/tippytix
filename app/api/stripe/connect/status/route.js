import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();

    if (!user?.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
      });
    }

    try {
      const account = await stripe.accounts.retrieve(user.stripeAccountId);
      return NextResponse.json({
        connected: true,
        onboardingComplete: user.stripeOnboardingComplete,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        accountId: user.stripeAccountId,
      });
    } catch {
      return NextResponse.json({
        connected: false,
        onboardingComplete: false,
        error: 'Failed to retrieve Stripe account',
      });
    }
  } catch (error) {
    console.error('GET /api/stripe/connect/status error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
