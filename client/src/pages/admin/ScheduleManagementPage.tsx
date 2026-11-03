import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import type { DaySchedule } from '../../types';
import {
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  RefreshCw,
  Power,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Check
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CustomSelect } from '../../components/ui/CustomSelect';

const TIME_OPTIONS = [
  { value: '06:00', label: '06:00 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '22:00', label: '10:00 PM' },
];

const DEFAULT_DAYS: DaySchedule[] = [
  { day: 'monday', label: 'Monday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'tuesday', label: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'wednesday', label: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'thursday', label: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'friday', label: 'Friday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'saturday', label: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'sunday', label: 'Sunday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
];

export const ScheduleManagementPage: React.FC = () => {
  const [days, setDays] = useState<DaySchedule[]>(DEFAULT_DAYS);
  const [slotDurationMinutes, setSlotDurationMinutes] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activePreviewDay, setActivePreviewDay] = useState<string>('monday');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const data = await api.getSchedule();
      if (data && Array.isArray(data.days) && data.days.length > 0) {
        setDays(data.days);
      }
      if (data && data.slotDurationMinutes) {
        setSlotDurationMinutes(data.slotDurationMinutes);
      } else if (data && data.slotDurationHours) {
        setSlotDurationMinutes(data.slotDurationHours * 60);
      }
    } catch (err: any) {
      console.warn('Could not load schedule, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayKey: string) => {
    setDays((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const handleTimeChange = (dayKey: string, field: 'openTime' | 'closeTime', val: string) => {
    setDays((prev) =>
      prev.map((d) => (d.day === dayKey ? { ...d, [field]: val } : d))
    );
  };

  const handleApplyMondayToAll = () => {
    const monday = days.find((d) => d.day === 'monday') || days[0];
    setDays((prev) =>
      prev.map((d) => ({
        ...d,
        isOpen: monday.isOpen,
        openTime: monday.openTime,
        closeTime: monday.closeTime,
      }))
    );
    setSuccessMsg('Applied Monday timings to all 7 days.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStandardWeekdays = () => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.day === 'sunday') {
          return { ...d, isOpen: false };
        }
        if (d.day === 'saturday') {
          return { ...d, isOpen: true, openTime: '09:00', closeTime: '18:00' };
        }
        return { ...d, isOpen: true, openTime: '08:00', closeTime: '20:00' };
      })
    );
    setSuccessMsg('Applied standard business hours (Mon-Fri 8 AM - 8 PM, Sat 9 AM - 6 PM, Sun Closed).');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.updateSchedule(days, slotDurationMinutes);
      setSuccessMsg(`Weekly slot timings updated! Customer booking page will now display ${slotDurationMinutes}-minute slots between the configured hours.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save operational schedule.');
    } finally {
      setSaving(false);
    }
  };

  // Preview slots for selected preview day using configured slotDurationMinutes
  const previewDayConfig = days.find((d) => d.day === activePreviewDay) || days[0];
  const previewSlots = React.useMemo(() => {
    if (!previewDayConfig || !previewDayConfig.isOpen) return [];

    const [openH, openM] = previewDayConfig.openTime.split(':').map(Number);
    const [closeH, closeM] = previewDayConfig.closeTime.split(':').map(Number);
    const openTotal = openH * 60 + (openM || 0);
    const closeTotal = closeH * 60 + (closeM || 0);
    const duration = slotDurationMinutes || 30;

    const list: string[] = [];
    for (let st = openTotal; st + duration <= closeTotal; st += duration) {
      const et = st + duration;
      const sh = Math.floor(st / 60);
      const sm = st % 60;
      const eh = Math.floor(et / 60);
      const em = et % 60;

      const fmt = (h: number, m: number) => {
        const p = h >= 12 ? 'PM' : 'AM';
        const dh = h % 12 === 0 ? 12 : h % 12;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(dh)}:${pad(m)} ${p}`;
      };

      list.push(`${fmt(sh, sm)} - ${fmt(eh, em)}`);
    }
    return list;
  }, [previewDayConfig, slotDurationMinutes]);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-24 md:pb-8 px-2 sm:px-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-3 sm:pb-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 mb-0.5 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Operational Schedule & Timing Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight whitespace-nowrap truncate">
            Weekly Slot Timings & Availability
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5 max-w-2xl line-clamp-1 sm:line-clamp-none">
            Configure working hours and customizable slot intervals. Customer booking slots adapt in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={fetchSchedule}
            disabled={loading}
            className="whitespace-nowrap text-xs font-bold px-3 py-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            type="button"
            onClick={handleSave}
            isLoading={saving}
            className="btn-orange text-xs font-bold whitespace-nowrap px-4 py-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Save All Timings</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold leading-tight">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-bold leading-tight">{errorMsg}</span>
        </div>
      )}

      {/* CONFIGURABLE SLOT DURATION SELECTOR (Space-Efficient & Single-Line Grid) */}
      <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-2.5">
          <div className="min-w-0">
            <h2 className="text-sm font-black text-zinc-950 flex items-center gap-2 whitespace-nowrap truncate">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Slot Time Duration</span>
            </h2>
            <p className="text-[11px] text-zinc-500 line-clamp-1">
              Slots are generated across your opening and closing hours according to this interval.
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden sm:inline text-[11px] font-bold text-zinc-400 whitespace-nowrap">Active:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white font-black text-xs shadow-2xs whitespace-nowrap">
              {slotDurationMinutes} Mins
            </span>
          </div>
        </div>

        {/* Preset Interval Buttons in a Structured 3-Col / 6-Col Single-Line Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-0.5">
          {[
            { mins: 15, label: '15 Mins' },
            { mins: 30, label: '30 Mins' },
            { mins: 45, label: '45 Mins' },
            { mins: 60, label: '1 Hour' },
            { mins: 90, label: '1.5 Hours' },
            { mins: 120, label: '2 Hours' },
          ].map(({ mins, label }) => {
            const isSelected = slotDurationMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setSlotDurationMinutes(mins)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer select-none ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-xs border border-orange-600 font-black'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 shrink-0" />}
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Duration Inline Row */}
        <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 border-t border-zinc-100/80 text-xs text-zinc-600">
          <span className="font-bold text-[11px] text-zinc-500 whitespace-nowrap">Or custom interval:</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="10"
              max="240"
              step="5"
              value={slotDurationMinutes}
              onChange={(e) => setSlotDurationMinutes(Math.max(5, Number(e.target.value)))}
              className="w-16 px-2.5 py-1 rounded-xl border border-zinc-300 text-xs font-mono font-bold text-zinc-900 text-center focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
            />
            <span className="font-bold text-[11px] text-zinc-500 whitespace-nowrap">Minutes</span>
          </div>
        </div>
      </div>

      {/* Quick Action Presets (Single-Line Buttons) */}
      <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-2 font-bold text-zinc-700 whitespace-nowrap">
          <Sliders className="w-4 h-4 text-orange-600 shrink-0" />
          <span>Quick Presets:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleStandardWeekdays}
            className="px-3.5 py-2 bg-zinc-50 hover:bg-orange-50 hover:text-orange-600 border border-zinc-200 hover:border-orange-300 rounded-xl font-bold text-zinc-700 transition-colors shadow-2xs whitespace-nowrap text-center cursor-pointer"
          >
            Standard Hours (Mon–Sat)
          </button>
          <button
            type="button"
            onClick={handleApplyMondayToAll}
            className="px-3.5 py-2 bg-zinc-50 hover:bg-orange-50 hover:text-orange-600 border border-zinc-200 hover:border-orange-300 rounded-xl font-bold text-zinc-700 transition-colors shadow-2xs whitespace-nowrap text-center cursor-pointer"
          >
            Apply Monday to All Days
          </button>
        </div>
      </div>

      {/* Main Days Grid & Live Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column (2/3): Days Configuration Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white border-2 border-zinc-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 border-b border-zinc-100 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-black text-zinc-950 whitespace-nowrap truncate">
                  Daily Operational Hours
                </h2>
                <p className="text-[11px] text-zinc-500 line-clamp-1">
                  Enable or disable days and set pickup operational window
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 whitespace-nowrap shrink-0">
                {slotDurationMinutes}-Min Intervals
              </span>
            </div>

            <div className="divide-y divide-zinc-100">
              {days.map((dayItem) => {
                const isSelectedForPreview = activePreviewDay === dayItem.day;

                return (
                  <div
                    key={dayItem.day}
                    onClick={() => setActivePreviewDay(dayItem.day)}
                    className={`p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 cursor-pointer transition-colors ${
                      isSelectedForPreview ? 'bg-orange-50/50' : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* Day Name & Toggle */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0 sm:min-w-[150px]">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDay(dayItem.day);
                          }}
                          className={`w-9 h-5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                            dayItem.isOpen ? 'bg-emerald-600' : 'bg-zinc-300'
                          }`}
                          title={dayItem.isOpen ? 'Open (Click to close)' : 'Closed (Click to open)'}
                        >
                          <span
                            className={`w-4 h-4 rounded-full bg-white shadow-xs block transition-transform ${
                              dayItem.isOpen ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>

                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="font-black text-xs text-zinc-950">{dayItem.label}</span>
                          <span
                            className={`text-[10px] font-bold ${
                              dayItem.isOpen ? 'text-emerald-700' : 'text-zinc-400'
                            }`}
                          >
                            {dayItem.isOpen ? '● Open' : '○ Closed'}
                          </span>
                        </div>
                      </div>

                      {isSelectedForPreview && (
                        <span className="sm:hidden text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-100/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                          Previewing
                        </span>
                      )}
                    </div>

                    {/* Hours Selection in Single-Line Row */}
                    {dayItem.isOpen ? (
                      <div
                        className="flex items-center gap-2 w-full sm:w-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase whitespace-nowrap shrink-0">From</span>
                          <div className="w-full sm:w-28">
                            <CustomSelect
                              value={dayItem.openTime}
                              onChange={(val) => handleTimeChange(dayItem.day, 'openTime', String(val))}
                              options={TIME_OPTIONS}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase whitespace-nowrap shrink-0">To</span>
                          <div className="w-full sm:w-28">
                            <CustomSelect
                              value={dayItem.closeTime}
                              onChange={(val) => handleTimeChange(dayItem.day, 'closeTime', String(val))}
                              options={TIME_OPTIONS}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-400 font-medium whitespace-nowrap py-0.5">
                        Closed (No customer pickup slots)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Live Customer Slot Preview */}
        <div className="space-y-4">
          <div className="bg-white border-2 border-zinc-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3.5">
            <div className="border-b border-zinc-100 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 whitespace-nowrap">
                  Live Customer Preview
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              </div>
              <h3 className="text-sm font-black text-zinc-950 mt-0.5 whitespace-nowrap truncate">
                {previewDayConfig.label}&rsquo;s Generated Slots
              </h3>
              <p className="text-[11px] text-zinc-500 line-clamp-1">
                {previewDayConfig.isOpen
                  ? `${previewDayConfig.openTime} – ${previewDayConfig.closeTime} (${slotDurationMinutes}m intervals)`
                  : 'Closed on this day'}
              </p>
            </div>

            {previewDayConfig.isOpen ? (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-zinc-600 flex items-center justify-between whitespace-nowrap">
                  <span>Customer View ({previewSlots.length} slots):</span>
                  <span className="text-emerald-700 font-bold">● Active</span>
                </div>

                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {previewSlots.map((slotStr, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2 whitespace-nowrap min-w-0">
                        <Clock className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <span className="font-bold text-zinc-900 truncate">{slotStr}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 space-y-2">
                <Power className="w-6 h-6 text-zinc-400 mx-auto" />
                <div className="font-bold text-zinc-700">Closed on {previewDayConfig.label}s</div>
                <p className="text-[11px] text-zinc-500">
                  Customers selecting this date will see an alert that operations are closed on this day.
                </p>
              </div>
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-3.5 sm:p-4 bg-orange-50/60 border border-orange-200 rounded-2xl text-xs space-y-1.5">
            <div className="font-black text-orange-950 flex items-center gap-1.5 whitespace-nowrap">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Real-Time Slot Enforcement</span>
            </div>
            <p className="text-[11px] text-orange-900/80 leading-relaxed">
              When slot duration and hours are updated, customer booking slots adapt immediately in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
