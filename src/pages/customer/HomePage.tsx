import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLaundry } from '../../context/LaundryContext';
import {
  Sparkles,
  Shirt,
  Flame,
  Wind,
  Layers,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Calendar,
  Truck,
  ShieldCheck,
  CreditCard,
  Banknote,
  Droplets,
  Search,
  X,
  ChevronRight,
  Zap,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, Textarea } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

interface SelectedServiceItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { services, createOrder } = useLaundry();

  // Active Category filter
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Garments Cart state for Homepage direct booking
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({
    'srv-0': 4, // 4 items for Steam & Dry Ironing initially
    'srv-1': 5, // 5 kg for Everyday Wash & Fold
  });

  // Fast Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Booking Form State
  const todayDate = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState<string>(todayDate);
  const [pickupSlot, setPickupSlot] = useState<string>('14:00 - 16:00');
  const [deliveryDate, setDeliveryDate] = useState<string>(tomorrow);
  const [deliverySlot, setDeliverySlot] = useState<string>('17:00 - 19:00');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [addressNotes, setAddressNotes] = useState('');
  const [detergentPreference, setDetergentPreference] = useState('Standard Eco Detergent');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Apple Pay' | 'Cash on Delivery'>('Credit Card');

  // Postal code checker
  const [postalCode, setPostalCode] = useState('');
  const [postalStatus, setPostalStatus] = useState<'idle' | 'success' | 'warning'>('idle');

  const categories = [
    'All',
    'Ironing & Pressing',
    'Wash & Fold',
    'Dry Cleaning',
    'Bedding & Home',
    'Specialty Care',
  ];

  // Helper icons for categories
  const getServiceIcon = (name: string, category: string) => {
    if (name.toLowerCase().includes('iron')) {
      return <Flame className="w-6 h-6 text-amber-500" />;
    }
    if (category === 'Wash & Fold' || name.toLowerCase().includes('wash')) {
      return <Droplets className="w-6 h-6 text-cyan-500" />;
    }
    if (category === 'Dry Cleaning' || name.toLowerCase().includes('suit')) {
      return <Layers className="w-6 h-6 text-blue-500" />;
    }
    if (category === 'Bedding & Home' || name.toLowerCase().includes('duvet')) {
      return <Wind className="w-6 h-6 text-teal-500" />;
    }
    return <Sparkles className="w-6 h-6 text-emerald-500" />;
  };

  // Quantity helpers
  const getItemQty = (id: string) => cartItems[id] || 0;

  const updateItemQty = (id: string, delta: number) => {
    setCartItems((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  // Compute pricing
  const { totalItemsCount, subtotal, deliveryFee, tax, grandTotal } = useMemo(() => {
    let count = 0;
    let sum = 0;

    services.forEach((srv) => {
      const qty = cartItems[srv.id];
      if (qty && qty > 0) {
        count += qty;
        sum += qty * srv.price;
      }
    });

    const fee = sum >= 35 || sum === 0 ? 0 : 4.0;
    const computedTax = Math.round(sum * 0.08 * 100) / 100;
    const finalTotal = Math.round((sum + fee + computedTax) * 100) / 100;

    return {
      totalItemsCount: count,
      subtotal: Math.round(sum * 100) / 100,
      deliveryFee: fee,
      tax: computedTax,
      grandTotal: finalTotal,
    };
  }, [services, cartItems]);

  const filteredServices = services.filter((srv) => {
    const matchesCategory = activeCategory === 'All' || srv.category === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePostalCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postalCode.trim()) return;
    const supported = ['97477', '97478', '97401', '97402', '97403', '97405'];
    if (supported.includes(postalCode.trim())) {
      setPostalStatus('success');
    } else {
      setPostalStatus('warning');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
      alert('Please fill in your name, phone number, and address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems: SelectedServiceItem[] = [];
      services.forEach((srv) => {
        const qty = cartItems[srv.id];
        if (qty && qty > 0) {
          orderItems.push({
            name: srv.name,
            quantity: qty,
            unit: srv.unit,
            unitPrice: srv.price,
          });
        }
      });

      const primaryService = orderItems.map((i) => i.name).join(', ');

      const newOrder = await createOrder({
        customerName,
        customerPhone,
        customerEmail,
        serviceType: primaryService || 'Custom Garment Care',
        items: orderItems,
        pickupDate,
        pickupSlot,
        deliveryDate,
        deliverySlot,
        address: {
          street: streetAddress,
          city: 'Springfield',
          zipCode: postalCode.trim() || '97477',
          instructions: addressNotes,
        },
        detergentPreference,
        specialInstructions,
        totalAmount: subtotal,
        paymentMethod,
      });

      setCreatedOrder(newOrder);
      setCartItems({});
    } catch (err) {
      console.error(err);
      alert('Failed to place booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden pb-32">
      {/* Animated Floating Bubbles Background Elements */}
      <div className="absolute top-12 left-10 w-64 h-64 bg-cyan-200/40 rounded-full blur-3xl pointer-events-none -z-10 animate-float"></div>
      <div className="absolute top-48 right-12 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-float-reverse"></div>
      <div className="absolute top-96 left-1/3 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>

      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Trendy Animated Pill */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-cyan-200 text-xs font-semibold text-slate-800 shadow-glow-cyan backdrop-blur-md"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse"></span>
              <span className="text-cyan-700 font-bold uppercase tracking-wider text-[11px]">Instant Doorstep Pickup</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">Springfield Metro & Suburbs</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]"
            >
              Fresh, Crisp Garments.{' '}
              <span className="gradient-text-cyan inline-block">Picked Up & Delivered.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto"
            >
              Select your services below — from <strong>crisp steam dry ironing</strong> and <strong>fluffy wash & fold</strong> to <strong>suit dry cleaning</strong>. Drivers collect at your scheduled window and return within 24 hours.
            </motion.p>

            {/* Quick Postal Coverage Checker */}
            <motion.form
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handlePostalCheck}
              className="pt-2 max-w-md mx-auto"
            >
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 shadow-card hover:border-cyan-300 transition-colors">
                <MapPin className="w-5 h-5 text-cyan-600 ml-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter postal code (e.g. 97477)"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setPostalStatus('idle');
                  }}
                  className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none px-2 py-1"
                />
                <button
                  type="submit"
                  className="gradient-btn-cyan text-white text-xs font-semibold px-4 py-2 rounded-lg shrink-0 whitespace-nowrap"
                >
                  Check Slot
                </button>
              </div>

              {postalStatus === 'success' && (
                <div className="mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Available! Next route pickup in <strong>Springfield today at 14:00</strong>.</span>
                </div>
              )}
              {postalStatus === 'warning' && (
                <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 py-1.5 px-3 rounded-lg">
                  Standard route covers 97477, 97478, 97401-97405. For express commercial courier, call (555) 234-LNDR.
                </div>
              )}
            </motion.form>

            {/* Trust Pill Highlights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-600"
            >
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/80">
                <Zap className="w-3.5 h-3.5 text-cyan-600" />
                <span>24-Hour Express Return</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Dedicated Machine Drum</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/70 px-3 py-1 rounded-full border border-slate-200/80">
                <Truck className="w-3.5 h-3.5 text-blue-600" />
                <span>Free Doorstep Pickup over $35</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Showcase & Direct Booking Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>Select Services to Book</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Choose Services & Quantities Directly
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tap <strong>+</strong> to add items or weight. Your total updates live in the floating booking bar below.
            </p>
          </div>

          {/* Search bar inside category */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search garments (e.g. Iron, Suit)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Category Filters Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-cyan-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Interactive Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service, idx) => {
            const qty = getItemQty(service.id);
            const isSelected = qty > 0;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                  isSelected
                    ? 'bg-white border-2 border-cyan-500 shadow-glow-cyan'
                    : 'glass-card hover:border-cyan-300'
                }`}
              >
                {/* Popular pill / highlight */}
                {service.popular && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm">
                    Most Popular
                  </span>
                )}

                <div className="space-y-3">
                  {/* Top Icon & Category Tag */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-subtle">
                      {getServiceIcon(service.name, service.category)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {service.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Rate & Quantity Stepper */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Standard Rate</div>
                    <div className="text-lg font-black text-slate-900">
                      ${service.price.toFixed(2)}
                      <span className="text-xs font-normal text-slate-500"> / {service.unit}</span>
                    </div>
                    <div className="text-[10px] text-teal-700 font-semibold flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{service.turnaroundHours}h turnaround</span>
                    </div>
                  </div>

                  {/* +/- Stepper Controls */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateItemQty(service.id, -1)}
                      disabled={qty === 0}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-transform active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="w-8 text-center font-bold text-sm text-slate-900 font-mono">
                      {qty}
                    </span>

                    <button
                      type="button"
                      onClick={() => updateItemQty(service.id, 1)}
                      className="w-7 h-7 rounded-lg gradient-btn-cyan text-white font-bold flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Floating Animated Sticky Booking Bar */}
      <AnimatePresence>
        {totalItemsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-4 inset-x-0 z-40 px-4 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-slate-950/95 text-white rounded-2xl p-4 sm:p-5 border border-cyan-500/40 shadow-2xl backdrop-blur-xl pointer-events-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-glow-cyan">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg text-white">
                      ${grandTotal.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({totalItemsCount} {totalItemsCount === 1 ? 'service item' : 'service items'})
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                        Free Delivery
                      </span>
                    ) : (
                      <span className="text-[10px] text-cyan-300 font-medium">
                        +${(35 - subtotal).toFixed(2)} for FREE delivery
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Collection within 2-hour window • Delivered fresh in 24 hours
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCartItems({})}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="gradient-btn-cyan text-white text-sm font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Book Pickup Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fast Doorstep Checkout Modal / Drawer */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Schedule Doorstep Collection"
        description="Courier collects bag, weighs items, and sends digital receipt"
        maxWidth="lg"
      >
        <form onSubmit={handlePlaceOrder} className="space-y-5 text-xs">
          {/* Order Items Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Selected Services & Garments
            </div>
            <div className="divide-y divide-slate-100 max-h-36 overflow-y-auto">
              {services.map((srv) => {
                const qty = cartItems[srv.id];
                if (!qty) return null;
                return (
                  <div key={srv.id} className="py-1.5 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900">
                      {qty}x {srv.name} ({srv.unit})
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${(qty * srv.price).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center font-bold text-sm text-slate-900">
              <span>Estimated Total</span>
              <span className="text-cyan-700">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Schedule Windows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Collection Date"
              type="date"
              min={todayDate}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              required
            />
            <Select
              label="2-Hour Pickup Window"
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              options={[
                { value: '08:00 - 10:00', label: '08:00 - 10:00 AM (Morning Route)' },
                { value: '10:00 - 12:00', label: '10:00 - 12:00 PM (Midday Route)' },
                { value: '14:00 - 16:00', label: '14:00 - 16:00 PM (Afternoon Route)' },
                { value: '17:00 - 19:00', label: '17:00 - 19:00 PM (Evening Route)' },
              ]}
            />
          </div>

          {/* Customer Contact & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rachel Adams"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <Input
              label="Phone Number (SMS Arrival Alerts)"
              placeholder="(555) 000-0000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Street Address & Apt / Unit"
                placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
              />
            </div>
            <Input
              label="Door Code / Buzzer"
              placeholder="#4102"
              value={addressNotes}
              onChange={(e) => setAddressNotes(e.target.value)}
            />
          </div>

          {/* Detergent Preference & Special Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Detergent Type"
              value={detergentPreference}
              onChange={(e) => setDetergentPreference(e.target.value)}
              options={[
                { value: 'Standard Eco Detergent', label: 'Standard Eco Detergent (Crisp Fresh)' },
                { value: 'Hypoallergenic / Fragrance-Free', label: 'Hypoallergenic Fragrance-Free (Sensitive)' },
                { value: 'Extra Softener & Lavender', label: 'Extra Softener & Lavender Scent' },
              ]}
            />
            <Input
              label="Garment Note (Optional)"
              placeholder="e.g. Heavy starch on shirt collars"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Payment Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  paymentMethod === 'Credit Card'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Card on Tap
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Apple Pay')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  paymentMethod === 'Apple Pay'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Apple Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-2.5 rounded-lg border text-center font-medium transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Cash on Return
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              className="gradient-btn-cyan text-white border-0"
              isLoading={isSubmitting}
            >
              Confirm Doorstep Pickup (${grandTotal.toFixed(2)})
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Celebration Modal */}
      {createdOrder && (
        <Modal
          isOpen={Boolean(createdOrder)}
          onClose={() => setCreatedOrder(null)}
          title="Booking Confirmed!"
          description="Your courier has been notified"
          maxWidth="md"
        >
          <div className="text-center py-4 space-y-4 text-xs">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-glow-emerald"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Order #{createdOrder.id}
              </h3>
              <p className="text-slate-600 mt-1">
                Pickup scheduled for <strong>{createdOrder.pickupDate} ({createdOrder.pickupSlot})</strong>
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-slate-700 space-y-1.5">
              <div>Customer: <strong>{createdOrder.customerName}</strong> ({createdOrder.customerPhone})</div>
              <div>Address: <strong>{createdOrder.address.street}</strong></div>
              <div>Services: <span className="font-medium text-slate-900">{createdOrder.serviceType}</span></div>
              <div className="pt-1 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Grand Total</span>
                <span>${createdOrder.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-slate-500 text-[11px]">
              This order has been received by our Springfield plant dispatch team.
            </p>

            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                className="gradient-btn-cyan text-white border-0"
                onClick={() => {
                  const id = createdOrder.id;
                  setCreatedOrder(null);
                  setIsCheckoutOpen(false);
                  navigate(`/track?orderId=${id}`);
                }}
              >
                Track Live Status
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setCreatedOrder(null);
                  setIsCheckoutOpen(false);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
