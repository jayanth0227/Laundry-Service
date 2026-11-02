import React, { useState } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { Customer } from '../../types';
import { Search, Phone, Mail, MapPin, Calendar, Receipt, ExternalLink, ArrowLeft, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/currency';

export const CustomersPage: React.FC = () => {
  const { customers, orders, loading } = useLaundry();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const customerOrders = selectedCustomer
    ? orders.filter(
        (o) =>
          o.customerId === selectedCustomer.id ||
          o.customerPhone === selectedCustomer.phone ||
          o.customerName === selectedCustomer.name
      )
    : [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* If a customer is selected, show their full history view on page (NO MODAL) */}
      {selectedCustomer ? (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="btn-outline"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                <span>Back to Customer Directory</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Customer History: {selectedCustomer.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registered on {selectedCustomer.registeredDate} • Lifetime Spend: {formatCurrency(selectedCustomer.totalSpend)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Phone Number</div>
              <div className="font-mono font-bold text-slate-900 text-sm">{selectedCustomer.phone}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Email Address</div>
              <div className="text-slate-900 text-sm">{selectedCustomer.email}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400">Lifetime Orders & Spend</div>
              <div className="font-black text-orange-600 font-mono text-sm">
                {selectedCustomer.totalOrders} Orders • {formatCurrency(selectedCustomer.totalSpend)}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-600" />
              <span>Past & Active Doorstep Orders ({customerOrders.length})</span>
            </h3>

            {customerOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic">
                No orders recorded for this customer yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50">
                    <div>
                      <div className="font-mono font-bold text-slate-900 text-sm">#{ord.bookingNumber || ord.id}</div>
                      <div className="text-slate-500 text-xs mt-0.5">
                        Pickup: <strong>{ord.pickupDate} ({ord.pickupSlot})</strong> • {ord.serviceType}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Address: {ord.address?.street}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-orange-600 text-base">
                        {formatCurrency(ord.grandTotal)}
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-orange-700 mt-1">
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory & Accounts</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Profiles, contact numbers, order histories, and lifetime spend records in Indian Rupee (₹).
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, phone, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Primary Address</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Lifetime Spend (₹ INR)</th>
                    <th className="py-3 px-4">Member Since</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading customer profiles...
                      </td>
                    </tr>
                  ) : filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No customers match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 text-sm">{cust.name}</div>
                          {cust.notes && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5 max-w-xs truncate">
                              "{cust.notes}"
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <div className="font-mono text-slate-900">{cust.phone}</div>
                          <div className="text-slate-500 text-[11px]">{cust.email}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700">
                          <div className="max-w-xs truncate">{cust.address}</div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-900">
                          {cust.totalOrders}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(cust.totalSpend)}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {cust.registeredDate}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setSelectedCustomer(cust)}
                          >
                            <Receipt className="w-3.5 h-3.5 mr-1 text-slate-500" />
                            <span>View History</span>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
