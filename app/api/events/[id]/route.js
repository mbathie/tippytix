import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const event = await Event.findOne({ _id: id, userId: session.user.id }).lean();
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Get order stats
    const orders = await Order.find({ eventId: id, status: 'succeeded' }).lean();
    const tickets = await Ticket.find({ eventId: id }).lean();

    const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalFees = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const checkedIn = tickets.filter(t => t.status === 'used').length;

    return NextResponse.json({
      ...event,
      stats: {
        totalOrders: orders.length,
        totalTicketsSold: tickets.length,
        totalRevenue,
        totalFees,
        checkedIn,
      },
    });
  } catch (error) {
    console.error('GET /api/events/[id] error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // Check slug uniqueness if changed
    if (body.slug) {
      const existing = await Event.findOne({ slug: body.slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ message: 'Event URL slug already taken' }, { status: 400 });
      }
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      body,
      { new: true }
    );

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('PUT /api/events/[id] error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const event = await Event.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('DELETE /api/events/[id] error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
