'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import TeacherCourseEditForm from '@/components/forms/TeacherCourseEditForm';

export default function TeacherCourseEditPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/courses/${id}`),
      api.get('/courses/categories'),
    ]).then(([courseData, catsData]) => {
      if (!courseData || courseData.error) {
        router.push('/teacher/courses');
        return;
      }
      setCourse(courseData);
      setCategories(catsData || []);
      setLoading(false);
    }).catch(() => router.push('/teacher/courses'));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>;
  if (!course) return null;

  return <TeacherCourseEditForm course={course} categories={categories} />;
}
