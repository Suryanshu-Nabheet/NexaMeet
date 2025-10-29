import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-') || '';

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-200">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full rounded-md border border-gray-600 bg-dark-300 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};