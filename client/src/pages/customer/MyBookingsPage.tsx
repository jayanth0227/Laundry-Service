import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLaundry } from '../../context/LaundryContext';
import {
  Calendar,
  Clock,
  MapPin,
  Truck,
  ShoppingBag,
  RefreshCw,
  Search,
  Plus,
  X,
  Shirt,
  ArrowRight,
  ChevronRight,
  Phone,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { Order } from '../../types';

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const { orders, refreshData, loading } = useLaundry();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Find orders matching this user
  const userBookings = useMemo(() => {
    return orders.filter((o) => {
      if (!user) return true; // Show all in guest/demo mode
      const matchUser =
        o.customerId === user.id ||
        o.customerEmail?.toLowerCase() === user.email?.toLowerCase() ||
        o.customerPhone === user.phone;
      return matchUser;
    });
  }, [orders, user]);

  const activeCount = useMemo(() => {
    return userBookings.filter((b) => !['delivered', 'cancelled'].includes(b.status)).length;
  }, [userBookings]);

  const completedCount = useMemo(() => {
    return userBookings.filter((b) => ['delivered', 'cancelled'].includes(b.status)).length;
  }, [userBookings]);

  const filteredBookings = useMemo(() => {
    return userBookings.filter((bkg) => {
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
          ? !['delivered', 'cancelled'].includes(bkg.status)
          : ['delivered', 'cancelled'].includes(bkg.status);

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (bkg.bookingNumber || bkg.id || '').toLowerCase().includes(q) ||
        (bkg.serviceType || '').toLowerCase().includes(q) ||
        (bkg.items || []).some((it: any) => it.name?.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [userBookings, filterStatus, searchQuery]);

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
        return 'Pickup scheduled. Our courier driver will arrive at your doorstep during the selected time slot.';
      case 'picked_up':
        return 'Garments collected from doorstep. Currently en route to our professional processing plant.';
      case 'in_wash_and_iron':
      case 'washing':
      case 'drying':
        return 'Garments are being washed and hygienic steam-pressed with premium fabric care detergents.';
      case 'quality_check':
      case 'ready_for_delivery':
        return 'Hygiene quality inspection passed! Garments are neatly packed and staged for doorstep dispatch.';
      case 'out_for_delivery':
        return 'Driver is out for delivery. Your freshly pressed laundry will reach you shortly.';
      case 'delivered':
        return 'Delivered safely to your doorstep. Thank you for choosing our laundry care!';
      case 'cancelled':
        return 'This booking was cancelled.';
      default:
        return 'Booking processed successfully.';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 pb-24 md:pb-12">
      {/* Top Header - Mobile friendly, no bulky back button */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-black text-zinc-950 tracking-tight">
              My Bookings
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800 border border-orange-200">
              {userBookings.length}
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Tap any order to see full details and garment breakdown
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => refreshData()}
            disabled={loading}
            className="w-9 h-9 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-600 transition-all shadow-2xs active:scale-95"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
          <Link to="/book">
            <button
              type="button"
              className="px-3 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all shadow-xs flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Pickup</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Segmented Filter Control & Search Bar */}
      <div className="space-y-2.5">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All', count: userBookings.length },
            { id: 'active', label: 'Active', count: activeCount },
            { id: 'completed', label: 'Completed', count: completedCount },
          ].map((tab) => {
            const isSelected = filterStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                  isSelected
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-zinc-200/80 text-zinc-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search booking # or garment..."
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
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-8 sm:p-12 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-zinc-900">
              {searchQuery ? 'No matching bookings found' : 'No bookings in this tab'}
            </h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto">
              {searchQuery
                ? 'Try a different booking number or clear your search query.'
                : 'Schedule a doorstep collection today. Free pickup & delivery!'}
            </p>
          </div>
          <Link to="/book" className="inline-block pt-1">
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Book a Pickup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((bkg) => {
            const isCancelled = bkg.status === 'cancelled';
            const isCompleted = bkg.status === 'delivered';
            const currentStep = getProgressStep(bkg.status);
            const totalGarments = (bkg.items || []).reduce(
              (acc: number, item: any) => acc + (Number(item.quantity) || 1),
              0
            );

            return (
              <div
                key={bkg.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedOrder(bkg)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedOrder(bkg);
                  }
                }}
                className="group bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-orange-300 hover:shadow-md transition-all space-y-3 cursor-pointer active:scale-[0.99] text-left"
              >
                {/* Card Top: Service Name, Reference # & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-zinc-100 pb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-zinc-950 text-xs sm:text-sm truncate group-hover:text-orange-600 transition-colors">
                          {bkg.serviceType || 'Laundry Service'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-zinc-400">
                          #{bkg.bookingNumber || bkg.id}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        Placed {bkg.createdAt ? new Date(bkg.createdAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge status={bkg.status} />
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                {/* Progress Stepper for Active Cycles */}
                {!isCancelled && !isCompleted && (
                  <div className="bg-zinc-50/80 p-2.5 rounded-xl border border-zinc-100">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      {['Booked', 'Picked Up', 'In Wash', 'Delivered'].map((label, idx) => {
                        const isPast = idx < currentStep;
                        const isCurrent = idx === currentStep;
                        return (
                          <div key={label} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                isCurrent
                                  ? 'bg-orange-600'
                                  : isPast
                                  ? 'bg-emerald-500'
                                  : 'bg-zinc-200'
                              }`}
                            />
                            <span
                              className={`text-[9px] block truncate ${
                                isCurrent
                                  ? 'font-black text-orange-700'
                                  : isPast
                                  ? 'font-bold text-zinc-700'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pickup Schedule & Doorstep Address - Clean 2-column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Pickup Slot */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50/40 border border-orange-100">
                    <Calendar className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-tight">
                        Pickup Slot
                      </span>
                      <span className="font-bold text-zinc-900 text-[11px] truncate block">
                        {bkg.pickupDate} ({bkg.pickupSlot || 'Morning'})
                      </span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] uppercase font-bold text-zinc-400 block leading-tight">
                        Delivery
                      </span>
                      <span className="font-bold text-zinc-900 text-[11px] truncate block">
                        {bkg.deliveryDate ? `${bkg.deliveryDate}` : 'Within 24 Hours'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address summary */}
                {bkg.address?.street && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 px-1 truncate">
                    <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {bkg.address.street}{bkg.address.city ? `, ${bkg.address.city}` : ''}
                    </span>
                  </div>
                )}

                {/* Garments tags row + View details indicator */}
                <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar min-w-0">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase shrink-0">
                      {totalGarments} {totalGarments === 1 ? 'Garment' : 'Garments'}:
                    </span>
                    {bkg.items && bkg.items.length > 0 ? (
                      bkg.items.map((it: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 text-[10px] font-bold shrink-0 whitespace-nowrap"
                        >
                          {it.quantity}x {it.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">No item list</span>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-orange-600 group-hover:text-orange-700">
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL ORDER DETAILS MODAL / BOTTOM SHEET */}
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
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-200/80 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950">
                    Current Order Status
                  </span>
                  <Badge status={selectedOrder.status} />
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
                  <div className="flex items-center gap-2 text-zinc-900 font-bold">
                    <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>{selectedOrder.customerName || 'Customer'}</span>
                    {selectedOrder.customerPhone && (
                      <span className="text-zinc-500 font-normal">
                        ({selectedOrder.customerPhone})
                      </span>
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
            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100 transition-colors"
              >
                Close
              </button>
              <Link to="/book" onClick={() => setSelectedOrder(null)}>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Book Another Pickup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
