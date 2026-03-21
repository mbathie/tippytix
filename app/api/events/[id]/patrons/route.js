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

    const event = await Event.findOne({ _id: id, userId: session.user.id });
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const orders = await Order.find({ eventId: id, status: 'succeeded' })
      .sort({ createdAt: -1 })
      .lean();

    const tickets = await Ticket.find({ eventId: id }).lean();

    const patrons = orders.map(order => ({
      orderNumber: order.orderNumber,
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      address: order.customerAddress,
      ticketCount: order.totalQuantity,
      totalPaid: order.totalAmount,
      categories: order.items.map(i => `${i.categoryName} x${i.quantity}`).join(', '),
      checkedIn: tickets.filter(t => t.orderId.toString() === order._id.toString() && t.status === 'used').length,
      purchasedAt: order.createdAt,
    }));

    if (format === 'csv') {
      const headers = ['Order #', 'Name', 'Email', 'Phone', 'Address', 'Tickets', 'Categories', 'Total Paid', 'Checked In', 'Purchase Date'];
      const rows = patrons.map(p => [
        p.orderNumber,
        p.name,
        p.email,
        p.phone,
        p.address,
        p.ticketCount,
        p.categories,
        (p.totalPaid / 100).toFixed(2),
        p.checkedIn,
        new Date(p.purchasedAt).toISOString(),
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${event.slug}-patrons.csv"`,
        },
      });
    }

    return NextResponse.json(patrons);
  } catch (error) {
    console.error('GET /api/events/[id]/patrons error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
