'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Save, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION } from '@/constants';
import { api } from '@/lib/api';

export default function TeacherCourseEditForm({ course, categories }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: course.title || '',
    description: course.description || '',
    price: course.price || 0,
    level: course.level || 'beginner',
    category_id: course.category_id || '',
    language: course.language || 'Arabic',
    requirements: (course.requirements || []).join(', '),
    what_you_learn: (course.what_you_learn || []).join(', '),
    thumbnail_url: course.thumbnail_url || '',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.put(`/courses/${course.id}`, {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        level: form.level,
        category_id: form.category_id || null,
        language: form.language,
        requirements: form.requirements ? form.requirements.split(',').map((s) => s.trim()).filter(Boolean) : [],
        what_you_learn: form.what_you_learn ? form.what_you_learn.split(',').map((s) => s.trim()).filter(Boolean) : [],
        thumbnail_url: form.thumbnail_url || null,
      });

      if (result?.error) throw new Error(result.error);
      setSuccess('تم حفظ التغييرات بنجاح');
      setTimeout(() => router.push('/teacher/courses'), 1500);
    } catch (err) {
      setError(err.message || 'حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <Link href="/teacher/courses" className="text-gray-500 hover:text-gray-700">
            <ArrowRight size={20} />
          </Link>
          <h1 className="text-lg font-black text-gray-900">تعديل الدورة</h1>
        </header>

        <main className="p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
            {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">{success}</div>}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان الدورة *</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">الوصف</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">السعر (USD)</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">المستوى</label>
                <select name="level" value={form.level} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">التصنيف</label>
                <select name="category_id" value={form.category_id} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">اللغة</label>
                <input name="language" value={form.language} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">المتطلبات (مفصولة بفاصلة)</label>
              <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={2}
                placeholder="مثال: معرفة أساسية بالرياضيات, حاسوب متصل بالإنترنت"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">ماذا ستتعلم (مفصولة بفاصلة)</label>
              <textarea name="what_you_learn" value={form.what_you_learn} onChange={handleChange} rows={2}
                placeholder="مثال: بناء تطبيقات ويب, فهم مبادئ البرمجة"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">رابط الصورة المصغرة</label>
              <input name="thumbnail_url" value={form.thumbnail_url} onChange={handleChange} placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Save size={18} />
              {loading ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
