import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'الأسئلة الشائعة - لرنيفا',
};

const FAQ_SECTIONS = [
  {
    title: 'حول المنصة',
    items: [
      {
        q: 'ما هي منصة لرنيفا؟',
        a: 'لرنيفا منصة تعليمية عربية متخصصة في مجالات العلوم والتقنية والهندسة والرياضيات (STEM). تقدم أكثر من 700 دورة تعليمية باللغة العربية يدرّسها أفضل المعلمين المتخصصين.',
      },
      {
        q: 'هل المنصة مجانية؟',
        a: 'تقدم لرنيفا مجموعة من الدورات المجانية تمامًا، إلى جانب دورات مدفوعة. يمكنك التسجيل مجانًا واستكشاف المحتوى المتاح.',
      },
    ],
  },
  {
    title: 'الدورات والتعلم',
    items: [
      {
        q: 'كيف أسجّل في دورة؟',
        a: 'ابحث عن الدورة التي تريدها، افتح صفحتها، ثم انقر على زر "التسجيل" أو "الاشتراك". إذا كانت مدفوعة، ستُوجَّه إلى صفحة الدفع.',
      },
      {
        q: 'هل يمكنني تنزيل المحتوى لمشاهدته بدون إنترنت؟',
        a: 'نعم، في خطة الطالب المميزة يمكنك تنزيل الدروس ومشاهدتها في أي وقت دون الحاجة إلى اتصال بالإنترنت.',
      },
      {
        q: 'ما هي مدة صلاحية الوصول للدورة؟',
        a: 'بعد الشراء، تحصل على وصول مدى الحياة للدورة. يمكنك العودة إليها وإعادة مشاهدتها متى أردت.',
      },
      {
        q: 'هل يمكنني الحصول على شهادة؟',
        a: 'نعم! بعد إتمام الدورة بنجاح واجتياز التقييمات، ستحصل على شهادة إتمام رقمية معتمدة يمكنك مشاركتها على ملفك المهني.',
      },
    ],
  },
  {
    title: 'الدفع والاشتراك',
    items: [
      {
        q: 'ما هي طرق الدفع المتاحة؟',
        a: 'نقبل بطاقات الائتمان والخصم (Visa, Mastercard)، وكذلك Apple Pay وGoogle Pay وبعض محافظ الدفع الإلكتروني.',
      },
      {
        q: 'هل يمكنني استرداد أموالي؟',
        a: 'نعم، نقدم ضمان استرداد الأموال خلال 30 يومًا من الشراء إذا لم تكن راضيًا عن الدورة. راجع سياسة الاسترداد لمزيد من التفاصيل.',
      },
    ],
  },
  {
    title: 'الحساب والإعدادات',
    items: [
      {
        q: 'كيف أغيّر كلمة المرور؟',
        a: 'اذهب إلى الملف الشخصي ← إعدادات الأمان ← تغيير كلمة المرور. يمكنك أيضًا استخدام رابط "نسيت كلمة المرور" في صفحة تسجيل الدخول.',
      },
      {
        q: 'هل يمكنني استخدام حساب واحد على أجهزة متعددة؟',
        a: 'نعم، يمكنك الوصول إلى حسابك من أي جهاز (كمبيوتر، هاتف، تابلت) باستخدام نفس بيانات تسجيل الدخول.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-3">الأسئلة الشائعة</h1>
            <p className="text-gray-500">إجابات على أكثر الأسئلة شيوعًا من مستخدمينا</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-gray-900 mb-5 pb-3 border-b border-gray-200">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map(({ q, a }) => (
                  <div key={q} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-2">{q}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="bg-indigo-50 rounded-2xl p-8 text-center border border-indigo-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">لم تجد إجابة لسؤالك؟</h3>
            <p className="text-gray-500 mb-6 text-sm">فريق الدعم لدينا يسعد بمساعدتك</p>
            <Link href="/contact">
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors text-sm">
                تواصل مع الدعم
              </button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
