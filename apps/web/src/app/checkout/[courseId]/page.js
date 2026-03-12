'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, Award, Play, Loader } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/helpers';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function CheckoutPage({ params }) {
  const { courseId } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await api.get(`/courses/${courseId}`);
      setCourse(data);
      setLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setError('');
    try {
      const isFree = !course?.price || Number(course.price) === 0;
      const data = isFree
        ? await api.post('/enrollments', { courseId })
        : await api.post('/payments/checkout', { courseId });

      if (isFree) {
        router.push('/student/my-courses');
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      if (err?.message?.includes('مسجل بالفعل')) {
        router.push('/student/my-courses');
        return;
      }
      setError(err?.message || 'حدث خطأ. حاول مجدداً.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader size={32} className="text-indigo-600 animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">الدورة غير موجودة</h1>
            <Link href="/courses">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold">
                تصفح الدورات
              </button>
            </Link>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl font-black text-gray-900 mb-8">إتمام التسجيل</h1>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={48} className="text-white/50" />
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-black text-gray-900 mb-2">{course.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{course.description}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600">
                    {(course.users?.full_name || 'م').charAt(0)}
                  </span>
                </div>
                <span>{course.users?.full_name || 'معلم غير محدد'}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><BookOpen size={14} /> {course.total_lessons || 0} درس</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {Math.round((course.total_duration || 0) / 60)} ساعة</span>
                <span className="flex items-center gap-1"><Award size={14} /> شهادة إتمام</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold text-gray-700">إجمالي الدفع</span>
              <span className="text-3xl font-black text-gray-900">
                {!course.price || Number(course.price) === 0 ? (
                  <span className="text-emerald-600">مجاني</span>
                ) : formatPrice(Number(course.price))}
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
            >
              {enrolling ? (
                <><Loader size={20} className="animate-spin" /> جارٍ المعالجة…</>
              ) : (
                <><Play size={20} /> {!course.price || Number(course.price) === 0 ? 'التسجيل مجاناً' : 'الدفع والتسجيل'}</>
              )}
            </button>
            <p className="text-xs text-gray-400 text-center mt-3">ضمان استرداد المبلغ خلال 30 يوماً</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
