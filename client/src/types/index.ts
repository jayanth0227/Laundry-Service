export type OrderStatus =
  | 'pickup_pending'
  | 'booking_received'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_wash_and_iron'
  | 'washing'
  | 'drying'
  | 'quality_check'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface ServicePricedItem {
  _id?: string;
  itemName: string;
  price: number;
  unit?: string;
}

export interface RegisteredItem {
  id?: string;
  _id?: string;
  name: string;
  unit: string;
  description?: string;
  active: boolean;
}

export interface PriceAllocationRecord {
  id?: string;
  _id?: string;
  serviceId: string;
  itemId?: string;
  itemName: string;
  price: number;
  unit: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category?: string;
  unit?: string;
  price?: number;
  turnaroundHours: number;
  description: string;
  image?: string;
  popular?: boolean;
  active: boolean;
  items?: ServicePricedItem[];
}

export interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface CustomerAddress {
  street: string;
  city: string;
  zipCode: string;
  instructions?: string;
}

export interface Order {
  id: string;
  bookingNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceType: string;
  items: OrderItem[];
  weightKg?: number | null;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  address: CustomerAddress;
  detergentPreference?: string;
  specialInstructions?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'pending' | 'refunded' | 'confirmed';
  paymentMethod: string;
  assignedDriver?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  totalSpend: number;
  registeredDate: string;
  notes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  activeDeliveries: number;
}

export interface DashboardMetrics {
  activeOrders: number;
  pendingPickup: number;
  inProcessing: number;
  readyOrOut: number;
  completedToday: number;
  totalRevenue: number;
  totalOrdersCount: number;
  totalCustomersCount: number;
  isMongoConnected?: boolean;
}

export interface DaySchedule {
  day: string; // 'monday', 'tuesday', etc.
  label: string; // 'Monday', 'Tuesday', etc.
  isOpen: boolean;
  openTime: string; // '08:00'
  closeTime: string; // '20:00'
  maxBookingsPerSlot?: number;
}

export interface WeeklySchedule {
  days: DaySchedule[];
  slotDurationMinutes?: number;
  slotDurationHours?: number;
}

export interface AvailableSlot {
  id: string; // '08:00 - 08:30'
  label: string; // '08:00 AM - 08:30 AM'
  period: string; // 'Morning' | 'Afternoon' | 'Evening'
  available: boolean;
  isPast?: boolean;
  isFull?: boolean;
  bookedCount?: number;
  maxCapacity?: number;
  remainingCapacity?: number;
}

export interface DateSlotsResponse {
  isOpen: boolean;
  day: string;
  label: string;
  openTime: string;
  closeTime: string;
  slotDurationMinutes?: number;
  availableSlots: AvailableSlot[];
  message?: string;
  schedule?: DaySchedule[];
}
