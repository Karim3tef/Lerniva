'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseGrid from '@/components/course/CourseGrid';
import CourseFilters from '@/components/course/CourseFilters';
import { api } from '@/lib/api';
import useCourseStore from '@/store/courseStore';

export default function CoursesPage() {
  const { setCourses, getFilteredCourses, filters } = useCourseStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await api.get('/courses');
      setCourses(data?.courses || data || []);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  const filteredCourses = getFilteredCourses();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen size={28} className="text-indigo-600" />
              <h1 className="text-3xl font-black text-gray-900">جميع الدورات</h1>
            </div>
            <p className="text-gray-500">
              اكتشف مئات الدورات التعليمية في مجالات STEM باللغة العربية
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-24">
                <CourseFilters />
              </div>
            </aside>

            {/* Courses */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500 font-medium">
                  {loading ? 'جاري التحميل...' : `${filteredCourses.length} دورة متاحة`}
                </p>
              </div>
              <CourseGrid courses={filteredCourses} loading={loading} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
