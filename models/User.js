import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  emailVerified: {
    type: Date,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    default: null,
    select: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  // Organizer profile
  organizationName: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  // Stripe Connect
  stripeAccountId: {
    type: String,
    default: null,
  },
  stripeOnboardingComplete: {
    type: Boolean,
    default: false,
  },
  // Stripe onboarding fields
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  addressLine1: {
    type: String,
    default: '',
  },
  addressLine2: {
    type: String,
    default: '',
  },
  addressCity: {
    type: String,
    default: '',
  },
  addressState: {
    type: String,
    default: '',
  },
  addressPostalCode: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: 'AU',
  },
  // Bank details (temporary - cleared after Stripe setup)
  bankName: {
    type: String,
    default: '',
  },
  bankRoutingNumber: {
    type: String,
    default: '',
  },
  bankAccountNumber: {
    type: String,
    default: '',
  },
  bankAccountName: {
    type: String,
    default: '',
  },
  stripeTermsAcceptedAt: {
    type: Date,
    default: null,
  },
  stripeTermsAcceptedIp: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
