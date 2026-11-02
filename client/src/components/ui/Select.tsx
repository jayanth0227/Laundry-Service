import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CustomSelect, CustomSelectOption } from './CustomSelect';

export interface SelectProps {
  label?: string;
  error?: string;
  options?: { value: string | number; label: string }[];
  value?: string | number;
  onChange?: (e: any) => void;
  className?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options = [],
  value = '',
  onChange,
  className,
  id,
  disabled,
  placeholder,
}) => {
  const handleChange = (val: string | number) => {
    if (onChange) {
      // Simulate standard change event for backward compatibility
      onChange({ target: { value: val } });
    }
  };

  return (
    <CustomSelect
      id={id}
      label={label}
      error={error}
      value={value}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
    />
  );
};

Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={twMerge(
            clsx(
              'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors shadow-subtle',
              'focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900',
              error && 'border-red-500 focus:border-red-500',
              className
            )
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

