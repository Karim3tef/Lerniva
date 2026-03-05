import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة')
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'الاسم الكامل مطلوب')
      .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
    email: z
      .string()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('يرجى إدخال بريد إلكتروني صحيح'),
    password: z
      .string()
      .min(1, 'كلمة المرور مطلوبة')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .regex(/[A-Z]/, 'يجب أن تحتوي كلمة المرور على حرف كبير')
      .regex(/[0-9]/, 'يجب أن تحتوي كلمة المرور على رقم'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
    role: z.enum(['student', 'teacher'], {
      errorMap: () => ({ message: 'يرجى اختيار نوع الحساب' }),
    }),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: 'يجب الموافقة على الشروط والأحكام',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمة المرور غير متطابقة',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
});

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(1, 'عنوان الدورة مطلوب')
    .min(10, 'عنوان الدورة يجب أن يكون 10 أحرف على الأقل')
    .max(100, 'عنوان الدورة يجب أن لا يتجاوز 100 حرف'),
  description: z
    .string()
    .min(1, 'وصف الدورة مطلوب')
    .min(50, 'وصف الدورة يجب أن يكون 50 حرف على الأقل'),
  category: z.string().min(1, 'يرجى اختيار تصنيف الدورة'),
  level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'يرجى اختيار مستوى الدورة' }),
  }),
  price: z
    .string()
    .min(1, 'سعر الدورة مطلوب')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: 'يرجى إدخال سعر صحيح',
    }),
  language: z.string().min(1, 'يرجى اختيار لغة الدورة'),
  thumbnailUrl: z.string().optional(),
});
