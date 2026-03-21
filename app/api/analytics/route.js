import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Event from '@/models/Event';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const events = await Event.find({ userId: session.user.id }).lean();
    const eventIds = events.map(e => e._id);

    const orders = await Order.find({
      eventId: { $in: eventIds },
      status: 'succeeded',
    }).lean();

    const tickets = await Ticket.find({
      eventId: { $in: eventIds },
    }).lean();

    // Overall stats
    const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalFees = orders.reduce((sum, o) => sum + o.platformFee, 0);
    const totalTicketsSold = tickets.length;
    const totalCheckedIn = tickets.filter(t => t.status === 'used').length;

    // Per-event breakdown
    const eventStats = events.map(event => {
      const eventOrders = orders.filter(o => o.eventId.toString() === event._id.toString());
      const eventTickets = tickets.filter(t => t.eventId.toString() === event._id.toString());
      return {
        _id: event._id,
        name: event.name,
        slug: event.slug,
        startDate: event.startDate,
        status: event.status,
        ticketsSold: eventTickets.length,
        revenue: eventOrders.reduce((sum, o) => sum + o.subtotal, 0),
        orders: eventOrders.length,
        checkedIn: eventTickets.filter(t => t.status === 'used').length,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailySales = {};
    for (const order of orders) {
      if (new Date(order.createdAt) >= thirtyDaysAgo) {
        const day = new Date(order.createdAt).toISOString().split('T')[0];
        if (!dailySales[day]) dailySales[day] = { revenue: 0, tickets: 0 };
        dailySales[day].revenue += order.subtotal;
        dailySales[day].tickets += order.totalQuantity;
      }
    }

    const salesTimeline = Object.entries(dailySales)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalEvents: events.length,
      totalRevenue,
      totalFees,
      totalTicketsSold,
      totalCheckedIn,
      totalOrders: orders.length,
      eventStats,
      salesTimeline,
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
