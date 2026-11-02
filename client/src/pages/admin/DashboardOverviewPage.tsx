import React, { useState, useMemo } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import type { Order, OrderStatus } from '../../types';
import {
  Clock,
  Droplets,
  PackageCheck,
  Eye,
  CheckCircle2,
  Bell,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Trash2,
  X,
  User,
  AlertCircle,
  Shirt,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';

// Simple, required lifecycle options without emojis
const ORDER_STATUS_OPTIONS = [
  { value: 'booking_received', label: 'Started' },
  { value: 'in_wash_and_iron', label: 'In Progress' },
  { value: 'delivered', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getNormalizedStatus = (status?: string): OrderStatus => {
  switch (status) {
    case 'booking_received':
    case 'pickup_pending':
    case 'pickup_scheduled':
      return 'booking_received';
    case 'picked_up':
    case 'in_wash_and_iron':
    case 'washing':
    case 'drying':
    case 'quality_check':
    case 'ready_for_delivery':
    case 'out_for_delivery':
      return 'in_wash_and_iron';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'booking_received';
  }
};

export const DashboardOverviewPage: React.FC = () => {
  const {
    orders,
    metrics,
    updateOrderStatus,
    deleteOrder,
    newOrderAlertCount,
    clearNewOrderAlert,
    refreshData,
    loading
  } = useLaundry();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleAccordion = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Counts for tabs
  const pendingCount = useMemo(
    () => orders.filter((o) => o.status === 'booking_received' || o.status === 'pickup_scheduled').length,
    [orders]
  );

  const inProcessingCount = useMemo(
    () =>
      orders.filter((o) =>
        ['picked_up', 'in_wash_and_iron', 'washing', 'drying', 'quality_check', 'ready_for_delivery', 'out_for_delivery'].includes(
          o.status
        )
      ).length,
    [orders]
  );

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'new'
          ? order.status === 'booking_received' || order.status === 'pickup_scheduled'
          : statusFilter === 'in_progress'
          ? [
              'picked_up',
              'in_wash_and_iron',
              'washing',
              'drying',
              'quality_check',
              'ready_for_delivery',
              'out_for_delivery'
            ].includes(order.status)
          : order.status === statusFilter;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.bookingNumber && order.bookingNumber.toLowerCase().includes(q)) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.includes(q) ||
        (order.address?.street && order.address.street.toLowerCase().includes(q)) ||
        (order.serviceType && order.serviceType.toLowerCase().includes(q)) ||
        (order.items || []).some((it) => it.name.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus, `Admin updated status to ${newStatus.replace(/_/g, ' ')}`);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Helper to calculate progress step index (0 to 3)
  const getProgressStep = (status: string) => {
    switch (status) {
      case 'booking_received':
      case 'pickup_pending':
      case 'pickup_scheduled':
        return 0; // Booked
      case 'picked_up':
        return 1; // Picked Up
      case 'in_wash_and_iron':
      case 'washing':
      case 'drying':
      case 'quality_check':
      case 'ready_for_delivery':
        return 2; // In Wash
      case 'out_for_delivery':
      case 'delivered':
        return 3; // Delivered
      default:
        return 0;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'booking_received':
      case 'pickup_pending':
      case 'pickup_scheduled':
        return 'Pickup scheduled. Driver assigned for collection.';
      case 'picked_up':
        return 'Garments collected from doorstep and en route to the laundry facility.';
      case 'in_wash_and_iron':
      case 'washing':
      case 'drying':
        return 'Active treatment: Washing, fluff drying, and steam iron processing.';
      case 'quality_check':
      case 'ready_for_delivery':
        return 'Inspection passed. Packaged and prepared for customer delivery.';
      case 'out_for_delivery':
        return 'Out for doorstep delivery with courier driver.';
      case 'delivered':
        return 'Order delivered safely to customer doorstep.';
      case 'cancelled':
        return 'Order cancelled.';
      default:
        return 'Order is being processed.';
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-28 md:pb-12 px-2 sm:px-0">
      {/* Real-Time Live Order Alert Banner */}
      {newOrderAlertCount > 0 && (
        <div className="p-3.5 bg-orange-600 text-white rounded-2xl shadow-sm flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5 min-w-0">
            <Bell className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <span className="font-black text-xs sm:text-sm truncate">
              {newOrderAlertCount} New Customer Booking{newOrderAlertCount > 1 ? 's' : ''} Received!
            </span>
          </div>
          <button
            type="button"
            onClick={clearNewOrderAlert}
            className="px-3 py-1 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with Title and Refresh */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-zinc-950 tracking-tight">
              Customer Bookings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800 border border-orange-200">
              {orders.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Tap any order to inspect full details, garments & doorstep address
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshData()}
          disabled={loading}
          className="px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1.5 text-xs font-bold text-zinc-700 shadow-2xs active:scale-95 transition-all"
          title="Refresh Bookings"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Interactive KPI Summary & Filter Cards - 100% text visibility */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
        {[
          {
            key: 'all',
            label: 'All',
            count: orders.length,
            icon: ShoppingBag,
            activeStyle: 'border-zinc-950 ring-2 ring-zinc-950/15 bg-zinc-100 shadow-xs',
            inactiveStyle: 'bg-white border-zinc-200/90 text-zinc-700 hover:border-zinc-300',
            iconColor: 'bg-zinc-100 text-zinc-700',
            activeIconColor: 'bg-zinc-950 text-white',
          },
          {
            key: 'new',
            label: 'Pending',
            count: pendingCount,
            icon: Clock,
            activeStyle: 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/80 shadow-xs',
            inactiveStyle: 'bg-white border-zinc-200/90 text-zinc-700 hover:border-orange-300',
            iconColor: 'bg-orange-50 text-orange-600 border border-orange-100',
            activeIconColor: 'bg-orange-600 text-white',
          },
          {
            key: 'in_progress',
            label: 'In Wash',
            count: inProcessingCount,
            icon: Droplets,
            activeStyle: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/80 shadow-xs',
            inactiveStyle: 'bg-white border-zinc-200/90 text-zinc-700 hover:border-blue-300',
            iconColor: 'bg-blue-50 text-blue-600 border border-blue-100',
            activeIconColor: 'bg-blue-600 text-white',
          },
          {
            key: 'delivered',
            label: 'Delivered',
            count: deliveredCount,
            icon: PackageCheck,
            activeStyle: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/80 shadow-xs',
            inactiveStyle: 'bg-white border-zinc-200/90 text-zinc-700 hover:border-emerald-300',
            iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
            activeIconColor: 'bg-emerald-600 text-white',
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const isActive = statusFilter === kpi.key;

          return (
            <button
              key={kpi.key}
              type="button"
              onClick={() => setStatusFilter(kpi.key)}
              className={`rounded-2xl py-2 px-1 sm:p-2.5 border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer active:scale-95 shadow-2xs ${
                isActive ? kpi.activeStyle : kpi.inactiveStyle
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mb-1 transition-colors ${
                  isActive ? kpi.activeIconColor : kpi.iconColor
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              <span className="text-base sm:text-lg font-black font-mono text-zinc-950 leading-none">
                {kpi.count}
              </span>

              <span className="text-[10px] sm:text-xs font-bold text-zinc-600 uppercase tracking-tight whitespace-nowrap mt-1 block">
                {kpi.label}
              </span>
            </button>
          );
        })}
      </div>

        {/* Compact Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customer, phone, address, booking #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-2xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      {/* Bookings Card List */}
      {loading && orders.length === 0 ? (
        <div className="py-16 text-center text-xs text-zinc-400 bg-white rounded-2xl border border-zinc-200">
          Loading live customer bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="py-12 text-center space-y-3 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="font-bold text-zinc-900 text-sm">No bookings found</div>
          <p className="text-zinc-500 text-xs max-w-xs mx-auto">
            {searchQuery
              ? 'No orders match your search query.'
              : 'New customer bookings will appear here instantly.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((order) => {
            const isExpanded = expandedOrders[order.id] ?? false;
            const totalGarments = (order.items || []).reduce(
              (acc, it) => acc + (Number(it.quantity) || 1),
              0
            );

            return (
              <div
                key={order.id}
                className={`bg-white border transition-all rounded-2xl shadow-2xs hover:shadow-md ${
                  isExpanded ? 'border-orange-300 ring-1 ring-orange-500/20 z-20 relative' : 'border-zinc-200 z-10 relative'
                }`}
              >
                {/* Accordion Trigger Header: Always Visible */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleAccordion(order.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleAccordion(order.id);
                    }
                  }}
                  className="p-3.5 sm:p-4 cursor-pointer select-none space-y-2 hover:bg-zinc-50/60 transition-colors text-left"
                >
                  {/* Reference #, Date, Status Badge & Accordion Toggle */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-xs font-black text-zinc-900 group-hover:text-orange-600 transition-colors">
                        #{order.bookingNumber || order.id}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        • {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge status={order.status} />
                      <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 transition-colors">
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-orange-600' : ''
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Customer Info & Quick Call */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-black text-sm text-zinc-950 capitalize truncate">
                        {order.customerName}
                      </h3>
                      <p className="text-xs font-bold text-orange-600 mt-0.5">
                        {order.serviceType}{' '}
                        <span className="text-zinc-400 font-normal">
                          • {totalGarments} {totalGarments === 1 ? 'item' : 'items'}
                        </span>
                      </p>
                    </div>

                    {order.customerPhone && (
                      <a
                        href={`tel:${order.customerPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                        title="Call Customer"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Accordion Expandable Details Drawer */}
                {isExpanded && (
                  <div className="px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 border-t border-zinc-100 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Unified Schedule & Address Box */}
                    <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-zinc-700">
                        <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="text-xs truncate">
                          Pickup: <strong className="text-zinc-900">{order.pickupDate}</strong> ({order.pickupSlot || 'Standard'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs truncate">
                          {order.address?.street}{order.address?.city ? `, ${order.address.city}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Garments items preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 text-[11px] font-bold"
                          >
                            {it.quantity}× {it.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Row: Custom Status Dropdown + Details + Delete */}
                    <div
                      className="pt-2.5 border-t border-zinc-100 flex items-center justify-between gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex-1 min-w-[160px] max-w-[210px]">
                        <CustomSelect
                          value={getNormalizedStatus(order.status)}
                          onChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                          options={ORDER_STATUS_OPTIONS}
                          size="sm"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          title="Delete booking"
                          onClick={async () => {
                            if (window.confirm(`Delete booking #${order.bookingNumber || order.id}?`)) {
                              await deleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FULL ORDER DETAILS MODAL / BOTTOM SHEET (SAME AS USER SIDE + ADMIN CONTROLS) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Overlay click to dismiss */}
          <div
            className="fixed inset-0"
            onClick={() => setSelectedOrder(null)}
          />

          {/* Modal / Bottom Sheet Card */}
          <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] sm:max-h-[85vh] w-full max-w-xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between gap-3 bg-zinc-50/50">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                  <Shirt className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-zinc-950 truncate">
                      {selectedOrder.serviceType || 'Laundry Order'}
                    </h2>
                    <span className="font-mono text-xs font-bold text-zinc-500 bg-zinc-200/70 px-2 py-0.5 rounded-md">
                      #{selectedOrder.bookingNumber || selectedOrder.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Placed {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'Recently'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-all shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
              {/* Status Banner with Admin Status Changer */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-200/80 space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950">
                    Order Status (Admin Quick Update)
                  </span>
                  <div className="w-56">
                    <CustomSelect
                      value={getNormalizedStatus(selectedOrder.status)}
                      onChange={(val) => handleStatusChange(selectedOrder.id, val as OrderStatus)}
                      options={ORDER_STATUS_OPTIONS}
                      size="sm"
                    />
                  </div>
                </div>
                <p className="text-xs text-orange-900/90 font-medium leading-relaxed">
                  {getStatusDescription(selectedOrder.status)}
                </p>
              </div>

              {/* Progress Steps Timeline */}
              {selectedOrder.status !== 'cancelled' && (
                <div className="p-3.5 rounded-2xl border border-zinc-200/90 bg-white space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Order Lifecycle
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { step: 0, label: 'Booked', sub: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString() : '' },
                      { step: 1, label: 'Picked Up', sub: selectedOrder.pickupDate },
                      { step: 2, label: 'In Wash', sub: 'Plant Care' },
                      { step: 3, label: 'Delivered', sub: selectedOrder.deliveryDate || '24h' }
                    ].map((item) => {
                      const cur = getProgressStep(selectedOrder.status);
                      const isDone = item.step <= cur;
                      const isCurrent = item.step === cur;

                      return (
                        <div key={item.label} className="space-y-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isCurrent
                                ? 'bg-orange-600 shadow-xs'
                                : isDone
                                ? 'bg-emerald-500'
                                : 'bg-zinc-200'
                            }`}
                          />
                          <span
                            className={`text-[10px] block font-bold leading-tight ${
                              isCurrent
                                ? 'text-orange-700 font-black'
                                : isDone
                                ? 'text-zinc-800'
                                : 'text-zinc-400'
                            }`}
                          >
                            {item.label}
                          </span>
                          {item.sub && (
                            <span className="text-[9px] text-zinc-400 block truncate">
                              {item.sub}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Garment Items List (Detailed Breakdown) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                  <span>Garments Breakdown</span>
                  <span className="text-orange-600 font-black">
                    {(selectedOrder.items || []).reduce(
                      (acc: number, item: any) => acc + (Number(item.quantity) || 1),
                      0
                    )}{' '}
                    Items Total
                  </span>
                </div>

                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 flex items-center justify-between hover:bg-zinc-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 font-mono font-black text-xs flex items-center justify-center shrink-0">
                            {it.quantity}x
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-900 text-xs truncate block">
                              {it.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {it.unit || 'piece'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-xs text-zinc-900">
                            {it.quantity} {it.unit || 'pcs'}
                          </span>
                          {it.unitPrice > 0 && (
                            <span className="text-[10px] text-zinc-400 block">
                              @ ₹{it.unitPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-zinc-400 italic">
                      Standard bag collection
                    </div>
                  )}
                </div>
              </div>

              {/* Pickup & Delivery Windows Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Pickup Window Card */}
                <div className="p-3 rounded-2xl bg-orange-50/50 border border-orange-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-orange-700 font-black text-[10px] uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Pickup Window</span>
                  </div>
                  <div className="font-bold text-zinc-900 text-xs">
                    {selectedOrder.pickupDate}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-600">
                    Slot: {selectedOrder.pickupSlot || 'Standard collection window'}
                  </div>
                </div>

                {/* Delivery Window Card */}
                <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-black text-[10px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Delivery Window</span>
                  </div>
                  <div className="font-bold text-zinc-900 text-xs">
                    {selectedOrder.deliveryDate || 'Within 24 Hours'}
                  </div>
                  <div className="text-[11px] font-mono text-zinc-600">
                    Slot: {selectedOrder.deliverySlot || 'Standard Return Window'}
                  </div>
                </div>
              </div>

              {/* Customer & Doorstep Address Details */}
              <div className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Doorstep Collection Address & Contact
                </span>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-zinc-900 font-bold">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{selectedOrder.customerName || 'Customer'}</span>
                    </div>
                    {selectedOrder.customerPhone && (
                      <a
                        href={`tel:${selectedOrder.customerPhone}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>Call {selectedOrder.customerPhone}</span>
                      </a>
                    )}
                  </div>

                  {selectedOrder.customerEmail && (
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{selectedOrder.customerEmail}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-2 text-zinc-800 pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      {selectedOrder.address?.street}
                      {selectedOrder.address?.city ? `, ${selectedOrder.address.city}` : ''}
                      {selectedOrder.address?.zipCode ? ` - ${selectedOrder.address.zipCode}` : ''}
                    </span>
                  </div>

                  {selectedOrder.specialInstructions && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-1.5 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> {selectedOrder.specialInstructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-3.5 rounded-2xl border border-zinc-200 bg-white space-y-2">
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Doorstep Pickup:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Return Delivery:</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex items-center justify-between text-zinc-600">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-zinc-900">
                    {selectedOrder.paymentMethod || 'Pay on Delivery'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-900 border-t border-zinc-100 pt-2 font-black text-sm">
                  <span>Payment Status:</span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-200 uppercase font-black">
                    {selectedOrder.paymentStatus || 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`Delete booking #${selectedOrder.bookingNumber || selectedOrder.id}?`)) {
                    await deleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }
                }}
                className="px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors flex items-center gap-1.5 border border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Order</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
