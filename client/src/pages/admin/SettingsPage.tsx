import React, { useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings mock state
  const [plantName, setPlantName] = useState('AquaClean Central Plant #4');
  const [dispatchPhone, setDispatchPhone] = useState('(555) 234-5637');
  const [taxRate, setTaxRate] = useState('8.0');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('499.00');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Data Control</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure operations constants, rates, thresholds, and demo environment state.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configuration parameters updated successfully.</span>
        </div>
      )}

      {/* Facility & Billing Configuration Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Facility & Financial Parameters</h2>
          <p className="text-xs text-slate-500">Values used across calculation and dispatch workflows</p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Operating Facility Name"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              required
            />
            <Input
              label="Dispatch Center Phone"
              value={dispatchPhone}
              onChange={(e) => setDispatchPhone(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sales Tax Percentage (%)"
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              required
            />
            <Input
              label="Free Delivery Threshold (? INR)"
              type="number"
              step="1"
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="md" type="submit">
              <Save className="w-3.5 h-3.5 mr-1" />
              <span>Save Configuration</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Weekly Operational Timings Card */}
      <div className="bg-gradient-to-r from-orange-50/70 via-white to-orange-50/30 border border-orange-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-wider text-orange-600">
            Booking Engine Operations
          </div>
          <h2 className="text-base font-black text-zinc-950">
            Weekly Pickup & Return Slot Timings
          </h2>
          <p className="text-xs text-zinc-600 max-w-xl">
            Configure working hours (e.g. 08:00 AM - 08:00 PM) for each day of the week. Customer booking slots dynamically adapt in real-time between these hours.
          </p>
        </div>
        <a
          href="/admin/schedule"
          className="btn-orange px-4 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shrink-0 shadow-sm hover:shadow"
        >
          <span>Manage Weekly Timings</span>
          <Save className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Database Connection & Environment Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Database & Environment Architecture</h2>
          <p className="text-xs text-slate-500">
            Real-time status of the remote production cloud database
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Connected Database</div>
            <div className="text-sm font-black text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>MongoDB Atlas Cluster</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono break-all pt-1">
              shqsjjt.mongodb.net/laundry_db
            </div>
          </div>

          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
            <div className="text-[10px] uppercase font-bold text-zinc-500">Admin Authentication</div>
            <div className="text-sm font-black text-zinc-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
              <span>Configured via server/.env</span>
            </div>
            <div className="text-[11px] text-zinc-500 pt-1">
              Credentials are never hardcoded and update dynamically on server restart.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

