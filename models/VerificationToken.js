import mongoose from 'mongoose';

const VerificationTokenSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expires: {
    type: Date,
    required: true,
  },
});

VerificationTokenSchema.index({ identifier: 1, token: 1 }, { unique: true });

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema);
