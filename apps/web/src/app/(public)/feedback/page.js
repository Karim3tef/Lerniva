'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Star, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 className="text-4xl font-black text-gray-900 mb-3">اقتراحاتك تهمنا</h1>
            <p className="text-gray-500">ساعدنا في تحسين منصة لرنيفا بملاحظاتك القيّمة</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">شكرًا لك!</h3>
                <p className="text-gray-500 leading-relaxed">
                  تلقينا ملاحظاتك وسنأخذها بعين الاعتبار لتطوير المنصة وتحسين تجربتك.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-3 block">
                    كيف تقيّم تجربتك مع لرنيفا؟
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={36}
                          className={`transition-colors ${
                            star <= (hovered || rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {['', 'سيء', 'مقبول', 'جيد', 'جيد جدًا', 'ممتاز!'][rating]}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">نوع الاقتراح</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="">اختر نوع الاقتراح</option>
                    <option value="content">محتوى الدورات</option>
                    <option value="ux">تجربة المستخدم</option>
                    <option value="feature">ميزة جديدة</option>
                    <option value="bug">الإبلاغ عن مشكلة</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">عنوان الاقتراح</label>
                  <input
                    type="text"
                    placeholder="اكتب عنوانًا موجزًا..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">تفاصيل اقتراحك *</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="شاركنا اقتراحك أو ملاحظتك بالتفصيل..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {/* Email (optional) */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    البريد الإلكتروني <span className="text-gray-400 font-normal">(اختياري - للرد عليك)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={loading}
                  leftIcon={<Send size={18} />}
                >
                  إرسال الاقتراح
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
