import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'سياسة ملفات تعريف الارتباط - لرنيفا',
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3">سياسة ملفات تعريف الارتباط</h1>
            <p className="text-gray-500">آخر تحديث: يناير 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {[
            {
              title: '1. ما هي ملفات تعريف الارتباط؟',
              body: 'ملفات تعريف الارتباط (Cookies) هي ملفات نصية صغيرة تُخزَّن على جهازك عند زيارة موقعنا. تساعدنا هذه الملفات في تذكر تفضيلاتك وتحسين تجربتك على المنصة.',
            },
            {
              title: '2. الكوكيز الضرورية',
              body: 'هذه الكوكيز ضرورية لتشغيل المنصة بشكل صحيح. تشمل: بيانات الجلسة (تسجيل الدخول)، وتذكر سلة التسوق، والتفضيلات الأساسية للموقع. لا يمكن تعطيل هذه الكوكيز.',
            },
            {
              title: '3. كوكيز الأداء والتحليل',
              body: 'نستخدم هذه الكوكيز لفهم كيفية استخدام الزوار لمنصتنا، وتحديد الصفحات الأكثر زيارة، ورصد أي أخطاء تقنية. تساعدنا البيانات المجمعة على تحسين أداء المنصة.',
            },
            {
              title: '4. كوكيز التخصيص',
              body: 'تسمح لنا هذه الكوكيز بتذكر اختياراتك مثل اللغة المفضلة وإعدادات العرض، مما يوفر تجربة أكثر تخصيصًا في كل زيارة.',
            },
            {
              title: '5. إدارة الكوكيز',
              body: 'يمكنك التحكم في ملفات تعريف الارتباط من خلال إعدادات متصفحك. يمكنك حذف جميع الكوكيز الموجودة أو ضبط متصفحك لمنع تخزينها. ملاحظة: تعطيل بعض الكوكيز قد يؤثر على وظائف المنصة.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-sm text-gray-600">
              لأي استفسارات حول سياسة الكوكيز، يرجى{' '}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">التواصل معنا</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
