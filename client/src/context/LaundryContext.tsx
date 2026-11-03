import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { Order, ServiceItem, Customer, Driver, DashboardMetrics, OrderStatus, RegisteredItem } from '../types';
import { api } from '../services/api';
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE, TAX_RATE } from '../utils/currency';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface LaundryContextType {
  orders: Order[];
  services: ServiceItem[];
  customers: Customer[];
  drivers: Driver[];
  registeredItems: RegisteredItem[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string, driver?: string) => Promise<Order>;
  deleteOrder: (id: string) => Promise<void>;
  createService: (serviceData: Partial<ServiceItem>) => Promise<ServiceItem>;
  updateService: (id: string, serviceData: Partial<ServiceItem>) => Promise<ServiceItem>;
  deleteService: (id: string) => Promise<void>;
  createItem: (data: Partial<RegisteredItem>) => Promise<RegisteredItem>;
  updateItem: (id: string, data: Partial<RegisteredItem>) => Promise<RegisteredItem>;
  deleteItem: (id: string) => Promise<void>;
  allocatePrices: (serviceId: string, allocations: { itemId?: string; itemName: string; price: number; unit?: string }[]) => Promise<any>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  newOrderAlertCount: number;
  clearNewOrderAlert: () => void;

  // Cart Management
  cartItems: Record<string, number>;
  addToCart: (serviceId: string, qty?: number) => void;
  updateItemQty: (serviceId: string, delta: number) => void;
  setItemQty: (serviceId: string, qty: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartTax: number;
  cartGrandTotal: number;
  cartItemsCount: number;

  // Master Store Status (Open / Closed)
  isStoreOpen: boolean;
  toggleStoreStatus: (targetState?: boolean) => Promise<boolean>;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [registeredItems, setRegisteredItems] = useState<RegisteredItem[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOrderAlertCount, setNewOrderAlertCount] = useState(0);

  // Cart state stored in localStorage
  const [cartItems, setCartItems] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('aquaclean_cart');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('aquaclean_cart', JSON.stringify(cartItems));
    } catch {
      // ignore storage error
    }
  }, [cartItems]);

  const prevOrderCountRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearNewOrderAlert = useCallback(() => {
    setNewOrderAlertCount(0);
  }, []);

  // Cart helper functions
  const addToCart = useCallback((serviceId: string, qty = 1) => {
    setCartItems((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || 0) + qty,
    }));
  }, []);

  const updateItemQty = useCallback((serviceId: string, delta: number) => {
    setCartItems((prev) => {
      const current = prev[serviceId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: next };
    });
  }, []);

  const setItemQty = useCallback((serviceId: string, qty: number) => {
    setCartItems((prev) => {
      if (qty <= 0) {
        const copy = { ...prev };
        delete copy[serviceId];
        return copy;
      }
      return { ...prev, [serviceId]: qty };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  // Cart calculations
  const { cartItemsCount, cartSubtotal, cartDeliveryFee, cartTax, cartGrandTotal } = useMemo(() => {
    let count = 0;
    let sum = 0;

    services.forEach((srv) => {
      const qty = cartItems[srv.id];
      if (qty && qty > 0) {
        count += qty;
        sum += qty * (srv.price ?? srv.items?.[0]?.price ?? 0);
      }
    });

    const fee = sum >= FREE_DELIVERY_THRESHOLD || sum === 0 ? 0 : STANDARD_DELIVERY_FEE;
    const computedTax = Math.round(sum * TAX_RATE * 100) / 100;
    const finalTotal = Math.round((sum + fee + computedTax) * 100) / 100;

    return {
      cartItemsCount: count,
      cartSubtotal: sum,
      cartDeliveryFee: fee,
      cartTax: computedTax,
      cartGrandTotal: finalTotal,
    };
  }, [services, cartItems]);

  const refreshData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);

      const [servicesRes, ordersRes, customersRes, driversRes, metricsRes, itemsRes, storeStatusRes] = await Promise.allSettled([
        api.getServices(),
        api.getOrders(),
        api.getCustomers(),
        api.getDrivers(),
        api.getMetrics(),
        api.getItems(),
        api.getStoreStatus(),
      ]);

      if (servicesRes.status === 'fulfilled') {
        setServices(servicesRes.value);
      }

      if (storeStatusRes.status === 'fulfilled') {
        setIsStoreOpen(Boolean(storeStatusRes.value?.isStoreOpen !== false));
      }

      if (itemsRes.status === 'fulfilled') {
        setRegisteredItems(itemsRes.value || []);
      }

      if (ordersRes.status === 'fulfilled') {
        const fetchedOrders = ordersRes.value || [];
        if (prevOrderCountRef.current !== null && fetchedOrders.length > prevOrderCountRef.current) {
          const diff = fetchedOrders.length - prevOrderCountRef.current;
          setNewOrderAlertCount((prev) => prev + diff);
        }
        prevOrderCountRef.current = fetchedOrders.length;
        setOrders(fetchedOrders);
      }

      if (customersRes.status === 'fulfilled') {
        setCustomers(customersRes.value || []);
      }

      if (driversRes.status === 'fulfilled') {
        setDrivers(driversRes.value || []);
      }

      if (metricsRes.status === 'fulfilled') {
        setMetrics(metricsRes.value);
      }
    } catch (err) {
      console.error('Failed to load laundry data from API:', err);
      if (!isPolling) {
        showToast('Unable to connect to live laundry server. Please ensure server is running.', 'error');
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData(false);

    // Auto-poll every 4 seconds for live real-time sync with Admin dashboard
    const interval = setInterval(() => {
      refreshData(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [refreshData]);

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      const created = await api.createOrder(orderData);
      showToast(`Order #${created.id} confirmed! We will pick it up at your scheduled window.`, 'success');
      clearCart();
      await refreshData(false);
      return created;
    } catch (err: any) {
      showToast(err.message || 'Error placing order', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: OrderStatus, note?: string, driver?: string) => {
    try {
      const updated = await api.updateOrderStatus(id, status, note, driver);
      showToast(`Order #${id} updated: ${status.replace(/_/g, ' ').toUpperCase()}`, 'success');
      await refreshData(false);
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Error updating status', 'error');
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      showToast('Booking deleted', 'info');
      await refreshData(false);
    } catch (err: any) {
      showToast(err.message || 'Error deleting booking', 'error');
      throw err;
    }
  };

  const createService = async (serviceData: Partial<ServiceItem>) => {
    try {
      const created = await api.createService(serviceData);
      showToast(`Service "${created.name}" created`, 'success');
      await refreshData(false);
      return created;
    } catch (err: any) {
      showToast(err.message || 'Error adding service', 'error');
      throw err;
    }
  };

  const updateService = async (id: string, serviceData: Partial<ServiceItem>) => {
    try {
      const updated = await api.updateService(id, serviceData);
      showToast(`Service updated successfully`, 'success');
      await refreshData(false);
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Error updating service', 'error');
      throw err;
    }
  };

  const deleteService = async (id: string) => {
    try {
      await api.deleteService(id);
      showToast('Service removed from catalog', 'info');
      await refreshData(false);
    } catch (err: any) {
      showToast(err.message || 'Error deleting service', 'error');
      throw err;
    }
  };

  const createItem = async (data: Partial<RegisteredItem>) => {
    try {
      const created = await api.createItem(data);
      showToast(`Garment "${created.name}" added to registry`, 'success');
      await refreshData(false);
      return created;
    } catch (err: any) {
      showToast(err.message || 'Error adding garment item', 'error');
      throw err;
    }
  };

  const updateItem = async (id: string, data: Partial<RegisteredItem>) => {
    try {
      const updated = await api.updateItem(id, data);
      showToast(`Garment "${updated.name}" updated`, 'success');
      await refreshData(false);
      return updated;
    } catch (err: any) {
      showToast(err.message || 'Error updating garment item', 'error');
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await api.deleteItem(id);
      showToast('Garment removed from registry', 'info');
      await refreshData(false);
    } catch (err: any) {
      showToast(err.message || 'Error deleting garment item', 'error');
      throw err;
    }
  };

  const allocatePrices = async (
    serviceId: string,
    allocations: { itemId?: string; itemName: string; price: number; unit?: string }[]
  ) => {
    try {
      const result = await api.allocatePrices(serviceId, allocations);
      showToast(`Item prices updated for service "${result.serviceName}"`, 'success');
      await refreshData(false);
      return result;
    } catch (err: any) {
      showToast(err.message || 'Error saving price allocation', 'error');
      throw err;
    }
  };

  const toggleStoreStatus = useCallback(async (targetState?: boolean) => {
    const nextState = typeof targetState === 'boolean' ? targetState : !isStoreOpen;
    // Optimistic update
    setIsStoreOpen(nextState);
    try {
      const res = await api.updateStoreStatus(nextState);
      setIsStoreOpen(res.isStoreOpen);
      showToast(
        res.isStoreOpen
          ? 'Store status: OPEN'
          : 'Store status: CLOSED',
        res.isStoreOpen ? 'success' : 'info'
      );
      return res.isStoreOpen;
    } catch (err: any) {
      // Revert on error
      setIsStoreOpen(!nextState);
      showToast(err.message || 'Failed to update store status', 'error');
      throw err;
    }
  }, [isStoreOpen, showToast]);

  return (
    <LaundryContext.Provider
      value={{
        orders,
        services,
        customers,
        drivers,
        registeredItems,
        metrics,
        loading,
        refreshData: () => refreshData(false),
        createOrder,
        updateOrderStatus,
        deleteOrder,
        createService,
        updateService,
        deleteService,
        createItem,
        updateItem,
        deleteItem,
        allocatePrices,
        toasts,
        showToast,
        removeToast,
        newOrderAlertCount,
        clearNewOrderAlert,
        cartItems,
        addToCart,
        updateItemQty,
        setItemQty,
        clearCart,
        cartSubtotal,
        cartDeliveryFee,
        cartTax,
        cartGrandTotal,
        cartItemsCount,
        isStoreOpen,
        toggleStoreStatus,
      }}
    >
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (!context) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
