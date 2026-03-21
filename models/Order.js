import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unitPrice: {
    type: Number, // cents
    required: true,
  },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  // Customer details
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    default: '',
  },
  customerAddress: {
    type: String,
    default: '',
  },
  // Order items
  items: {
    type: [OrderItemSchema],
    required: true,
  },
  totalQuantity: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number, // cents - ticket prices only
    required: true,
  },
  platformFee: {
    type: Number, // cents
    required: true,
  },
  totalAmount: {
    type: Number, // cents - subtotal + platformFee
    required: true,
  },
  // Stripe
  stripePaymentIntentId: {
    type: String,
    default: null,
  },
  stripeChargeId: {
    type: String,
    default: null,
  },
  stripeFee: {
    type: Number, // cents
    default: 0,
  },
  netAmount: {
    type: Number, // cents - what organizer receives
    default: 0,
  },
  stripeTransferId: {
    type: String,
    default: null,
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending',
  },
  refundedAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

OrderSchema.index({ eventId: 1 });
OrderSchema.index({ customerEmail: 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
