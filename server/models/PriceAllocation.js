import mongoose from 'mongoose';

const priceAllocationSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'piece',
    },
  },
  { timestamps: true }
);

// Unique index so each service has at most one allocated price per item
priceAllocationSchema.index({ serviceId: 1, itemId: 1 }, { unique: true });

export const PriceAllocation = mongoose.model('PriceAllocation', priceAllocationSchema);

