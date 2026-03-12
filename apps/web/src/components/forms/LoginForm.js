'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { loginSchema } from '@/lib/validations';
import useAuthStore from '@/store/authStore';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      const role = user?.role || 'student';
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'teacher') router.push('/teacher/dashboard');
      else router.push('/student/dashboard');
    } catch (error) {
      setServerError(error?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {serverError}
        </div>
      )}

      <Input
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@email.com"
        autoComplete="email"
        leftIcon={<Mail size={18} />}
        error={errors.email?.message}
        required
        {...register('email')}
      />

      <Input
        label="كلمة المرور"
        type="password"
        placeholder="أدخل كلمة المرور"
        autoComplete="current-password"
        leftIcon={<Lock size={18} />}
        error={errors.password?.message}
        required
        {...register('password')}
      />

      <div className="flex justify-start">
        <Link
          href="/forgot-password"
          className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          نسيت كلمة المرور؟
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting}
        rightIcon={<ArrowLeft size={18} />}
      >
        تسجيل الدخول
      </Button>

      <p className="text-center text-sm text-gray-500">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700">
          سجّل الآن مجاناً
        </Link>
      </p>
    </form>
  );
}
