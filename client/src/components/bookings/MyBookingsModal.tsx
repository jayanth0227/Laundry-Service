import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLaundry } from '../../context/LaundryContext';
import { X, Calendar, Clock, MapPin, Truck, CheckCircle2, PackageCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface MyBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({ isOpen, onClose }) => {
  const { user, token } = useAuth();
  const { orders } = useLaundry();
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      // Find orders matching this user
      const userBookings = orders.filter(
        o => o.customerId === user.id || o.customerEmail === user.email || o.customerPhone === user.phone
      );
      setMyBookings(userBookings);
    }
  }, [isOpen, user, orders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-zinc-950/70 transition-opacity backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-zinc-950 text-white px-6 py-5 flex items-center justify-between border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <h3 className="font-black text-base tracking-tight text-white">
                My Bookings ({myBookings.length})
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Logged in as {user?.name} ({user?.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {myBookings.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <PackageCheck className="w-10 h-10 text-zinc-400 mx-auto" />
              <div className="text-sm font-bold text-zinc-800">No active bookings found</div>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                You haven't scheduled any laundry collections yet. Select your services on the homepage and click Book Now!
              </p>
            </div>
          ) : (
            myBookings.map((bkg) => (
              <div
                key={bkg.id}
                className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-orange-300 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-900 text-sm">{bkg.id}</span>
                    <Badge status={bkg.status} />
                  </div>
                  <span className="font-mono font-bold text-orange-600 text-sm">
                    ${bkg.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="text-zinc-800 font-semibold">{bkg.serviceType}</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-600" />
                    <span>Pickup: <strong>{bkg.pickupDate} ({bkg.pickupSlot})</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Courier: <strong>{bkg.assignedDriver || 'Springfield Route Team'}</strong></span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-1.5 text-zinc-500">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{bkg.address.street}, {bkg.address.city}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

