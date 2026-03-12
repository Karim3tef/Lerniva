'use client';

import { useState, useEffect } from 'react';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/helpers';
import useAuthStore from '@/store/authStore';

function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          aria-label={`${star} نجوم`}
        >
          <Star
            size={readOnly ? 14 : 22}
            className={`${(hovered || value) >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [myEnrollment, setMyEnrollment] = useState(null);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [reviewsData, enrollmentData] = await Promise.all([
        api.get(`/reviews/course/${courseId}`),
        api.get(`/enrollments/${courseId}/check`).catch(() => null),
      ]);

      const reviews = reviewsData || [];
      setReviews(reviews);
      setMyEnrollment(enrollmentData?.is_enrolled ? { id: courseId } : null);

      const existing = reviews.find((r) => r.is_mine);
      if (existing) {
        setMyReview(existing);
        setRating(existing.rating);
        setComment(existing.comment || '');
      }

      setLoading(false);
    };
    fetchData();
  }, [courseId]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const data = await api.post('/reviews', { course_id: courseId, rating, comment });
      if (!data || data.error) {
        setError(data?.error || 'حدث خطأ');
        return;
      }
      const newReview = data.review || data;
      if (myReview) {
        setReviews((prev) => prev.map((r) => r.id === myReview.id ? newReview : r));
      } else {
        setReviews((prev) => [newReview, ...prev]);
      }
      setMyReview(newReview);
    } catch {
      setError('حدث خطأ. حاول مجدداً.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!myReview) return;
    await api.delete(`/reviews/${courseId}`);
    setReviews((prev) => prev.filter((r) => r.id !== myReview.id));
    setMyReview(null);
    setRating(5);
    setComment('');
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 size={24} className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-black text-gray-900">{avgRating}</div>
        <div>
          <StarRating value={Math.round(avgRating)} readOnly />
          <p className="text-xs text-gray-500 mt-1">{reviews.length} تقييم</p>
        </div>
      </div>

      {/* Submit form for enrolled students */}
      {myEnrollment && (
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">
            {myReview ? 'تقييمك' : 'أضف تقييمك'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <StarRating value={rating} onChange={setRating} />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب تعليقك هنا (اختياري)..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            {error && <p className="text-red-600 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {myReview ? 'تحديث التقييم' : 'إرسال التقييم'}
              </button>
              {myReview && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  aria-label="حذف التقييم"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">لا توجد تقييمات بعد</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-600">
                  {getInitials(review.users?.full_name || 'م')}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{review.users?.full_name || 'مجهول'}</p>
                  <StarRating value={review.rating} readOnly />
                  <span className="text-xs text-gray-400 mr-auto">
                    {review.created_at ? formatDate(review.created_at) : ''}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
