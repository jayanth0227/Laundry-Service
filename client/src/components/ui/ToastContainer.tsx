import React from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLaundry();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-3 sm:right-6 left-3 sm:left-auto z-[999] flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-zinc-800';
        let icon = (
          <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
            <Info className="w-4 h-4" />
          </div>
        );

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.5)]';
          icon = (
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          );
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/40 shadow-[0_12px_36px_rgba(0,0,0,0.5)]';
          icon = (
            <div className="w-7 h-7 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <AlertCircle className="w-4 h-4" />
            </div>
          );
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-zinc-950 text-white border shadow-2xl text-xs transition-all animate-in fade-in slide-in-from-bottom-4 duration-200 select-none ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <span className="font-bold text-xs text-zinc-100 leading-snug break-words">
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer ml-1"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

