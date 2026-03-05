'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, COURSE_LEVELS } from '@/constants';
import useCourseStore from '@/store/courseStore';

export default function CourseFilters({ showCategoryFilter = true }) {
  const { filters, setFilter, resetFilters } = useCourseStore();
  const hasActiveFilters = filters.category || filters.level || filters.priceRange !== 'all' || filters.search;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-indigo-600" />
          <h3 className="font-bold text-gray-900">تصفية الدورات</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold"
          >
            <X size={14} />
            مسح الكل
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ابحث عن دورة..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {filters.search && (
          <button
            onClick={() => setFilter('search', '')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category */}
      {showCategoryFilter && (
        <div className="mb-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">التصنيف</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('category', '')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !filters.category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter('category', filters.category === cat.id ? '' : cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filters.category === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Level */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">المستوى</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('level', '')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              !filters.level
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            الكل
          </button>
          {COURSE_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setFilter('level', filters.level === level.value ? '' : level.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filters.level === level.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">السعر</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'free', label: 'مجاني' },
            { value: 'paid', label: 'مدفوع' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter('priceRange', opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filters.priceRange === opt.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">ترتيب حسب</h4>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilter('sortBy', e.target.value)}
          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700"
        >
          <option value="newest">الأحدث</option>
          <option value="popular">الأكثر شعبية</option>
          <option value="rating">الأعلى تقييماً</option>
          <option value="price-low">السعر: الأقل</option>
          <option value="price-high">السعر: الأعلى</option>
        </select>
      </div>
    </div>
  );
}
