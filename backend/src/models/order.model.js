import mongoose, { Schema } from 'mongoose';
import Counter from './counter.model.js';

const OrderItemSchema = new Schema(
  {
    productId: { type: String, ref: 'Product' },
    productName: { type: String, required: true },
    productImage: { type: String, default: '' },
    size: { type: String, default: '50ml' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sku: { type: String, default: '' },
  },
  { _id: false }
);

const TimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, default: '' },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const DeliveryAddressSchema = new Schema(
  {
    id: { type: String },
    label: { type: String, default: 'Default Address' },
    recipientName: { type: String, default: '' },
    phone: { type: String, default: '' },
    street: { type: String, required: true },
    apartment: { type: String, default: '' },
    city: { type: String, required: true },
    district: { type: String, required: true },
    postalCode: { type: String, default: '00100' },
    country: { type: String, default: 'Sri Lanka' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    _id: {
      type: String,
    },
    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },
    customer: {
      id: { type: String, index: true },
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true },
    },
    deliveryAddress: {
      type: DeliveryAddressSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 450,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['PayHere', 'WhatsApp', 'Card', 'CashOnDelivery'],
      default: 'WhatsApp',
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Awaiting WhatsApp Confirmation', 'Failed'],
      default: 'Pending',
    },
    paymentReference: {
      type: String,
      default: '',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    timeline: {
      type: [TimelineSchema],
      default: [],
    },
    date: {
      type: String,
      default: () => new Date().toISOString(),
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

OrderSchema.pre('validate', async function () {
  if (this.isNew && (!this._id || !this.orderNumber)) {
    const counter = await Counter.findByIdAndUpdate(
      'order',
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    if (!this._id) {
      this._id = `ord_${String(counter.seq).padStart(2, '0')}`;
    }
    if (!this.orderNumber) {
      this.orderNumber = `VL-${10000 + counter.seq}`;
    }
  }
});

export const OrderModel = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default OrderModel;
