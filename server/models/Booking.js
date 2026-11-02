import mongoose from 'mongoose';

const BookingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'service' },
  unitPrice: { type: Number, default: 0 },
});

const StatusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: { type: String, required: true, unique: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    serviceType: { type: String, required: true },
    items: [BookingItemSchema],
    weightKg: { type: Number, default: null },
    pickupDate: { type: String, required: true },
    pickupSlot: { type: String, required: true },
    deliveryDate: { type: String, default: '' },
    deliverySlot: { type: String, default: '' },
    address: {
      street: { type: String, required: true },
      city: { type: String, default: 'Springfield' },
      zipCode: { type: String, default: '97477' },
      instructions: { type: String, default: '' },
    },
    detergentPreference: { type: String, default: 'Standard Eco Detergent' },
    specialInstructions: { type: String, default: '' },
    status: {
      type: String,
      enum: [
        'booking_received',
        'pickup_scheduled',
        'picked_up',
        'in_wash_and_iron',
        'quality_check',
        'ready_for_delivery',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'booking_received',
    },
    statusHistory: [StatusHistorySchema],
    totalAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paymentStatus: { type: String, default: 'confirmed' },
    paymentMethod: { type: String, default: 'Direct Booking' },
    assignedDriver: { type: String, default: 'Unassigned' },
  },
  { timestamps: true }
);

BookingSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret.bookingNumber || ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Booking = mongoose.model('Booking', BookingSchema);
