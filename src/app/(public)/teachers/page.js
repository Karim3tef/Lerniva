import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { GraduationCap, DollarSign, Users, Star, BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'كن معلمًا في لرنيفا - شارك معرفتك وكسب دخلاً',
};

const BENEFITS = [
  { icon: DollarSign, title: 'دخل مستدام', desc: 'اكسب حتى 70% من كل عملية بيع لدوراتك التعليمية' },
  { icon: Users, title: 'آلاف الطلاب', desc: 'تواصل مع أكثر من 12,500 طالب متحمس للتعلم' },
  { icon: TrendingUp, title: 'نمو مستمر', desc: 'لوحة تحليلات متكاملة لمتابعة أداء دوراتك ونموها' },
  { icon: Star, title: 'دعم كامل', desc: 'فريق متخصص لمساعدتك في إنشاء وتسويق دوراتك' },
];

const STEPS = [
  { step: '01', title: 'سجّل كمعلم', desc: 'أنشئ حسابًا وأكمل ملفك الشخصي بتفاصيل خبرتك وتخصصك' },
  { step: '02', title: 'أنشئ دورتك', desc: 'استخدم أدواتنا السهلة لتصميم دورة احترافية وجذابة' },
  { step: '03', title: 'انشر وابدأ', desc: 'راجع فريقنا لضمان الجودة ثم انشر دورتك للعالم' },
  { step: '04', title: 'اكسب وتطور', desc: 'تابع إيراداتك وتحليلاتك وطوّر دوراتك باستمرار' },
];

export default function TeachersPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <GraduationCap size={32} className="text-amber-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-6">
              شارك معرفتك مع <span className="text-amber-400">آلاف الطلاب العرب</span>
            </h1>
            <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              انضم إلى أكثر من 150 معلمًا متخصصًا على منصة لرنيفا وابدأ رحلتك في التدريس الإلكتروني اليوم.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" variant="accent">ابدأ كمعلم مجانًا</Button>
              </Link>
              <Link href="/courses">
                <Button size="xl" className="bg-white/10 hover:bg-white/20 text-white border border-white/30">
                  استعرض الدورات
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">لماذا تدرّس في لرنيفا؟</h2>
              <p className="text-gray-500">مزايا حصرية تجعل تجربة التدريس ممتعة ومجزية</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow border border-gray-100">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">كيف تبدأ؟</h2>
              <p className="text-gray-500">أربع خطوات بسيطة لبدء مسيرتك التعليمية</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                    <span className="text-xl font-black text-white">{step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">متطلبات الانضمام</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'خبرة في مجالك لا تقل عن سنتين',
                'القدرة على الشرح بوضوح باللغة العربية',
                'امتلاك معدات تسجيل أساسية (ميكروفون + كاميرا)',
                'الالتزام بمعايير جودة المحتوى',
                'الاستعداد للرد على استفسارات الطلاب',
                'شهادة أو ما يثبت التخصص (مُستحسن)',
              ].map((req) => (
                <div key={req} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-indigo-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-4">مستعد لتغيير حياة طلابك؟</h2>
            <p className="text-indigo-200 mb-8">انضم اليوم وابدأ رحلتك في التعليم الرقمي</p>
            <Link href="/register">
              <Button size="xl" variant="accent">سجّل كمعلم الآن</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
