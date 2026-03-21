import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import { EventPage } from '@/components/event-page';

export async function generateMetadata({ params }) {
  await connectDB();
  const { slug } = await params;
  const event = await Event.findOne({ slug }).lean();
  if (!event) return {};

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tippytix.app';
  return {
    title: `${event.name} - Get Tickets`,
    description: event.ogDescription || event.description || `Get tickets for ${event.name}`,
    openGraph: {
      title: `${event.name} - Get Tickets`,
      description: event.ogDescription || event.description || `Get tickets for ${event.name}`,
      url: `${baseUrl}/events/${event.slug}`,
      images: event.bannerImage ? [{ url: event.bannerImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.name} - Get Tickets`,
      description: event.ogDescription || event.description || `Get tickets for ${event.name}`,
      images: event.bannerImage ? [event.bannerImage] : [],
    },
  };
}

export default async function PublicEventPage({ params }) {
  await connectDB();
  const { slug } = await params;
  // Try active first, then fall back to any status (for organizer preview)
  let event = await Event.findOne({ slug, status: 'active', isActive: true }).lean();
  let isPreview = false;

  if (!event) {
    event = await Event.findOne({ slug }).lean();
    if (event) {
      isPreview = true;
    }
  }

  if (!event) {
    notFound();
  }

  // Track click
  await Event.findByIdAndUpdate(event._id, { $push: { clicks: new Date() } });

  // Process categories for availability
  const categories = event.ticketCategories.map((cat, index) => {
    const isSoldOut = cat.sold >= cat.quantity;
    let isAvailable = !isSoldOut;
    if (cat.sequential && index > 0) {
      const prev = event.ticketCategories[index - 1];
      isAvailable = !isSoldOut && prev.sold >= prev.quantity;
    }
    return {
      ...cat,
      _id: cat._id.toString(),
      remaining: cat.quantity - cat.sold,
      isSoldOut,
      isAvailable,
    };
  });

  const serializedEvent = {
    _id: event._id.toString(),
    name: event.name,
    slug: event.slug,
    description: event.description,
    bannerImage: event.bannerImage,
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
    venue: event.venue,
    address: event.address,
    startDate: event.startDate?.toISOString(),
    endDate: event.endDate?.toISOString(),
    ticketCategories: categories,
    refundPolicy: event.refundPolicy,
  };

  return <EventPage event={serializedEvent} />;
}
