import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Event from '@/models/Event';
import Ticket from '@/models/Ticket';
import { getRefundPercentageForEvent, calculateRefundAmount } from '@/lib/fees';
import { sendRefundConfirmationEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order || order.status !== 'succeeded') {
      return NextResponse.json({ message: 'Order not found or not eligible for refund' }, { status: 404 });
    }

    const event = await Event.findById(order.eventId);
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Check refund eligibility based on event policy
    const refundPercentage = getRefundPercentageForEvent(event, event.startDate);
    if (refundPercentage === 0) {
      return NextResponse.json({ message: 'Refunds are no longer available for this event' }, { status: 400 });
    }

    // Calculate refund amount (per ticket, minus $2 handling fee per ticket)
    const { refundAmount } = calculateRefundAmount(order.subtotal, refundPercentage);
    if (refundAmount <= 0) {
      return NextResponse.json({ message: 'Refund amount after handling fee is $0' }, { status: 400 });
    }

    // Process Stripe refund
    try {
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId,
        amount: refundAmount,
      });
    } catch (stripeErr) {
      console.error('Stripe refund error:', stripeErr.message);
      return NextResponse.json({ message: 'Failed to process refund' }, { status: 500 });
    }

    // Update order
    await Order.findByIdAndUpdate(id, {
      status: 'refunded',
      refundedAmount: refundAmount,
      refundedAt: new Date(),
    });

    // Cancel tickets
    await Ticket.updateMany({ orderId: id }, { status: 'refunded' });

    // Restore sold counts
    for (const item of order.items) {
      await Event.findOneAndUpdate(
        { _id: order.eventId, 'ticketCategories._id': item.categoryId },
        { $inc: { 'ticketCategories.$.sold': -item.quantity } }
      );
    }

    // Send confirmation
    await sendRefundConfirmationEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      eventName: event.name,
      orderNumber: order.orderNumber,
      refundAmount,
      originalAmount: order.totalAmount,
    });

    return NextResponse.json({
      success: true,
      refundAmount,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('POST /api/orders/[id]/refund error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
