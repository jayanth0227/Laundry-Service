import React, { useState } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { Settings, RotateCcw, ShieldAlert, CheckCircle2, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const SettingsPage: React.FC = () => {
  const { resetAllData } = useLaundry();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings mock state
  const [plantName, setPlantName] = useState('AquaClean Central Plant #4');
  const [dispatchPhone, setDispatchPhone] = useState('(555) 234-5637');
  const [taxRate, setTaxRate] = useState('8.0');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('35.00');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetAllData();
      setIsResetConfirmOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reset demo data');
    } finally {
      setIsResetting(false);
    }
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
              label="Free Delivery Threshold ($ USD)"
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

      {/* Demo Seed Reset Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">Demo Environment & Database Seed Reset</h2>
          <p className="text-xs text-slate-500">
            Restore sample orders, customers, and services back to initial commercial demonstration states.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <p className="text-slate-600 max-w-lg">
            This will overwrite the server database (`db.json`) with fresh sample orders across all lifecycle states (washing, ready, out for delivery, delivered).
          </p>
          <Button
            variant="destructive"
            size="md"
            onClick={() => setIsResetConfirmOpen(true)}
            className="whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset Demo Data</span>
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Confirm Reset Database"
        description="Data restoration confirmation"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              Are you sure you want to restore original seed data? Any new orders or custom services created will be reset.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleResetData}
              isLoading={isResetting}
            >
              Confirm & Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

