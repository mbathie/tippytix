import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const event = await Event.findOne({ slug, status: 'active', isActive: true }).lean();

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    // Track page view
    await Event.findByIdAndUpdate(event._id, {
      $push: { clicks: new Date() },
    });

    // Determine available categories based on sequential selling
    const categories = event.ticketCategories.map((cat, index) => {
      const isSoldOut = cat.sold >= cat.quantity;
      let isAvailable = !isSoldOut;

      // If sequential, only available if all previous categories are sold out
      if (cat.sequential && index > 0) {
        const previousCat = event.ticketCategories[index - 1];
        isAvailable = !isSoldOut && previousCat.sold >= previousCat.quantity;
      }

      return {
        _id: cat._id,
        name: cat.name,
        description: cat.description,
        price: cat.price,
        quantity: cat.quantity,
        sold: cat.sold,
        remaining: cat.quantity - cat.sold,
        isSoldOut,
        isAvailable,
        sortOrder: cat.sortOrder,
      };
    });

    return NextResponse.json({
      _id: event._id,
      name: event.name,
      slug: event.slug,
      description: event.description,
      bannerImage: event.bannerImage,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      venue: event.venue,
      address: event.address,
      startDate: event.startDate,
      endDate: event.endDate,
      ticketCategories: categories,
      refundPolicy: event.refundPolicy,
    });
  } catch (error) {
    console.error('GET /api/public/events/[slug] error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
