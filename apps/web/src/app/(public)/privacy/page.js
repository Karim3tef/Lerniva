import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'سياسة الخصوصية - لرنيفا',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3">سياسة الخصوصية</h1>
            <p className="text-gray-500">آخر تحديث: يناير 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {[
            {
              title: '1. المعلومات التي نجمعها',
              body: 'نقوم بجمع المعلومات التي تقدمها مباشرةً عند التسجيل، مثل: الاسم، عنوان البريد الإلكتروني، ومعلومات الدفع. كما نجمع بيانات الاستخدام مثل الدورات التي شاهدتها، والتقدم في التعلم، والتفاعلات مع المحتوى.',
            },
            {
              title: '2. كيف نستخدم معلوماتك',
              body: 'نستخدم معلوماتك لتقديم خدماتنا التعليمية، وتخصيص تجربة التعلم لديك، ومعالجة المدفوعات، وإرسال التحديثات المتعلقة بحسابك. لن نبيع معلوماتك الشخصية لأطراف ثالثة بأي حال.',
            },
            {
              title: '3. مشاركة البيانات',
              body: 'قد نشارك معلوماتك مع مزودي الخدمات الموثوقين الذين يساعدوننا في تشغيل المنصة، مثل معالجي الدفع ومزودي الاستضافة. جميع الأطراف الثالثة ملزمة بالحفاظ على سرية بياناتك.',
            },
            {
              title: '4. أمان البيانات',
              body: 'نطبق أحدث معايير الأمان لحماية بياناتك، بما يشمل التشفير (SSL/TLS)، والمصادقة الثنائية، والمراقبة المستمرة. نحتفظ ببياناتك فقط طالما كان ذلك ضروريًا لتقديم الخدمة.',
            },
            {
              title: '5. حقوقك',
              body: 'يحق لك طلب الاطلاع على بياناتك الشخصية، أو تصحيحها، أو حذفها في أي وقت. يمكنك إلغاء الاشتراك في الرسائل التسويقية بسهولة من خلال إعدادات حسابك أو عبر رابط إلغاء الاشتراك في أي بريد إلكتروني.',
            },
            {
              title: '6. ملفات تعريف الارتباط (Cookies)',
              body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. لمزيد من التفاصيل حول كيفية استخدامنا لهذه الملفات، يرجى مراجعة سياسة الكوكيز الخاصة بنا.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-sm text-gray-600">
              لأي استفسارات تتعلق بخصوصيتك، يرجى{' '}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">التواصل معنا</Link>
              {' '}أو مراسلتنا على{' '}
              <a href="mailto:privacy@lerniva.com" className="text-indigo-600 font-semibold hover:underline">privacy@lerniva.com</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
