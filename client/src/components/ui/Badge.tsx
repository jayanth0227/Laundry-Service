import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { OrderStatus } from '../../types';

export interface BadgeProps {
  status?: OrderStatus | 'paid' | 'pending' | 'refunded' | string;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'orange';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, variant, children, className }) => {
  let computedClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
  let label = children;

  if (status) {
    switch (status) {
      case 'booking_received':
      case 'pickup_pending':
      case 'pickup_scheduled':
      case 'picked_up':
        computedClass = 'bg-orange-50 text-orange-800 border-orange-200 font-bold';
        label = label || 'Started';
        break;
      case 'in_wash_and_iron':
      case 'washing':
      case 'drying':
      case 'quality_check':
      case 'ready_for_delivery':
      case 'out_for_delivery':
        computedClass = 'bg-blue-50 text-blue-900 border-blue-200 font-bold';
        label = label || 'In Progress';
        break;
      case 'delivered':
        computedClass = 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
        label = label || 'Completed';
        break;
      case 'cancelled':
        computedClass = 'bg-red-50 text-red-800 border-red-200 font-bold';
        label = label || 'Cancelled';
        break;
      case 'paid':
        computedClass = 'bg-emerald-50 text-emerald-900 border-emerald-200 font-bold';
        label = label || 'Paid';
        break;
      case 'pending':
        computedClass = 'bg-orange-50 text-orange-800 border-orange-200 font-bold';
        label = label || 'Payment Pending';
        break;
      default:
        break;
    }
  }

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border tracking-wide whitespace-nowrap',
          computedClass,
          className
        )
      )}
    >
      {label}
    </span>
  );
};
