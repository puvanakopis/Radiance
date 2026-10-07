import mongoose from 'mongoose';
import Counter from './counter.model.js';

const OtpVerificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: 'REGISTRATION',
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index on email and purpose
OtpVerificationSchema.index({ email: 1, purpose: 1 });
// Automatic TTL deletion after expiration
OtpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpVerificationSchema.pre('save', async function () {
  if (this.isNew && !this._id) {
    const counter = await Counter.findByIdAndUpdate(
      'otp',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = `otp_${String(counter.seq).padStart(2, '0')}`;
  }
});

export const OtpVerificationModel =
  mongoose.models.OtpVerification ||
  mongoose.model('OtpVerification', OtpVerificationSchema);

export default OtpVerificationModel;
