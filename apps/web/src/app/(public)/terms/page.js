import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'شروط الاستخدام - لرنيفا',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3">شروط الاستخدام</h1>
            <p className="text-gray-500">آخر تحديث: يناير 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {[
            {
              title: '1. القبول بالشروط',
              body: 'باستخدامك منصة لرنيفا، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى التوقف عن استخدام المنصة. هذه الشروط تمثل اتفاقية ملزمة قانونيًا بينك وبين شركة لرنيفا.',
            },
            {
              title: '2. الحساب والتسجيل',
              body: 'يجب أن يكون عمرك 13 عامًا أو أكثر لإنشاء حساب. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك. تتحمل المسؤولية الكاملة عن جميع الأنشطة التي تحدث تحت حسابك.',
            },
            {
              title: '3. المحتوى التعليمي',
              body: 'جميع المحتويات المتاحة على المنصة محمية بحقوق الملكية الفكرية. يُمنح لك ترخيص محدود وغير قابل للتحويل للوصول إلى المحتوى الذي اشتركت فيه. لا يحق لك نسخ المحتوى أو توزيعه أو بيعه دون إذن كتابي مسبق.',
            },
            {
              title: '4. سياسة الدفع',
              body: 'تُعالَج المدفوعات بشكل آمن عبر مزودي الدفع المعتمدين. يمكنك الاشتراك في دورات مدفوعة باستخدام بطاقات الائتمان أو وسائل الدفع الإلكترونية المتاحة. يتم تطبيق سياسة الاسترداد وفقًا لبنود سياسة الاسترداد المعلنة.',
            },
            {
              title: '5. سلوك المستخدم',
              body: 'يُلتزم المستخدمون باحترام جميع أعضاء المجتمع. يُحظر نشر أي محتوى مسيء أو مضلل أو منتهك للحقوق. تحتفظ لرنيفا بالحق في تعليق أو إلغاء أي حساب يخالف هذه الشروط.',
            },
            {
              title: '6. التعديلات على الشروط',
              body: 'تحتفظ لرنيفا بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على المنصة. استمرارك في استخدام المنصة بعد التعديلات يُعتبر قبولًا للشروط الجديدة.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-sm text-gray-600">
              إذا كان لديك أي استفسارات حول شروط الاستخدام، يرجى{' '}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">التواصل معنا</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
