import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    // Verify event ownership
    const event = await Event.findOne({ _id: id, userId: session.user.id });
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const orders = await Order.find({ eventId: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET /api/events/[id]/orders error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
