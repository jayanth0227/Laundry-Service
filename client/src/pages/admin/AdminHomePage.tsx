import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Tags,
  Clock,
  TrendingUp,
  Droplets,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useLaundry } from '../../context/LaundryContext';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/currency';

export const AdminHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { orders, services, metrics, loading, refreshData, newOrderAlertCount, isStoreOpen, toggleStoreStatus } = useLaundry();
  const [togglingStore, setTogglingStore] = useState(false);

  const handleToggleStore = async () => {
    try {
      setTogglingStore(true);
      await toggleStoreStatus();
    } catch {
      // toast handled in context
    } finally {
      setTogglingStore(false);
    }
  };

  // Metrics calculations
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.grandTotal || o.totalAmount || 0),
    0
  );

  const pendingBookings = orders.filter(
    (o) => o.status === 'booking_received' || o.status === 'pickup_scheduled' || o.status === 'pickup_pending'
  );

  const inProgressBookings = orders.filter((o) =>
    ['picked_up', 'in_wash_and_iron', 'washing', 'drying', 'quality_check', 'ready_for_delivery', 'out_for_delivery'].includes(
      o.status
    )
  );

  const completedBookings = orders.filter((o) => o.status === 'delivered');

  // Recent 5 bookings
  const recentBookings = [...orders]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto pb-24 md:pb-8 px-2 sm:px-0">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 pb-3 border-b border-zinc-200">
        {/* Top Header Row: Title on Left, Toggle Button on Far Right Edge */}
        <div className="flex items-center justify-between gap-3 w-full">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              Operations Hub
            </h1>
            <p className="text-xs text-zinc-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
              Welcome to AquaClean management. Overview of live orders, revenue, and store capacity.
            </p>
          </div>

          {/* Master Store Status Interactive Toggle - Anchored to Far Right Edge */}
          <div className="shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleToggleStore}
              disabled={togglingStore}
              className={`group relative inline-flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs cursor-pointer select-none ${
                isStoreOpen
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-red-50 hover:bg-red-100 text-red-800 border-red-300'
              } ${togglingStore ? 'opacity-70 cursor-wait' : 'active:scale-95'}`}
              title={isStoreOpen ? 'Click to toggle Closed' : 'Click to toggle Open'}
            >
              {/* Animated Status Pulse Dot */}
              <span className="flex h-2 w-2 relative shrink-0">
                {isStoreOpen && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isStoreOpen ? 'bg-emerald-600' : 'bg-red-500'
                  }`}
                />
              </span>

              {/* Status Text Label */}
              <span className="font-black text-[11px] uppercase tracking-wider">
                {isStoreOpen ? 'Open' : 'Closed'}
              </span>

              {/* iOS-Style Toggle Switch Slider */}
              <div
                className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out shrink-0 flex items-center ${
                  isStoreOpen ? 'bg-emerald-600 justify-end' : 'bg-red-400 justify-start'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
              </div>
            </button>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
          <button
            type="button"
            onClick={() => refreshData()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1.5 text-xs font-bold text-zinc-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/admin/bookings"
            className="ml-auto sm:ml-0 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Go to Bookings</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Cards (4 columns) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Revenue */}
        <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-normal whitespace-nowrap truncate">
              Total Revenue
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-auto py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 leading-none">
              {formatCurrency(totalRevenue)}
            </div>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-zinc-500 font-medium mt-auto flex items-center whitespace-nowrap leading-tight">
            <span>{orders.length} lifetime {orders.length === 1 ? 'order' : 'orders'}</span>
          </div>
        </div>

        {/* Pending Pickups */}
        <Link
          to="/admin/bookings?status=new"
          className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-orange-400 transition-all group flex flex-col justify-between h-full cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-normal whitespace-nowrap truncate group-hover:text-orange-600 transition-colors">
              Pending Pickup
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-auto py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 leading-none">
              {pendingBookings.length}
            </div>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-orange-600 font-bold flex items-center gap-0.5 mt-auto whitespace-nowrap leading-tight">
            <span>Awaiting collection</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </Link>

        {/* In Wash & Treatment */}
        <Link
          to="/admin/bookings?status=in_progress"
          className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-blue-400 transition-all group flex flex-col justify-between h-full cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-normal whitespace-nowrap truncate group-hover:text-blue-600 transition-colors">
              In Wash & Iron
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Droplets className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-auto py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 leading-none">
              {inProgressBookings.length}
            </div>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-blue-600 font-bold flex items-center gap-0.5 mt-auto whitespace-nowrap leading-tight">
            <span>In facility plant</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </Link>

        {/* Delivered / Completed */}
        <Link
          to="/admin/bookings?status=delivered"
          className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-emerald-400 transition-all group flex flex-col justify-between h-full cursor-pointer"
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-normal whitespace-nowrap truncate group-hover:text-emerald-600 transition-colors">
              Completed
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <PackageCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="my-auto py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-zinc-950 leading-none">
              {completedBookings.length}
            </div>
          </div>
          <div className="text-[10.5px] sm:text-[11px] text-emerald-600 font-bold flex items-center gap-0.5 mt-auto whitespace-nowrap leading-tight">
            <span>Delivered safely</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Quick Access Sections
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link
            to="/admin/bookings"
            className="p-4 rounded-2xl bg-white border-2 border-zinc-200/90 hover:border-orange-500/60 shadow-xs transition-all flex items-start gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-zinc-950 text-sm group-hover:text-orange-600 transition-colors">
                  Customer Bookings
                </h3>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                Filter orders, update statuses, manage laundry garments & customer details.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/services"
            className="p-4 rounded-2xl bg-white border-2 border-zinc-200/90 hover:border-orange-500/60 shadow-xs transition-all flex items-start gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Tags className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-zinc-950 text-sm group-hover:text-orange-600 transition-colors">
                  Services & Pricing
                </h3>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                Configure rates in ₹ INR, turnaround times, and registered garments catalog.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/schedule"
            className="p-4 rounded-2xl bg-white border-2 border-zinc-200/90 hover:border-orange-500/60 shadow-xs transition-all flex items-start gap-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-bold text-zinc-950 text-sm group-hover:text-orange-600 transition-colors">
                  Slot Timings
                </h3>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                Set active business days, operational hours, and pickup/delivery capacity.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Bookings Activity Feed */}
      <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-sm sm:text-base text-zinc-950 truncate">
              Recent Customer Bookings
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Latest incoming orders placed through the platform.
            </p>
          </div>

          <Link
            to="/admin/bookings"
            className="shrink-0 whitespace-nowrap text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline py-1 px-1.5 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400">
            No bookings recorded yet. New customer orders will show up here.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentBookings.map((order) => {
              const totalGarments = (order.items || []).reduce((sum, it) => sum + (it.quantity || 1), 0);
              return (
                <div
                  key={order.id}
                  onClick={() => navigate('/admin/bookings')}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/70 px-2 -mx-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-zinc-950 group-hover:text-orange-600 transition-colors">
                        #{order.bookingNumber || order.id}
                      </span>
                      <span className="text-xs font-bold text-zinc-700 truncate">
                        {order.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5 flex-wrap">
                      <span className="text-orange-600 font-semibold">{order.serviceType}</span>
                      <span>•</span>
                      <span>{totalGarments} items</span>
                      <span>•</span>
                      <span>Pickup: {order.pickupDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-black text-xs text-zinc-950">
                        {formatCurrency(order.grandTotal || order.totalAmount || 0)}
                      </div>
                      <Badge status={order.status} className="mt-0.5 text-[10px]" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            to="/admin/bookings"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all"
          >
            <span>Open Full Bookings Manager</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
