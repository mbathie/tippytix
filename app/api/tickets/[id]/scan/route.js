import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';
import Event from '@/models/Event';

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const { qrCode } = body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return NextResponse.json({
        valid: false,
        message: 'Ticket not found',
      }, { status: 404 });
    }

    // Verify QR code matches
    if (ticket.qrCode !== qrCode) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid QR code',
      }, { status: 400 });
    }

    // Verify event ownership
    const event = await Event.findOne({ _id: ticket.eventId, userId: session.user.id });
    if (!event) {
      return NextResponse.json({
        valid: false,
        message: 'Not authorized to scan tickets for this event',
      }, { status: 403 });
    }

    // Check if already scanned
    if (ticket.status === 'used') {
      return NextResponse.json({
        valid: false,
        alreadyScanned: true,
        message: 'WARNING: This ticket has already been scanned!',
        checkedInAt: ticket.checkedInAt,
        ticketInfo: {
          ticketNumber: ticket.ticketNumber,
          categoryName: ticket.categoryName,
          customerName: ticket.customerName,
        },
      });
    }

    if (ticket.status === 'refunded' || ticket.status === 'cancelled') {
      return NextResponse.json({
        valid: false,
        message: `This ticket has been ${ticket.status}`,
      });
    }

    // Mark as used
    ticket.status = 'used';
    ticket.checkedInAt = new Date();
    ticket.checkedInBy = session.user.id;
    await ticket.save();

    return NextResponse.json({
      valid: true,
      message: 'Ticket verified successfully!',
      ticketInfo: {
        ticketNumber: ticket.ticketNumber,
        categoryName: ticket.categoryName,
        customerName: ticket.customerName,
        customerEmail: ticket.customerEmail,
      },
    });
  } catch (error) {
    console.error('POST /api/tickets/[id]/scan error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
