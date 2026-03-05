'use client';

export default function Card({
  children,
  className = '',
  hover = false,
  padding = true,
  shadow = 'sm',
  ...props
}) {
  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-100
        ${shadows[shadow]}
        ${hover ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`mb-4 pb-4 border-b border-gray-100 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-bold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
}
