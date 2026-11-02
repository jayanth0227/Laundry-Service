import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import type { Order, OrderStatus } from '../../types';
import {
  Search,
  Eye,
  Truck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';
import { formatCurrency } from '../../utils/currency';

export const OrdersManagementPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orders, loading, updateOrderStatus } = useLaundry();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(q) ||
      (o.bookingNumber && o.bookingNumber.toLowerCase().includes(q)) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.address && o.address.street.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleBatchStatus = async (status: OrderStatus) => {
    for (const id of selectedOrderIds) {
      await updateOrderStatus(id, status, `Batch status update to ${status}`);
    }
    setSelectedOrderIds([]);
  };

  const statusPills: { key: string; label: string }[] = [
    { key: 'all', label: 'All Bookings' },
    { key: 'booking_received', label: 'New Bookings' },
    { key: 'pickup_scheduled', label: 'Pickup En Route' },
    { key: 'picked_up', label: 'Collected' },
    { key: 'in_wash_and_iron', label: 'Washing & Steam Iron' },
    { key: 'ready_for_delivery', label: 'Packaged' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  // If an order is selected, show full in-page inspection view (NO MODAL / OVERLAY)
  if (selectedOrder) {
    return (
      <div className="max-w-7xl mx-auto py-2 animate-in fade-in duration-150">
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          inline={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-zinc-950 tracking-tight">
            Doorstep Bookings & Dispatch Registry
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage incoming web bookings, courier collection dispatch, and washing & iron status transitions.
          </p>
        </div>

        {selectedOrderIds.length > 0 && (
          <div className="flex items-center gap-2 bg-zinc-950 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md">
            <span>{selectedOrderIds.length} selected</span>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => handleBatchStatus('in_wash_and_iron')}
              className="text-orange-400 hover:text-white underline"
            >
              Start Wash & Iron
            </button>
            <span className="text-zinc-600">|</span>
            <button
              onClick={() => handleBatchStatus('out_for_delivery')}
              className="text-orange-400 hover:text-white underline"
            >
              Dispatch for Delivery
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statusPills.map((pill) => {
            const count =
              pill.key === 'all'
                ? orders.length
                : orders.filter((o) => o.status === pill.key).length;
            const isActive = statusFilter === pill.key;

            return (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-sm'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:border-orange-500 hover:text-orange-600'
                }`}
              >
                <span>{pill.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-orange-600 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search booking #, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-bold text-[10px]">
                <th className="py-3 px-3.5 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length
                    }
                    onChange={selectAll}
                    className="rounded border-zinc-300 accent-orange-600"
                  />
                </th>
                <th className="py-3 px-3.5">Booking Reference</th>
                <th className="py-3 px-3.5">Customer & Contact</th>
                <th className="py-3 px-3.5">Pickup Date & Slot</th>
                <th className="py-3 px-3.5">Garment Items</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Delivery Slot</th>
                <th className="py-3 px-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    Loading live orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No bookings match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        isChecked ? 'bg-orange-50/50' : ''
                      }`}
                    >
                      <td className="py-3 px-3.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-zinc-300 accent-orange-600"
                        />
                      </td>

                      <td className="py-3 px-3.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-black text-zinc-950 hover:text-orange-600 underline"
                        >
                          #{order.bookingNumber || order.id}
                        </button>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-bold text-zinc-950">{order.customerName}</div>
                        <div className="font-mono text-zinc-500 text-[11px]">{order.customerPhone}</div>
                      </td>

                      <td className="py-3 px-3.5 text-zinc-700">
                        <div className="font-bold">{order.pickupDate}</div>
                        <div className="text-[11px] text-zinc-500">{order.pickupSlot}</div>
                      </td>

                      <td className="py-3 px-3.5 text-zinc-600">
                        <div className="max-w-xs truncate font-medium">
                          {order.items && order.items.length > 0
                            ? order.items.map((i) => i.name).join(', ')
                            : order.serviceType}
                        </div>
                        {order.detergentPreference && (
                          <div className="text-[10px] text-orange-700 font-semibold">
                            {order.detergentPreference}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3.5">
                        <Badge status={order.status} />
                      </td>

                      <td className="py-3 px-3.5 text-zinc-700 text-xs">
                        <div className="font-bold">{order.deliveryDate || 'Within 24h'}</div>
                        <div className="text-[11px] text-zinc-500">{order.deliverySlot || '17:00 - 19:00'}</div>
                      </td>

                      <td className="py-3 px-3.5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="btn-outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>Inspect</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
