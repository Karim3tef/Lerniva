import CourseCard from './CourseCard';
import { BookOpen } from 'lucide-react';

export default function CourseGrid({ courses, loading = false, emptyMessage = 'لا توجد دورات متاحة' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen size={36} className="text-gray-300" />
        </div>
        <p className="text-lg font-semibold">{emptyMessage}</p>
        <p className="text-sm mt-1">جرّب تغيير فلاتر البحث</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
