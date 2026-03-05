'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import useAuthStore from '@/store/authStore';

export function useEnrollments() {
  const { user, isAuthenticated } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) fetchEnrollments();
  }, [isAuthenticated]);

  const fetchEnrollments = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/enrollments/mine');
      setEnrollments(data || []);
    } catch (err) {
      setError(err?.message || 'فشل تحميل التسجيلات');
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!isAuthenticated) throw new Error('يجب تسجيل الدخول أولاً');
    const data = await api.post('/enrollments', { course_id: courseId });
    await fetchEnrollments();
    return data;
  };

  const isEnrolled = (courseId) => {
    return enrollments.some((e) => e.course_id === courseId);
  };

  const getProgress = (courseId) => {
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  return {
    enrollments,
    isLoading,
    error,
    enrollInCourse,
    isEnrolled,
    getProgress,
    fetchEnrollments,
  };
}
