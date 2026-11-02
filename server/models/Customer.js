import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    totalOrders: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
    registeredDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

CustomerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Customer = mongoose.model('Customer', CustomerSchema);

