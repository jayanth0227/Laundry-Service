export type OrderStatus =
  | 'pickup_pending'
  | 'picked_up'
  | 'washing'
  | 'drying'
  | 'quality_check'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'Wash & Fold' | 'Dry Cleaning' | 'Ironing & Pressing' | 'Bedding & Home' | 'Specialty Care';
  unit: 'kg' | 'item' | 'set' | 'pair' | 'panel';
  price: number;
  turnaroundHours: number;
  description: string;
  popular?: boolean;
  active: boolean;
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
  paymentStatus: 'paid' | 'pending' | 'refunded';
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
}

