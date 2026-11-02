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
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const OrderTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { orders } = useLaundry();

  const [orderIdInput, setOrderIdInput] = useState(searchParams.get('orderId') || 'ORD-8941');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const paramId = searchParams.get('orderId');
    if (paramId) {
      setOrderIdInput(paramId);
      lookupOrder(paramId);
    } else if (orders.length > 0) {
      lookupOrder(orderIdInput || orders[0].id);
    }
  }, [searchParams, orders]);

  const lookupOrder = (id: string) => {
    setErrorMsg(null);
    const found = orders.find((o) => o.id.toLowerCase() === id.trim().toLowerCase());
    if (found) {
      setCurrentOrder(found);
    } else {
      setErrorMsg(`Order #${id.trim()} not found. Check the order number on your collection receipt.`);
      setCurrentOrder(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    lookupOrder(orderIdInput);
  };

  // Progression steps map
  const statusSteps: { key: OrderStatus; label: string; description: string }[] = [
    { key: 'pickup_pending', label: 'Pickup Scheduled', description: 'Collection slot confirmed with courier' },
    { key: 'picked_up', label: 'Collected at Doorstep', description: 'Bag weighed and tagged at your address' },
    { key: 'washing', label: 'In Wash & Treatment', description: 'Individual drum cycle running with eco solvents' },
    { key: 'quality_check', label: 'Quality Check & Steam', description: 'Inspection, stain check, and hand pressing' },
    { key: 'ready_for_delivery', label: 'Ready for Dispatch', description: 'Folded or hung in sealed protective bag' },
    { key: 'out_for_delivery', label: 'Out for Delivery', description: 'Courier in transit to your address' },
    { key: 'delivered', label: 'Delivered Fresh', description: 'Received and completed' },
  ];

  const getStepState = (stepKey: OrderStatus) => {
    if (!currentOrder) return 'upcoming';
    const orderStatusOrder: OrderStatus[] = [
      'pickup_pending',
      'picked_up',
      'washing',
      'drying',
      'quality_check',
      'ready_for_delivery',
      'out_for_delivery',
      'delivered',
    ];

    const currentIndex = orderStatusOrder.indexOf(currentOrder.status);
    const stepIndex = orderStatusOrder.indexOf(stepKey);

    if (currentOrder.status === 'delivered') return 'completed';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
            Real-Time Garment Tracking
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Track Your Laundry Bag & Delivery Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Enter your order reference code (e.g. ORD-8941) to see live facility updates.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. ORD-8941"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            <span>Find Order</span>
          </Button>
        </form>

        {/* Quick Demo Pill Selector */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 overflow-x-auto">
          <span className="shrink-0 text-[11px] font-medium text-slate-400">Sample tracking orders:</span>
          {orders.slice(0, 4).map((o) => (
            <button
              key={o.id}
              onClick={() => {
                setOrderIdInput(o.id);
                lookupOrder(o.id);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono transition-colors shrink-0"
            >
              {o.id} ({o.status.replace(/_/g, ' ')})
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {currentOrder && (
        <div className="space-y-6">
          {/* Order Header Ribbon */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-subtle">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900 font-mono">{currentOrder.id}</h2>
                <Badge status={currentOrder.status} />
                <Badge status={currentOrder.paymentStatus} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {new Date(currentOrder.createdAt).toLocaleDateString()} for {currentOrder.customerName}
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReceiptOpen(true)}
              >
                <Receipt className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>View Receipt</span>
              </Button>
              <Link to="/book">
                <Button variant="primary" size="sm">
                  <span>New Pickup</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Stepper Timeline & Courier Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timeline Column */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-6">
                Lifecycle Milestones
              </h3>

              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 before:z-0">
                {statusSteps.map((step, idx) => {
                  const state = getStepState(step.key);

                  return (
                    <div key={step.key} className="relative z-10 flex items-start gap-4">
                      {/* Step Indicator */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${state === 'completed'
                          ? 'bg-teal-700 text-white'
                          : state === 'current'
                            ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                            : 'bg-white border-2 border-slate-300 text-slate-400'
                          }`}
                      >
                        {state === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5">
                        <div className="flex items-baseline justify-between">
                          <h4
                            className={`text-sm font-semibold ${state === 'current'
                              ? 'text-slate-900'
                              : state === 'completed'
                                ? 'text-slate-800'
                                : 'text-slate-400'
                              }`}
                          >
                            {step.label}
                          </h4>
                          {state === 'current' && (
                            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              Current Phase
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timestamp History */}
              <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Facility Log Entries
                </h4>
                {currentOrder.statusHistory.map((hist, i) => (
                  <div key={i} className="flex justify-between text-xs py-1 text-slate-600">
                    <span className="font-medium text-slate-800">{hist.note || hist.status}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier & Order Metadata Card */}
            <div className="lg:col-span-4 space-y-5">
              {/* Courier Dispatch Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3 shadow-subtle">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Truck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Assigned Courier</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {currentOrder.assignedDriver ? currentOrder.assignedDriver.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {currentOrder.assignedDriver || 'Springfield Route Team'}
                    </div>
                    <div className="text-xs text-slate-500">Certified Garment Courier</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Pickup Window:</span>
                    <span className="font-medium text-slate-800">{currentOrder.pickupDate} ({currentOrder.pickupSlot})</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Return:</span>
                    <span className="font-medium text-slate-800">{currentOrder.deliveryDate} ({currentOrder.deliverySlot})</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Instructions */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2.5 text-xs shadow-subtle">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Delivery Address</span>
                </div>
                <div className="text-slate-900 font-medium">
                  {currentOrder.address.street}<br />
                  {currentOrder.address.city}, {currentOrder.address.zipCode}
                </div>
                {currentOrder.address.instructions && (
                  <p className="text-slate-500 italic pt-1">
                    "{currentOrder.address.instructions}"
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  Detergent: <span className="font-medium text-slate-700">{currentOrder.detergentPreference || 'Standard Eco'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Receipt Modal */}
          <Modal
            isOpen={isReceiptOpen}
            onClose={() => setIsReceiptOpen(false)}
            title={`Invoice & Garment Receipt: ${currentOrder.id}`}
            description="Itemized commercial breakdown"
            maxWidth="lg"
          >
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">AquaClean Garment Care</h4>
                  <p className="text-slate-500 text-[11px]">Central Springfield Facility #4</p>
                  <p className="text-slate-500 text-[11px]">Customer: {currentOrder.customerName} ({currentOrder.customerPhone})</p>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900">{currentOrder.id}</div>
                  <div className="text-slate-500 text-[11px]">Date: {new Date(currentOrder.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                    <th className="py-2">Garment Item</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 text-center text-slate-600">{item.quantity} {item.unit}</td>
                      <td className="py-2 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-semibold text-slate-900">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right">
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Subtotal</span>
                  <span className="font-medium text-slate-900">${currentOrder.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup & Return Delivery</span>
                  <span className="font-medium text-slate-900">
                    {currentOrder.deliveryFee === 0 ? 'FREE ($35+)' : `$${currentOrder.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Tax (8%)</span>
                  <span className="font-medium text-slate-900">${currentOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span>${currentOrder.grandTotal.toFixed(2)}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Payment Status: <span className="font-semibold text-emerald-700 uppercase">{currentOrder.paymentStatus}</span> ({currentOrder.paymentMethod})
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  <span>Print Receipt</span>
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsReceiptOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

