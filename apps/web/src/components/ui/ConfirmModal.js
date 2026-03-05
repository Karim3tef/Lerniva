'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الإجراء',
  message,
  confirmLabel = 'تأكيد',
  confirmVariant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          confirmVariant === 'danger' ? 'bg-red-100' : 'bg-indigo-100'
        }`}>
          <AlertTriangle size={24} className={confirmVariant === 'danger' ? 'text-red-600' : 'text-indigo-600'} />
        </div>
        {message && (
          <p className="text-gray-600 text-sm text-center">{message}</p>
        )}
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
