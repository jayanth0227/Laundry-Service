import React, { useState } from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { ServiceItem } from '../../types';
import { Plus, Edit2, Trash2, Clock, Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select, Textarea } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';

export const ServicesManagementPage: React.FC = () => {
  const { services, createService, updateService, deleteService, loading } = useLaundry();

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Wash & Fold' | 'Dry Cleaning' | 'Ironing & Pressing' | 'Bedding & Home' | 'Specialty Care'>('Wash & Fold');
  const [unit, setUnit] = useState<'kg' | 'item' | 'set' | 'pair' | 'panel'>('kg');
  const [price, setPrice] = useState<number>(0);
  const [turnaroundHours, setTurnaroundHours] = useState<number>(24);
  const [description, setDescription] = useState('');
  const [popular, setPopular] = useState(false);
  const [active, setActive] = useState(true);

  // Delete confirmation
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setCategory('Wash & Fold');
    setUnit('kg');
    setPrice(2.50);
    setTurnaroundHours(24);
    setDescription('');
    setPopular(false);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setUnit(service.unit);
    setPrice(service.price);
    setTurnaroundHours(service.turnaroundHours);
    setDescription(service.description);
    setPopular(Boolean(service.popular));
    setActive(service.active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      await updateService(editingService.id, {
        name,
        category,
        unit,
        price: Number(price),
        turnaroundHours: Number(turnaroundHours),
        description,
        popular,
        active,
      });
    } else {
      await createService({
        name,
        category,
        unit,
        price: Number(price),
        turnaroundHours: Number(turnaroundHours),
        description,
        popular,
        active,
      });
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!serviceToDelete) return;
    await deleteService(serviceToDelete.id);
    setServiceToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Service Catalogue & Rate Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure unit rates, turnaround guarantees, and service categories shown on the customer platform.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openCreateModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Add New Service</span>
        </Button>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-4">Service Name & Description</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Turnaround</th>
                <th className="py-3 px-4">Standard Rate</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading services catalogue...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No services in catalogue. Add one above.
                  </td>
                </tr>
              ) : (
                services.map((srv) => (
                  <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <span>{srv.name}</span>
                        {srv.popular && (
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            Featured
                          </span>
                        )}
                      </div>
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
                      <div className="text-sm font-bold font-mono text-slate-900">
                        ${srv.price.toFixed(2)}
                        <span className="text-xs font-normal text-slate-500"> / {srv.unit}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => updateService(srv.id, { active: !srv.active })}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          srv.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {srv.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(srv)}
                        >
                          <Edit2 className="w-3 h-3 mr-1 text-slate-500" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setServiceToDelete(srv)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Edit Catalogue Service' : 'Add New Laundry Service'}
        description="Configure unit rate, department, and SLA guarantee"
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Service Title"
            placeholder="e.g. Wool & Cashmere Overcoat"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Department Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'Wash & Fold', label: 'Wash & Fold' },
                { value: 'Dry Cleaning', label: 'Dry Cleaning' },
                { value: 'Ironing & Pressing', label: 'Ironing & Pressing' },
                { value: 'Bedding & Home', label: 'Bedding & Home' },
                { value: 'Specialty Care', label: 'Specialty Care' },
              ]}
            />

            <Select
              label="Billing Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              options={[
                { value: 'kg', label: 'Per Kilogram (kg)' },
                { value: 'item', label: 'Per Garment Item' },
                { value: 'set', label: 'Per Set (Suits / Linens)' },
                { value: 'pair', label: 'Per Pair (Shoes / Boots)' },
                { value: 'panel', label: 'Per Panel (Curtains)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Standard Rate ($ USD)"
              type="number"
              step="0.25"
              min="0"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
            />
            <Input
              label="SLA Turnaround (Hours)"
              type="number"
              min="1"
              value={turnaroundHours}
              onChange={(e) => setTurnaroundHours(Number(e.target.value))}
              required
            />
          </div>

          <Textarea
            label="Service Description & Fabric Care Info"
            rows={2}
            placeholder="Specify detergent used, finishing standard, packaging..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="rounded border-slate-300 accent-slate-900"
              />
              <span className="text-xs text-slate-700 font-medium">Highlight as Most Requested</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded border-slate-300 accent-slate-900"
              />
              <span className="text-xs text-slate-700 font-medium">Service Active on Customer Site</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        title="Confirm Service Deletion"
        description="Destructive action confirmation"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              Are you sure you want to remove <strong>"{serviceToDelete?.name}"</strong>? It will no longer appear on the customer booking portal.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setServiceToDelete(null)}>
              Keep Service
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
              Permanently Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

