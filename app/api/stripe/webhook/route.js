import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { sendTicketConfirmationEmail } from '@/lib/email';
import { generateQRCodeDataUrl } from '@/lib/qr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_CONNECTED_SECRET);
    } catch (error2) {
      console.error('Webhook signature verification failed:', error2.message);
      return NextResponse.json({ message: 'Webhook error' }, { status: 400 });
    }
  }

  await connectDB();

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      // Get Stripe fee
      let stripeFee = 0;
      if (paymentIntent.latest_charge) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge, {
            expand: ['balance_transaction'],
          });
          if (charge.balance_transaction) {
            const bt = typeof charge.balance_transaction === 'string'
              ? await stripe.balanceTransactions.retrieve(charge.balance_transaction)
              : charge.balance_transaction;
            stripeFee = bt.fee || 0;
          }
        } catch (err) {
          console.error('[Webhook] Failed to retrieve Stripe fee:', err.message);
        }
      }

      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          status: 'succeeded',
          stripeChargeId: paymentIntent.latest_charge,
          stripeFee,
          netAmount: paymentIntent.amount - stripeFee - (await Order.findOne({ stripePaymentIntentId: paymentIntent.id }))?.platformFee || 0,
        },
        { new: true }
      );

      if (!order) {
        console.error('[Webhook] Order not found for PI:', paymentIntent.id);
        break;
      }

      // Update ticket category sold counts
      const eventDoc = await Event.findById(order.eventId);
      if (eventDoc) {
        for (const item of order.items) {
          const cat = eventDoc.ticketCategories.id(item.categoryId);
          if (cat) {
            cat.sold += item.quantity;
          }
        }
        await eventDoc.save();
      }

      // Transfer to connected account
      const stripeAccountId = paymentIntent.metadata?.stripeAccountId;
      const netAmount = order.totalAmount - stripeFee - order.platformFee;
      if (stripeAccountId && netAmount > 0) {
        try {
          const transfer = await stripe.transfers.create({
            amount: netAmount,
            currency: 'aud',
            destination: stripeAccountId,
            source_transaction: paymentIntent.latest_charge,
            metadata: {
              orderId: order._id.toString(),
              orderNumber: order.orderNumber,
            },
          });
          await Order.findByIdAndUpdate(order._id, {
            stripeTransferId: transfer.id,
            netAmount,
          });
        } catch (err) {
          console.error('[Webhook] Transfer failed:', err.message);
        }
      }

      // Send ticket confirmation email with QR codes
      try {
        const tickets = await Ticket.find({ orderId: order._id }).lean();
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tippytix.app';

        const qrCodeDataUrls = await Promise.all(
          tickets.map(ticket =>
            generateQRCodeDataUrl(`${baseUrl}/api/tickets/${ticket._id}/verify?code=${ticket.qrCode}`)
          )
        );

        await sendTicketConfirmationEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          eventName: eventDoc?.name || 'Event',
          eventDate: eventDoc?.startDate,
          eventVenue: eventDoc?.venue,
          tickets: tickets.map(t => ({
            categoryName: t.categoryName,
            ticketNumber: t.ticketNumber,
          })),
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          qrCodeDataUrls,
        });
      } catch (emailErr) {
        console.error('[Webhook] Failed to send ticket email:', emailErr);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const lastError = paymentIntent.last_payment_error;
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          status: 'failed',
        }
      );
      // Cancel associated tickets
      if (order) {
        await Ticket.updateMany({ orderId: order._id }, { status: 'cancelled' });
      }
      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const order = await Order.findOne({ stripeChargeId: charge.id });
      if (order) {
        const refundAmount = charge.amount_refunded;
        const newStatus = refundAmount >= order.totalAmount ? 'refunded' : 'partially_refunded';
        await Order.findByIdAndUpdate(order._id, {
          status: newStatus,
          refundedAmount: refundAmount,
          refundedAt: new Date(),
        });
        if (newStatus === 'refunded') {
          await Ticket.updateMany({ orderId: order._id }, { status: 'refunded' });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
