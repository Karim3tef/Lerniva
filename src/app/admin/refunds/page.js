'use client';

import { useState } from 'react';
import { Menu, Search, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import Badge from '@/components/ui/Badge';
import { ADMIN_NAVIGATION } from '@/constants';
import { formatPrice, formatDate } from '@/lib/helpers';

const REFUND_REQUESTS = [
  {
    id: 1,
    student: 'أحمد محمد السيد',
    email: 'ahmed@email.com',
    course: 'دورة Python للمبتدئين',
    amount: 199,
    reason: 'المحتوى لا يتناسب مع المستوى المُعلن',
    requestedAt: '2024-03-10T10:00:00Z',
    status: 'pending',
    daysSincePurchase: 5,
  },
  {
    id: 2,
    student: 'سارة عبدالله',
    email: 'sara@email.com',
    course: 'الرياضيات المتقدمة',
    amount: 249,
    reason: 'لم أستطع الوصول للدورة بسبب مشكلة تقنية',
    requestedAt: '2024-03-09T14:00:00Z',
    status: 'approved',
    daysSincePurchase: 8,
  },
  {
    id: 3,
    student: 'خالد العمري',
    email: 'khalid@email.com',
    course: 'الذكاء الاصطناعي الشامل',
    amount: 349,
    reason: 'تغيرت الظروف ولا أستطيع الاستمرار',
    requestedAt: '2024-03-08T09:00:00Z',
    status: 'rejected',
    daysSincePurchase: 35,
  },
  {
    id: 4,
    student: 'فاطمة القحطاني',
    email: 'fatima@email.com',
    course: 'هندسة الميكاترونيكس',
    amount: 399,
    reason: 'الدورة لا تعمل على جهازي',
    requestedAt: '2024-03-07T11:00:00Z',
    status: 'pending',
    daysSincePurchase: 3,
  },
];

const STATUS_CONFIG = {
  pending: { label: 'قيد المراجعة', variant: 'warning' },
  approved: { label: 'تم القبول', variant: 'success' },
  rejected: { label: 'مرفوض', variant: 'danger' },
};

export default function AdminRefundsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = REFUND_REQUESTS.filter((r) =>
    statusFilter === 'all' ? true : r.status === statusFilter
  );

  const pendingCount = REFUND_REQUESTS.filter((r) => r.status === 'pending').length;
  const totalPending = REFUND_REQUESTS.filter((r) => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

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
          <div className="space-y-4">
            {filtered.map((refund) => (
              <div key={refund.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-indigo-600 text-sm">{refund.student.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900">{refund.student}</h3>
                        <Badge variant={STATUS_CONFIG[refund.status].variant}>
                          {STATUS_CONFIG[refund.status].label}
                        </Badge>
                        {refund.daysSincePurchase > 30 && (
                          <Badge variant="danger" size="sm">تجاوز 30 يوم</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{refund.email}</p>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">الدورة:</span> {refund.course}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">السبب:</span> {refund.reason}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        تاريخ الطلب: {formatDate(refund.requestedAt)} ·
                        منذ الشراء: {refund.daysSincePurchase} يوم
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <p className="text-2xl font-black text-gray-900">{formatPrice(refund.amount)}</p>
                    {refund.status === 'pending' && (
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors">
                          <CheckCircle size={14} />
                          قبول
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors border border-red-200">
                          <XCircle size={14} />
                          رفض
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
