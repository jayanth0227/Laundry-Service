import mongoose from 'mongoose';

const ServiceGarmentSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, default: 'piece' },
});

const ServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    turnaroundHours: { type: Number, default: 24 },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    popular: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    items: [ServiceGarmentSchema],
  },
  { timestamps: true }
);

ServiceSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Service = mongoose.model('Service', ServiceSchema);
