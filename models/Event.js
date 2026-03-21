import mongoose from 'mongoose';

const TicketCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number, // in cents
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  sold: {
    type: Number,
    default: 0,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  // If true, this category becomes available only after the previous one sells out
  sequential: {
    type: Boolean,
    default: false,
  },
});

const RefundTierSchema = new mongoose.Schema({
  daysBeforeEvent: {
    type: Number,
    required: true,
  },
  refundPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
}, { _id: false });

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  bannerImage: {
    type: String,
    default: null,
  },
  primaryColor: {
    type: String,
    default: 'violet-700',
  },
  secondaryColor: {
    type: String,
    default: 'pink-500',
  },
  backgroundPattern: {
    type: String,
    default: 'none',
  },
  venue: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'ended', 'cancelled'],
    default: 'draft',
  },
  ticketCategories: {
    type: [TicketCategorySchema],
    default: [],
  },
  refundPolicy: {
    type: [RefundTierSchema],
    default: [
      { daysBeforeEvent: 7, refundPercentage: 100 },
      { daysBeforeEvent: 3, refundPercentage: 50 },
      { daysBeforeEvent: 1, refundPercentage: 0 },
    ],
  },
  // OG / share link metadata
  ogDescription: {
    type: String,
    default: '',
  },
  clicks: {
    type: [Date],
    default: [],
  },
}, {
  timestamps: true,
});

EventSchema.index({ userId: 1 });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
