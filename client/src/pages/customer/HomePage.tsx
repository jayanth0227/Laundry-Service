import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import {
  Sparkles,
  Flame,
  Droplets,
  Clock,
  ArrowRight,
  MapPin,
  Check,
  ShieldCheck,
  Truck,
  Shirt,
  Calendar,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { HeroLaundryVisual } from '../../components/home/HeroLaundryVisual';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { services, loading } = useLaundry();

  const [postalCode, setPostalCode] = useState('');
  const [postalStatus, setPostalStatus] = useState<'idle' | 'success'>('idle');

  const handlePostalCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postalCode.trim()) return;
    setPostalStatus('success');
  };

  return (
    <div className="relative pb-20 space-y-16">
      {/* Hero Section: Commercial Fabric Care (Orange & Black Theme) */}
      <section className="bg-white border-b border-zinc-200 pt-6 sm:pt-10 pb-8 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[10px] sm:text-xs font-bold text-orange-700 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse shrink-0"></span>
                <span>Commercial Fabric Care & Steam Ironing</span>
                <span className="hidden sm:inline text-orange-300">•</span>
                <span className="hidden sm:inline text-zinc-600 font-medium">Metro City Coverage</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 leading-[1.12]">
                Crisp, Fresh Clothes.{' '}
                <span className="text-orange-600">Zero Effort.</span>
              </h1>

              <p className="text-sm sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
                Dedicated machine cycles for every customer. High-temperature steam dry ironing, hypoallergenic detergent, and guaranteed 24-hour collection and return across the metro area.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link to="/prices" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="btn-orange w-full sm:w-auto font-black text-xs shadow-md">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>View Services & Prices</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>

                <Link to="/book" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto font-black text-xs border-zinc-300">
                    <Calendar className="w-4 h-4 mr-2 text-orange-600" />
                    <span>Book Doorstep Pickup</span>
                  </Button>
                </Link>
              </div>

              {/* Service Pincode Quick-Checker */}
              <form onSubmit={handlePostalCheck} className="max-w-md pt-1">
                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                  <div className="flex items-center gap-2 pl-3 text-zinc-400 w-full">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter pincode (e.g. 560001)"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none w-full"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-orange px-4 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap shadow-sm hover:shadow"
                  >
                    Check Slot
                  </button>
                </div>
                {postalStatus === 'success' && (
                  <div className="mt-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-lg flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doorstep pickup is active in your pincode today!</span>
                  </div>
                )}
              </form>

              {/* Trust Signals */}
              <div className="pt-3 border-t border-zinc-100 flex flex-wrap sm:grid sm:grid-cols-3 gap-2 sm:gap-3 text-xs text-zinc-700">
                <div className="flex items-center gap-1.5 font-medium bg-zinc-50 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg sm:rounded-none border border-zinc-200/60 sm:border-0">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Never mixed with others</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium bg-zinc-50 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg sm:rounded-none border border-zinc-200/60 sm:border-0">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>Free doorstep collection</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium bg-zinc-50 sm:bg-transparent px-2.5 py-1 sm:p-0 rounded-lg sm:rounded-none border border-zinc-200/60 sm:border-0">
                  <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>24-Hour turnaround</span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Interactive Person & Laundry Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroLaundryVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ADMIN CONFIGURED SERVICES SHOWCASE SECTION */}
      <section id="services-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-100 pb-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Available Laundry Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              Our Laundry & Garment Care Services
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
              Explore services added by our facility. Select any service to directly schedule your doorstep pickup.
            </p>
          </div>

          <Link to="/prices" className="shrink-0">
            <Button variant="secondary" size="sm" className="font-bold text-xs border-zinc-300">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
              <span>View Full Price Chart</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="h-44 bg-zinc-200 rounded-2xl w-full"></div>
                <div className="h-5 bg-zinc-200 rounded w-2/3"></div>
                <div className="h-4 bg-zinc-100 rounded w-full"></div>
                <div className="h-10 bg-zinc-200 rounded-xl w-full pt-2"></div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto font-black">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">No Services Configured Yet</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Our facility is currently setting up the services catalog. Please check back shortly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const itemCount = (service.items || []).filter((it) => Number(it.price) > 0).length;
              return (
                <div
                  key={service.id}
                  className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Service Image with Turnaround Badge */}
                    <div className="relative h-48 w-full bg-zinc-100 overflow-hidden">
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                          <Shirt className="w-12 h-12 text-orange-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-zinc-800 border border-zinc-200/60 flex items-center gap-1 shadow-sm">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span>{service.turnaroundHours || 24}h Return</span>
                      </div>
                      {service.popular && (
                        <div className="absolute top-3 left-3 bg-orange-600 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Popular
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-zinc-950 group-hover:text-orange-600 transition-colors">
                          {service.name}
                        </h3>
                        {itemCount > 0 && (
                          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            {itemCount} garments
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">
                        {service.description || 'Professional fabric cleaning and care using high-grade machines.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-6 pt-0 space-y-2">
                    <Link to={`/book?serviceId=${service.id}`} className="block">
                      <Button variant="primary" size="md" className="btn-orange w-full font-bold text-xs shadow-sm">
                        <span>Select & Book Service</span>
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            How AquaClean Works
          </h2>
          <p className="text-xs text-zinc-600">
            Convenient doorstep collection, individual drum cycles, and fast delivery back to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Schedule Doorstep Slot',
              desc: 'Select your preferred morning, afternoon or evening window online in seconds.',
              icon: Calendar,
            },
            {
              step: '02',
              title: 'Contactless Pickup',
              desc: 'Our fleet rider arrives with a sealed laundry bag to collect your garments safely.',
              icon: Truck,
            },
            {
              step: '03',
              title: 'Dedicated Cycle & Steam Iron',
              desc: 'Washed in individual drums with premium eco-detergent and flatbed steam pressed.',
              icon: Droplets,
            },
            {
              step: '04',
              title: 'Doorstep Delivery',
              desc: 'Crisply pressed and packed garments returned within 24 hours to your door.',
              icon: CheckCircle2,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-card transition-all space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-black">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black font-mono text-zinc-200">
                  {item.step}
                </span>
              </div>
              <div>
                <h3 className="font-black text-zinc-950 text-sm">{item.title}</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK LINK BANNER TO PRICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-zinc-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 z-10 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-600 text-white inline-block">
              Transparent Pricing Chart
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Looking for Garment Rates?
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              Explore our full catalog of services (*Wash & Iron*, *Dry Wash*, *Steam Iron*) and view itemized rates for shirts, trousers, sarees, and suits.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0 w-full sm:w-auto">
            <Link to="/prices" className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="btn-orange w-full font-black text-xs">
                <span>View Full Price Chart</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/book" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                className="w-full font-black text-xs border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:border-zinc-500 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-orange-500" />
                <span>Book Pickup Now</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
