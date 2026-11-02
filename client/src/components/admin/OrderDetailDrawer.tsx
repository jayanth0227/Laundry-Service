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
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';
import { formatCurrency } from '../../utils/currency';

export interface OrderDetailDrawerProps {
  order: Order;
  onClose: () => void;
  inline?: boolean;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({ order, onClose, inline = false }) => {
  const { updateOrderStatus, drivers } = useLaundry();

  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(order.status);
  const [assignedDriver, setAssignedDriver] = useState<string>(order.assignedDriver || '');
  const [internalNote, setInternalNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'booking_received', label: 'Booking Received' },
    { value: 'pickup_scheduled', label: 'Pickup Scheduled with Driver' },
    { value: 'picked_up', label: 'Collected at Doorstep' },
    { value: 'in_wash_and_iron', label: 'In Dedicated Drum & Steam Iron' },
    { value: 'quality_check', label: 'Quality Check & Finish' },
    { value: 'ready_for_delivery', label: 'Packed & Ready for Dispatch' },
    { value: 'out_for_delivery', label: 'Out for Doorstep Delivery' },
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

  const content = (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onClose} className="btn-outline">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Orders</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-slate-900">
                #{order.bookingNumber || order.id}
              </span>
              <Badge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSlip}
            title="Print laundry bag tag"
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white hover:text-slate-900 flex items-center gap-1.5 text-xs font-bold"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Tag</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 text-xs">
        {/* Customer & Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Customer Details
            </div>
            <div className="font-bold text-slate-900 text-sm">{order.customerName}</div>
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
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Address & Doorstep Window
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium">{order.address?.street}</div>
                <div>{order.address?.city} {order.address?.zipCode}</div>
                {order.address?.instructions && (
                  <div className="text-slate-500 italic mt-0.5">
                    Note: {order.address.instructions}
                  </div>
                )}
              </div>
            </div>
            <div className="text-slate-600 pt-1">
              Pickup Slot: <strong>{order.pickupDate} ({order.pickupSlot})</strong>
            </div>
          </div>
        </div>

        {/* Garments & Services Table */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Booked Garment Services
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
                  <th className="py-2.5 px-3">Garment Item</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{item.unitPrice}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.quantity * (item.unitPrice || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold">
                  <td colSpan={3} className="py-2.5 px-3 text-slate-800">
                    Grand Total Payable
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-orange-600 text-sm font-black">
                    ₹{order.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Dispatch Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
            Dispatch & Facility Status Controls
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Transition Workflow Status"
              value={currentStatus}
              onChange={(e) => setCurrentStatus(e.target.value as OrderStatus)}
              options={statusOptions}
            />

            <Select
              label="Assigned Fleet Driver"
              value={assignedDriver}
              onChange={(e) => setAssignedDriver(e.target.value)}
              options={[
                { value: '', label: 'Unassigned (Plant Queue)' },
                ...drivers.map((d) => ({
                  value: d.name,
                  label: `${d.name} (${d.vehicle})`,
                })),
              ]}
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Back
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isUpdating}
              onClick={handleUpdate}
              className="btn-orange"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              <span>{isUpdating ? 'Saving...' : 'Update Order State'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return content;
};
