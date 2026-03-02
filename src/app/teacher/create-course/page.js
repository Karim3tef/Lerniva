'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ArrowRight, CheckCircle } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import CreateCourseForm from '@/components/forms/CreateCourseForm';
import { TEACHER_NAVIGATION } from '@/constants';

export default function CreateCoursePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [created, setCreated] = useState(false);

  const handleSuccess = (course) => {
    setCreated(true);
    setTimeout(() => router.push('/teacher/courses'), 2000);
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
            <h1 className="text-lg font-black text-gray-900">إنشاء دورة جديدة</h1>
            <p className="text-xs text-gray-500">أضف دورتك وابدأ في التدريس</p>
          </div>
        </header>

        <main className="p-6">
          {created ? (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">تم إنشاء الدورة!</h2>
              <p className="text-gray-500">يتم تحويلك لصفحة إدارة الدورات...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Steps indicator */}
              <div className="flex items-center gap-3 mb-8">
                {['معلومات الدورة', 'المحتوى', 'النشر'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm font-semibold ${i === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step}
                    </span>
                    {i < 2 && <ArrowRight size={16} className="text-gray-300" />}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات الدورة الأساسية</h2>
                <CreateCourseForm onSuccess={handleSuccess} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
