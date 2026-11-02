import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import { Search, Clock, ArrowRight, Flame, Sparkles } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { services, loading } = useLaundry();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = services.filter((srv) => {
    const q = searchQuery.toLowerCase();
    return (
      srv.name.toLowerCase().includes(q) ||
      (srv.description || '').toLowerCase().includes(q) ||
      srv.items?.some((it) => it.itemName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>Garment Services & Rate Chart</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            Laundry Services & Garment Item Rates (₹ INR)
          </h1>
          <p className="text-sm text-zinc-600 mt-1 max-w-3xl">
            Clean rates configured by garment and service. Choose your service to view specific item pricing and book a doorstep slot.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search service or item (e.g. Saree, Shirt)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-300 text-xs text-zinc-900 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Services List / Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-400">Loading services and rate chart...</div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-orange-500 mx-auto" />
          <div className="font-bold text-zinc-900 text-sm">No services found</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {searchQuery ? 'Try clearing your search query.' : 'Services configured by the admin will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-card transition-all space-y-5"
            >
              {/* Header: Service Name, Photo/Icon, Turnaround, and Book Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-4">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-black text-xl shrink-0">
                      {service.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-black text-zinc-950 tracking-tight">{service.name}</h2>
                    {service.description && (
                      <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{service.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                        <Clock className="w-3 h-3 text-orange-600" />
                        <span>{service.turnaroundHours} Hours Turnaround Guarantee</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/book?serviceId=${service.id}`)}
                  className="btn-orange px-5 py-2.5 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 shadow-sm shrink-0"
                >
                  <span>Book This Service</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Garment Items & Rates Table */}
              <div>
                <div className="text-[11px] uppercase font-bold text-zinc-500 mb-2.5">
                  Item Pricing for {service.name}
                </div>
                {service.items && service.items.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {service.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-zinc-900 text-xs">{item.itemName}</div>
                          <div className="text-[10px] text-zinc-500">per {item.unit || 'piece'}</div>
                        </div>
                        <div className="font-mono font-black text-zinc-950 text-sm">
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 italic">No individual item rates configured.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
