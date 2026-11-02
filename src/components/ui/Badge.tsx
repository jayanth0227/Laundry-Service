import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from '../../types';

export interface BadgeProps {
  status?: OrderStatus | 'paid' | 'pending' | 'refunded' | string;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'teal';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className }) => {
  let computedClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = children;

  if (status) {
    switch (status) {
      case 'pickup_pending':
        computedClass = 'bg-amber-50 text-amber-800 border-amber-200/80';
        label = label || 'Pickup Scheduled';
        break;
      case 'picked_up':
        computedClass = 'bg-sky-50 text-sky-800 border-sky-200/80';
        label = label || 'Picked Up';
        break;
      case 'washing':
        computedClass = 'bg-blue-50 text-blue-800 border-blue-200/80';
        label = label || 'In Wash';
        break;
      case 'drying':
        computedClass = 'bg-blue-50 text-blue-800 border-blue-200/80';
        label = label || 'Drying & Fluffing';
        break;
      case 'quality_check':
        computedClass = 'bg-indigo-50 text-indigo-800 border-indigo-200/80';
        label = label || 'Inspection & Press';
        break;
      case 'ready_for_delivery':
        computedClass = 'bg-teal-50 text-teal-800 border-teal-200/80';
        label = label || 'Ready for Dispatch';
        break;
      case 'out_for_delivery':
        computedClass = 'bg-slate-800 text-white border-slate-800';
        label = label || 'Out for Delivery';
        break;
      case 'delivered':
        computedClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
        label = label || 'Delivered';
        break;
      case 'cancelled':
        computedClass = 'bg-red-50 text-red-800 border-red-200/80';
        label = label || 'Cancelled';
        break;
      case 'paid':
        computedClass = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
        label = label || 'Paid';
        break;
      case 'pending':
        computedClass = 'bg-amber-50 text-amber-800 border-amber-200/80';
        label = label || 'Payment Pending';
        break;
      default:
        break;
    }
  } else if (variant) {
    const variantMap = {
      neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      info: 'bg-sky-50 text-sky-800 border-sky-200/80',
      success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
      error: 'bg-red-50 text-red-800 border-red-200/80',
      teal: 'bg-teal-50 text-teal-800 border-teal-200/80',
    };
    computedClass = variantMap[variant] || computedClass;
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tracking-wide whitespace-nowrap',
          computedClass,
          className
        )
      )}
    >
      {label}
    </span>
  );
};

