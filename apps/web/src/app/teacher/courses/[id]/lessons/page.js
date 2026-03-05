'use client';

import { useState, useEffect, use } from 'react';
import { Menu, PlusCircle, Trash2, Video, FileText, ArrowRight, GripVertical, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION } from '@/constants';
import { createClient } from '@/lib/supabase';
import MuxUploaderClient from '@/components/video/MuxUploaderClient';

export default function TeacherLessonsPage({ params }) {
  const { id: courseId } = use(params);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');
  const [addForm, setAddForm] = useState({
    title: '',
    lesson_type: 'video',
    duration: 0,
    is_preview: false,
    content: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    const [{ data: courseData }, { data: lessonsData }] = await Promise.all([
      supabase.from('courses').select('id, title, teacher_id').eq('id', courseId).single(),
      supabase.from('lessons').select('*').eq('course_id', courseId).order('order_number', { ascending: true }),
    ]);
    setCourse(courseData);
    setLessons(lessonsData || []);
    setLoading(false);
  };

  const handleAddFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const getUploadUrl = async (lessonId) => {
    const res = await fetch('/api/mux/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson_id: lessonId, course_id: courseId }),
    });
    const data = await res.json();
    if (data.upload_url) setUploadUrl(data.upload_url);
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const nextOrder = lessons.length + 1;
      const { data: newLesson, error: insertError } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: addForm.title,
          lesson_type: addForm.lesson_type,
          duration: Number(addForm.duration),
          is_preview: addForm.is_preview,
          content: addForm.lesson_type === 'text' ? addForm.content : null,
          order_number: nextOrder,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (addForm.lesson_type === 'video') {
        await getUploadUrl(newLesson.id);
      }

      await supabase
        .from('courses')
        .update({ total_lessons: lessons.length + 1 })
        .eq('id', courseId);

      setLessons((prev) => [...prev, newLesson]);
      setAddForm({ title: '', lesson_type: 'video', duration: 0, is_preview: false, content: '' });
      if (addForm.lesson_type !== 'video') setShowAddForm(false);
    } catch (err) {
      setError(err.message || 'حدث خطأ في إضافة الدرس');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    const { error: deleteError } = await supabase.from('lessons').delete().eq('id', lessonId);
    if (!deleteError) {
      const updated = lessons.filter((l) => l.id !== lessonId);
      setLessons(updated);
      await supabase.from('courses').update({ total_lessons: updated.length }).eq('id', courseId);
    }
  };

  const togglePreview = async (lesson) => {
    await supabase.from('lessons').update({ is_preview: !lesson.is_preview }).eq('id', lesson.id);
    setLessons((prev) => prev.map((l) => l.id === lesson.id ? { ...l, is_preview: !l.is_preview } : l));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">جارٍ التحميل…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <Link href="/teacher/courses" className="text-gray-500 hover:text-gray-700">
              <ArrowRight size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-black text-gray-900">إدارة الدروس</h1>
              <p className="text-xs text-gray-500">{course?.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <PlusCircle size={16} />
            إضافة درس
          </button>
        </header>

        <main className="p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

          {/* Add Lesson Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">درس جديد</h2>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">عنوان الدرس *</label>
                    <input name="title" value={addForm.title} onChange={handleAddFormChange} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">نوع الدرس</label>
                    <select name="lesson_type" value={addForm.lesson_type} onChange={handleAddFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="video">فيديو</option>
                      <option value="text">نص</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">المدة (دقائق)</label>
                    <input name="duration" type="number" min="0" value={addForm.duration} onChange={handleAddFormChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="flex items-end pb-2.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="is_preview" checked={addForm.is_preview} onChange={handleAddFormChange}
                        className="w-4 h-4 text-indigo-600 rounded" />
                      <span className="text-sm font-semibold text-gray-700">درس مجاني (معاينة)</span>
                    </label>
                  </div>
                </div>

                {addForm.lesson_type === 'text' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">محتوى الدرس</label>
                    <textarea name="content" value={addForm.content} onChange={handleAddFormChange} rows={4}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="submit" disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                    {saving ? 'جارٍ الحفظ…' : 'حفظ الدرس'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                    إلغاء
                  </button>
                </div>
              </form>

              {uploadUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700 mb-3">رفع الفيديو</p>
                  <MuxUploaderClient uploadUrl={uploadUrl} onSuccess={() => { setUploadUrl(''); setShowAddForm(false); }} />
                </div>
              )}
            </div>
          )}

          {/* Lessons List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {lessons.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-40" />
                <p className="font-semibold">لا توجد دروس بعد</p>
                <p className="text-sm mt-1">أضف درسك الأول لبدء بناء الدورة</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <GripVertical size={16} className="text-gray-300 cursor-grab flex-shrink-0" />
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      lesson.lesson_type === 'video' ? 'bg-indigo-100' : 'bg-amber-100'
                    }`}>
                      {lesson.lesson_type === 'video'
                        ? <Video size={14} className="text-indigo-600" />
                        : <FileText size={14} className="text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{lesson.title}</p>
                      <p className="text-xs text-gray-400">{lesson.duration || 0} دقيقة · درس {index + 1}</p>
                    </div>
                    {lesson.is_preview && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">معاينة</span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePreview(lesson)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                        title={lesson.is_preview ? 'إلغاء المعاينة' : 'تفعيل المعاينة'}
                      >
                        {lesson.is_preview ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
