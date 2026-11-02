import React, { useState } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { Truck, Phone, MapPin, Calendar, Clock, CheckCircle2, UserCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { OrderDetailDrawer } from '../../components/admin/OrderDetailDrawer';
import { Order } from '../../types';

export const DispatchPage: React.FC = () => {
  const { drivers, orders, updateOrderStatus } = useLaundry();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Orders that need pickup or are out for delivery
  const dispatchActiveOrders = orders.filter(
    (o) => o.status === 'pickup_pending' || o.status === 'ready_for_delivery' || o.status === 'out_for_delivery'
  );

  const assignCourier = async (orderId: string, driverName: string) => {
    await updateOrderStatus(orderId, 'out_for_delivery', `Assigned to courier ${driverName}`, driverName);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Courier Routes & Field Dispatch</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time vehicle workload, pickup route manifests, and doorstep delivery assignments.
        </p>
      </div>

      {/* Driver Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drivers.map((drv) => {
          const driverOrders = orders.filter((o) => o.assignedDriver === drv.name);

          return (
            <div
              key={drv.id}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-subtle space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {drv.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{drv.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{drv.vehicle}</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {driverOrders.length} assigned
                </span>
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${drv.phone}`} className="font-mono hover:underline">
                  {drv.phone}
                </a>
              </div>

              {/* Driver's currently assigned stops */}
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Manifest Stops
                </div>
                {driverOrders.length === 0 ? (
                  <div className="text-slate-400 italic text-[11px]">No active route stops</div>
                ) : (
                  driverOrders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className="flex items-center justify-between p-1.5 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer text-[11px]"
                    >
                      <span className="font-mono font-medium text-slate-900">{ord.id}</span>
                      <span className="text-slate-600 truncate max-w-[120px]">{ord.address.street}</span>
                      <Badge status={ord.status} className="text-[9px] py-0 px-1" />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Route Board */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-subtle space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Doorstep Collection & Delivery Stops</h2>
            <p className="text-xs text-slate-500">Assign courier or mark stops completed</p>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-700">
            {dispatchActiveOrders.length} Total Route Stops
          </span>
        </div>

        {dispatchActiveOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            All routes clear. No pending pickups or deliveries for today's shifts.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {dispatchActiveOrders.map((ord) => (
              <div
                key={ord.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="font-mono font-bold text-slate-900 hover:text-teal-700 underline text-sm"
                    >
                      {ord.id}
                    </button>
                    <Badge status={ord.status} />
                    <span className="text-slate-500 font-medium">{ord.customerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ord.address.street}, {ord.address.city}</span>
                    {ord.address.instructions && (
                      <span className="text-slate-400 italic">({ord.address.instructions})</span>
                    )}
                  </div>
                  <div className="text-slate-400 text-[11px] flex items-center gap-3">
                    <span>Window: <strong>{ord.status === 'pickup_pending' ? ord.pickupSlot : ord.deliverySlot}</strong></span>
                    <span>•</span>
                    <span>Driver: <strong>{ord.assignedDriver || 'Unassigned'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-44">
                    <CustomSelect
                      value={ord.assignedDriver || ''}
                      onChange={(val) => assignCourier(ord.id, String(val))}
                      placeholder="Assign Driver..."
                      options={[
                        { value: '', label: 'Unassigned (Queue)' },
                        ...drivers.map((d) => ({
                          value: d.name,
                          label: `${d.name} (${d.vehicle})`,
                        })),
                      ]}
                      size="sm"
                    />
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedOrder(ord)}
                  >
                    Inspect
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

