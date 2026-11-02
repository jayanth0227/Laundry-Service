import React, { useState, useEffect } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { ServiceItem, RegisteredItem } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  X,
  Save,
  Layers,
  Shirt,
  DollarSign,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

export const ServicesManagementPage: React.FC = () => {
  const {
    services,
    registeredItems,
    createService,
    updateService,
    deleteService,
    createItem,
    deleteItem,
    allocatePrices,
    loading,
  } = useLaundry();

  // Active Tab: 'services' | 'garments' | 'pricing'
  const [activeTab, setActiveTab] = useState<'services' | 'garments' | 'pricing'>('services');

  // ---------- 1. SERVICES MANAGEMENT ----------
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [turnaroundHours, setTurnaroundHours] = useState<number>(24);
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceImage, setServiceImage] = useState('');

  const openServiceForm = (srv?: ServiceItem) => {
    if (srv) {
      setEditingService(srv);
      setServiceName(srv.name);
      setTurnaroundHours(srv.turnaroundHours);
      setServiceDescription(srv.description || '');
      setServiceImage(srv.image || '');
    } else {
      setEditingService(null);
      setServiceName('');
      setTurnaroundHours(24);
      setServiceDescription('');
      setServiceImage('');
    }
    setIsServiceFormOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    const payload = {
      name: serviceName.trim(),
      turnaroundHours,
      description: serviceDescription.trim(),
      image: serviceImage.trim(),
      active: true,
    };

    if (editingService) {
      await updateService(editingService.id, payload);
    } else {
      await createService(payload);
    }
    setIsServiceFormOpen(false);
  };

  // ---------- 2. GARMENT REGISTRY (Quick-Add) ----------
  const [newGarmentName, setNewGarmentName] = useState('');
  const [newGarmentUnit, setNewGarmentUnit] = useState('piece');
  const [isAddingGarment, setIsAddingGarment] = useState(false);

  const handleAddGarment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGarmentName.trim()) return;
    setIsAddingGarment(true);
    try {
      await createItem({
        name: newGarmentName.trim(),
        unit: newGarmentUnit.trim(),
      });
      setNewGarmentName('');
    } finally {
      setIsAddingGarment(false);
    }
  };

  // ---------- 3. PRICE ALLOCATION ----------
  const [selectedPricingServiceId, setSelectedPricingServiceId] = useState<string>('');

  const activePricingService =
    services.find((s) => s.id === selectedPricingServiceId) || services[0] || null;

  const [draftPrices, setDraftPrices] = useState<Record<string, number>>({});
  const [isSavingPrices, setIsSavingPrices] = useState(false);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  useEffect(() => {
    if (activePricingService) {
      const map: Record<string, number> = {};
      if (activePricingService.items) {
        activePricingService.items.forEach((it) => {
          map[it.itemName] = it.price;
        });
      }
      setDraftPrices(map);
      setSavedSuccessMessage(false);
    }
  }, [activePricingService]);

  const handlePriceChange = (itemName: string, price: number) => {
    setDraftPrices((prev) => ({
      ...prev,
      [itemName]: Math.max(0, price),
    }));
    setSavedSuccessMessage(false);
  };

  const handleSavePriceAllocation = async () => {
    if (!activePricingService) return;
    setIsSavingPrices(true);
    try {
      const allocations = registeredItems.map((item) => ({
        itemId: item.id || item._id,
        itemName: item.name,
        price: draftPrices[item.name] ?? 0,
        unit: item.unit || 'piece',
      }));

      await allocatePrices(activePricingService.id, allocations);
      setSavedSuccessMessage(true);
      setTimeout(() => setSavedSuccessMessage(false), 4000);
    } finally {
      setIsSavingPrices(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-28 md:pb-12 px-2 sm:px-0">
      {/* Header with Title and Quick Action: clean, non-wrapping layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight whitespace-nowrap">
              Services & Pricing
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
              {services.length} Services
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            Manage treatments, registered garments, and prices in Indian Rupee (₹ INR)
          </p>
        </div>

        {activeTab === 'services' && (
          <div className="flex justify-end w-full sm:w-auto">
            <button
              type="button"
              onClick={() => openServiceForm()}
              className="px-3.5 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all shadow-xs flex items-center gap-1.5 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Navigation: Mobile Dropdown with CustomSelect */}
      <div className="sm:hidden">
        <CustomSelect
          value={activeTab}
          onChange={(val) => setActiveTab(val as 'services' | 'garments' | 'pricing')}
          options={[
            {
              value: 'services',
              label: `Services Catalog (${services.length})`,
              description: 'Manage treatment categories & hours',
              icon: <Layers className="w-4 h-4" />
            },
            {
              value: 'garments',
              label: `Registered Garments (${registeredItems.length})`,
              description: 'Manage garment registry & units',
              icon: <Shirt className="w-4 h-4" />
            },
            {
              value: 'pricing',
              label: 'Pricing Matrix',
              description: 'Configure INR item rates',
              icon: <DollarSign className="w-4 h-4" />
            },
          ]}
        />
      </div>

      {/* Tab Navigation: Desktop Segmented Tabs */}
      <div className="hidden sm:flex items-center gap-1 bg-zinc-200/70 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'services'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Services</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'services' ? 'bg-orange-600 text-white' : 'bg-zinc-200/80 text-zinc-600'
            }`}
          >
            {services.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('garments')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'garments'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Shirt className="w-3.5 h-3.5" />
          <span>Garments</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              activeTab === 'garments' ? 'bg-orange-600 text-white' : 'bg-zinc-200/80 text-zinc-600'
            }`}
          >
            {registeredItems.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'pricing'
              ? 'bg-white text-zinc-950 shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Pricing Matrix</span>
        </button>
      </div>

      {/* ==================== 1. SERVICES TAB ==================== */}
      {activeTab === 'services' && (
        <div className="space-y-3">
          {/* Add / Edit Service Inline Card */}
          {isServiceFormOpen && (
            <div className="bg-white border-2 border-orange-500 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                <h3 className="text-sm sm:text-base font-black text-zinc-950">
                  {editingService ? `Edit Service: ${editingService.name}` : 'Create New Service'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsServiceFormOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">Service Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Wash & Iron, Dry Wash, Steam Press"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <CustomSelect
                  label="Turnaround Time"
                  value={turnaroundHours}
                  onChange={(val) => setTurnaroundHours(Number(val))}
                  options={[
                    { value: 12, label: '12 Hours (Same Day Delivery)' },
                    { value: 24, label: '24 Hours (Next Day Delivery)' },
                    { value: 48, label: '48 Hours (2 Days Delivery)' },
                    { value: 72, label: '72 Hours (3 Days Delivery)' },
                  ]}
                />

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Treatment description (e.g. hygienic washing with steam pressing)..."
                    value={serviceDescription}
                    onChange={(e) => setServiceDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-zinc-700 block mb-1">Photo Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={serviceImage}
                    onChange={(e) => setServiceImage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsServiceFormOpen(false)}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 transition-all shadow-xs flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Service</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Clean Mobile-Friendly Services Card List */}
          {services.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-xs text-zinc-400">
              No services added yet. Click &ldquo;Add Service&rdquo; above.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((srv) => (
                <div
                  key={srv.id}
                  className="bg-white border-2 border-zinc-200/90 hover:border-orange-300 rounded-2xl p-4 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      {srv.image ? (
                        <img
                          src={srv.image}
                          alt={srv.name}
                          className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 font-black flex items-center justify-center shrink-0 border border-orange-100">
                          {srv.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-black text-sm text-zinc-950 truncate">{srv.name}</h4>
                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60 mt-0.5">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>{srv.turnaroundHours}h Return</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openServiceForm(srv)}
                        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Edit service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (window.confirm(`Delete service "${srv.name}"?`)) {
                            await deleteService(srv.id);
                          }
                        }}
                        className="p-1.5 rounded-lg border border-zinc-200 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {srv.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {srv.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Configured garments:</span>
                    <span className="font-bold text-zinc-700">
                      {srv.items?.length || 0} items priced
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. GARMENT REGISTRY TAB ==================== */}
      {activeTab === 'garments' && (
        <div className="space-y-3">
          {/* Quick-Add Garment Form */}
          <form
            onSubmit={handleAddGarment}
            className="bg-white border-2 border-zinc-200 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="relative flex-1">
              <Shirt className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Garment name (e.g. Shirt, Saree, Bedsheet)..."
                value={newGarmentName}
                onChange={(e) => setNewGarmentName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="w-full sm:w-40">
              <CustomSelect
                value={newGarmentUnit}
                onChange={(val) => setNewGarmentUnit(String(val))}
                options={[
                  { value: 'piece', label: 'per piece' },
                  { value: 'pair', label: 'per pair' },
                  { value: 'set', label: 'per set' },
                  { value: 'kg', label: 'per kg' },
                ]}
              />
            </div>

            <button
              type="submit"
              disabled={isAddingGarment || !newGarmentName.trim()}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-all shadow-xs flex items-center justify-center gap-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Garment</span>
            </button>
          </form>

          {/* Garments List Grid */}
          {registeredItems.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-8 text-center text-xs text-zinc-400">
              No garments registered. Add a garment above to configure pricing.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {registeredItems.map((item) => {
                const id = item.id || item._id!;
                return (
                  <div
                    key={id}
                    className="bg-white border border-zinc-200 hover:border-orange-300 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-zinc-900 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        per {item.unit || 'piece'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete garment "${item.name}"?`)) {
                          await deleteItem(id);
                        }
                      }}
                      className="p-1 rounded-md text-zinc-300 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                      title="Delete garment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. PRICE ALLOCATION TAB ==================== */}
      {activeTab === 'pricing' && (
        <div className="space-y-3">
          {/* Service Selector Dropdown */}
          <div className="bg-white border-2 border-zinc-200 rounded-2xl p-3.5 shadow-xs space-y-2">
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Select Service to Allocate Prices:
            </label>

            {services.length === 0 ? (
              <div className="text-xs text-zinc-400 italic py-2">
                No services added yet. Please add a service first.
              </div>
            ) : (
              <CustomSelect
                value={activePricingService?.id || ''}
                onChange={(val) => setSelectedPricingServiceId(String(val))}
                options={services.map((srv) => ({
                  value: srv.id,
                  label: `${srv.name} (${srv.turnaroundHours}h)`,
                  description: `${srv.turnaroundHours}h turnaround`,
                }))}
                size="md"
              />
            )}
          </div>

          {/* Allocation Grid */}
          {activePricingService && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="border-b border-zinc-100 pb-3">
                <h3 className="text-sm sm:text-base font-black text-zinc-950">
                  Garment Prices for &ldquo;{activePricingService.name}&rdquo;
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Set price per garment item in ₹ INR for this service.
                </p>
              </div>

              {registeredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  No garments registered yet. Add garments in the &ldquo;Garments&rdquo; tab first.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {registeredItems.map((item) => {
                    const priceVal = draftPrices[item.name] ?? 0;
                    return (
                      <div
                        key={item.name}
                        className="bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 space-y-1.5 hover:border-orange-300 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-zinc-900 text-xs truncate" title={item.name}>
                            {item.name}
                          </span>
                          <span className="text-[9px] text-zinc-400 uppercase font-medium shrink-0">
                            /{item.unit || 'pc'}
                          </span>
                        </div>

                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-zinc-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={priceVal}
                            onChange={(e) => handlePriceChange(item.name, Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-zinc-300 text-xs font-mono font-black text-zinc-950 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Action Row: Save Prices button aligned to bottom right */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <div>
                  {savedSuccessMessage && (
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Prices Saved!</span>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSavePriceAllocation}
                  disabled={isSavingPrices}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingPrices ? 'Saving...' : 'Save Prices'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
