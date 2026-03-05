'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Clock, Users, BookOpen, Play, ArrowRight, CheckCircle, Award } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';
import { formatPrice, formatDuration, formatNumber, getLevelLabel, getLevelColor } from '@/lib/helpers';
import useAuthStore from '@/store/authStore';

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const { isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [courseData, reviewsData] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/reviews/course/${id}`),
      ]);

      setCourse(courseData);
      setReviews(reviewsData || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">جاري تحميل الدورة...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-6">📚</div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">الدورة غير موجودة</h1>
            <p className="text-gray-500 mb-8">لم نتمكن من العثور على هذه الدورة. ربما تم حذفها أو تغيير رابطها.</p>
            <Link href="/courses">
              <Button rightIcon={<ArrowRight size={18} />}>تصفح جميع الدورات</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const levelColor = getLevelColor(course.level);
  const hoursTotal = Math.round((course.duration_minutes || 0) / 60);
  const categoryName = course.categories?.name;

  const WHAT_YOU_LEARN = [
    'فهم المفاهيم الأساسية وتطبيقها عملياً',
    'بناء مشاريع حقيقية تُعزز سيرتك الذاتية',
    'حل المسائل والتحديات بأسلوب منهجي',
    'الاطلاع على أحدث الأساليب والأدوات',
    'التفاعل مع مجتمع المتعلمين والمعلم',
    'الحصول على شهادة إتمام معتمدة',
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              {/* Course info */}
              <div className="lg:col-span-2">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-indigo-300 mb-6">
                  <Link href="/courses" className="hover:text-white transition-colors">الدورات</Link>
                  <span>/</span>
                  {categoryName && <span>{categoryName}</span>}
                  <span>/</span>
                  <span className="text-white truncate max-w-xs">{course.title}</span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {categoryName && (
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-xs font-bold">
                      {categoryName}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20`}>
                    {getLevelLabel(course.level)}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4">{course.title}</h1>
                <p className="text-indigo-200 text-lg leading-relaxed mb-6">{course.description}</p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-5 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-amber-400">{course.avg_rating?.toFixed(1) || '4.5'}</span>
                    <span className="text-indigo-300">({formatNumber(course.enrollment_count || 0)} طالب)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <BookOpen size={15} />
                    <span>{course.lessons_count || 0} درس</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Clock size={15} />
                    <span>{hoursTotal} ساعة</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Users size={15} />
                    <span>{formatNumber(course.enrollment_count || 0)} متعلم</span>
                  </div>
                </div>

                {/* Instructor */}
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                  <div className="w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-white">
                      {(course.users?.full_name || 'م').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-indigo-300">المدرب</p>
                    <p className="font-bold text-white">{course.users?.full_name || 'معلم غير محدد'}</p>
                  </div>
                </div>
              </div>

              {/* Purchase card - desktop */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900 sticky top-24">
                  {/* Thumbnail */}
                  <div className="h-44 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mb-5 flex items-center justify-center overflow-hidden">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-7xl opacity-40">📚</span>
                    )}
                  </div>

                  <div className="text-3xl font-black text-gray-900 mb-5">
                    {course.price === 0 ? (
                      <span className="text-emerald-600">مجاني</span>
                    ) : (
                      formatPrice(course.price)
                    )}
                  </div>

                  {isAuthenticated ? (
                    <Link href={`/checkout/${id}`}>
                      <Button fullWidth size="lg" leftIcon={<Play size={18} />}>
                        {course.price === 0 ? 'التسجيل مجاناً' : 'اشترك الآن'}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/login?redirect=/courses/${id}`}>
                      <Button fullWidth size="lg" leftIcon={<Play size={18} />}>
                        {course.price === 0 ? 'التسجيل مجاناً' : 'اشترك الآن'}
                      </Button>
                    </Link>
                  )}

                  <p className="text-xs text-gray-400 text-center mt-3">ضمان استرداد المبلغ خلال 30 يوماً</p>

                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2.5 text-sm text-gray-600">
                    {[
                      { icon: BookOpen, text: `${course.lessons_count || 0} درس` },
                      { icon: Clock, text: `${hoursTotal} ساعة من المحتوى` },
                      { icon: Award, text: 'شهادة إتمام معتمدة' },
                      { icon: Users, text: 'وصول مدى الحياة' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2">
                        <Icon size={15} className="text-indigo-500 flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        <section className="py-12 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">ماذا ستتعلم؟</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WHAT_YOU_LEARN.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4">وصف الدورة</h2>
            <p className="text-gray-600 leading-relaxed text-base">{course.description}</p>
          </div>
        </section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="py-12 bg-white border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">
                تقييمات الطلاب ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-indigo-600">
                        {(review.users?.full_name || 'م').charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{review.users?.full_name}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Mobile CTA */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="flex items-center justify-between max-w-lg mx-auto gap-4">
            <div className="text-xl font-black text-gray-900">
              {course.price === 0 ? <span className="text-emerald-600">مجاني</span> : formatPrice(course.price)}
            </div>
            {isAuthenticated ? (
              <Link href={`/checkout/${id}`}>
                <Button size="lg" leftIcon={<Play size={18} />}>
                  {course.price === 0 ? 'التسجيل مجاناً' : 'اشترك الآن'}
                </Button>
              </Link>
            ) : (
              <Link href={`/login?redirect=/courses/${id}`}>
                <Button size="lg" leftIcon={<Play size={18} />}>
                  {course.price === 0 ? 'التسجيل مجاناً' : 'اشترك الآن'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
