'use client';

import { useState, useEffect } from 'react';
import { Menu, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { formatPrice, formatDate } from '@/lib/helpers';
import { createClient } from '@/lib/supabase';

const STATUS_CONFIG = {
  pending: { label: 'قيد المراجعة', variant: 'warning' },
  approved: { label: 'تم القبول', variant: 'success' },
  rejected: { label: 'مرفوض', variant: 'danger' },
};

export default function AdminRefundsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    const supabase = createClient();
    const { data } = await supabase
      .from('refunds')
      .select('*, users(full_name, email), courses(title)')
      .order('created_at', { ascending: false });
    setRefunds(data || []);
    setLoading(false);
  }

  async function approveRefund(id) {
    const supabase = createClient();
    const { error } = await supabase
      .from('refunds')
      .update({ status: 'approved' })
      .eq('id', id);
    if (!error) {
      setRefunds((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
      );
    }
  }

  async function rejectRefund(id) {
    const supabase = createClient();
    const { error } = await supabase
      .from('refunds')
      .update({ status: 'rejected' })
      .eq('id', id);
    if (!error) {
      setRefunds((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
      );
    }
  }

  const filtered = refunds.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const pendingCount = refunds.filter((r) => r.status === 'pending').length;
  const totalPending = refunds
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={ADMIN_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="text-amber-500" />
            <div>
              <h1 className="text-lg font-black text-gray-900">طلبات الاسترداد</h1>
              <p className="text-xs text-gray-500">{pendingCount} طلبات تنتظر المراجعة</p>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Summary */}
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800">{pendingCount} طلبات استرداد معلقة</p>
                <p className="text-sm text-amber-600">إجمالي مبالغ مطلوبة: {formatPrice(totalPending)}</p>
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
                  statusFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Refund Cards */}
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">جارٍ التحميل...</div>
          ) : (
            <div className="space-y-4">
              {filtered.map((refund) => {
                const studentName = refund.users?.full_name || '—';
                const studentEmail = refund.users?.email || '—';
                const courseTitle = refund.courses?.title || refund.course_title || '—';
                const status = refund.status || 'pending';
                const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
                return (
                  <div key={refund.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-indigo-600 text-sm">{studentName.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-gray-900">{studentName}</h3>
                            <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                          </div>
                          <p className="text-xs text-gray-400 mb-2">{studentEmail}</p>
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-semibold">الدورة:</span> {courseTitle}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">السبب:</span> {refund.reason || '—'}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            تاريخ الطلب: {formatDate(refund.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-2xl font-black text-gray-900">{formatPrice(refund.amount || 0)}</p>
                        {status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveRefund(refund.id)}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              <CheckCircle size={14} />
                              قبول
                            </button>
                            <button
                              onClick={() => rejectRefund(refund.id)}
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
              {filtered.length === 0 && !loading && (
                <div className="text-center py-12 text-gray-400 text-sm">لا توجد طلبات استرداد</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
