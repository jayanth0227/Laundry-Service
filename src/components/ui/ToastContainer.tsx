import React from 'react';
import { useLaundry } from '../../context/LaundryContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLaundry();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-200';
        let icon = <Info className="w-4 h-4 text-slate-500 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-emerald-50/95 text-emerald-900';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-red-200 bg-red-50/95 text-red-900';
          icon = <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
        } else {
          borderClass = 'border-slate-300 bg-white text-slate-900';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-md border shadow-dropdown text-xs transition-all ${borderClass}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="font-medium leading-relaxed">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-black/5 text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

