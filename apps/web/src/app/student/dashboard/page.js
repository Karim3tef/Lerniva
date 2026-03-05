'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Play, ChevronLeft, Menu, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import StatsCard from '@/components/dashboard/StatsCard';
import CourseCard from '@/components/course/CourseCard';
import NotificationBell from '@/components/notifications/NotificationBell';
import { STUDENT_NAVIGATION } from '@/constants';
import { createClient } from '@/lib/supabase';

const EMOJIS = ['💻', '📐', '🤖', '⚛️', '📊', '⚙️', '🧪', '🧬'];

export default function StudentDashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [certCount, setCertCount] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [learnHours, setLearnHours] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      const [
        { data: enrollData },
        { count: certCountData },
        { count: completedCount },
        { data: watchData },
      ] = await Promise.all([
        supabase
          .from('enrollments')
          .select('*, courses(id, title, thumbnail_url, total_duration, total_lessons, users(full_name))')
          .eq('student_id', user.id)
          .order('purchased_at', { ascending: false }),
        supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id),
        supabase
          .from('lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('completed', true),
        supabase
          .from('lesson_progress')
          .select('watch_duration')
          .eq('student_id', user.id),
      ]);

      setEnrollments(enrollData || []);
      setCertCount(certCountData || 0);
      setCompletedLessons(completedCount || 0);

      const totalSeconds = (watchData || []).reduce((sum, r) => sum + (r.watch_duration || 0), 0);
      setLearnHours(Math.round(totalSeconds / 3600));

      // Fetch recommended courses (not enrolled)
      const enrolledIds = (enrollData || []).map((e) => e.course_id);
      let recommendQuery = supabase
        .from('courses')
        .select('*, users(full_name)')
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(4);

      if (enrolledIds.length > 0) {
        recommendQuery = recommendQuery.not('id', 'in', `(${enrolledIds.join(',')})`);
      }

      const { data: recData } = await recommendQuery;
      setRecommendations(recData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  // For each enrollment, fetch the last watched lesson or first lesson
  const [lessonLinks, setLessonLinks] = useState({});
  useEffect(() => {
    if (enrollments.length === 0) return;
    const fetchLessonLinks = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const links = {};
      await Promise.all(
        enrollments.slice(0, 3).map(async (enrollment) => {
          const courseId = enrollment.course_id;

          // Try to get last watched lesson
          const { data: lastProgress } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('student_id', user.id)
            .eq('course_id', courseId)
            .order('last_watched_at', { ascending: false })
            .limit(1)
            .single();

          if (lastProgress?.lesson_id) {
            links[courseId] = `/learn/${courseId}/${lastProgress.lesson_id}`;
          } else {
            // Fall back to first lesson
            const { data: firstLesson } = await supabase
              .from('lessons')
              .select('id')
              .eq('course_id', courseId)
              .order('order_number', { ascending: true })
              .limit(1)
              .single();

            links[courseId] = firstLesson?.id
              ? `/learn/${courseId}/${firstLesson.id}`
              : null;
          }
        })
      );
      setLessonLinks(links);
    };
    fetchLessonLinks();
  }, [enrollments]);

  const recentEnrollments = enrollments.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        navigation={STUDENT_NAVIGATION}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100"
              aria-label="فتح القائمة"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black text-gray-900">لوحة التحكم</h1>
              <p className="text-xs text-gray-500">مرحباً بعودتك! واصل رحلة التعلم</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {userId && <NotificationBell userId={userId} />}
            <Link href="/courses">
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <BookOpen size={16} />
                <span className="hidden sm:inline">استكشف الدورات</span>
              </button>
            </Link>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard title="الدورات المسجلة" value={String(enrollments.length)} icon="BookOpen" color="indigo" subtitle="" />
                <StatsCard title="الدروس المكتملة" value={String(completedLessons)} icon="CheckCircle" color="emerald" subtitle="" />
                <StatsCard title="الشهادات" value={String(certCount)} icon="Award" color="amber" subtitle="" />
                <StatsCard title="ساعات التعلم" value={String(learnHours)} icon="Clock" color="purple" subtitle="" />
              </div>

              {/* Continue Learning */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">واصل التعلم</h2>
                  <Link href="/student/my-courses" className="flex items-center gap-1 text-sm text-indigo-600 font-semibold">
                    عرض الكل <ChevronLeft size={16} />
                  </Link>
                </div>
                {recentEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400 mb-3">لم تسجل في أي دورة بعد</p>
                    <Link href="/courses">
                      <button className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                        ابدأ رحلتك التعليمية اليوم
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentEnrollments.map((enrollment, idx) => {
                      const link = lessonLinks[enrollment.course_id];
                      return (
                        <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">
                            {EMOJIS[idx % EMOJIS.length]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {enrollment.courses?.title || '—'}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                                {enrollment.progress || 0}%
                              </span>
                            </div>
                          </div>
                          {link ? (
                            <Link href={link}>
                              <button className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label="استمر في التعلم">
                                <Play size={14} />
                              </button>
                            </Link>
                          ) : (
                            <button disabled className="w-9 h-9 bg-gray-300 rounded-xl flex items-center justify-center text-white flex-shrink-0 opacity-40" aria-label="لا توجد دروس بعد">
                              <Play size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Recommended */}
              {recommendations.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">دورات مقترحة لك</h2>
                    <Link href="/courses" className="flex items-center gap-1 text-sm text-indigo-600 font-semibold">
                      عرض الكل <ChevronLeft size={16} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {recommendations.slice(0, 3).map((course) => (
                      <CourseCard key={course.id} course={course} compact />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

