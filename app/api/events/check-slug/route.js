import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    await connectDB();
    const query = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Event.findOne(query);
    return NextResponse.json({ available: !existing });
  } catch (error) {
    console.error('GET /api/events/check-slug error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
