'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
  showCloseButton = true,
}) {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full
          ${sizes[size] || sizes.md}
          max-h-[90vh] flex flex-col
        `}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {title && (
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors mr-auto"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
