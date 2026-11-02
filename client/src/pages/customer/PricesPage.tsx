import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import {
  Clock,
  ArrowRight,
  Sparkles,
  Shirt,
  Calendar,
  ShieldCheck,
  Search,
  Check,
  Flame,
  ChevronDown,
  X,
  LayoutGrid,
  List,
  Tag
} from 'lucide-react';

export const PricesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlServiceId = searchParams.get('serviceId');

  const { services, loading } = useLaundry();

  const [selectedServiceId, setSelectedServiceId] = useState<string>(urlServiceId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with url parameter if updated
  useEffect(() => {
    if (urlServiceId) {
      setSelectedServiceId(urlServiceId);
    }
  }, [urlServiceId]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeService = useMemo(() => {
    if (services.length === 0) return null;
    if (selectedServiceId) {
      const found = services.find((s) => s.id === selectedServiceId);
      if (found) return found;
    }
    return services[0];
  }, [services, selectedServiceId]);

  // Garment items available under active service
  const displayedItems = useMemo(() => {
    if (!activeService || !activeService.items) return [];
    const pricedItems = activeService.items.filter((it) => Number(it.price) > 0);
    if (!searchQuery.trim()) return pricedItems;
    const q = searchQuery.toLowerCase();
    return pricedItems.filter((it) => it.itemName.toLowerCase().includes(q));
  }, [activeService, searchQuery]);

  // Minimum starting price for this service
  const minPrice = useMemo(() => {
    if (!activeService?.items || activeService.items.length === 0) return null;
    const priced = activeService.items.filter((it) => Number(it.price) > 0);
    if (priced.length === 0) return null;
    return Math.min(...priced.map((it) => Number(it.price)));
  }, [activeService]);

  const handleSelectService = (id: string) => {
    setSelectedServiceId(id);
    setIsDropdownOpen(false);
    setSearchQuery('');
    setSearchParams({ serviceId: id });
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-3.5 sm:space-y-5">
      {/* Compact Page Header (No space-wasting 'Back to Home' button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 mb-0.5">
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Garment Rates & Pricing Card</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black text-zinc-950 tracking-tight">
            Laundry Services & Garment Prices (₹ INR)
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600 font-medium bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Free doorstep pickup & return on orders over ₹499</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400">Loading service pricing chart...</div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-orange-500 mx-auto" />
          <div className="font-bold text-zinc-900 text-sm">No services currently available</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Services and prices added by the administrator will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* COMPACT CONTROL BAR: SERVICE DROPDOWN, SEARCH & VIEW TOGGLE */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 sm:p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            {/* Service Dropdown Selector */}
            <div className="relative flex-1 sm:max-w-xs" ref={dropdownRef}>
              <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-0.5">
                Select Service
              </label>

              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-left transition-all ${
                  isDropdownOpen
                    ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/20'
                    : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/70'
                }`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-orange-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                    {activeService?.name.charAt(0) || 'S'}
                  </div>
                  <span className="text-xs font-bold text-zinc-950 truncate">
                    {activeService?.name || 'Choose a service'}
                  </span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-800 shrink-0">
                    {activeService?.turnaroundHours}h
                  </span>
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-orange-600' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu Options */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-zinc-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto p-1.5 space-y-1 animate-in fade-in duration-100">
                  {services.map((srv) => {
                    const isSelected = activeService?.id === srv.id;
                    const itemsCount = srv.items?.filter((it) => Number(it.price) > 0).length || 0;

                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => handleSelectService(srv.id)}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? 'bg-orange-50 text-orange-950 border border-orange-200 font-bold'
                            : 'hover:bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected ? 'bg-orange-600 text-white' : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {srv.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate flex items-center gap-1">
                              <span>{srv.name}</span>
                              {isSelected && <Check className="w-3 h-3 text-orange-600 inline" />}
                            </div>
                            <div className="text-[10px] text-zinc-500">
                              {itemsCount} {itemsCount === 1 ? 'garment' : 'garments'}
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                          {srv.turnaroundHours}h Return
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Garment Search Input */}
            <div className="relative flex-1">
              <label className="block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-0.5">
                Search In Garments
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeService?.name || ''} garments (e.g. Saree, Shirt)...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-zinc-50/70 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* View Mode Toggle & Items Count */}
            <div className="flex items-end justify-between sm:justify-start gap-2 shrink-0">
              <div className="text-[10px] text-zinc-500 font-bold sm:hidden">
                {displayedItems.length} {displayedItems.length === 1 ? 'garment' : 'garments'}
              </div>
              <div>
                <label className="hidden sm:block text-[9px] font-black uppercase tracking-wider text-zinc-400 mb-0.5 opacity-0">
                  View
                </label>
                <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-orange-600 shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                    title="List view"
                    aria-label="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* COMPACT ACTIVE SERVICE STRIP (Minimal height, highly visible CTA) */}
          {activeService && (
            <div className="bg-gradient-to-r from-orange-50/80 via-white to-orange-50/40 border border-orange-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                {activeService.image ? (
                  <img
                    src={activeService.image}
                    alt={activeService.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-orange-200 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                    {activeService.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-zinc-950">
                      {activeService.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200">
                      <Clock className="w-3 h-3 text-orange-600" />
                      <span>{activeService.turnaroundHours}h Guarantee</span>
                    </span>
                    {minPrice !== null && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-white px-2 py-0.5 rounded-md border border-zinc-200">
                        <Tag className="w-3 h-3 text-zinc-400" />
                        <span>From ₹{minPrice}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 truncate sm:line-clamp-1 max-w-xl mt-0.5">
                    {activeService.description || 'Professional garment care with doorstep pickup and delivery.'}
                  </p>
                </div>
              </div>

              {/* Booking CTA Button */}
              <div className="shrink-0 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate(`/book?serviceId=${activeService.id}`)}
                  className="w-full sm:w-auto btn-orange px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Pickup</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </div>
            </div>
          )}

          {/* AVAILABLE GARMENT ITEMS SECTION (Immediately visible on mobile screen) */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-3 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-[11px] sm:text-xs uppercase font-black text-zinc-800 tracking-wider flex items-center gap-2">
                <span>Available Garments ({activeService?.name})</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                  {displayedItems.length} {displayedItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                >
                  <span>Clear &ldquo;{searchQuery}&rdquo;</span>
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {displayedItems.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-xs text-zinc-500 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-2">
                <p className="font-bold text-zinc-700 text-sm">No garments found</p>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  {searchQuery
                    ? `No garment in ${activeService?.name} matches "${searchQuery}". Try a different keyword.`
                    : 'No individual item prices have been allocated for this service yet.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reset search filter</span>
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {displayedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-50/80 hover:bg-orange-50/40 border border-zinc-200/90 hover:border-orange-300 rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-sm group"
                  >
                    <div>
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white border border-zinc-200 text-orange-600 flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 group-hover:bg-orange-600 group-hover:text-white transition-all">
                        <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div
                        className="font-black text-zinc-900 text-xs leading-snug line-clamp-2"
                        title={item.itemName}
                      >
                        {item.itemName}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-medium mt-0.5">
                        per {item.unit || 'piece'}
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-zinc-200/60 flex items-baseline justify-between">
                      <span className="text-[10px] font-bold text-zinc-400">Rate:</span>
                      <span className="font-mono font-black text-sm sm:text-base text-zinc-950 group-hover:text-orange-600 transition-colors">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW (Ultra-clean, compact, high-efficiency price sheet) */
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-100 shadow-xs">
                {displayedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3 sm:px-4 py-2.5 flex items-center justify-between hover:bg-orange-50/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                        <Shirt className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-zinc-900 truncate">
                          {item.itemName}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-medium">
                          per {item.unit || 'piece'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-black text-sm sm:text-base text-orange-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Trust Strip */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2 text-center sm:text-left text-[11px] sm:text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free doorstep pickup & return on orders over ₹499. Pay on delivery.</span>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/book?serviceId=${activeService?.id}`)}
                className="font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0 text-xs"
              >
                <span>Book this service pickup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
