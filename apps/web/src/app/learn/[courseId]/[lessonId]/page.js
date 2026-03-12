'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Lock, ChevronLeft, BookOpen, Play, Loader2 } from 'lucide-react';
import { api, setAccessToken } from '@/lib/api';
import LessonProgressClient from '@/components/video/LessonProgressClient';

export default function LessonPlayerPage({ params }) {
  const { courseId, lessonId } = use(params);
  const router = useRouter();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const refreshData = await api.post('/auth/refresh').catch(() => null);
        if (refreshData?.accessToken) {
          setAccessToken(refreshData.accessToken);
        }

        const [lessonData, lessonsData, enrollData, courseData] = await Promise.all([
          api.get(`/lessons/${lessonId}/watch`),
          api.get(`/lessons/course/${courseId}`),
          api.get(`/enrollments/${courseId}/check`),
          api.get(`/courses/${courseId}`),
        ]);

        if (!enrollData?.is_enrolled) {
          router.push(`/checkout/${courseId}`);
          return;
        }
        if (!lessonData || lessonData.error) {
          router.push('/student/my-courses');
          return;
        }

        setLesson(lessonData);
        setLessons(lessonsData || []);
        setEnrollment(enrollData);
        setCourse(courseData);
      } catch {
        router.push('/student/my-courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 size={40} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!lesson) return null;

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
            {Math.round(enrollment?.progress || 0)}% مكتمل
          </div>
        </header>

        {/* Video Player */}
        <div className="flex-1 p-6">
          {lesson.bunny_playback_url ? (
            <LessonProgressClient
              playbackUrl={lesson.bunny_playback_url}
              lessonTitle={lesson.title}
              courseId={courseId}
              lessonId={lessonId}
              lessons={lessons}
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
          <p className="text-xs text-gray-400 mt-1">{lessons.length} درس</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {lessons.map((l, index) => {
            const isActive = l.id === lessonId;
            const isCompleted = l.user_completed || false;
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
