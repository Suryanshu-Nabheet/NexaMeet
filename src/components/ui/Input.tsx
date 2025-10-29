import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className = '',
  id,
  icon,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-') || '';
  
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full rounded-md border bg-dark-300 text-white placeholder-gray-400
            ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
            border-gray-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-400">{helpText}</p>}
    </div>
  );
};