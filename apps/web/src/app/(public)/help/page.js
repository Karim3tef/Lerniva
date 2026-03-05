import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { Search, BookOpen, Users, MessageCircle, ChevronLeft } from 'lucide-react';

export const metadata = {
  title: 'مركز المساعدة - لرنيفا',
};

const HELP_CATEGORIES = [
  { icon: BookOpen, title: 'الدورات والمحتوى', desc: 'كيفية الوصول للدورات وتشغيل الفيديوهات', href: '/faq' },
  { icon: Users, title: 'الحساب والملف الشخصي', desc: 'إعدادات الحساب وكلمة المرور والمعلومات', href: '/faq' },
  { icon: MessageCircle, title: 'الدفع والاسترداد', desc: 'طرق الدفع، الفواتير، وسياسة الاسترداد', href: '/refund' },
];

const POPULAR_ARTICLES = [
  'كيفية التسجيل في دورة جديدة',
  'إعادة تعيين كلمة المرور',
  'تحميل الشهادة بعد إتمام الدورة',
  'كيفية تفعيل الوضع غير المتصل',
  'التواصل مع المعلم',
  'إلغاء الاشتراك أو تغيير الخطة',
];

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-black mb-4">كيف يمكننا مساعدتك؟</h1>
            <p className="text-indigo-200 mb-8">ابحث في مركز المساعدة أو تصفح الفئات أدناه</p>
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن موضوع..."
                className="w-full px-6 py-4 rounded-2xl text-gray-900 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
              />
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Categories */}
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">تصفح حسب الفئة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {HELP_CATEGORIES.map(({ icon: Icon, title, desc, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-indigo-200 transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                    <Icon size={22} className="text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular articles */}
          <section className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6">المقالات الأكثر شيوعًا</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {POPULAR_ARTICLES.map((article) => (
                <Link
                  key={article}
                  href="/faq"
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-sm text-gray-700 group-hover:text-indigo-600 font-medium">{article}</span>
                  <ChevronLeft size={16} className="text-gray-400 group-hover:text-indigo-600 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Still need help */}
          <section className="bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">لم تجد ما تبحث عنه؟</h3>
            <p className="text-gray-500 mb-6 text-sm">فريق الدعم لدينا جاهز للمساعدة على مدار الساعة</p>
            <Link href="/contact">
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm">
                تواصل مع الدعم
              </button>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
