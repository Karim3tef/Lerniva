'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { GraduationCap, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { forgotPasswordSchema } from '@/lib/validations';
import { forgotPassword } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err || '');
      setServerError(message || 'حدث خطأ. تأكد من البريد الإلكتروني وأعد المحاولة.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              لرن<span className="text-indigo-600">يفا</span>
            </span>
          </Link>
          {!sent ? (
            <>
              <h1 className="text-2xl font-black text-gray-900 mb-2">نسيت كلمة المرور؟</h1>
              <p className="text-gray-500 text-sm">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">تم إرسال الرابط!</h1>
              <p className="text-gray-500 text-sm">
                تحقق من بريدك الإلكتروني{' '}
                <strong className="text-gray-700">{getValues('email')}</strong>
              </p>
            </>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {!sent ? (
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
                leftIcon={<Mail size={18} />}
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Button type="submit" fullWidth size="lg" loading={isSubmitting} rightIcon={<ArrowLeft size={18} />}>
                إرسال رابط التعيين
              </Button>
            </form>
          ) : (
            <Link href="/login">
              <Button fullWidth size="lg">العودة لتسجيل الدخول</Button>
            </Link>
          )}
          <p className="text-center text-sm text-gray-500 mt-5">
            <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-700">
              ← العودة لتسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
