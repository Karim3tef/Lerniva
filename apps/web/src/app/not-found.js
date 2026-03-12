import Link from 'next/link';
import { SearchX, Home, BookOpen } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center bg-white border border-gray-100 rounded-3xl shadow-sm p-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <SearchX size={40} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">الصفحة غير موجودة</h1>
          <p className="text-gray-500 mb-8">
            الرابط الذي فتحته غير صحيح أو تم نقل الصفحة إلى مكان آخر.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
            >
              <Home size={18} />
              الصفحة الرئيسية
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold transition-colors"
            >
              <BookOpen size={18} />
              تصفح الدورات
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
