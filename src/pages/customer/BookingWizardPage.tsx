import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Droplets,
  CreditCard,
  Banknote,
  Sparkles,
  Shirt,
  Scale
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, Textarea } from '../../components/ui/Select';

export const BookingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { services, createOrder } = useLaundry();

  const stateData = location.state as {
    initialWashKg?: number;
    initialShirts?: number;
    initialSuits?: number;
    initialDuvets?: number;
  } | null;

  // Step state: 1 -> 2 -> 3 -> 4
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Step 1 (Services & Garments)
  const [washKg, setWashKg] = useState<number>(stateData?.initialWashKg ?? 6);
  const [shirtCount, setShirtCount] = useState<number>(stateData?.initialShirts ?? 2);
  const [suitCount, setSuitCount] = useState<number>(stateData?.initialSuits ?? 1);
  const [duvetCount, setDuvetCount] = useState<number>(stateData?.initialDuvets ?? 0);

  // Step 2: Schedule
  const todayDate = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [pickupDate, setPickupDate] = useState<string>(todayDate);
  const [pickupSlot, setPickupSlot] = useState<string>('09:00 - 11:00');
  const [deliveryDate, setDeliveryDate] = useState<string>(tomorrow);
  const [deliverySlot, setDeliverySlot] = useState<string>('17:00 - 19:00');

  // Step 3: Contact & Address
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Springfield');
  const [zipCode, setZipCode] = useState('97477');
  const [addressInstructions, setAddressInstructions] = useState('');
  const [detergentPreference, setDetergentPreference] = useState('Standard Eco Detergent');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Step 4: Payment
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Cash on Delivery' | 'Apple Pay'>('Credit Card');

  // Calculations
  const calculatePricing = () => {
    const washRate = 2.50;
    const shirtRate = 3.75;
    const suitRate = 14.50;
    const duvetRate = 22.00;

    const subtotal =
      washKg * washRate +
      shirtCount * shirtRate +
      suitCount * suitRate +
      duvetCount * duvetRate;

    const deliveryFee = subtotal >= 35 ? 0 : 4.00;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const grandTotal = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      tax,
      grandTotal,
    };
  };

  const pricing = calculatePricing();

  const handleNext = () => {
    if (currentStep === 1) {
      if (washKg === 0 && shirtCount === 0 && suitCount === 0 && duvetCount === 0) {
        alert('Please select at least one garment or wash quantity.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!pickupDate || !pickupSlot || !deliveryDate || !deliverySlot) {
        alert('Please select valid pickup and delivery time windows.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!customerName.trim() || !customerPhone.trim() || !streetAddress.trim()) {
        alert('Please provide your name, phone number, and street address.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    try {
      const items = [];
      if (washKg > 0) items.push({ name: 'Everyday Wash & Fold', quantity: washKg, unit: 'kg', unitPrice: 2.50 });
      if (shirtCount > 0) items.push({ name: 'Executive Shirt Press & Finish', quantity: shirtCount, unit: 'item', unitPrice: 3.75 });
      if (suitCount > 0) items.push({ name: '2-Piece Business Suit Dry Clean', quantity: suitCount, unit: 'set', unitPrice: 14.50 });
      if (duvetCount > 0) items.push({ name: 'Duvet / Comforter (Queen/King)', quantity: duvetCount, unit: 'item', unitPrice: 22.00 });

      const newOrder = await createOrder({
        customerName,
        customerPhone,
        customerEmail,
        serviceType: items.map(i => i.name).join(', '),
        items,
        weightKg: washKg > 0 ? washKg : null,
        pickupDate,
        pickupSlot,
        deliveryDate,
        deliverySlot,
        address: {
          street: streetAddress,
          city,
          zipCode,
          instructions: addressInstructions,
        },
        detergentPreference,
        specialInstructions,
        totalAmount: pricing.subtotal,
        paymentMethod,
      });

      // Redirect to tracking page with newly created order
      navigate(`/track?orderId=${newOrder.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
          Streamlined Booking
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Schedule Doorstep Collection & Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Complete the 4 steps below. Driver collects at your scheduled window and provides digital bag receipt.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-4 gap-2 mb-8 border-b border-slate-200 pb-4 text-xs font-medium">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            1
          </span>
          <span className="hidden sm:inline">Garments</span>
        </div>

        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            2
          </span>
          <span className="hidden sm:inline">Schedule</span>
        </div>

        <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            3
          </span>
          <span className="hidden sm:inline">Address & Care</span>
        </div>

        <div className={`flex items-center gap-2 ${currentStep >= 4 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${currentStep >= 4 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}>
            4
          </span>
          <span className="hidden sm:inline">Review & Pay</span>
        </div>
      </div>

      {/* Main Grid: Form Steps + Order Summary Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Step Area */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
          {/* STEP 1: Garment Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Step 1: Choose Garments & Estimated Weight</h2>
                <p className="text-xs text-slate-500">Exact weights are verified with certified scale upon collection.</p>
              </div>

              {/* Wash & Fold Slider */}
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Everyday Wash & Fold</h3>
                    <p className="text-xs text-slate-500">$2.50 per kg (Separated whites/colors, tumble dried, folded)</p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{washKg} kg</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={washKg}
                  onChange={(e) => setWashKg(Number(e.target.value))}
                  className="w-full accent-slate-900 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0 kg</span>
                  <span>Typical bag: 5-8 kg</span>
                  <span>20 kg</span>
                </div>
              </div>

              {/* Itemized Garments Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Shirts */}
                <div className="border border-slate-200 rounded-md p-3.5 space-y-2 bg-white">
                  <div className="text-xs font-semibold text-slate-900">Executive Shirts</div>
                  <div className="text-[11px] text-slate-500">$3.75 / hanger press</div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShirtCount(Math.max(0, shirtCount - 1))}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-900">{shirtCount}</span>
                    <button
                      type="button"
                      onClick={() => setShirtCount(shirtCount + 1)}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Suits */}
                <div className="border border-slate-200 rounded-md p-3.5 space-y-2 bg-white">
                  <div className="text-xs font-semibold text-slate-900">2-Piece Suits</div>
                  <div className="text-[11px] text-slate-500">$14.50 / eco dry clean</div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setSuitCount(Math.max(0, suitCount - 1))}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-900">{suitCount}</span>
                    <button
                      type="button"
                      onClick={() => setSuitCount(suitCount + 1)}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Duvets */}
                <div className="border border-slate-200 rounded-md p-3.5 space-y-2 bg-white">
                  <div className="text-xs font-semibold text-slate-900">Duvet / Bedding</div>
                  <div className="text-[11px] text-slate-500">$22.00 / sanitization</div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setDuvetCount(Math.max(0, duvetCount - 1))}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-900">{duvetCount}</span>
                    <button
                      type="button"
                      onClick={() => setDuvetCount(duvetCount + 1)}
                      className="w-7 h-7 rounded border border-slate-300 font-semibold hover:bg-slate-100 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scheduling Windows */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Step 2: Pickup & Delivery Time Slots</h2>
                <p className="text-xs text-slate-500">Couriers operate daily with guaranteed 2-hour arrival windows.</p>
              </div>

              {/* Pickup Section */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-teal-700" />
                  <span>Doorstep Collection Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Collection Date"
                    type="date"
                    min={todayDate}
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                  />
                  <Select
                    label="2-Hour Arrival Slot"
                    value={pickupSlot}
                    onChange={(e) => setPickupSlot(e.target.value)}
                    options={[
                      { value: '08:00 - 10:00', label: '08:00 - 10:00 AM (Morning Route)' },
                      { value: '10:00 - 12:00', label: '10:00 - 12:00 PM (Mid-day Route)' },
                      { value: '14:00 - 16:00', label: '14:00 - 16:00 PM (Afternoon Route)' },
                      { value: '17:00 - 19:00', label: '17:00 - 19:00 PM (Evening Route)' },
                      { value: '19:00 - 21:00', label: '19:00 - 21:00 PM (Late Route)' },
                    ]}
                  />
                </div>
              </div>

              {/* Delivery Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span>Return Delivery Window</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Delivery Date"
                    type="date"
                    min={pickupDate || tomorrow}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                  <Select
                    label="2-Hour Delivery Slot"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    options={[
                      { value: '08:00 - 10:00', label: '08:00 - 10:00 AM' },
                      { value: '10:00 - 12:00', label: '10:00 - 12:00 PM' },
                      { value: '14:00 - 16:00', label: '14:00 - 16:00 PM' },
                      { value: '17:00 - 19:00', label: '17:00 - 19:00 PM' },
                      { value: '19:00 - 21:00', label: '19:00 - 21:00 PM' },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Fabric Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Step 3: Contact & Garment Care Preferences</h2>
                <p className="text-xs text-slate-500">Provide pickup location and specify custom washing instructions.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
                <Input
                  label="Phone (SMS Updates)"
                  placeholder="e.g. (555) 000-0000"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
                <Input
                  label="Email (Digital Receipt)"
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address / Apt / Suite"
                    placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="ZIP Code"
                  placeholder="97477"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
              </div>

              <Input
                label="Building Access / Gate Code / Concierge Notes"
                placeholder="e.g. Gate code #1234. Leave with front desk if not home."
                value={addressInstructions}
                onChange={(e) => setAddressInstructions(e.target.value)}
              />

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <Select
                  label="Detergent & Softener Specification"
                  value={detergentPreference}
                  onChange={(e) => setDetergentPreference(e.target.value)}
                  options={[
                    { value: 'Standard Eco Detergent', label: 'Standard Eco Detergent (Light Fresh Clean)' },
                    { value: 'Hypoallergenic / Fragrance-Free', label: 'Hypoallergenic / Fragrance-Free (Zero Dyes, Sensitive Skin)' },
                    { value: 'Extra Softener & Lavender', label: 'Extra Fabric Softener & Lavender Essence' },
                  ]}
                />

                <Textarea
                  label="Special Garment Handling Notes (Optional)"
                  rows={2}
                  placeholder="e.g. Spot clean wine splash on blue shirt; wash activewear in cold cycle only."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review & Payment Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-semibold text-slate-900">Step 4: Final Verification & Payment</h2>
                <p className="text-xs text-slate-500">Review your schedule and select your preferred payment mode.</p>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Collection Details</div>
                  <div className="font-semibold text-slate-900">{pickupDate} ({pickupSlot})</div>
                  <div className="text-slate-600">{streetAddress}, {city} {zipCode}</div>
                  {addressInstructions && <div className="text-slate-500 italic mt-1">Note: {addressInstructions}</div>}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contact & Preferences</div>
                  <div className="font-semibold text-slate-900">{customerName} — {customerPhone}</div>
                  <div className="text-slate-600">{detergentPreference}</div>
                  <div className="text-slate-500">Delivery: {deliveryDate} ({deliverySlot})</div>
                </div>
              </div>

              {/* Payment Mode Selector */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Payment Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    className={`border rounded-md p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'Credit Card'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4 text-slate-700" />
                      <input
                        type="radio"
                        name="payment"
                        value="Credit Card"
                        checked={paymentMethod === 'Credit Card'}
                        onChange={() => setPaymentMethod('Credit Card')}
                        className="accent-slate-900"
                      />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-900">Card Online / Tap</div>
                    <div className="text-[10px] text-slate-500">Courier brings portable card reader</div>
                  </label>

                  <label
                    className={`border rounded-md p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'Apple Pay'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="w-4 h-4 text-slate-700" />
                      <input
                        type="radio"
                        name="payment"
                        value="Apple Pay"
                        checked={paymentMethod === 'Apple Pay'}
                        onChange={() => setPaymentMethod('Apple Pay')}
                        className="accent-slate-900"
                      />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-900">Apple Pay / Google Pay</div>
                    <div className="text-[10px] text-slate-500">Contactless digital payment</div>
                  </label>

                  <label
                    className={`border rounded-md p-3.5 flex flex-col justify-between cursor-pointer transition-colors ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Banknote className="w-4 h-4 text-slate-700" />
                      <input
                        type="radio"
                        name="payment"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="accent-slate-900"
                      />
                    </div>
                    <div className="mt-2 text-xs font-semibold text-slate-900">Cash on Delivery</div>
                    <div className="text-[10px] text-slate-500">Pay courier upon bag return</div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="pt-6 mt-6 border-t border-slate-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <Button variant="primary" size="md" onClick={handleNext}>
                <span>Continue to Step {currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 text-teal-400" />
              </Button>
            ) : (
              <Button
                variant="accent"
                size="md"
                onClick={handleSubmitOrder}
                isLoading={isSubmitting}
              >
                <span>Confirm & Schedule Pickup (${pricing.grandTotal.toFixed(2)})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Right Sticky Order Summary */}
        <div className="lg:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4 shadow-subtle">
          <div className="border-b border-slate-200 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Estimated Bag Order</h3>
            <p className="text-[11px] text-slate-500">Itemized cost estimate</p>
          </div>

          <div className="space-y-2 text-xs">
            {washKg > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">{washKg} kg Wash & Fold ($2.50)</span>
                <span className="font-medium text-slate-900">${(washKg * 2.50).toFixed(2)}</span>
              </div>
            )}
            {shirtCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">{shirtCount} Executive Shirts ($3.75)</span>
                <span className="font-medium text-slate-900">${(shirtCount * 3.75).toFixed(2)}</span>
              </div>
            )}
            {suitCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">{suitCount} 2-Piece Suits ($14.50)</span>
                <span className="font-medium text-slate-900">${(suitCount * 14.50).toFixed(2)}</span>
              </div>
            )}
            {duvetCount > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">{duvetCount} Duvet/Comforter ($22.00)</span>
                <span className="font-medium text-slate-900">${(duvetCount * 22.00).toFixed(2)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery & Collection</span>
              <span className="font-medium">
                {pricing.deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-semibold">FREE</span>
                ) : (
                  `$${pricing.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (8%)</span>
              <span className="font-medium text-slate-900">${pricing.tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-xs uppercase font-bold text-slate-700">Estimated Total</span>
            <span className="text-xl font-bold text-slate-900">${pricing.grandTotal.toFixed(2)}</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-md text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>SLA Guarantee</span>
            </div>
            <p>Garments collected, individually washed, and returned in sealed weather-proof packaging.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

