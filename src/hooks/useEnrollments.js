'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/authStore';

export function useEnrollments() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchEnrollments();
  }, [user?.id]);

  const fetchEnrollments = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('student_id', user.id)
        .order('purchased_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEnrollments(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    if (!user?.id) throw new Error('يجب تسجيل الدخول أولاً');
    const { data, error: enrollError } = await supabase
      .from('enrollments')
      .insert({ student_id: user.id, course_id: courseId })
      .select()
      .single();
    if (enrollError) throw enrollError;
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
