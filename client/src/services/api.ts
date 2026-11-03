import type {
  Order,
  ServiceItem,
  Customer,
  Driver,
  DashboardMetrics,
  OrderStatus,
  RegisteredItem,
  PriceAllocationRecord,
  DaySchedule,
  WeeklySchedule,
  AvailableSlot
} from '../types';

// Dynamically determine API_BASE:
// When accessed from another device (like mobile phone on Wi-Fi at 192.168.x.x),
// using relative '/api' ensures the browser talks to the Vite dev server which proxies to port 5000,
// avoiding ERR_CONNECTION_REFUSED when localhost is called on the mobile device.
const getApiBase = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl === '/api' || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
    return '/api';
  }
  return envUrl;
};

const API_BASE = getApiBase();

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('laundry_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response, defaultError: string): Promise<T> {
  if (!res.ok) {
    let errMsg = defaultError;
    try {
      const data = await res.json();
      if (data && data.error) errMsg = data.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await fetch(`${API_BASE}/metrics`, { headers: getAuthHeaders() });
    return handleResponse<DashboardMetrics>(res, 'Failed to fetch metrics');
  },

  async getServices(): Promise<ServiceItem[]> {
    const res = await fetch(`${API_BASE}/services`, { headers: getAuthHeaders() });
    return handleResponse<ServiceItem[]>(res, 'Failed to fetch services');
  },

  async createService(data: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ServiceItem>(res, 'Failed to create service');
  },

  async updateService(id: string, data: Partial<ServiceItem>): Promise<ServiceItem> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ServiceItem>(res, 'Failed to update service');
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res, 'Failed to delete service');
  },

  // Garment Item Registry CRUD
  async getItems(): Promise<RegisteredItem[]> {
    const res = await fetch(`${API_BASE}/items`, { headers: getAuthHeaders() });
    return handleResponse<RegisteredItem[]>(res, 'Failed to fetch items');
  },

  async createItem(data: Partial<RegisteredItem>): Promise<RegisteredItem> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<RegisteredItem>(res, 'Failed to add item');
  },

  async updateItem(id: string, data: Partial<RegisteredItem>): Promise<RegisteredItem> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<RegisteredItem>(res, 'Failed to update item');
  },

  async deleteItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res, 'Failed to delete item');
  },

  // Dedicated Price Allocation
  async getPriceAllocations(serviceId?: string): Promise<PriceAllocationRecord[]> {
    const url = serviceId ? `${API_BASE}/price-allocations?serviceId=${encodeURIComponent(serviceId)}` : `${API_BASE}/price-allocations`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<PriceAllocationRecord[]>(res, 'Failed to fetch price allocations');
  },

  async allocatePrices(
    serviceId: string,
    allocations: { itemId?: string; itemName: string; price: number; unit?: string }[]
  ): Promise<{ success: boolean; serviceName: string; items: any[] }> {
    const res = await fetch(`${API_BASE}/price-allocations/allocate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ serviceId, allocations }),
    });
    return handleResponse<{ success: boolean; serviceName: string; items: any[] }>(
      res,
      'Failed to allocate prices'
    );
  },

  async getOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const url = `${API_BASE}/bookings${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse<Order[]>(res, 'Failed to fetch bookings');
  },

  async getMyBookings(): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/bookings/my`, { headers: getAuthHeaders() });
    return handleResponse<Order[]>(res, 'Failed to fetch your bookings');
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(id)}`, { headers: getAuthHeaders() });
    return handleResponse<Order>(res, 'Booking not found');
  },

  async createOrder(data: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Order>(res, 'Failed to submit booking');
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string, assignedDriver?: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, note, assignedDriver }),
    });
    return handleResponse<Order>(res, 'Failed to update booking status');
  },

  async deleteOrder(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean }>(res, 'Failed to delete booking');
  },

  async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${API_BASE}/customers`, { headers: getAuthHeaders() });
    return handleResponse<Customer[]>(res, 'Failed to fetch customers');
  },

  async getDrivers(): Promise<Driver[]> {
    const res = await fetch(`${API_BASE}/drivers`, { headers: getAuthHeaders() });
    return handleResponse<Driver[]>(res, 'Failed to fetch drivers');
  },

  // Operational Schedule & Slots API
  async getSchedule(date?: string): Promise<{
    days: DaySchedule[];
    dayConfig?: DaySchedule;
    availableSlots?: AvailableSlot[];
    isOpen?: boolean;
    label?: string;
    message?: string;
    openTime?: string;
    closeTime?: string;
    slotDurationMinutes?: number;
    slotDurationHours?: number;
  }> {
    const url = date ? `${API_BASE}/schedule?date=${encodeURIComponent(date)}` : `${API_BASE}/schedule`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res, 'Failed to fetch operational schedule');
  },

  async updateSchedule(days: DaySchedule[], slotDurationMinutes?: number): Promise<{ success: boolean; schedule: WeeklySchedule }> {
    const res = await fetch(`${API_BASE}/schedule`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ days, slotDurationMinutes }),
    });
    return handleResponse(res, 'Failed to update operational schedule');
  },

  // Master Store Status (Open vs Closed)
  async getStoreStatus(): Promise<{ isStoreOpen: boolean }> {
    const res = await fetch(`${API_BASE}/store-status`, { headers: getAuthHeaders() });
    return handleResponse<{ isStoreOpen: boolean }>(res, 'Failed to fetch store status');
  },

  async updateStoreStatus(isStoreOpen: boolean): Promise<{ success: boolean; isStoreOpen: boolean }> {
    const res = await fetch(`${API_BASE}/store-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isStoreOpen }),
    });
    return handleResponse<{ success: boolean; isStoreOpen: boolean }>(res, 'Failed to update store status');
  },
};
