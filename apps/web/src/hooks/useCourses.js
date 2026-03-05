'use client';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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
      const { data, error: fetchError, count } = await supabase
        .from('courses')
        .select('*, users(full_name, avatar_url)', { count: 'exact' })
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(
          (pagination.page - 1) * pagination.perPage,
          pagination.page * pagination.perPage - 1
        );

      if (fetchError) throw fetchError;
      setCourses(data || []);
      setPagination({ total: count || 0 });
    } catch (err) {
      setError(err.message);
      setCourses(MOCK_COURSES);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.perPage]);

  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('*, users(full_name, avatar_url)')
        .eq('is_published', true)
        .eq('is_approved', true)
        .limit(6);
      setFeaturedCourses(data || MOCK_COURSES.slice(0, 6));
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
  {
    id: '3',
    title: 'الذكاء الاصطناعي وتعلم الآلة - دورة شاملة',
    description: 'من الأساسيات إلى النماذج المتقدمة، تعلم AI/ML بأسلوب عملي ومبسط',
    category: 'ai',
    level: 'intermediate',
    price: 349,
    thumbnail_url: null,
    avg_rating: 4.7,
    enrollment_count: 3100,
    lessons_count: 75,
    duration_minutes: 2880,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'م. خالد العمري', avatar_url: null },
  },
  {
    id: '4',
    title: 'الفيزياء الكمية للمهندسين',
    description: 'مقدمة شاملة في مبادئ الفيزياء الكمية مع تطبيقاتها في الإلكترونيات الحديثة',
    category: 'physics',
    level: 'advanced',
    price: 299,
    thumbnail_url: null,
    avg_rating: 4.6,
    enrollment_count: 980,
    lessons_count: 55,
    duration_minutes: 1980,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'د. فاطمة الحربي', avatar_url: null },
  },
  {
    id: '5',
    title: 'علم البيانات وتحليلها باستخدام R',
    description: 'تعلم تحليل البيانات والإحصاء التطبيقي باستخدام لغة R مع مشاريع حقيقية',
    category: 'data-science',
    level: 'intermediate',
    price: 0,
    thumbnail_url: null,
    avg_rating: 4.5,
    enrollment_count: 4200,
    lessons_count: 40,
    duration_minutes: 1200,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'أ. محمد القحطاني', avatar_url: null },
  },
  {
    id: '6',
    title: 'هندسة الميكاترونيكس والروبوتات',
    description: 'تصميم وبرمجة أنظمة الروبوتات والميكاترونيكس من المفاهيم الأساسية إلى المشاريع المتكاملة',
    category: 'engineering',
    level: 'advanced',
    price: 399,
    thumbnail_url: null,
    avg_rating: 4.8,
    enrollment_count: 1250,
    lessons_count: 85,
    duration_minutes: 3600,
    created_at: new Date().toISOString(),
    status: 'published',
    profiles: { full_name: 'م. عمر السلمي', avatar_url: null },
  },
];

export { MOCK_COURSES };
