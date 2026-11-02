import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Clock,
  MapPin,
  Truck,
  CheckCircle2,
  Package,
  Droplets,
  Calendar,
  Receipt,
  Download,
  AlertCircle,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/currency';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orders } = useLaundry();

  const [orderIdInput, setOrderIdInput] = useState(searchParams.get('orderId') || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      setOrderIdInput(paramId);
      lookupOrder(paramId);
    } else if (orders.length > 0 && !currentOrder) {
      lookupOrder(orders[0].bookingNumber || orders[0].id);
    }
  }, [searchParams, orders]);

  const lookupOrder = (id: string) => {
    setErrorMsg(null);
    const clean = id.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === clean ||
        (o.bookingNumber && o.bookingNumber.toLowerCase() === clean)
    );
    if (found) {
      setCurrentOrder(found);
    } else {
      setErrorMsg(`Booking reference #${id.trim()} not found. Please verify your receipt reference.`);
      setCurrentOrder(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    lookupOrder(orderIdInput);
  };

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'booking_received', label: 'Booking Confirmed', desc: 'Order logged & queued for plant collection' },
    { key: 'pickup_scheduled', label: 'Rider Dispatched', desc: 'Courier en route to collect garments' },
    { key: 'picked_up', label: 'Collected & Tagged', desc: 'Digital receipt issued with weight verification' },
    { key: 'in_wash_and_iron', label: 'Isolated Machine Cycle', desc: 'Hypoallergenic drum wash & thermal dry steam iron' },
    { key: 'ready_for_delivery', label: 'Sealed & Packaged', desc: 'Quality checked and packed in moisture-seal film' },
    { key: 'out_for_delivery', label: 'Out for Doorstep Delivery', desc: 'Van en route to your destination address' },
    { key: 'delivered', label: 'Delivered', desc: 'Delivered fresh and confirmed' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIndex = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-time Operations Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
          Track Your Doorstep Laundry
        </h1>
        <p className="text-xs text-zinc-600 mt-1">
          Follow your garments through isolated washing drum cycles, steam pressing, and rider delivery.
        </p>
      </div>

      {/* Reference Lookup Form */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Enter Booking Reference (e.g. BKG-1001)..."
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
          />
        </div>
        <Button variant="primary" size="md" type="submit" className="btn-orange">
          <span>Track Status</span>
        </Button>
      </form>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div>
                <div className="text-xs text-zinc-400">Booking Reference</div>
                <div className="text-xl font-black font-mono text-zinc-950">
                  #{currentOrder.bookingNumber || currentOrder.id}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge status={currentOrder.status} />
                <span className="font-mono font-bold text-orange-600 text-lg">
                  {formatCurrency(currentOrder.grandTotal)}
                </span>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Cycle Progression
              </div>
              <div className="space-y-3">
                {steps.map((st, i) => {
                  const isDone = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={st.key} className="flex items-start gap-3.5">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCurrent
                              ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                        </div>
                        {i < steps.length - 1 && (
                          <div
                            className={`w-0.5 h-6 my-0.5 ${
                              i < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-200'
                            }`}
                          />
                        )}
                      </div>

                      <div className="pt-0.5">
                        <div
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-orange-600 font-black'
                              : isDone
                              ? 'text-zinc-900'
                              : 'text-zinc-400'
                          }`}
                        >
                          {st.label}
                        </div>
                        <div className="text-[11px] text-zinc-500">{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items & Info */}
            <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-zinc-900">Collection & Delivery</div>
                <div className="text-zinc-600">
                  Pickup: <strong>{currentOrder.pickupDate} ({currentOrder.pickupSlot})</strong>
                </div>
                <div className="text-zinc-600">
                  Address: {currentOrder.address?.street}, {currentOrder.address?.city}
                </div>
              </div>

              <div className="bg-zinc-50 p-4 rounded-2xl space-y-2">
                <div className="font-bold text-zinc-900">Garments & Total</div>
                <div className="space-y-1">
                  {currentOrder.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-zinc-600">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono font-bold">{formatCurrency(it.quantity * it.unitPrice)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-zinc-200 flex justify-between font-bold text-zinc-950">
                  <span>Grand Total</span>
                  <span className="text-orange-600 font-mono">{formatCurrency(currentOrder.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

