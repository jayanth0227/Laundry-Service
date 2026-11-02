import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Phone,
  Truck,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';

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
    { key: 'all', label: 'All Orders' },
    { key: 'pickup_pending', label: 'Pickup Pending' },
    { key: 'washing', label: 'In Wash/Dry' },
    { key: 'ready_for_delivery', label: 'Ready for Dispatch' },
    { key: 'out_for_delivery', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Title & Batch Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Orders Processing Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage incoming bags, facility status transitions, and courier assignments.
          </p>
        </div>

        {selectedOrderIds.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-md text-xs">
            <span className="font-semibold">{selectedOrderIds.length} selected</span>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => handleBatchStatus('washing')}
              className="text-teal-300 hover:text-white underline font-medium"
            >
              Mark In Wash
            </button>
            <span className="text-slate-500">|</span>
            <button
              onClick={() => handleBatchStatus('ready_for_delivery')}
              className="text-teal-300 hover:text-white underline font-medium"
            >
              Mark Ready
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-subtle">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusPills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => setStatusFilter(pill.key)}
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === pill.key
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* High Density Orders Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-2.5 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredOrders.length > 0 &&
                      selectedOrderIds.length === filteredOrders.length
                    }
                    onChange={selectAll}
                    className="rounded border-slate-300 accent-slate-900"
                  />
                </th>
                <th className="py-2.5 px-3 font-mono">Order ID</th>
                <th className="py-2.5 px-3">Customer & Contact</th>
                <th className="py-2.5 px-3">Garment Items</th>
                <th className="py-2.5 px-3">Pickup Window</th>
                <th className="py-2.5 px-3">Delivery Target</th>
                <th className="py-2.5 px-3">Assigned Courier</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Loading orders from operational server...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-slate-50' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="rounded border-slate-300 accent-slate-900"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="font-mono font-bold text-slate-900 hover:text-teal-700 underline"
                        >
                          {order.id}
                        </button>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-slate-500 font-mono text-[11px]">{order.customerPhone}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium line-clamp-1">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </div>
                        {order.weightKg && (
                          <div className="text-slate-500 text-[11px]">Weight: {order.weightKg} kg</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div>{order.pickupDate}</div>
                        <div className="text-slate-400 text-[11px]">{order.pickupSlot}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600">
                        <div>{order.deliveryDate}</div>
                        <div className="text-slate-400 text-[11px]">{order.deliverySlot}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>{order.assignedDriver || 'Unassigned'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <Badge status={order.status} />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          ${order.grandTotal.toFixed(2)}
                        </div>
                        <Badge status={order.paymentStatus} className="text-[9px] py-0 px-1" />
                      </td>

                      <td className="py-3 px-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
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

      {/* Slide-over Inspection Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

