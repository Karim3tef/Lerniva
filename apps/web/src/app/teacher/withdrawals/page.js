'use client';

import { useState, useEffect } from 'react';
import { Menu, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION } from '@/constants';
import { formatPrice, formatDate } from '@/lib/helpers';
import { api } from '@/lib/api';

const STATUS_LABEL = { pending: 'قيد المراجعة', approved: 'تمت الموافقة', rejected: 'مرفوض', paid: 'تم الدفع' };
const STATUS_COLOR = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-emerald-100 text-emerald-700', rejected: 'bg-red-100 text-red-700', paid: 'bg-blue-100 text-blue-700' };

export default function TeacherWithdrawalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [withdrawals, setWithdrawals] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.get('/teachers/withdrawals');
      setBalance(data?.balance || 0);
      setWithdrawals(data?.withdrawals || []);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('أدخل مبلغاً صحيحاً');
      return;
    }
    if (withdrawAmount > balance) {
      setError('المبلغ أكبر من الرصيد المتاح');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await api.post('/teachers/withdrawals', { amount: withdrawAmount });
      if (result?.error) throw new Error(result.error);
      setSuccess('تم إرسال طلب السحب بنجاح');
      setAmount('');
      fetchData();
    } catch (err) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">طلبات السحب</h1>
            <p className="text-xs text-gray-500">إدارة إيراداتك وطلبات السحب</p>
          </div>
        </header>

        <main className="p-6 max-w-3xl mx-auto">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
            <p className="text-indigo-200 text-sm mb-1">الرصيد المتاح للسحب</p>
            <div className="text-4xl font-black mb-4">{formatPrice(balance)}</div>
            <form onSubmit={handleWithdraw} className="flex gap-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                min="1"
                max={balance}
                step="0.01"
                className="flex-1 px-4 py-2.5 rounded-xl text-gray-900 text-sm focus:outline-none"
              />
              <button type="submit" disabled={submitting || loading}
                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
                {submitting ? 'جارٍ الإرسال…' : 'طلب سحب'}
              </button>
            </form>
            {error && <p className="text-red-200 text-sm mt-2">{error}</p>}
            {success && <p className="text-emerald-200 text-sm mt-2">{success}</p>}
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900">سجل طلبات السحب</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-gray-400">جارٍ التحميل…</div>
            ) : withdrawals.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <DollarSign size={40} className="mx-auto mb-3 opacity-40" />
                <p>لا توجد طلبات سحب بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {withdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <DollarSign size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{formatPrice(Number(w.amount))}</p>
                        <p className="text-xs text-gray-400">{formatDate(w.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLOR[w.status] || STATUS_COLOR.pending}`}>
                      {STATUS_LABEL[w.status] || w.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
