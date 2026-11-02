import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

export interface CustomSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  label?: string;
  error?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  direction?: 'up' | 'down' | 'auto';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  label,
  error,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  disabled = false,
  size = 'md',
  id,
  direction = 'auto',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Determine if menu should open upwards or downwards
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (direction === 'up') {
        setOpenUpwards(true);
      } else if (direction === 'down') {
        setOpenUpwards(false);
      } else {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If less than 240px below and more space above, open upwards
        if (spaceBelow < 250 && rect.top > 200) {
          setOpenUpwards(true);
        } else {
          setOpenUpwards(false);
        }
      }
    }
  }, [isOpen, direction]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const sizeClasses = {
    sm: 'py-1.5 px-2.5 text-xs',
    md: 'py-2 px-3 text-xs',
    lg: 'py-2.5 px-3.5 text-sm',
  };

  return (
    <div
      className={`relative w-full text-left transition-all ${
        isOpen ? 'z-40' : 'z-10'
      } ${className}`}
      ref={containerRef}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1"
        >
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border-2 transition-all font-bold select-none cursor-pointer text-left ${
          isOpen
            ? 'border-orange-500 ring-2 ring-orange-500/20 bg-white shadow-xs'
            : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-900 shadow-2xs'
        } ${sizeClasses[size]} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100' : ''
        } ${error ? 'border-red-500 ring-red-500/20' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selectedOption?.icon && (
            <span className="shrink-0 text-orange-600">{selectedOption.icon}</span>
          )}
          <span className="whitespace-nowrap font-bold block">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-orange-600' : ''
          }`}
        />
      </button>

      {/* Custom Popup Menu - Auto positioned upward/downward with high z-index and full text */}
      {isOpen && (
        <div
          className={`absolute left-0 z-50 min-w-full w-max max-w-[260px] max-h-60 overflow-y-auto rounded-2xl bg-white border-2 border-zinc-200/90 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150 ${
            openUpwards ? 'bottom-full mb-1.5 slide-in-from-bottom-2' : 'top-full mt-1.5 slide-in-from-top-2'
          } ${menuClassName}`}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-zinc-400 text-center">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50 text-orange-950 font-black'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {option.icon && (
                      <span
                        className={`shrink-0 ${
                          isSelected ? 'text-orange-600' : 'text-zinc-400'
                        }`}
                      >
                        {option.icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <span className="block whitespace-nowrap font-bold">{option.label}</span>
                      {option.description && (
                        <span className="block text-[10px] text-zinc-400 font-normal whitespace-nowrap">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 animate-in zoom-in-75" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {error && <p className="text-[10px] font-bold text-red-600 mt-1">{error}</p>}
    </div>
  );
};
