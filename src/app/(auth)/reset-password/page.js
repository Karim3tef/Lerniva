'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('student');

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        setRole(profile?.role ?? 'student');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => {
        const dashboardPath = role === 'admin' ? '/admin/dashboard' :
          role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
        router.push(dashboardPath);
      }, 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ. حاول مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              لرن<span className="text-indigo-600">يفا</span>
            </span>
          </Link>
          {!success ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-2">تعيين كلمة مرور جديدة</h1>
              <p className="text-gray-500 text-sm">أدخل كلمة مرور جديدة لحسابك</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">تم التحديث!</h1>
              <p className="text-gray-500 text-sm">جارٍ تحويلك إلى لوحة التحكم…</p>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="8 أحرف على الأقل"
                    required
                    minLength={8}
                    className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'جارٍ التحديث…' : 'تعيين كلمة المرور'}
              </button>
            </form>
          ) : (
            <div className="text-center text-emerald-600 font-semibold">
              ✓ تم تحديث كلمة المرور بنجاح
            </div>
          )}
          <p className="text-center text-sm text-gray-500 mt-5">
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
              ← العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
