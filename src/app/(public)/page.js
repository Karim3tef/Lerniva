import Link from 'next/link';
import { ArrowLeft, Star, Play, CheckCircle, ChevronLeft, Users, BookOpen, Award, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '@/components/course/CourseCard';
import Button from '@/components/ui/Button';
import { STATS, CATEGORIES, HOW_IT_WORKS, TESTIMONIALS, MOCK_COURSES } from '@/constants';

export const metadata = {
  title: 'لرنيفا - منصة تعلم STEM بالعربية | علوم تقنية هندسة رياضيات',
  description: 'تعلم العلوم والتقنية والهندسة والرياضيات بالعربية مع أفضل المعلمين. أكثر من 700 دورة تفاعلية.',
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-semibold">المنصة العربية الأولى في تعليم STEM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                تعلّم العلوم والتقنية
                <span className="block text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-amber-200">
                  بلغتك العربية
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-indigo-200 leading-relaxed mb-10 max-w-2xl mx-auto">
                منصة لرنيفا توفر أكثر من <strong className="text-white">700 دورة تعليمية</strong> في
                العلوم والتقنية والهندسة والرياضيات، يشرحها أفضل المعلمين العرب بأسلوب تفاعلي وشيّق.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="xl" variant="accent" rightIcon={<ArrowLeft size={20} />}>
                    ابدأ التعلم مجاناً
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="xl"
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30"
                    leftIcon={<Play size={18} />}
                  >
                    استعرض الدورات
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-12 text-sm text-indigo-300">
                {[
                  { icon: CheckCircle, text: 'بدون بطاقة ائتمانية' },
                  { icon: CheckCircle, text: 'إلغاء في أي وقت' },
                  { icon: CheckCircle, text: 'ضمان استرداد 30 يوم' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon size={15} className="text-emerald-400" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-indigo-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {STATS.map((stat) => (
                <div key={stat.label} className="py-2">
                  <div className="text-3xl font-black text-amber-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-indigo-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">الدورات المميزة</h2>
                <p className="text-gray-500">اختيارات محررينا من أفضل الدورات التعليمية</p>
              </div>
              <Link href="/courses" className="hidden sm:flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                عرض الكل
                <ChevronLeft size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_COURSES.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/courses">
                <Button variant="outline">عرض جميع الدورات</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">استكشف التخصصات</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                من البرمجة إلى الفيزياء الكمية، نغطي جميع مجالات STEM باللغة العربية
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/courses?category=${cat.id}`}
                  className="group p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 text-center"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{cat.label}</h3>
                  <p className="text-xs text-gray-400">{cat.count} دورة</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-black text-gray-900 mb-3">كيف تعمل المنصة؟</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                أربع خطوات بسيطة تفصلك عن بداية رحلتك التعليمية
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {HOW_IT_WORKS.map((step, index) => {
                const icons = { UserPlus: Users, Search: BookOpen, PlayCircle: Play, Award: Award };
                const Icon = icons[step.icon] || BookOpen;
                return (
                  <div key={step.step} className="text-center relative">
                    {index < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-0 w-full h-0.5 bg-gradient-to-l from-indigo-200 to-transparent" />
                    )}
                    <div className="relative z-10 w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-200">
                      <Icon size={28} className="text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-xs font-black text-gray-900">
                        {step.step.replace('0', '')}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-3">ماذا يقول طلابنا؟</h2>
              <p className="text-gray-500">آراء حقيقية من متعلمين حقيقيين</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-700 font-bold">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
              <Award size={32} className="text-amber-400" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              ابدأ رحلتك التعليمية اليوم
            </h2>
            <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
              انضم إلى أكثر من 12,500 طالب يتعلمون العلوم والتقنية بالعربية.
              أول 30 يوم مجاناً - بدون أي التزام.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="xl" variant="accent" rightIcon={<ArrowLeft size={20} />}>
                  ابدأ مجاناً الآن
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="xl" className="bg-white/10 hover:bg-white/20 text-white border border-white/30">
                  تصفح الدورات
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
