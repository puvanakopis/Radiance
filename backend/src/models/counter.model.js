import mongoose, { Schema } from 'mongoose';

const counterSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

export const CounterModel =
  mongoose.models.Counter || mongoose.model('Counter', counterSchema);

export default CounterModel;
