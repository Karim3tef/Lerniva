import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Lock, ChevronLeft, BookOpen, Play } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import MuxPlayerClient from '@/components/video/MuxPlayerClient';
import LessonProgressClient from '@/components/video/LessonProgressClient';

export default async function LessonPlayerPage({ params }) {
  const { courseId, lessonId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/learn/${courseId}/${lessonId}`);
  }

  // Verify enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, progress')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (!enrollment) {
    redirect(`/checkout/${courseId}`);
  }

  // Fetch all lessons
  const { data: lessons } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', courseId)
    .order('order_number', { ascending: true });

  // Fetch current lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (!lesson) {
    redirect(`/student/my-courses`);
  }

  // Fetch course title
  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  return (
    <div className="min-h-screen bg-gray-900 flex" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center gap-4">
          <Link href="/student/my-courses" className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">{course?.title}</p>
            <h1 className="text-white font-bold text-sm truncate">{lesson.title}</h1>
          </div>
          <div className="text-xs text-gray-400">
            {Math.round(enrollment.progress || 0)}% مكتمل
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 p-6">
          {lesson.mux_playback_id ? (
            <LessonProgressClient
              playbackId={lesson.mux_playback_id}
              lessonTitle={lesson.title}
              courseId={courseId}
              lessonId={lessonId}
              lessons={lessons || []}
            />
          ) : (
            <div className="w-full aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Play size={48} className="mx-auto mb-3 opacity-50" />
                <p>الفيديو قيد المعالجة…</p>
              </div>
            </div>
          )}

          {/* Lesson Info */}
          <div className="mt-6 bg-gray-800 rounded-xl p-5">
            <h2 className="text-white font-bold text-lg mb-2">{lesson.title}</h2>
            {lesson.content && (
              <p className="text-gray-300 text-sm leading-relaxed">{lesson.content}</p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Lesson List */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex-col hidden lg:flex">
        <div className="p-5 border-b border-gray-700">
          <h2 className="text-white font-bold text-sm flex items-center gap-2">
            <BookOpen size={16} />
            محتوى الدورة
          </h2>
          <p className="text-xs text-gray-400 mt-1">{lessons?.length || 0} درس</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {(lessons || []).map((l, index) => {
            const isActive = l.id === lessonId;
            const isCompleted = false; // TODO: track individual lesson completion
            return (
              <Link
                key={l.id}
                href={`/learn/${courseId}/${l.id}`}
                className={`flex items-center gap-3 p-4 border-b border-gray-700/50 hover:bg-gray-700 transition-colors ${
                  isActive ? 'bg-indigo-900/50 border-r-2 border-r-indigo-500' : ''
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isActive ? 'bg-indigo-600 text-white' :
                  isCompleted ? 'bg-emerald-600 text-white' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {isCompleted ? <CheckCircle size={14} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isActive ? 'text-white font-semibold' : 'text-gray-300'}`}>
                    {l.title}
                  </p>
                  <p className="text-xs text-gray-500">{l.duration || 0} دقيقة</p>
                </div>
                {!l.is_preview && !isCompleted && !isActive && (
                  <Lock size={12} className="text-gray-500 flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
