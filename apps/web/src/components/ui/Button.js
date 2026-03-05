'use client';

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md',
  secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm',
  accent: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm hover:shadow-md',
  outline: 'bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-600',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm',
};

const sizes = {
  xs: 'px-3 py-1.5 text-xs rounded-lg',
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon ? (
        <span className="flex items-center">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && (
        <span className="flex items-center">{rightIcon}</span>
      )}
    </button>
  );
});

export default Button;
