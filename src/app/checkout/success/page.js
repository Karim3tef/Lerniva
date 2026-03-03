'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, BookOpen, Loader } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollment = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Find the most recent enrollment
      const { data } = await supabase
        .from('enrollments')
        .select('*, courses(id, title, thumbnail_url)')
        .eq('student_id', user.id)
        .order('purchased_at', { ascending: false })
        .limit(1)
        .single();

      setEnrollment(data);
      setLoading(false);
    };
    fetchEnrollment();
  }, [sessionId]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {loading ? (
            <Loader size={40} className="text-indigo-600 animate-spin mx-auto" />
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-3">تم التسجيل بنجاح! 🎉</h1>
              <p className="text-gray-500 mb-2">
                {enrollment?.courses?.title
                  ? `تم تسجيلك في دورة: ${enrollment.courses.title}`
                  : 'يمكنك الآن بدء التعلم'}
              </p>
              <p className="text-sm text-gray-400 mb-8">ابدأ رحلة التعلم الآن وحقق أهدافك</p>
              <Link href="/student/my-courses">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <BookOpen size={20} />
                  ابدأ التعلم الآن
                </button>
              </Link>
              <Link href="/courses" className="block mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
                تصفح المزيد من الدورات
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
