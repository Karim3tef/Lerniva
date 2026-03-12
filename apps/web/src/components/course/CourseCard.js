'use client';

import Link from 'next/link';
import { Star, Clock, Users, BookOpen, Play } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDuration, formatNumber, getLevelLabel, getLevelColor, truncateText } from '@/lib/helpers';
import { CATEGORIES } from '@/constants';

export default function CourseCard({ course, compact = false }) {
  const category = CATEGORIES.find((c) => c.id === course.category);
  const levelColor = getLevelColor(course.level);
  const avgRating = Number(course.avg_rating || 0);

  return (
    <Link href={`/courses/${course.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-44 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex-shrink-0">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-30 select-none">
                {category?.icon || '📚'}
              </div>
            </div>
          )}

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            <span className={`
              px-3 py-1 rounded-full text-xs font-bold shadow-sm
              ${course.price === 0
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-900'
              }
            `}>
              {course.price === 0 ? 'مجاني' : formatPrice(course.price)}
            </span>
          </div>

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <Play size={20} className="text-indigo-600 mr-0.5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          {/* Category & Level */}
          <div className="flex items-center gap-2 mb-3">
            {category && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${category.color}`}>
                {category.label}
              </span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelColor}`}>
              {getLevelLabel(course.level)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-gray-900 text-sm leading-relaxed mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>

          {!compact && (
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {truncateText(course.description || '', 100)}
            </p>
          )}

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-4 mt-auto">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-indigo-600">
                {(course.profiles?.full_name || course.users?.full_name || 'م').charAt(0)}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {course.profiles?.full_name || course.users?.full_name || 'معلم غير محدد'}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold text-gray-700">
                {avgRating > 0 ? avgRating.toFixed(1) : '4.5'}
              </span>
              <span className="text-xs text-gray-400">
                ({formatNumber(course.enrollment_count || 0)})
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex items-center gap-1">
                <BookOpen size={12} />
                <span className="text-xs">{course.lessons_count || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span className="text-xs">
                  {Math.round((course.duration_minutes || 0) / 60)}س
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
