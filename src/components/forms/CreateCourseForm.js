'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, FileText, Tag, BarChart2, DollarSign, Globe, Image, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { createCourseSchema } from '@/lib/validations';
import { CATEGORIES, COURSE_LEVELS, COURSE_LANGUAGES } from '@/constants';
import { supabase } from '@/lib/supabase';
import useAuthStore from '@/store/authStore';

export default function CreateCourseForm({ onSuccess }) {
  const { user } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { level: 'beginner', language: 'ar', price: '0' },
  });

  const price = watch('price');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          price: Number(data.price),
          language: data.language,
          thumbnail_url: data.thumbnailUrl || null,
          teacher_id: user?.id,
          status: 'draft',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      onSuccess?.(course);
    } catch (err) {
      setServerError('حدث خطأ أثناء إنشاء الدورة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      <Input
        label="عنوان الدورة"
        type="text"
        placeholder="مثال: دورة Python للمبتدئين - من الصفر إلى الاحتراف"
        leftIcon={<BookOpen size={18} />}
        error={errors.title?.message}
        hint="اجعل العنوان واضحاً ومميزاً (10-100 حرف)"
        required
        {...register('title')}
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          وصف الدورة <span className="text-red-500">*</span>
        </label>
        <textarea
          placeholder="اشرح ما سيتعلمه الطلاب في هذه الدورة، ومتطلباتها، والفئة المستهدفة..."
          rows={5}
          className={`
            w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none
            transition-all duration-200
            ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
          `}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            التصنيف <span className="text-red-500">*</span>
          </label>
          <select
            className={`
              w-full rounded-xl border px-4 py-3 text-sm text-gray-900 bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              ${errors.category ? 'border-red-400' : 'border-gray-200'}
            `}
            {...register('category')}
          >
            <option value="">اختر التصنيف</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            المستوى <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('level')}
          >
            {COURSE_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            السعر (ريال سعودي) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0 للمجاني"
              className={`
                w-full rounded-xl border pr-10 pl-4 py-3 text-sm text-gray-900
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              {...register('price')}
            />
          </div>
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
          )}
          {price === '0' && (
            <p className="mt-1 text-xs text-emerald-600 font-semibold">✓ هذه الدورة ستكون مجانية</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            لغة الدورة
          </label>
          <select
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...register('language')}
          >
            {COURSE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        label="رابط الصورة المصغرة (اختياري)"
        type="url"
        placeholder="https://example.com/image.jpg"
        leftIcon={<Image size={18} />}
        hint="يُفضل أن تكون بنسبة 16:9"
        {...register('thumbnailUrl')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" fullWidth size="lg" loading={isSubmitting} rightIcon={<ArrowLeft size={18} />}>
          إنشاء الدورة
        </Button>
      </div>
    </form>
  );
}
