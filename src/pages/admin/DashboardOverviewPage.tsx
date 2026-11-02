import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import type { Order, OrderStatus } from '../../types';
import {
  Clock,
  Truck,
  Droplets,
  PackageCheck,
  TrendingUp,
  Eye,
  CheckCircle2,
  Bell,
  Sparkles,
  UserCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';

export const DashboardOverviewPage: React.FC = () => {
  const { orders, metrics, drivers, updateOrderStatus, newOrderAlertCount, clearNewOrderAlert } = useLaundry();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const pendingPickups = orders.filter((o) => o.status === 'pickup_pending');
  const activeProcessing = orders.filter((o) =>
    ['picked_up', 'washing', 'drying', 'quality_check'].includes(o.status)
  );
  const readyOrOut = orders.filter((o) =>
    ['ready_for_delivery', 'out_for_delivery'].includes(o.status)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Real-Time Live Order Alert Banner */}
      {newOrderAlertCount > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl shadow-glow-cyan flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-yellow-300 animate-bounce" />
            <span className="font-bold text-xs sm:text-sm">
              {newOrderAlertCount} New Customer Booking{newOrderAlertCount > 1 ? 's' : ''} Received!
            </span>
            <span className="hidden sm:inline text-xs text-cyan-100">
              Fetched live from customer web booking. Proceed below to assign pickup courier.
            </span>
          </div>
          <button
            onClick={clearNewOrderAlert}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Plant Operations & Order Flow</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inbound collection requests, washing/ironing queue, and outbound courier route dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/orders">
            <Button variant="secondary" size="sm">
              <span>View All Orders ({orders.length})</span>
            </Button>
          </Link>
          <Link to="/book">
            <Button variant="primary" size="sm" className="gradient-btn-cyan text-white border-0">
              <span>+ Manual Booking</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Scannable Operational Density Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-subtle">
        {/* Metric 1: Pending Pickup */}
        <div className="border-r border-slate-100 pr-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pickup Pending</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {metrics?.pendingPickup ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Scheduled for collection</div>
        </div>

        {/* Metric 2: In Drums / Press */}
        <div className="border-r border-slate-100 pr-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-500" />
            <span>In Wash & Iron</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {metrics?.inProcessing ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Washing, dry & steam</div>
        </div>

        {/* Metric 3: Ready or In Transit */}
        <div className="border-r border-slate-100 pr-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span>Ready / Out</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {metrics?.readyOrOut ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Packed & en route</div>
        </div>

        {/* Metric 4: Delivered */}
        <div className="border-r border-slate-100 pr-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Delivered</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            {metrics?.completedToday ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Returned to customer</div>
        </div>

        {/* Metric 5: Revenue */}
        <div className="col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-600" />
            <span>Gross Revenue</span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 mt-1">
            ${metrics?.totalRevenue?.toFixed(2) ?? '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across {metrics?.totalOrdersCount ?? 0} orders</div>
        </div>
      </div>

      {/* Two Column Operational Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Priority Inbound Pickups */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Inbound Pickups & Intake Queue</span>
                {pendingPickups.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Scheduled collections requiring driver dispatch or facility check-in</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {pendingPickups.length} Intake
            </span>
          </div>

          {pendingPickups.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No pending collections. All scheduled bags have been collected.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPickups.map((order) => (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{order.id}</span>
                      <span className="font-semibold text-slate-800">{order.customerName}</span>
                      <span className="text-[10px] font-bold uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Pickup Slot: {order.pickupSlot}
                      </span>
                    </div>
                    <div className="text-slate-600 line-clamp-1">
                      {order.serviceType}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Address: {order.address.street} • Total: <strong>${order.grandTotal.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      <span>Inspect</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gradient-btn-cyan text-white border-0"
                      onClick={() => updateOrderStatus(order.id, 'picked_up', 'Driver collected bag at doorstep; arriving at facility')}
                    >
                      <span>Collect Bag</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: In Processing & Outbound Deliveries */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-5 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Washing, Ironing & Outbound</h2>
              <p className="text-xs text-slate-500">Garments in machine drums, steam presses, and transit</p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
              {activeProcessing.length + readyOrOut.length} Active
            </span>
          </div>

          {activeProcessing.length === 0 && readyOrOut.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No orders currently in wash or transit.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {[...activeProcessing, ...readyOrOut].map((order) => (
                <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 p-2 rounded-lg transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{order.id}</span>
                      <Badge status={order.status} />
                    </div>
                    <div className="text-slate-800 font-medium">
                      {order.customerName} — {order.serviceType}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Courier: <strong>{order.assignedDriver || 'Unassigned'}</strong> • Slot: {order.deliverySlot}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <span>View</span>
                    </Button>

                    {/* Quick stage advancement */}
                    {order.status === 'picked_up' && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'washing', 'Loaded into dedicated drum cycle & steam pressing')}
                      >
                        Start Wash/Iron
                      </Button>
                    )}
                    {order.status === 'washing' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready_for_delivery', 'Finished, steam pressed and bagged in protective sleeve')}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {order.status === 'ready_for_delivery' && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="gradient-btn-cyan text-white border-0"
                        onClick={() => updateOrderStatus(order.id, 'out_for_delivery', 'Courier in transit with clean garments')}
                      >
                        Dispatch
                      </Button>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'delivered', 'Handed over clean clothes to customer at doorstep')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Delivered
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Order Detail Drawer */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};
