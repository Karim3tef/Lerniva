'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, GraduationCap, BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { registerSchema } from '@/lib/validations';
import { api } from '@/lib/api';

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student', agreeToTerms: false },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: data.role,
      });
      setSuccess(true);
    } catch (err) {
      if (err?.message?.includes('already registered') || err?.message?.includes('already exists')) {
        setServerError('هذا البريد الإلكتروني مسجل مسبقاً');
      } else {
        setServerError('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">تم إنشاء حسابك بنجاح!</h3>
        <p className="text-gray-500 text-sm mb-6">
          تحقق من بريدك الإلكتروني لتفعيل حسابك
        </p>
        <Link href="/login">
          <Button fullWidth>تسجيل الدخول</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'student', label: 'طالب', icon: BookOpen, desc: 'أريد التعلم' },
          { value: 'teacher', label: 'معلم', icon: GraduationCap, desc: 'أريد التدريس' },
        ].map(({ value, label, icon: Icon, desc }) => (
          <label
            key={value}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${selectedRole === value
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <input type="radio" value={value} {...register('role')} className="sr-only" />
            <Icon size={24} className={selectedRole === value ? 'text-indigo-600' : 'text-gray-400'} />
            <div className="text-center">
              <p className={`text-sm font-bold ${selectedRole === value ? 'text-indigo-700' : 'text-gray-700'}`}>
                {label}
              </p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </label>
        ))}
      </div>
      {errors.role && <p className="text-xs text-red-600">{errors.role.message}</p>}

      <Input
        label="الاسم الكامل"
        type="text"
        placeholder="أدخل اسمك الكامل"
        leftIcon={<User size={18} />}
        error={errors.fullName?.message}
        required
        {...register('fullName')}
      />

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@email.com"
        leftIcon={<Mail size={18} />}
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="كلمة المرور"
        type="password"
        placeholder="8 أحرف على الأقل"
        leftIcon={<Lock size={18} />}
        error={errors.password?.message}
        hint="يجب أن تحتوي على حرف كبير ورقم"
        required
        {...register('password')}
      />

      <Input
        label="تأكيد كلمة المرور"
        type="password"
        placeholder="أعد إدخال كلمة المرور"
        leftIcon={<Lock size={18} />}
        error={errors.confirmPassword?.message}
        required
        {...register('confirmPassword')}
      />

      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="mt-0.5 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">
            أوافق على{' '}
            <Link href="/terms" className="text-indigo-600 font-semibold hover:underline">
              شروط الاستخدام
            </Link>
            {' '}و{' '}
            <Link href="/privacy" className="text-indigo-600 font-semibold hover:underline">
              سياسة الخصوصية
            </Link>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-xs text-red-600 mt-1">{errors.agreeToTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting}
        rightIcon={<ArrowLeft size={18} />}
      >
        إنشاء حساب مجاني
      </Button>

      <p className="text-center text-sm text-gray-500">
        لديك حساب؟{' '}
        <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
          تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
