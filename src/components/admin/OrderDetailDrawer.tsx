import React, { useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { useLaundry } from '../../context/LaundryContext';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Printer,
  Truck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';

export interface OrderDetailDrawerProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, onClose }) => {
  const { updateOrderStatus, drivers } = useLaundry();

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [assignedDriver, setAssignedDriver] = useState<string>(order.assignedDriver || '');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pickup_pending', label: 'Pickup Pending' },
    { value: 'picked_up', label: 'Collected at Doorstep' },
    { value: 'washing', label: 'Washing Drum Cycle' },
    { value: 'drying', label: 'Drying & Fluffing' },
    { value: 'quality_check', label: 'Inspection & Finishing' },
    { value: 'ready_for_delivery', label: 'Ready for Dispatch' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered to Customer' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, currentStatus, internalNote.trim() || undefined, assignedDriver);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-lg bg-white border-l border-slate-200 shadow-modal flex flex-col h-full z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900">{order.id}</span>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSlip}
              title="Print laundry bag tag"
              className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-white hover:text-slate-900"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-5 space-y-6 flex-1 text-xs">
          {/* Customer & Address Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customer Information
            </div>
            <div className="space-y-1.5 text-slate-700">
              <div className="font-semibold text-slate-900 text-sm">{order.customerName}</div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono">
                  {order.customerPhone}
                </a>
              </div>
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customerEmail}</span>
                </div>
              )}
              <div className="flex items-start gap-2 pt-1 text-slate-700 border-t border-slate-200/60 mt-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium">{order.address.street}</div>
                  <div>{order.address.city}, {order.address.zipCode}</div>
                  {order.address.instructions && (
                    <div className="text-slate-500 italic mt-0.5">
                      Note: {order.address.instructions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Garment Breakdown Checklist */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Garments & Service Units
            </div>
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                    <th className="py-2 px-3">Item / Service</th>
                    <th className="py-2 px-3 text-center">Count</th>
                    <th className="py-2 px-3 text-right">Unit Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2 px-3 font-medium text-slate-900">{item.name}</td>
                      <td className="py-2 px-3 text-center text-slate-600">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-medium text-slate-900">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-600">Grand Total ({order.paymentStatus.toUpperCase()})</span>
                <span className="text-slate-900 text-sm font-bold font-mono">
                  ${order.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Care Preferences */}
          <div className="bg-teal-50/60 border border-teal-200/80 rounded-md p-3.5 space-y-1.5 text-xs text-teal-900">
            <div className="font-bold uppercase tracking-wider text-[10px] text-teal-800">
              Washing Specifications
            </div>
            <div>Detergent: <strong>{order.detergentPreference || 'Standard Eco'}</strong></div>
            {order.specialInstructions && (
              <div>Instructions: <em>"{order.specialInstructions}"</em></div>
            )}
          </div>

          {/* Operations Controls: Update Status & Driver */}
          <div className="bg-white border border-slate-200 rounded-md p-4 space-y-4 shadow-subtle">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Dispatch & Facility Controls
            </div>

            <Select
              label="Transition Workflow Status"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
              options={statusOptions}
            />

            <Select
              label="Assigned Courier Route"
              value={assignedDriver}
              onChange={(e) => setAssignedDriver(e.target.value)}
            >
              <option value="">Unassigned</option>
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.name}>
                  {drv.name} ({drv.vehicle})
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Internal Operational Note
              </label>
              <input
                type="text"
                placeholder="e.g. Extra stain treatment applied on jacket collar"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleUpdate}
              isLoading={isUpdating}
            >
              Save Workflow Status & Dispatch
            </Button>
          </div>

          {/* Status Progression Log */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Activity History
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 bg-white">
              {order.statusHistory.map((hist, idx) => (
                <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-medium text-slate-800">{hist.note || hist.status}</div>
                    <div className="text-slate-400 text-[10px] font-mono">
                      {new Date(hist.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge status={hist.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

