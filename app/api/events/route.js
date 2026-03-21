import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const events = await Event.find({ userId: session.user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(events);
  } catch (error) {
    console.error('GET /api/events error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    // Verify slug uniqueness
    const existing = await Event.findOne({ slug: body.slug });
    if (existing) {
      return NextResponse.json({ message: 'Event URL slug already taken' }, { status: 400 });
    }

    const event = await Event.create({
      ...body,
      userId: session.user.id,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('POST /api/events error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
