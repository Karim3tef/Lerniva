'use client';

import { create } from 'zustand';

const useCourseStore = create((set, get) => ({
  courses: [],
  featuredCourses: [],
  currentCourse: null,
  isLoading: false,
  error: null,
  filters: {
    category: '',
    level: '',
    priceRange: 'all',
    search: '',
    sortBy: 'newest',
  },
  pagination: {
    page: 1,
    perPage: 12,
    total: 0,
  },

  setCourses: (courses) => set({ courses }),
  setFeaturedCourses: (featuredCourses) => set({ featuredCourses }),
  setCurrentCourse: (currentCourse) => set({ currentCourse }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pagination: { ...state.pagination, page: 1 },
    })),

  resetFilters: () =>
    set({
      filters: {
        category: '',
        level: '',
        priceRange: 'all',
        search: '',
        sortBy: 'newest',
      },
    }),

  setPagination: (updates) =>
    set((state) => ({
      pagination: { ...state.pagination, ...updates },
    })),

  getFilteredCourses: () => {
    const { courses, filters } = get();
    let filtered = [...courses];

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    if (filters.category) {
      filtered = filtered.filter((c) => c.category === filters.category);
    }

    if (filters.level) {
      filtered = filtered.filter((c) => c.level === filters.level);
    }

    if (filters.priceRange === 'free') {
      filtered = filtered.filter((c) => c.price === 0);
    } else if (filters.priceRange === 'paid') {
      filtered = filtered.filter((c) => c.price > 0);
    }

    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sortBy === 'popular') {
      filtered.sort((a, b) => (b.enrollment_count || 0) - (a.enrollment_count || 0));
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else if (filters.sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  },
}));

export default useCourseStore;
