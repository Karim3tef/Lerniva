'use client';

import { useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import useCourseStore from '@/store/courseStore';

export function useCourses() {
  const {
    courses, featuredCourses, isLoading, error,
    filters, pagination, setCourses, setFeaturedCourses,
    setLoading, setError, setFilter, resetFilters,
    setPagination, getFilteredCourses,
  } = useCourseStore();

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.perPage,
      });
      if (filters.category) params.set('category', filters.category);
      if (filters.level) params.set('level', filters.level);
      if (filters.search) params.set('search', filters.search);

      const data = await api.get('/courses?' + params);
      setCourses(data?.courses || data || []);
      if (data?.total !== undefined) setPagination({ total: data.total });
    } catch (err) {
      setError(err?.message || 'فشل تحميل الدورات');
      setCourses(MOCK_COURSES);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage, filters.category, filters.level, filters.search]);

  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const data = await api.get('/courses?limit=6');
      setFeaturedCourses(data?.courses || data || MOCK_COURSES.slice(0, 6));
    } catch {
      setFeaturedCourses(MOCK_COURSES.slice(0, 6));
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    featuredCourses,
    filteredCourses: getFilteredCourses(),
    isLoading,
    error,
    filters,
    pagination,
    setFilter,
    resetFilters,
    setPagination,
    fetchCourses,
    fetchFeaturedCourses,
  };
}

const MOCK_COURSES = [
  {
    id: '1',
    title: 'دورة Python للمبتدئين - من الصفر إلى الاحتراف',
    description: 'تعلم لغة البرمجة Python خطوة بخطوة مع تطبيقات عملية في تحليل البيانات والذكاء الاصطناعي',
    category: 'programming',
    level: 'beginner',
    price: 199,
    thumbnail_url: null,
    avg_rating: 4.8,
    enrollment_count: 2340,
    lessons_count: 48,
    duration_minutes: 1440,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'د. أحمد الشمري', avatar_url: null },
  },
  {
    id: '2',
    title: 'الرياضيات المتقدمة - حساب التفاضل والتكامل',
    description: 'شرح شامل لمبادئ التفاضل والتكامل مع أمثلة تطبيقية في الهندسة والفيزياء',
    category: 'math',
    level: 'intermediate',
    price: 249,
    thumbnail_url: null,
    avg_rating: 4.9,
    enrollment_count: 1870,
    lessons_count: 62,
    duration_minutes: 2160,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'أ. سارة الزهراني', avatar_url: null },
  },
];

export { MOCK_COURSES };
