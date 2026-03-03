import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'سياسة الاسترداد - لرنيفا',
};

export default function RefundPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3">سياسة الاسترداد</h1>
            <p className="text-gray-500">نضمن رضاك التام - ضمان استرداد 30 يومًا</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          {/* Guarantee Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-4">
            <div className="text-3xl">✅</div>
            <div>
              <h3 className="font-bold text-emerald-800 mb-1">ضمان استرداد الأموال خلال 30 يومًا</h3>
              <p className="text-emerald-700 text-sm leading-relaxed">
                إذا لم تكن راضيًا عن الدورة لأي سبب كان، أرسل لنا طلبًا خلال 30 يومًا من الشراء وسنسترد مبلغك كاملًا دون أسئلة.
              </p>
            </div>
          </div>

          {[
            {
              title: '1. الأهلية للاسترداد',
              body: 'يمكنك طلب استرداد مبلغ الدورة إذا: مضى أقل من 30 يومًا على الشراء، ولم تكمل أكثر من 30% من محتوى الدورة. يسري هذا الضمان على جميع الدورات المدفوعة المشتراة مباشرةً من المنصة.',
            },
            {
              title: '2. الحالات المستثناة',
              body: 'لا تشمل سياسة الاسترداد: الاشتراكات الشهرية أو السنوية بعد انتهاء الفترة التجريبية، الدورات التي أُكملت بالكامل، والمحتوى الرقمي القابل للتنزيل بعد تنزيله.',
            },
            {
              title: '3. كيفية طلب الاسترداد',
              body: 'لطلب الاسترداد، يرجى التواصل مع فريق الدعم عبر صفحة "تواصل معنا" أو إرسال بريد إلكتروني إلى support@lerniva.com مع ذكر رقم الطلب وسبب طلب الاسترداد.',
            },
            {
              title: '4. مدة معالجة الطلب',
              body: 'تتم معالجة طلبات الاسترداد خلال 3-5 أيام عمل. يظهر المبلغ المسترد على بطاقتك الائتمانية أو حسابك خلال 5-10 أيام عمل إضافية بحسب سياسة مصرفك.',
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <p className="text-gray-600 leading-relaxed">{body}</p>
            </section>
          ))}

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
            <p className="text-sm text-gray-600">
              للمساعدة في طلب الاسترداد، يرجى{' '}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">التواصل مع فريق الدعم</Link>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
