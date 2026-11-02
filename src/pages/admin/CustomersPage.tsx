import React, { useState } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { Customer } from '../../types';
import { Search, Phone, Mail, MapPin, Calendar, Receipt, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Customer Directory & Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Profiles, contact numbers, order histories, and lifetime spend records.
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
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
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
                      ${cust.totalSpend.toFixed(2)}
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
                        <span>History</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={Boolean(selectedCustomer)}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer History: ${selectedCustomer.name}`}
          description={`Registered on ${selectedCustomer.registeredDate} • Lifetime: $${selectedCustomer.totalSpend.toFixed(2)}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 text-slate-700 space-y-1">
              <div>Phone: <strong className="font-mono text-slate-900">{selectedCustomer.phone}</strong></div>
              <div>Address: <strong className="text-slate-900">{selectedCustomer.address}</strong></div>
              {selectedCustomer.notes && (
                <div className="text-slate-500 italic">Notes: {selectedCustomer.notes}</div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Past & Active Orders ({customerOrders.length})
              </h4>

              {customerOrders.length === 0 ? (
                <p className="text-slate-400 italic text-center py-4">No recent orders recorded</p>
              ) : (
                <div className="border border-slate-200 rounded-md divide-y divide-slate-100 bg-white max-h-60 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div key={ord.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900">{ord.id}</div>
                        <div className="text-slate-500 text-[11px]">
                          {ord.pickupDate} — {ord.serviceType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">${ord.grandTotal.toFixed(2)}</div>
                        <div className="text-[10px] text-teal-800 uppercase font-semibold">
                          {ord.status.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

