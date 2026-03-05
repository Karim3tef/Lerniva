'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, ArrowRight, ArrowLeft, CheckCircle, BookOpen, DollarSign, Image, Globe, BarChart2, FileText, Tag } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { TEACHER_NAVIGATION, COURSE_LEVELS, COURSE_LANGUAGES } from '@/constants';
import { api } from '@/lib/api';

const STEPS = ['معلومات الدورة', 'المحتوى', 'النشر'];

const EMPTY_FORM = {
  title: '',
  description: '',
  category_id: '',
  level: 'beginner',
  price: '0',
  language: 'ar',
  requirements: '',
  what_you_learn: '',
  thumbnail_url: '',
  is_published: false,
};

export default function CreateCoursePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await api.get('/courses/categories');
      if (data && data.length > 0) setCategories(data);
    };
    loadCategories();
  }, []);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const newCourse = await api.post('/courses', {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price) || 0,
        level: formData.level || 'beginner',
        category_id: formData.category_id || null,
        language: formData.language || 'ar',
        requirements: formData.requirements
          ? formData.requirements.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        what_you_learn: formData.what_you_learn
          ? formData.what_you_learn.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        thumbnail_url: formData.thumbnail_url || null,
        is_published: formData.is_published === true,
      });

      if (newCourse?.error) throw new Error(newCourse.error);

      setCreated(true);
      setTimeout(() => router.push('/teacher/courses'), 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الدورة. يرجى المحاولة مرة أخرى.');
      setSubmitting(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent hover:border-gray-300 transition-all';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={TEACHER_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">إنشاء دورة جديدة</h1>
            <p className="text-xs text-gray-500">أضف دورتك وابدأ في التدريس</p>
          </div>
        </header>

        <main className="p-6">
          {created ? (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">تم إنشاء الدورة!</h2>
              <p className="text-gray-500">يتم تحويلك لصفحة إدارة الدورات...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Steps indicator */}
              <div className="flex items-center gap-3 mb-8">
                {STEPS.map((stepLabel, i) => (
                  <div key={stepLabel} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-sm font-semibold ${i === step ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stepLabel}
                    </span>
                    {i < STEPS.length - 1 && <ArrowRight size={16} className="text-gray-300" />}
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                    {error}
                  </div>
                )}

                {/* Step 1: Basic Info */}
                {step === 0 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">معلومات الدورة الأساسية</h2>

                    <div>
                      <label className={labelCls}>عنوان الدورة <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <BookOpen size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          className={`${inputCls} pr-10`}
                          placeholder="مثال: دورة Python للمبتدئين - من الصفر إلى الاحتراف"
                          value={formData.title}
                          onChange={set('title')}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>وصف الدورة <span className="text-red-500">*</span></label>
                      <textarea
                        rows={4}
                        className={`${inputCls} resize-none`}
                        placeholder="اشرح ما سيتعلمه الطلاب في هذه الدورة، ومتطلباتها، والفئة المستهدفة..."
                        value={formData.description}
                        onChange={set('description')}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>التصنيف</label>
                        <select className={inputCls} value={formData.category_id} onChange={set('category_id')}>
                          <option value="">اختر التصنيف</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>المستوى</label>
                        <select className={inputCls} value={formData.level} onChange={set('level')}>
                          {COURSE_LEVELS.map((lvl) => (
                            <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>السعر (ريال سعودي)</label>
                        <div className="relative">
                          <DollarSign size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={`${inputCls} pr-10`}
                            placeholder="0 للمجاني"
                            value={formData.price}
                            onChange={set('price')}
                          />
                        </div>
                        {formData.price === '0' || formData.price === 0 ? (
                          <p className="mt-1 text-xs text-emerald-600 font-semibold">✓ هذه الدورة ستكون مجانية</p>
                        ) : null}
                      </div>
                      <div>
                        <label className={labelCls}>لغة الدورة</label>
                        <select className={inputCls} value={formData.language} onChange={set('language')}>
                          {COURSE_LANGUAGES.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!formData.title || !formData.description}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                    >
                      التالي <ArrowLeft size={16} />
                    </button>
                  </div>
                )}

                {/* Step 2: Content */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">محتوى الدورة</h2>

                    <div>
                      <label className={labelCls}>متطلبات الدورة</label>
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-none`}
                        placeholder="أدخل المتطلبات مفصولة بفاصلة، مثال: معرفة أساسيات الحاسوب، اتصال بالإنترنت"
                        value={formData.requirements}
                        onChange={set('requirements')}
                      />
                      <p className="mt-1 text-xs text-gray-400">افصل المتطلبات بفاصلة (,)</p>
                    </div>

                    <div>
                      <label className={labelCls}>ماذا سيتعلم الطلاب</label>
                      <textarea
                        rows={3}
                        className={`${inputCls} resize-none`}
                        placeholder="أدخل مخرجات التعلم مفصولة بفاصلة، مثال: بناء تطبيقات ويب, فهم أساسيات البرمجة"
                        value={formData.what_you_learn}
                        onChange={set('what_you_learn')}
                      />
                      <p className="mt-1 text-xs text-gray-400">افصل المخرجات بفاصلة (,)</p>
                    </div>

                    <div>
                      <label className={labelCls}>رابط الصورة المصغرة (اختياري)</label>
                      <div className="relative">
                        <Image size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="url"
                          className={`${inputCls} pr-10`}
                          placeholder="https://example.com/image.jpg"
                          value={formData.thumbnail_url}
                          onChange={set('thumbnail_url')}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">يُفضل أن تكون بنسبة 16:9</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <ArrowRight size={16} /> السابق
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        التالي <ArrowLeft size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Publish */}
                {step === 2 && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">إعدادات النشر</h2>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">العنوان</span>
                        <span className="font-semibold text-gray-900 text-left max-w-[60%] truncate">{formData.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">السعر</span>
                        <span className="font-semibold text-gray-900">{Number(formData.price) === 0 ? 'مجاني' : `${formData.price} ر.س`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">المستوى</span>
                        <span className="font-semibold text-gray-900">
                          {COURSE_LEVELS.find((l) => l.value === formData.level)?.label || formData.level}
                        </span>
                      </div>
                    </div>

                    {/* Publish toggle */}
                    <div className="flex items-start gap-4 bg-indigo-50 rounded-xl p-5">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">نشر الدورة للمراجعة</p>
                        <p className="text-xs text-gray-500 mt-1">
                          سيتم إرسال الدورة لمراجعة الإدارة قبل نشرها للطلاب. يمكنك حفظها كمسودة الآن ونشرها لاحقاً.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer mt-0.5">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.is_published}
                          onChange={set('is_published')}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                      </label>
                    </div>

                    {formData.is_published && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                        ✓ سيتم إرسال الدورة للمراجعة بعد الإنشاء
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <ArrowRight size={16} /> السابق
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            جارٍ الإنشاء...
                          </span>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            {formData.is_published ? 'إنشاء وإرسال للمراجعة' : 'حفظ كمسودة'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
