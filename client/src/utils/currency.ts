/**
 * Utility functions for Indian Rupee (₹ INR) currency formatting
 */

export const CURRENCY_SYMBOL = '₹';
export const FREE_DELIVERY_THRESHOLD = 499;
export const STANDARD_DELIVERY_FEE = 50;
export const TAX_RATE = 0.05; // 5% GST on laundry services

export const formatCurrency = (amount: number | undefined | null): string => {
  const val = Number(amount) || 0;
  return `₹${val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrencyInteger = (amount: number | undefined | null): string => {
  const val = Number(amount) || 0;
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
};

