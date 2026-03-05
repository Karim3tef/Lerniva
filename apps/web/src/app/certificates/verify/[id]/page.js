import Link from 'next/link';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { formatDate } from '@/lib/helpers';

export default async function CertificateVerifyPage({ params }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: cert } = await supabase
    .from('certificates')
    .select('*, users(full_name), courses(title, users(full_name))')
    .eq('certificate_id', id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-full max-w-lg p-8 text-center">
        {/* Lerniva Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Award size={28} className="text-indigo-600" />
          <span className="text-xl font-black text-indigo-600">لرنيفا</span>
        </div>

        {cert ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">شهادة صحيحة ومعتمدة</h1>
            <p className="text-gray-500 text-sm mb-6">هذه الشهادة صحيحة ومعتمدة من لرنيفا</p>

            <div className="bg-gray-50 rounded-xl p-5 text-right space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-400">اسم الطالب</p>
                <p className="font-bold text-gray-900">{cert.users?.full_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">الدورة</p>
                <p className="font-bold text-gray-900">{cert.courses?.title || '—'}</p>
              </div>
              {cert.courses?.users?.full_name && (
                <div>
                  <p className="text-xs text-gray-400">المعلم</p>
                  <p className="font-bold text-gray-900">{cert.courses.users.full_name}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400">تاريخ الإصدار</p>
                <p className="font-bold text-gray-900">
                  {cert.issued_at ? formatDate(cert.issued_at) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">رقم الشهادة</p>
                <p className="font-mono font-bold text-indigo-600 text-sm">{cert.certificate_id || id}</p>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm font-semibold">
              ✓ تم التحقق من صحة هذه الشهادة
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={36} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">شهادة غير صحيحة</h1>
            <p className="text-gray-500 text-sm mb-6">
              لم يتم العثور على شهادة بهذا الرقم في نظام لرنيفا.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold">
              ✗ رقم الشهادة غير صالح أو غير موجود
            </div>
          </>
        )}

        <Link href="/" className="inline-block mt-6 text-sm text-indigo-600 hover:text-indigo-700 font-semibold">
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
