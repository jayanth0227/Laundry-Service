import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Truck,
  ArrowRight,
  Phone,
  Receipt,
  ShoppingBag,
  Sparkles,
  Home
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/currency';
import type { Order } from '../../types';

export const BookingConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = useLaundry();

  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>((location.state as any)?.order || null);

  useEffect(() => {
    if (!order && orderId && orders.length > 0) {
      const found = orders.find(
        (o) => o.id === orderId || o.bookingNumber === orderId
      );
      if (found) {
        setOrder(found);
      }
    }
  }, [order, orderId, orders]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        {/* Top Success Badge */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Booking Confirmed
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Doorstep Collection Scheduled!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto">
            Your pickup request has been routed to our Springfield operations hub. A plant courier will arrive during your selected window.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 sm:p-6 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
            <div>
              <span className="text-zinc-500 text-[11px]">Booking Reference:</span>
              <div className="text-base font-black font-mono text-zinc-950">
                #{order?.bookingNumber || order?.id || orderId || 'BKG-CONFIRMED'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-[11px] uppercase tracking-wide">
                Pickup Scheduled
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-zinc-500 text-[11px]">Pickup Date & Window</div>
                <div className="font-bold text-zinc-900">
                  {order?.pickupDate || 'Today'} ({order?.pickupSlot || '14:00 - 16:00'})
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-zinc-500 text-[11px]">Collection Address</div>
                <div className="font-bold text-zinc-900">
                  {order?.address?.street || 'Customer Address'}, {order?.address?.city || 'Springfield Metro'}
                </div>
              </div>
            </div>
          </div>

          {order && (
            <div className="pt-2 border-t border-zinc-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                Services Reserved
              </div>
              <div className="space-y-1.5 divide-y divide-zinc-200/60">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="pt-1.5 flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-900">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Booked
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-600">
                <span>Estimated Return: <strong>{order.deliveryDate || 'Next Day'} ({order.deliverySlot || '17:00 - 19:00'})</strong></span>
                <span className="text-orange-600 font-bold text-xs">
                  Doorstep Collection Confirmed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Process Timeline Card */}
        <div className="border border-zinc-200 rounded-2xl p-5 space-y-3">
          <div className="text-xs font-bold text-zinc-900">What happens next?</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-600">
            <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
              <div className="font-bold text-zinc-900 text-[11px]">1. Courier Arrival</div>
              <p className="text-[11px] text-zinc-500">
                Our driver brings dedicated mesh laundry bags, confirms item count, and provides a physical receipt.
              </p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
              <div className="font-bold text-zinc-900 text-[11px]">2. Individual Wash & Iron</div>
              <p className="text-[11px] text-zinc-500">
                Dedicated machine cycle (never mixed). Form pressing & allergen filtration at our central plant.
              </p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl space-y-1">
              <div className="font-bold text-zinc-900 text-[11px]">3. Clean Delivery</div>
              <p className="text-[11px] text-zinc-500">
                Returned crisp, sealed in weather-proof packaging ready for your wardrobe.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/my-bookings" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full btn-orange justify-center font-bold text-xs py-3 px-6 rounded-xl">
              <Receipt className="w-4 h-4 mr-2" />
              <span>View My Bookings</span>
            </Button>
          </Link>

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full btn-outline justify-center font-bold text-xs py-3 px-6 rounded-xl">
              <Home className="w-4 h-4 mr-2" />
              <span>Return to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

