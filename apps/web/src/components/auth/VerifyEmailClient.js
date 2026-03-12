'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('جاري تأكيد البريد الإلكتروني...');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const presetEmail = searchParams.get('email');
    if (presetEmail) setEmail(presetEmail);
    if (!token) {
      setStatus('error');
      setMessage('رابط التأكيد غير مكتمل');
      return;
    }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((data) => {
        setStatus('success');
        setMessage(data?.message || 'تم تأكيد البريد الإلكتروني بنجاح');
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'فشل تأكيد البريد الإلكتروني');
      });
  }, [searchParams]);

  const handleResend = async () => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setResendMessage('يرجى إدخال بريدك الإلكتروني');
      return;
    }

    setResendLoading(true);
    setResendMessage('');
    try {
      const data = await api.post('/auth/verify-email/request', { email: normalizedEmail });
      setResendMessage(data?.message || 'تم إرسال بريد تأكيد جديد');
    } catch (error) {
      setResendMessage(error?.message || 'تعذر إعادة إرسال بريد التأكيد');
    } finally {
      setResendLoading(false);
    }
  };

  const isSuccess = status === 'success';
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <div className={`w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center ${isSuccess ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {isSuccess ? <CheckCircle2 className="text-emerald-600" /> : <XCircle className="text-red-600" />}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">تأكيد البريد الإلكتروني</h1>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        {!isSuccess && (
          <div className="text-right mb-5 space-y-3">
            <Input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="button"
              variant="secondary"
              fullWidth
              loading={resendLoading}
              onClick={handleResend}
            >
              إعادة إرسال بريد التأكيد
            </Button>
            {resendMessage && (
              <p className="text-xs text-gray-600 text-center">{resendMessage}</p>
            )}
          </div>
        )}
        <Link href="/login">
          <Button fullWidth>{isSuccess ? 'الانتقال لتسجيل الدخول' : 'العودة لتسجيل الدخول'}</Button>
        </Link>
      </div>
    </main>
  );
}
