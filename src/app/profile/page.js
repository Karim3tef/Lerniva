'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Shield, BookOpen, Award, Edit3, Camera, LogOut } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';

export default function ProfilePage() {
  const { isAuthenticated, user, profile, getRole } = useAuthStore();
  const [editMode, setEditMode] = useState(false);

  const role = getRole();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'المستخدم';
  const email = user?.email || profile?.email || '';

  const roleLabels = { student: 'طالب', teacher: 'معلم', admin: 'مدير' };
  const roleColors = {
    student: 'bg-indigo-100 text-indigo-700',
    teacher: 'bg-emerald-100 text-emerald-700',
    admin: 'bg-amber-100 text-amber-700',
  };
  const dashboardPath = role === 'admin' ? '/admin/dashboard' :
    role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center py-20 px-4 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={36} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">غير مسجل الدخول</h1>
            <p className="text-gray-500 mb-8">يجب تسجيل الدخول لعرض ملفك الشخصي</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login">
                <Button size="lg">تسجيل الدخول</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary" size="lg">إنشاء حساب</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative">
              <button className="absolute top-3 left-3 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white">
                <Camera size={16} />
              </button>
            </div>

            {/* Avatar + name */}
            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-10 mb-5">
                <div className="w-20 h-20 bg-indigo-600 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                  <span className="text-3xl font-black text-white">{displayName.charAt(0)}</span>
                </div>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                >
                  <Edit3 size={15} />
                  {editMode ? 'إلغاء' : 'تعديل الملف'}
                </button>
              </div>

              <h1 className="text-2xl font-black text-gray-900 mb-1">{displayName}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColors[role] || roleColors.student}`}>
                  {roleLabels[role] || 'مستخدم'}
                </span>
                <span className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Mail size={14} />
                  {email}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="md:col-span-2 space-y-5">
              {/* Info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <User size={18} className="text-indigo-500" />
                  المعلومات الشخصية
                </h2>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الاسم الكامل</label>
                      <input
                        type="text"
                        defaultValue={displayName}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">البريد الإلكتروني</label>
                      <input
                        type="email"
                        defaultValue={email}
                        disabled
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <Button onClick={() => setEditMode(false)}>حفظ التغييرات</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: 'الاسم الكامل', value: displayName, icon: User },
                      { label: 'البريد الإلكتروني', value: email, icon: Mail },
                      { label: 'الدور', value: roleLabels[role] || 'مستخدم', icon: Shield },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon size={15} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-semibold text-gray-700">{value || '—'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-500" />
                  إحصائيات التعلم
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'الدورات المسجلة', value: '—', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'الدروس المكتملة', value: '—', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'الشهادات', value: '—', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                      <Icon size={20} className={`${color} mx-auto mb-2`} />
                      <div className="text-xl font-black text-gray-900">{value}</div>
                      <div className="text-xs text-gray-500 mt-1">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-sm font-bold text-gray-900 mb-4">روابط سريعة</h2>
                <div className="space-y-2">
                  <Link
                    href={dashboardPath}
                    className="flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <BookOpen size={16} />
                    لوحة التحكم
                  </Link>
                  {role === 'student' && (
                    <Link
                      href="/student/my-courses"
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <BookOpen size={16} />
                      دوراتي
                    </Link>
                  )}
                  <Link
                    href="/courses"
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    <Award size={16} />
                    استكشف الدورات
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
