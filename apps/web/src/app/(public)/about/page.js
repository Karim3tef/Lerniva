import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Target, Users, Award, Globe, Heart, Zap } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'عن لرنيفا - منصة تعلم STEM بالعربية',
};

const VALUES = [
  { icon: Target, title: 'الجودة أولاً', desc: 'نضمن أعلى معايير الجودة في كل دورة تعليمية من خلال مراجعة دقيقة للمحتوى' },
  { icon: Globe, title: 'تعليم للجميع', desc: 'نؤمن بأن التعليم حق للجميع، لذا نقدم دورات مجانية ومدفوعة بأسعار معقولة' },
  { icon: Heart, title: 'المجتمع أساسنا', desc: 'نبني مجتمعاً تعليمياً داعماً يجمع الطلاب والمعلمين من جميع أنحاء العالم العربي' },
  { icon: Zap, title: 'التطور المستمر', desc: 'نواكب أحدث التطورات في مجالات STEM لنوفر محتوى معاصراً وذا صلة' },
];

const TEAM = [
  { name: 'أ. عبدالله المطيري', role: 'المؤسس والرئيس التنفيذي', bg: 'from-indigo-500 to-purple-600', initial: 'ع' },
  { name: 'د. نورة الشمري', role: 'مدير المحتوى التعليمي', bg: 'from-emerald-500 to-teal-600', initial: 'ن' },
  { name: 'م. فيصل الدوسري', role: 'مدير التقنية', bg: 'from-amber-500 to-orange-600', initial: 'ف' },
  { name: 'أ. منى القحطاني', role: 'مدير تجربة المستخدم', bg: 'from-rose-500 to-pink-600', initial: 'م' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
              <Heart size={14} className="text-red-400 fill-red-400" />
              <span className="text-sm font-semibold">صنعنا بشغف لكل عربي يحب العلم</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-6">
              نعيد تشكيل <span className="text-amber-400">التعليم العلمي</span>
              <br />بالعربية
            </h1>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto leading-relaxed">
              لرنيفا منصة تعليمية عربية تأسست عام 2023 بهدف واحد:
              جعل تعلم العلوم والتقنية والهندسة والرياضيات متاحاً وممتعاً لكل عربي.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-6">رسالتنا</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-lg">
                  نؤمن بأن الشباب العربي يمتلك طاقات هائلة وعقوليات متميزة.
                  كل ما ينقصه هو محتوى تعليمي عالي الجودة بلغته الأم.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  لذلك جمعنا أفضل المعلمين والمتخصصين العرب في منصة واحدة تقدم
                  تجربة تعليمية لا مثيل لها في مجالات STEM.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['علوم', 'تقنية', 'هندسة', 'رياضيات', 'برمجة', 'ذكاء اصطناعي'].map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '12,500+', label: 'طالب نشط', icon: Users },
                  { value: '700+', label: 'دورة تعليمية', icon: Award },
                  { value: '150+', label: 'معلم متخصص', icon: Globe },
                  { value: '98%', label: 'رضا الطلاب', icon: Heart },
                ].map(({ value, label, icon: Icon }) => (
                  <div key={label} className="bg-gray-50 rounded-2xl p-6 text-center">
                    <Icon size={28} className="text-indigo-600 mx-auto mb-3" />
                    <div className="text-2xl font-black text-gray-900">{value}</div>
                    <div className="text-xs text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">قيمنا</h2>
              <p className="text-gray-500">المبادئ التي نبني عليها كل قرار نتخذه</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                    <Icon size={24} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">فريقنا</h2>
              <p className="text-gray-500">نخبة من المتخصصين يعملون بشغف لخدمتك</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {TEAM.map((member) => (
                <div key={member.name} className="text-center">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.bg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-3xl font-black text-white">{member.initial}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{member.name}</h3>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-indigo-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-4">انضم إلى عائلة لرنيفا</h2>
            <p className="text-indigo-200 mb-8">كن جزءاً من مجتمع المتعلمين العرب</p>
            <Link href="/register">
              <Button size="xl" variant="accent">ابدأ التعلم الآن</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
