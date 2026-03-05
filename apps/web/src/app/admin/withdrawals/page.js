'use client';

import { useState, useEffect } from 'react';
import { Menu, CheckCircle, XCircle, DollarSign, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { formatPrice, formatDate } from '@/lib/helpers';
import { api } from '@/lib/api';

const STATUS_CONFIG = {
  pending: { label: 'قيد المراجعة', variant: 'warning' },
  approved: { label: 'تم القبول', variant: 'success' },
  rejected: { label: 'مرفوض', variant: 'danger' },
};

export default function AdminWithdrawalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  async function fetchWithdrawals() {
    const data = await api.get('/admin/withdrawals');
    setWithdrawals(data || []);
    setLoading(false);
  }

  async function approveWithdrawal(id) {
    const result = await api.patch(`/admin/withdrawals/${id}`, { status: 'approved' });
    if (!result?.error) {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'approved' } : w))
      );
    }
  }

  async function rejectWithdrawal(id) {
    const result = await api.patch(`/admin/withdrawals/${id}`, { status: 'rejected' });
    if (!result?.error) {
      setWithdrawals((prev) =>
        prev.map((w) => (w.id === id ? { ...w, status: 'rejected' } : w))
      );
    }
  }

  const filtered = withdrawals.filter((w) =>
    statusFilter === 'all' ? true : w.status === statusFilter
  );

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;
  const totalPending = withdrawals
    .filter((w) => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={ADMIN_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <DollarSign size={20} className="text-emerald-500" />
            <div>
              <h1 className="text-lg font-black text-gray-900">طلبات السحب</h1>
              <p className="text-xs text-gray-500">{pendingCount} طلبات تنتظر المراجعة</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Summary */}
          {pendingCount > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-emerald-800">{pendingCount} طلبات سحب معلقة</p>
                <p className="text-sm text-emerald-600">إجمالي المبالغ المطلوبة: {formatPrice(totalPending)}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {[
              { value: 'all', label: 'الكل' },
              { value: 'pending', label: 'معلقة' },
              { value: 'approved', label: 'مقبولة' },
              { value: 'rejected', label: 'مرفوضة' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === f.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Withdrawal Cards */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">جارٍ التحميل...</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((withdrawal) => {
                const teacherName = withdrawal.users?.full_name || '—';
                const teacherEmail = withdrawal.users?.email || '—';
                const status = withdrawal.status || 'pending';
                const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                return (
                  <div key={withdrawal.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-emerald-600 text-sm">{teacherName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">{teacherName}</h3>
                            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{teacherEmail}</p>
                          {withdrawal.bank_name && (
                            <p className="text-sm text-gray-700 mb-1">
                              <span className="font-semibold">البنك:</span> {withdrawal.bank_name}
                            </p>
                          )}
                          {withdrawal.account_number && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">رقم الحساب:</span> {withdrawal.account_number}
                            </p>
                          )}
                          {withdrawal.notes && (
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">ملاحظات:</span> {withdrawal.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            تاريخ الطلب: {formatDate(withdrawal.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-black text-gray-900">{formatPrice(withdrawal.amount || 0)}</p>
                        {status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveWithdrawal(withdrawal.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              <CheckCircle size={14} />
                              قبول
                            </button>
                            <button
                              onClick={() => rejectWithdrawal(withdrawal.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-200"
                            >
                              <XCircle size={14} />
                              رفض
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">لا توجد طلبات سحب</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
