import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    vehicle: { type: String, default: 'Van' },
    activeDeliveries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DriverSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Driver = mongoose.model('Driver', DriverSchema);

