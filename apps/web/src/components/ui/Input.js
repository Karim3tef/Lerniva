'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    type = 'text',
    className = '',
    containerClassName = '',
    required = false,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-gray-900
            placeholder:text-gray-400 text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-gray-200 hover:border-gray-300'
            }
            ${leftIcon ? 'pr-10' : ''}
            ${isPassword || rightIcon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={14} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
});

export default Input;
