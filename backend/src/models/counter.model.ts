import mongoose, { Document, Schema } from 'mongoose';

export interface ICounterDocument extends Document<string> {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounterDocument>(
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
  mongoose.models.Counter || mongoose.model<ICounterDocument>('Counter', counterSchema);

export default CounterModel;
