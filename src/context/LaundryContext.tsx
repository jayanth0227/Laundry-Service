import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Order, ServiceItem, Customer, Driver, DashboardMetrics, OrderStatus } from '../types';
import { api } from '../services/api';

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
  metrics: DashboardMetrics | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string, driver?: string) => Promise<Order>;
  createService: (serviceData: Partial<ServiceItem>) => Promise<ServiceItem>;
  updateService: (id: string, serviceData: Partial<ServiceItem>) => Promise<ServiceItem>;
  deleteService: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  newOrderAlertCount: number;
  clearNewOrderAlert: () => void;
}

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [newOrderAlertCount, setNewOrderAlertCount] = useState(0);

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

  const refreshData = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      const [fetchedOrders, fetchedServices, fetchedCustomers, fetchedDrivers, fetchedMetrics] = await Promise.all([
        api.getOrders(),
        api.getServices(),
        api.getCustomers(),
        api.getDrivers(),
        api.getMetrics(),
      ]);

      if (prevOrderCountRef.current !== null && fetchedOrders.length > prevOrderCountRef.current) {
        const diff = fetchedOrders.length - prevOrderCountRef.current;
        setNewOrderAlertCount((prev) => prev + diff);
      }
      prevOrderCountRef.current = fetchedOrders.length;

      setOrders(fetchedOrders);
      setServices(fetchedServices);
      setCustomers(fetchedCustomers);
      setDrivers(fetchedDrivers);
      setMetrics(fetchedMetrics);
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

    // Auto-poll every 3.5 seconds for live real-time sync with Admin dashboard
    const interval = setInterval(() => {
      refreshData(true);
    }, 3500);

    return () => clearInterval(interval);
  }, [refreshData]);

  const createOrder = async (orderData: Partial<Order>) => {
    try {
      const created = await api.createOrder(orderData);
      showToast(`Order #${created.id} confirmed! We will pick it up at your scheduled window.`, 'success');
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

  const resetAllData = async () => {
    try {
      await api.resetDatabase();
      prevOrderCountRef.current = null;
      setNewOrderAlertCount(0);
      showToast('Platform data reset to standard commercial demo defaults', 'success');
      await refreshData(false);
    } catch (err: any) {
      showToast(err.message || 'Error resetting data', 'error');
      throw err;
    }
  };

  return (
    <LaundryContext.Provider
      value={{
        orders,
        services,
        customers,
        drivers,
        metrics,
        loading,
        refreshData: () => refreshData(false),
        createOrder,
        updateOrderStatus,
        createService,
        updateService,
        deleteService,
        resetAllData,
        toasts,
        showToast,
        removeToast,
        newOrderAlertCount,
        clearNewOrderAlert,
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
