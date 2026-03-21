import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Ticket from '@/models/Ticket';

// Public endpoint for QR code verification (used by scanner)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    const ticket = await Ticket.findById(id).lean();
    if (!ticket || ticket.qrCode !== code) {
      return NextResponse.json({ valid: false, message: 'Invalid ticket' }, { status: 404 });
    }

    return NextResponse.json({
      valid: ticket.status === 'valid',
      status: ticket.status,
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      categoryName: ticket.categoryName,
      customerName: ticket.customerName,
      qrCode: ticket.qrCode,
      checkedInAt: ticket.checkedInAt,
    });
  } catch (error) {
    console.error('GET /api/tickets/[id]/verify error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
