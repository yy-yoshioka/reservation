'use client';

import { cn } from '@/app/lib/utils';
import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[];
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, label, helperText, error, fullWidth = true, size = 'md', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    
    const sizeStyles = {
      sm: "py-1 text-xs",
      md: "py-2 text-sm",
      lg: "py-3 text-base",
    };
    
    return (
      <div className={cn("mb-4", fullWidth ? "w-full" : "")}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500",
            sizeStyles[size],
            error && "border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500",
            fullWidth && "w-full",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500" id={`${selectId}-helper`}>
            {helperText}
          </p>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-600" id={`${selectId}-error`}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;