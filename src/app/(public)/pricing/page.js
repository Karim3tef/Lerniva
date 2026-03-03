import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { CheckCircle, Star, Zap, Users } from 'lucide-react';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'الأسعار والباقات - لرنيفا',
};

const PLANS = [
  {
    name: 'المجاني',
    price: 0,
    period: '',
    desc: 'ابدأ رحلتك التعليمية بدون أي تكلفة',
    color: 'border-gray-200',
    btnVariant: 'secondary',
    features: [
      'الوصول إلى الدورات المجانية',
      'تتبع التقدم الأساسي',
      'شهادات إتمام',
      'دعم المجتمع',
    ],
    notIncluded: ['الدورات المميزة', 'دعم أولوية', 'محتوى حصري'],
  },
  {
    name: 'الطالب',
    price: 49,
    period: 'شهريًا',
    desc: 'الأنسب للطلاب الجادين في التعلم',
    color: 'border-indigo-500',
    popular: true,
    btnVariant: 'primary',
    features: [
      'وصول غير محدود لجميع الدورات',
      'تحميل المحتوى للمشاهدة دون إنترنت',
      'دعم فني بالبريد الإلكتروني',
      'شهادات معتمدة',
      'اختبارات وتمارين تفاعلية',
      'تتبع تقدم تفصيلي',
    ],
    notIncluded: ['جلسات خاصة مع المعلمين'],
  },
  {
    name: 'المحترف',
    price: 99,
    period: 'شهريًا',
    desc: 'للمحترفين الذين يريدون التميز',
    color: 'border-amber-400',
    btnVariant: 'accent',
    features: [
      'كل مميزات خطة الطالب',
      'جلسات خاصة مع المعلمين (2/شهر)',
      'دعم أولوية على مدار الساعة',
      'محتوى حصري ومتقدم',
      'مجموعات دراسية خاصة',
      'مراجعة المشاريع من قبل الخبراء',
      'شهادات مميزة',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-20 text-center">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-black mb-4">
              أسعار <span className="text-amber-400">بسيطة وشفافة</span>
            </h1>
            <p className="text-xl text-indigo-200 mb-6">
              ابدأ مجانًا وطوّر نفسك في أي وقت. بدون عقود، بدون رسوم خفية.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>ضمان استرداد الأموال خلال 30 يومًا</span>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm overflow-hidden relative ${plan.popular ? 'shadow-xl scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="bg-indigo-600 text-white text-xs font-bold text-center py-2">
                      الأكثر شعبية ⭐
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                    <div className="mb-8">
                      <span className="text-4xl font-black text-gray-900">
                        {plan.price === 0 ? 'مجاني' : `${plan.price} ر.س`}
                      </span>
                      {plan.period && <span className="text-gray-400 text-sm mr-1">/ {plan.period}</span>}
                    </div>
                    <Link href="/register">
                      <Button
                        fullWidth
                        size="lg"
                        variant={plan.popular ? 'primary' : 'secondary'}
                      >
                        {plan.price === 0 ? 'ابدأ مجانًا' : 'اشترك الآن'}
                      </Button>
                    </Link>
                  </div>
                  <div className="px-8 pb-8">
                    <div className="border-t border-gray-100 pt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 opacity-40">
                          <CheckCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500 line-through">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8 text-center">أسئلة شائعة حول الأسعار</h2>
            <div className="space-y-4">
              {[
                { q: 'هل يمكنني إلغاء الاشتراك في أي وقت؟', a: 'نعم، يمكنك إلغاء اشتراكك في أي وقت دون رسوم إضافية. ستحتفظ بالوصول حتى نهاية فترة الاشتراك المدفوعة.' },
                { q: 'هل توجد عروض للمجموعات والشركات؟', a: 'نعم! نقدم باقات خاصة للمؤسسات التعليمية والشركات. تواصل معنا للحصول على عرض مخصص.' },
                { q: 'هل يمكنني الترقية أو تخفيض الخطة؟', a: 'بالطبع، يمكنك تغيير خطتك في أي وقت من إعدادات حسابك.' },
              ].map(({ q, a }) => (
                <div key={q} className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-2">{q}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
