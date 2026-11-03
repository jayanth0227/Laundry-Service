import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Truck,
  ArrowRight,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Phone,
  User as UserIcon,
  Mail,
  Home,
  Check,
  Shirt,
  Search,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import type { AvailableSlot } from '../../types';

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { services, loading: servicesLoading, createOrder, registeredItems, isStoreOpen } = useLaundry();
  const { user } = useAuth();

  // Selected Service
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Quantities for items of the selected service: { [itemName: string]: number }
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Search query for selecting garments
  const [garmentSearchQuery, setGarmentSearchQuery] = useState('');

  // Slots
  const todayStr = new Date().toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [pickupSlot, setPickupSlot] = useState<string>('');
  const [pickupSlots, setPickupSlots] = useState<AvailableSlot[]>([]);
  const [slotPeriodFilter, setSlotPeriodFilter] = useState<'all' | 'Morning' | 'Afternoon' | 'Evening'>('all');
  const [pickupLoading, setPickupLoading] = useState(false);
  const [pickupScheduleInfo, setPickupScheduleInfo] = useState<{
    isOpen: boolean;
    openTime: string;
    closeTime: string;
    label: string;
    slotDurationMinutes?: number;
  } | null>(null);

  const morningCount = useMemo(() => pickupSlots.filter((s) => s.period === 'Morning').length, [pickupSlots]);
  const afternoonCount = useMemo(() => pickupSlots.filter((s) => s.period === 'Afternoon').length, [pickupSlots]);
  const eveningCount = useMemo(() => pickupSlots.filter((s) => s.period === 'Evening').length, [pickupSlots]);

  const filteredSlots = useMemo(() => {
    if (slotPeriodFilter === 'all') return pickupSlots;
    return pickupSlots.filter((s) => s.period === slotPeriodFilter);
  }, [pickupSlots, slotPeriodFilter]);

  // Customer Contact & Address Details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [streetAddress, setStreetAddress] = useState(user?.address || '');
  const [areaLocality, setAreaLocality] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560001');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Status & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Set default selected service from URL or first available service
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      const paramId = searchParams.get('serviceId');
      const found = services.find((s) => s.id === paramId);
      if (found) {
        setSelectedServiceId(found.id);
      } else {
        setSelectedServiceId(services[0].id);
      }
    }
  }, [services, searchParams, selectedServiceId]);

  const activeService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0] || null;
  }, [services, selectedServiceId]);

  // Estimated delivery date string based on service turnaround
  const estimatedDeliveryDateStr = useMemo(() => {
    if (!pickupDate) return '';
    const hours = activeService?.turnaroundHours || 24;
    const pDate = new Date(pickupDate);
    const returnTimestamp = pDate.getTime() + (hours / 24) * 86400000;
    return new Date(returnTimestamp).toISOString().split('T')[0];
  }, [activeService, pickupDate]);

  // Helper to generate slots so customers can book anytime
  const generateClientSlots = (openTime = '08:00', closeTime = '20:00', durationMinutes = 30): AvailableSlot[] => {
    const [openH, openM] = (openTime || '08:00').split(':').map(Number);
    const [closeH, closeM] = (closeTime || '20:00').split(':').map(Number);
    const openTotal = (isNaN(openH) ? 8 : openH) * 60 + (isNaN(openM) ? 0 : openM);
    const closeTotal = (isNaN(closeH) ? 20 : closeH) * 60 + (isNaN(closeM) ? 0 : closeM);
    const dur = Math.max(15, Number(durationMinutes) || 30);

    const list: AvailableSlot[] = [];
    for (let st = openTotal; st + dur <= closeTotal; st += dur) {
      const et = st + dur;
      const sh = Math.floor(st / 60);
      const sm = st % 60;
      const eh = Math.floor(et / 60);
      const em = et % 60;

      const fmt = (h: number, m: number) => {
        const p = h >= 12 ? 'PM' : 'AM';
        const dh = h % 12 === 0 ? 12 : h % 12;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(dh)}:${pad(m)} ${p}`;
      };

      const pad = (n: number) => String(n).padStart(2, '0');
      const id = `${pad(sh)}:${pad(sm)} - ${pad(eh)}:${pad(em)}`;
      const label = `${fmt(sh, sm)} - ${fmt(eh, em)}`;

      let period = 'Morning';
      if (sh >= 12 && sh < 17) period = 'Afternoon';
      else if (sh >= 17) period = 'Evening';

      list.push({ id, label, period, available: true });
    }
    return list;
  };

  // Dynamic slot availability calculation for Pickup Date - slots are bookable anytime
  useEffect(() => {
    let isMounted = true;
    const fetchPickupSlots = async () => {
      if (!pickupDate) return;
      setPickupLoading(true);
      try {
        const res = await api.getSchedule(pickupDate);
        if (!isMounted) return;

        const openTime = res.openTime || '08:00';
        const closeTime = res.closeTime || '20:00';
        const slotDuration = res.slotDurationMinutes || 30;

        setPickupScheduleInfo({
          isOpen: true,
          openTime,
          closeTime,
          label: res.label || 'Day',
          slotDurationMinutes: slotDuration,
        });

        const activeSlots = (Array.isArray(res.availableSlots) && res.availableSlots.length > 0)
          ? res.availableSlots.map((s) => ({ ...s, available: true }))
          : generateClientSlots(openTime, closeTime, slotDuration);

        setPickupSlots(activeSlots);
        if (activeSlots.length > 0) {
          const currentValid = activeSlots.find((s: AvailableSlot) => s.id === pickupSlot);
          if (!currentValid) {
            setPickupSlot(activeSlots[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not load pickup slots from API, using default operational schedule:', err);
        if (!isMounted) return;
        const fallbackSlots = generateClientSlots('08:00', '20:00', 30);
        setPickupScheduleInfo({
          isOpen: true,
          openTime: '08:00',
          closeTime: '20:00',
          label: 'Day',
          slotDurationMinutes: 30,
        });
        setPickupSlots(fallbackSlots);
        if (fallbackSlots.length > 0 && !pickupSlot) {
          setPickupSlot(fallbackSlots[0].id);
        }
      } finally {
        if (isMounted) setPickupLoading(false);
      }
    };

    fetchPickupSlots();
    return () => { isMounted = false; };
  }, [pickupDate]);

  // Comprehensive garment catalog from service items, registered master items, and standard laundry garments
  const garmentCatalog = useMemo(() => {
    const map = new Map<string, { name: string; unit: string; price: number }>();

    // 1. Service specific items
    (activeService?.items || []).forEach((it) => {
      if (it.itemName && it.itemName.trim()) {
        map.set(it.itemName.toLowerCase(), {
          name: it.itemName.trim(),
          unit: it.unit || 'piece',
          price: it.price || 0,
        });
      }
    });

    // 2. Registered master items
    (registeredItems || []).forEach((it) => {
      if (it.name && it.name.trim() && !map.has(it.name.toLowerCase())) {
        map.set(it.name.toLowerCase(), {
          name: it.name.trim(),
          unit: it.unit || 'piece',
          price: 0,
        });
      }
    });

    // 3. Common standard laundry garments
    const defaults = [
      'Shirt',
      'T-Shirt',
      'Pant / Trousers',
      'Jeans',
      'Saree',
      'Kurta / Kurti',
      'Bedsheet',
      'Blanket / Quilt',
      'Suit / Blazer',
      'Towel',
      'Curtain',
      'Salwar Suit',
      'Dress / Gown',
      'Jacket',
    ];
    defaults.forEach((name) => {
      if (!map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          name,
          unit: 'piece',
          price: 0,
        });
      }
    });

    return Array.from(map.values());
  }, [activeService, registeredItems]);

  // Filtered garments matching search query
  const searchedGarments = useMemo(() => {
    const q = garmentSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return garmentCatalog.filter((g) => g.name.toLowerCase().includes(q));
  }, [garmentCatalog, garmentSearchQuery]);

  // Quick popular garment suggestions
  const popularSuggestions = ['Shirt', 'Pant / Trousers', 'Saree', 'Kurta / Kurti', 'Bedsheet', 'Blanket'];

  // Add or increment a garment
  const handleAddGarment = (name: string) => {
    setItemQuantities((prev) => ({
      ...prev,
      [name]: (prev[name] || 0) + 1,
    }));
    setGarmentSearchQuery('');
  };

  // Remove a garment completely
  const handleRemoveGarment = (name: string) => {
    setItemQuantities((prev) => {
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  // Handle Item Quantity stepper increment / decrement
  const handleQtyChange = (itemName: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[itemName] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemName];
        return copy;
      }
      return { ...prev, [itemName]: next };
    });
  };

  // Build items array for booking
  const selectedItemsList = useMemo(() => {
    return Object.entries(itemQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => {
        const found = garmentCatalog.find((it) => it.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          quantity: qty,
          unit: found?.unit || 'piece',
          unitPrice: found?.price || 0,
          total: qty * (found?.price || 0),
        };
      });
  }, [itemQuantities, garmentCatalog]);

  // Total garment count
  const totalItemCount = useMemo(() => {
    return Object.values(itemQuantities).reduce((sum, q) => sum + q, 0);
  }, [itemQuantities]);

  const subtotal = 0;
  const deliveryFee = 0;
  const grandTotal = 0;

  // Handle Placing Doorstep Booking
  const handlePlaceBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeService) {
      setErrorMessage('Please select a laundry service.');
      return;
    }

    if (totalItemCount === 0) {
      setErrorMessage('Please select at least 1 garment item and quantity to book.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      setErrorMessage('Please provide your full name, phone number, and doorstep collection address.');
      return;
    }

    if (!pickupSlot) {
      setErrorMessage('Please select an available pickup time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const fullAddressStreet = areaLocality
        ? `${streetAddress.trim()}, ${areaLocality.trim()}`
        : streetAddress.trim();

      const payload = {
        customerId: user?.id || `GUEST-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || user?.email || '',
        serviceType: activeService.name,
        items: selectedItemsList.map((it) => ({
          name: it.name,
          quantity: it.quantity,
          unit: it.unit,
          unitPrice: it.unitPrice,
        })),
        pickupDate,
        pickupSlot,
        deliveryDate: estimatedDeliveryDateStr,
        deliverySlot: 'Standard Return Window',
        address: {
          street: fullAddressStreet,
          city: city.trim() || 'Metro Area',
          zipCode: pincode.trim(),
          instructions: specialInstructions ? specialInstructions.trim() : undefined,
        },
        specialInstructions,
        totalAmount: subtotal,
        deliveryFee,
        tax: 0,
        grandTotal,
        paymentStatus: 'confirmed' as const,
        paymentMethod: 'Doorstep Collection',
      };

      const result = await createOrder(payload);
      setConfirmedBooking(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW (No popup modal - inline page view)
  if (confirmedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-8 sm:p-10 shadow-lg space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-black bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              BOOKING #{confirmedBooking.bookingNumber || confirmedBooking.id}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Doorstep Pickup Scheduled!
            </h1>
            <p className="text-zinc-600 text-sm mt-1 max-w-md mx-auto">
              Our courier driver will collect your garments at the scheduled time. No advance payment required.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-left space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <span className="text-zinc-500 font-bold uppercase text-[10px]">Selected Service</span>
              <span className="font-black text-orange-600 text-sm">{confirmedBooking.serviceType}</span>
            </div>

            {/* Selected Garments */}
            <div>
              <div className="text-zinc-500 font-bold uppercase text-[10px] mb-2">Scheduled Garments</div>
              <div className="space-y-1.5">
                {confirmedBooking.items?.map((it: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-zinc-800 bg-white p-2.5 rounded-xl border border-zinc-200/60 font-bold">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="text-[11px] text-zinc-500 font-medium">Garment ({it.unit || 'piece'})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Mode */}
            <div className="flex items-center justify-between border-t border-zinc-200 pt-3">
              <span className="font-bold text-zinc-700 text-xs">Payment Method:</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                Pay on Delivery / Collection
              </span>
            </div>

            {/* Slots and Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-200">
              <div className="space-y-1">
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Pickup Slot</span>
                <div className="font-bold text-zinc-900">{confirmedBooking.pickupDate} ({confirmedBooking.pickupSlot})</div>
              </div>
              <div className="space-y-1">
                <span className="text-zinc-400 text-[10px] uppercase font-bold">Doorstep Address</span>
                <div className="font-bold text-zinc-900 leading-snug">{confirmedBooking.address?.street}, {confirmedBooking.address?.city}</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setConfirmedBooking(null);
                setItemQuantities({});
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 font-bold text-xs hover:bg-zinc-100 transition-colors"
            >
              Book Another Service
            </button>
            <Link to="/my-bookings" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="btn-orange w-full text-xs font-bold shadow-sm">
                <span>View in My Bookings</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Page Title Header */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 sm:pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
            Schedule Doorstep Pickup
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Fast, professional laundry collection and doorstep delivery
          </p>
        </div>
      </div>

      {/* Live Store Closed Informational Notice (Orders still enabled) */}
      {!isStoreOpen && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black flex items-center gap-2">
              <span>Facility is Currently Closed</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] uppercase font-black tracking-wider">
                Bookings Open
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-800 font-medium mt-0.5">
              Operating hours are currently closed, but you can book your pickup anytime! Your doorstep collection will be processed during the next active cycle.
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handlePlaceBooking} className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
        {/* Left 7 Cols: Selected Service Banner, Items Picker, Slots & Address */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          {/* ACTIVE SERVICE HEADER BADGE CARD - matching design system */}
          {activeService && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {activeService.image ? (
                  <img
                    src={activeService.image}
                    alt={activeService.name}
                    className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-orange-600 text-white font-black flex items-center justify-center shrink-0">
                    <Shirt className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    Selected Service
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm sm:text-base font-black text-zinc-950 truncate">
                      {activeService.name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {activeService.turnaroundHours || 24}h Return
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/#services-section"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-orange-300 bg-zinc-50 hover:bg-orange-50/50 text-xs font-bold text-zinc-700 hover:text-orange-600 transition-colors shadow-2xs shrink-0 whitespace-nowrap"
              >
                <span>Change</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* STEP 1: SELECT GARMENTS WITH SEARCH BAR & QUANTITY STEPPERS */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                  1
                </span>
                <h2 className="text-sm sm:text-base font-black text-zinc-950 truncate">
                  Select Garments
                </h2>
              </div>

              {totalItemCount > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                  {totalItemCount} {totalItemCount === 1 ? 'garment' : 'garments'}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-500 shrink-0">
                  0 selected
                </span>
              )}
            </div>

            {/* Interactive Garment Search Bar */}
            <div className="relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search garment (e.g. Shirt, Saree, Kurta, Bedsheet)..."
                  value={garmentSearchQuery}
                  onChange={(e) => setGarmentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-zinc-300 text-xs bg-zinc-50/60 focus:bg-white text-zinc-900 font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
                />
                {garmentSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setGarmentSearchQuery('')}
                    className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {garmentSearchQuery.trim() !== '' && (
                <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-zinc-100 animate-in fade-in slide-in-from-top-1">
                  {searchedGarments.length > 0 ? (
                    searchedGarments.map((g) => {
                      const curQty = itemQuantities[g.name] || 0;
                      return (
                        <div
                          key={g.name}
                          className="p-2.5 sm:p-3 flex items-center justify-between hover:bg-orange-50/40 transition-colors"
                        >
                          <div>
                            <span className="font-bold text-xs text-zinc-900">{g.name}</span>
                            <span className="text-[10px] text-zinc-400 ml-2">({g.unit})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddGarment(g.name)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                              curQty > 0
                                ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-xs'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            <span>{curQty > 0 ? `Add More (${curQty})` : 'Add'}</span>
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 text-center">
                      <div className="text-xs text-zinc-500 font-medium mb-1.5">
                        No standard item named "{garmentSearchQuery}".
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddGarment(garmentSearchQuery.trim())}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add "{garmentSearchQuery.trim()}" as custom item</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick-Add Popular Garment Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[10px] text-zinc-400 uppercase font-black shrink-0 mr-1">
                Popular:
              </span>
              {popularSuggestions.map((name) => {
                const qty = itemQuantities[name] || 0;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleAddGarment(name)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      qty > 0
                        ? 'bg-orange-50 text-orange-700 border-orange-300'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <Plus className="w-3 h-3 text-orange-600" />
                    <span>{name}</span>
                    {qty > 0 && (
                      <span className="w-4 h-4 rounded-full bg-orange-600 text-white text-[9px] flex items-center justify-center font-black">
                        {qty}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Garments List with Steppers */}
            <div className="pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2 flex items-center justify-between">
                <span>Selected Garments ({selectedItemsList.length})</span>
                {selectedItemsList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setItemQuantities({})}
                    className="text-[10px] text-red-600 hover:text-red-700 font-bold lowercase underline"
                  >
                    clear all
                  </button>
                )}
              </div>

              {selectedItemsList.length > 0 ? (
                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                  {selectedItemsList.map((item) => (
                    <div
                      key={item.name}
                      className="p-3 sm:p-3.5 flex items-center justify-between bg-white hover:bg-zinc-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-orange-700 flex items-center justify-center shrink-0 font-black text-xs">
                          {item.quantity}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-zinc-900 text-xs sm:text-sm truncate">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium">
                            Garment ({item.unit || 'piece'})
                          </div>
                        </div>
                      </div>

                      {/* Stepper + Remove */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.name, -1)}
                            className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 transition-all active:scale-95 shadow-2xs"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-7 text-center font-mono font-black text-xs text-zinc-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.name, 1)}
                            className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 transition-all active:scale-95 shadow-2xs"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGarment(item.name)}
                          className="w-8 h-8 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-7 px-4 text-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60">
                  <Shirt className="w-7 h-7 text-zinc-300 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-zinc-600">No garments selected yet</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5 max-w-sm mx-auto">
                    Type in the search bar above or click popular tags to add garments for doorstep laundry.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: DOORSTEP PICKUP SLOT */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                  2
                </span>
                <h2 className="text-sm sm:text-base font-black text-zinc-950">Doorstep Collection Slot</h2>
              </div>
              {pickupScheduleInfo?.isOpen && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-900 border border-orange-200">
                  <Clock className="w-3 h-3 text-orange-600" />
                  Hours: {pickupScheduleInfo.openTime} - {pickupScheduleInfo.closeTime}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {/* Symmetrical Balanced Side-by-Side Cards for Pickup Date & Selected Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card 1: Pickup Date */}
                <div className="p-3.5 rounded-xl border border-zinc-200/90 bg-white hover:border-orange-200 transition-colors shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-600" />
                      Pickup Date
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                      Step 1 of 2
                    </span>
                  </div>
                  <div>
                    <input
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-zinc-50/70 text-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all cursor-pointer"
                      required
                    />
                  </div>
                </div>

                {/* Card 2: Selected Time Slot */}
                <div className={`p-3.5 rounded-xl border transition-colors shadow-2xs space-y-1.5 ${
                  pickupSlot ? 'border-orange-200 bg-orange-50/30' : 'border-zinc-200/90 bg-white'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-600" />
                      Selected Time Slot
                    </span>
                    {pickupSlot ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                        Pick below
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2 rounded-lg border border-zinc-200/80 bg-white flex items-center justify-between min-h-[38px]">
                    <span className="font-mono font-black text-xs text-orange-700 truncate">
                      {pickupSlot
                        ? (pickupSlots.find((s) => s.id === pickupSlot)?.label || pickupSlot)
                        : 'Choose an available slot below'}
                    </span>
                    {pickupSlot && (
                      <span className="text-[10px] text-zinc-400 font-semibold shrink-0 ml-1.5">
                        Collection
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Slot Period Filter Chips */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSlotPeriodFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      slotPeriodFilter === 'all'
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    All ({pickupSlots.length})
                  </button>
                  {morningCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSlotPeriodFilter('Morning')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotPeriodFilter === 'Morning'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      Morning ({morningCount})
                    </button>
                  )}
                  {afternoonCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSlotPeriodFilter('Afternoon')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotPeriodFilter === 'Afternoon'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      Afternoon ({afternoonCount})
                    </button>
                  )}
                  {eveningCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setSlotPeriodFilter('Evening')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        slotPeriodFilter === 'Evening'
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      Evening ({eveningCount})
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">
                  Click any slot to select
                </span>
              </div>

              {/* Ultra-compact Slot Grid without truncation */}
              {pickupLoading ? (
                <div className="py-6 text-center text-xs text-zinc-400 flex items-center justify-center gap-2 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <Clock className="w-3.5 h-3.5 animate-spin text-orange-500" />
                  <span>Loading slots...</span>
                </div>
              ) : filteredSlots.length === 0 ? (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  No slots found for {slotPeriodFilter}.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-1.5">
                  {filteredSlots.map((slot) => {
                    const isSelected = pickupSlot === slot.id;
                    const compactLabel = slot.label.replace(/\b([AP]M)\b\s*-\s*/, ' - ');

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setPickupSlot(slot.id)}
                        className={`px-2 py-2 rounded-lg text-[11px] transition-all text-center border flex items-center justify-center gap-1 leading-none ${
                          isSelected
                            ? 'bg-orange-600 text-white border-orange-600 shadow-xs font-black ring-2 ring-orange-500/20'
                            : 'bg-zinc-50/80 hover:bg-white text-zinc-800 hover:text-orange-950 border-zinc-200 hover:border-orange-300 font-bold'
                        }`}
                        title={slot.label}
                      >
                        <span className="whitespace-nowrap">{compactLabel}</span>
                        {isSelected && <Check className="w-3 h-3 text-white shrink-0 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Informative turnaround delivery card */}
              <div className="p-2.5 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-center gap-2.5 text-xs text-blue-950">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="text-[11px]">
                  <span className="font-bold">Standard Return Delivery: </span>
                  <span className="text-blue-800">
                    Garments cleaned, steam-pressed, and delivered within ~{activeService?.turnaroundHours || 24} hours of collection.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: CUSTOMER CONTACT & DOORSTEP ADDRESS */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs">
                3
              </span>
              <h2 className="text-sm sm:text-base font-black text-zinc-950">Customer Contact & Address Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Phone Number (+91) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="tel"
                    placeholder="+91 98450 12345"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                  Doorstep Address (Flat, House No, Building, Street) *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <textarea
                    rows={2}
                    placeholder="e.g. Flat 402, Sunshine Apartments, 12th Main, Indiranagar"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Pincode</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">
                  Special Instructions / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before coming, gate security code 4492"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Order Summary & Direct Confirmation */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
            <div className="border-b border-zinc-100 pb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                Booking Breakdown
              </span>
              <h3 className="text-base sm:text-lg font-black text-zinc-950">Doorstep Order Summary</h3>
            </div>

            {/* Selected Service Card */}
            <div className="bg-orange-50/60 border border-orange-200/70 rounded-xl p-3 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] text-zinc-400 font-bold uppercase block">Service</span>
                <div className="font-black text-zinc-950 text-xs sm:text-sm">
                  {activeService?.name || 'None selected'}
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 bg-white px-2 py-0.5 rounded-full border border-orange-200 shrink-0">
                <Clock className="w-3 h-3 text-orange-600" />
                {activeService?.turnaroundHours || 24}h Return
              </span>
            </div>

            {/* Selected Items List */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Selected Garments</div>
              {selectedItemsList.length === 0 ? (
                <div className="text-xs text-zinc-400 italic py-2.5 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  Select garment quantities in Step 1.
                </div>
              ) : (
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1 divide-y divide-zinc-100">
                  {selectedItemsList.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1.5"
                    >
                      <span className="font-bold text-zinc-800">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-medium">
                        {item.quantity} {item.unit || 'pcs'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collection & Fulfillment Details */}
            <div className="border-t border-zinc-200/80 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Doorstep Collection:</span>
                <span className="font-bold text-emerald-600">Free Doorstep Pickup</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Payment Mode:</span>
                <span className="font-medium text-zinc-800">Pay on Delivery / Collection</span>
              </div>
              <div className="flex justify-between text-zinc-900 border-t border-zinc-200/80 pt-2 font-black text-sm">
                <span>Total Garments:</span>
                <span className="font-mono text-orange-600 text-base">{totalItemCount} Items</span>
              </div>
            </div>

            {/* Submit Confirmation Button (Always Enabled for Valid Orders) */}
            <button
              type="submit"
              disabled={isSubmitting || totalItemCount === 0}
              className="w-full btn-orange py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? (
                <span>Scheduling Pickup...</span>
              ) : (
                <>
                  <span>Confirm Doorstep Booking</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No pre-payment required • Pay on collection</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
