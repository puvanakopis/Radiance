import mongoose from 'mongoose';
import Counter from './counter.model.js';

const AdminSchema = new mongoose.Schema(
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
      default: 'Admin',
      immutable: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
      trim: true,
    },
    permissions: {
      type: [String],
      default: ['all'],
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

AdminSchema.pre('validate', async function () {
  if (this.isNew && !this._id) {
    const counter = await Counter.findByIdAndUpdate(
      'admin',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    this._id = `admin_${String(counter.seq).padStart(2, '0')}`;
  }
});

export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export default AdminModel;
