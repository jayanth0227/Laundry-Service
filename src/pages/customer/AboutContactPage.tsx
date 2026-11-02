import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Select';

export const AboutContactPage: React.FC = () => {
  const [inquirySent, setInquirySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="border-b border-slate-200 pb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">
          Operations & Support
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Facility Details, Service Zones & Commercial Inquiries
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Operating high-capacity eco-wash facilities with dedicated courier routes across Springfield Metro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Information */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-subtle">
            <h2 className="text-base font-bold text-slate-900">Direct Contact & Plant Information</h2>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Central Processing Plant</div>
                  <div>Plant #4, 185 Industrial Parkway, Springfield, SP 97477</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Telephone Dispatch</div>
                  <div>Direct Line: (555) 234-LNDR (5637)</div>
                  <div className="text-slate-400 text-[11px]">Mon-Sun: 7:00 AM – 9:00 PM</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Commercial & Support Email</div>
                  <div>dispatch@aquaclean-laundry.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900">Doorstep Collection Hours</div>
                  <div>Monday – Friday: 7:00 AM – 9:00 PM</div>
                  <div>Saturday – Sunday: 8:00 AM – 7:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Area Coverage */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Daily Courier Route ZIP Codes
            </h3>
            <p className="text-xs text-slate-600">
              Couriers service the following zones twice daily (Morning 8-12 and Evening 14-20):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97477 — Downtown</div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97478 — East Metro</div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97401 — River District</div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97402 — University</div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97403 — South Hills</div>
              <div className="p-2 rounded bg-white border border-slate-200 text-slate-800">97405 — Financial Park</div>
            </div>
          </div>
        </div>

        {/* Right: Commercial Contact Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h2 className="text-base font-semibold text-slate-900">Commercial & High-Volume Inquiry</h2>
            <p className="text-xs text-slate-500">
              For Airbnb managers, boutique hotels, medical practices, or fitness centers.
            </p>
          </div>

          {inquirySent ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-md text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-900">Inquiry Received</h3>
              <p className="text-xs text-emerald-800">
                Our Springfield commercial operations manager will reach out within 2 business hours with a custom contract rate sheet.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Company / Entity" placeholder="e.g. Springfield Boutique Hotel" required />
                <Input label="Contact Person" placeholder="e.g. Sarah Connor" required />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Work Email" type="email" placeholder="manager@business.com" required />
                <Input label="Direct Phone" placeholder="(555) 000-0000" required />
              </div>

              <Input label="Estimated Volume" placeholder="e.g. ~50 kg wash & fold weekly + 20 duvet sets" />

              <Textarea
                label="Requirements & Frequency"
                rows={3}
                placeholder="Mention specific pickup days or delivery requirements..."
                required
              />

              <Button type="submit" variant="primary" size="md" className="w-full">
                Submit Commercial Inquiry
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

