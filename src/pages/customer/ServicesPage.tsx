import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLaundry } from '../../context/LaundryContext';
import { Search, Clock, ArrowRight, Shield, Check, Info } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ServicesPage: React.FC = () => {
  const { services, loading } = useLaundry();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Wash & Fold',
    'Dry Cleaning',
    'Ironing & Pressing',
    'Bedding & Home',
    'Specialty Care',
  ];

  const filteredServices = services.filter((srv) => {
    const matchesCategory = activeCategory === 'All' || srv.category === activeCategory;
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
          Catalog & Pricing
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Services, Turnaround Times & Standard Rates
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Individual drum washing, eco-solvents for dry cleaning, and hand-finished pressing. Free collection and return on orders over $35.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search garment or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Services Table View */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading catalog items...</div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-2">
          <p className="text-sm text-slate-700 font-medium">No services match your search.</p>
          <p className="text-xs text-slate-500">Try resetting filters or searching for everyday items.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setActiveCategory('All');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Service & Garment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Turnaround</th>
                  <th className="py-3 px-4">Standard Rate</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">{srv.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{srv.description}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {srv.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{srv.turnaroundHours} Hours</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-bold text-slate-900">
                        ${srv.price.toFixed(2)}
                        <span className="text-xs font-normal text-slate-500"> / {srv.unit}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link to="/book" state={{ preselectedService: srv.id }}>
                        <Button variant="secondary" size="sm">
                          Select
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commercial & Contract Rates Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-teal-700 text-white flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              High-Volume Commercial Contracts
            </h4>
            <p className="text-xs text-slate-600">
              Hotels, Airbnb hosts, law firms, and medical clinics qualify for custom tier rates and scheduled daily route pickups.
            </p>
          </div>
        </div>
        <Link to="/contact">
          <Button variant="secondary" size="sm" className="whitespace-nowrap">
            Inquire for Business
          </Button>
        </Link>
      </div>
    </div>
  );
};

