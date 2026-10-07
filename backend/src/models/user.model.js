import mongoose from 'mongoose';
import Counter from './counter.model.js';

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'CUSTOMER'],
      default: 'CUSTOMER',
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
    },
    district: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

UserSchema.pre('validate', async function () {
  if (this.isNew && !this._id) {
    const counter = await Counter.findByIdAndUpdate(
      'user',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = `user_${String(counter.seq).padStart(2, '0')}`;
  }
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export default UserModel;
