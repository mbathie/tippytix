import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
  },
  // QR code contains this unique code for scanning
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  price: {
    type: Number, // cents
    required: true,
  },
  // Customer info (denormalized from order for quick lookup)
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  // Check-in status
  status: {
    type: String,
    enum: ['valid', 'used', 'refunded', 'cancelled'],
    default: 'valid',
  },
  checkedInAt: {
    type: Date,
    default: null,
  },
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

TicketSchema.index({ eventId: 1 });
TicketSchema.index({ orderId: 1 });
// qrCode index already created by unique: true on the field

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
