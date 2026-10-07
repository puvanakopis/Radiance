import mongoose, { Schema } from 'mongoose';
import Counter from './counter.model.js';

const ActiveIngredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    benefit: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const CustomerReviewSchema = new Schema(
  {
    userId: {
      type: String,
      ref: 'User',
      required: [true, 'User ID is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1 star'],
      max: [5, 'Rating cannot exceed 5 stars'],
    },
    feedback: {
      type: String,
      required: [true, 'Feedback is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const ProductSchema = new Schema(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'],
      index: true,
    },
    subcategory: {
      type: String,
      default: 'General',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
      index: true,
    },
    size: {
      type: String,
      default: '50ml',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
    },
    longDescription: {
      type: String,
      default: '',
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    activeIngredients: {
      type: [ActiveIngredientSchema],
      default: [],
    },
    howToUse: {
      type: String,
      default: '',
      trim: true,
    },
    skinTypes: {
      type: [String],
      default: ['All Skin Types'],
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    reviews: {
      type: [CustomerReviewSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock count cannot be negative'],
      default: 0,
      index: true,
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

// Generate sequential product ID (prod_01, prod_02, etc.)
export async function getNextProductId() {
  const counter = await Counter.findByIdAndUpdate(
    'product',
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );
  return `prod_${String(counter.seq).padStart(2, '0')}`;
}

// Pre-validate hook for ID generation
ProductSchema.pre('validate', async function () {
  if (this.isNew && !this._id) {
    this._id = await getNextProductId();
  }
});

export const ProductModel =
  mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default ProductModel;
