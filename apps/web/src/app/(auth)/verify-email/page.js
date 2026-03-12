import { Suspense } from 'react';
import VerifyEmailClient from '@/components/auth/VerifyEmailClient';

function VerifyEmailFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-3">تأكيد البريد الإلكتروني</h1>
        <p className="text-sm text-gray-600">جاري تأكيد البريد الإلكتروني...</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
