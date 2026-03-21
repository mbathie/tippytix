import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { calculatePlatformFee } from '@/lib/fees';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { eventId, items, customerName, customerEmail, customerPhone, customerAddress } = body;
    // items: [{ categoryId, quantity }]

    if (!eventId || !items?.length || !customerName || !customerEmail) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const event = await Event.findById(eventId);
    if (!event || !event.isActive || event.status !== 'active') {
      return NextResponse.json({ message: 'Event not found or not active' }, { status: 404 });
    }

    const organizer = await User.findById(event.userId);
    if (!organizer) {
      return NextResponse.json({ message: 'Event organizer not found' }, { status: 404 });
    }

    // Validate items and calculate totals
    let subtotal = 0;
    let totalQuantity = 0;
    const orderItems = [];

    for (const item of items) {
      const category = event.ticketCategories.id(item.categoryId);
      if (!category) {
        return NextResponse.json({ message: `Ticket category not found: ${item.categoryId}` }, { status: 400 });
      }

      const remaining = category.quantity - category.sold;
      if (item.quantity > remaining) {
        return NextResponse.json({ message: `Only ${remaining} tickets remaining for ${category.name}` }, { status: 400 });
      }

      subtotal += category.price * item.quantity;
      totalQuantity += item.quantity;
      orderItems.push({
        categoryId: category._id,
        categoryName: category.name,
        quantity: item.quantity,
        unitPrice: category.price,
      });
    }

    const platformFee = calculatePlatformFee(subtotal / totalQuantity, totalQuantity);
    const totalAmount = subtotal + platformFee;

    // Generate order number
    const orderNumber = `TX-${Date.now().toString(36).toUpperCase()}-${uuidv4().slice(0, 4).toUpperCase()}`;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
      metadata: {
        eventId: event._id.toString(),
        organizerId: organizer._id.toString(),
        orderNumber,
        stripeAccountId: organizer.stripeAccountId || '',
      },
    });

    // Create order (pending)
    const order = await Order.create({
      eventId: event._id,
      orderNumber,
      customerName,
      customerEmail,
      customerPhone: customerPhone || '',
      customerAddress: customerAddress || '',
      items: orderItems,
      totalQuantity,
      subtotal,
      platformFee,
      totalAmount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    // Create tickets (pending - will be activated on payment success)
    const ticketDocs = [];
    for (const item of orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = `${orderNumber}-${ticketDocs.length + 1}`;
        const qrCode = uuidv4();
        ticketDocs.push({
          orderId: order._id,
          eventId: event._id,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          ticketNumber,
          qrCode,
          price: item.unitPrice,
          customerName,
          customerEmail,
          status: 'valid',
        });
      }
    }
    await Ticket.insertMany(ticketDocs);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderNumber,
      orderId: order._id,
    });
  } catch (error) {
    console.error('POST /api/stripe/create-payment-intent error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
