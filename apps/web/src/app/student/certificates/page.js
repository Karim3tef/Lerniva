'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Award, Download, Loader2, ExternalLink } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { STUDENT_NAVIGATION } from '@/constants';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/helpers';

const downloadCertificate = async (cert) => {
  const studentName = cert.users?.full_name || 'الطالب';
  const courseTitle = cert.courses?.title || '';
  const issuedOn = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const certId = cert.certificate_id || cert.id?.slice(0, 8).toUpperCase() || '';

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800');
  if (!printWindow) {
    throw new Error('تعذر فتح نافذة الطباعة');
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>شهادة لرنيفا - ${courseTitle}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />
        <style>
          body {
            margin: 0;
            font-family: 'Cairo', Arial, sans-serif;
            background: #f5f7fb;
            direction: rtl;
          }
          .page {
            width: 1123px;
            height: 794px;
            margin: 24px auto;
            background: linear-gradient(135deg, #fff8e1, #ffffff);
            border: 16px solid #f59e0b;
            box-sizing: border-box;
            padding: 60px 80px;
            text-align: center;
            position: relative;
          }
          .brand {
            color: #4f46e5;
            font-size: 26px;
            font-weight: 900;
            margin-bottom: 24px;
          }
          .title {
            font-size: 44px;
            font-weight: 900;
            color: #111827;
            margin-bottom: 16px;
          }
          .subtitle {
            font-size: 18px;
            color: #6b7280;
            margin-bottom: 20px;
          }
          .name {
            font-size: 42px;
            font-weight: 900;
            color: #b45309;
            margin: 16px 0;
          }
          .course {
            font-size: 26px;
            font-weight: 700;
            color: #1f2937;
            margin: 16px 0 32px;
          }
          .meta {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 8px;
          }
          .cert-id {
            font-size: 14px;
            color: #9ca3af;
            font-family: monospace;
          }
          .footer {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 40px;
            font-size: 13px;
            color: #9ca3af;
          }
          @media print {
            body { background: white; }
            .page { margin: 0; border: 12px solid #f59e0b; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="brand">لرنيفا — منصة تعلم STEM بالعربية</div>
          <div class="title">شهادة إتمام الدورة</div>
          <div class="subtitle">يُشهد بأن الطالب/ة</div>
          <div class="name">${studentName}</div>
          <div class="subtitle">قد أتم/ت بنجاح متطلبات دورة</div>
          <div class="course">${courseTitle}</div>
          <div class="meta">تاريخ الإصدار: ${issuedOn}</div>
          ${certId ? `<div class="cert-id">رقم الشهادة: ${certId}</div>` : ''}
          <div class="footer">استخدم خيار "طباعة / حفظ كـ PDF" في متصفحك لتنزيل هذه الشهادة.</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export default function CertificatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      const data = await api.get('/certificates/mine');
      setCertificates(data || []);
      setLoading(false);
    };
    fetchCertificates();
  }, []);

  const handleDownload = async (cert) => {
    setDownloading(cert.id);
    try {
      await downloadCertificate(cert);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar navigation={STUDENT_NAVIGATION} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">شهاداتي</h1>
            <p className="text-xs text-gray-500">{certificates.length} شهادة مكتسبة</p>
          </div>
        </header>

        <main className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-indigo-600" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-24">
              <Award size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-semibold text-lg">لا توجد شهادات بعد</p>
              <p className="text-gray-400 text-sm mt-1">أكمل دورة للحصول على شهادتك الأولى</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Certificate header */}
                  <div className="h-32 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center relative">
                    <Award size={56} className="text-white opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">
                      {cert.courses?.title || '—'}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">
                      {cert.courses?.users?.full_name ? `المعلم: ${cert.courses.users.full_name}` : ''}
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      تاريخ الإصدار:{' '}
                      {cert.issued_at
                        ? formatDate(cert.issued_at)
                        : '—'}
                    </p>
                    {cert.certificate_id && (
                      <p className="text-xs text-gray-400 font-mono mb-3">
                        رقم الشهادة: <span className="text-indigo-600 font-semibold">{cert.certificate_id}</span>
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(cert)}
                        disabled={downloading === cert.id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors"
                      >
                        {downloading === cert.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Download size={16} />
                        )}
                        تنزيل PDF
                      </button>
                      {cert.certificate_id && (
                        <Link href={`/certificates/verify/${cert.certificate_id}`} target="_blank">
                          <button className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors" aria-label="التحقق من الشهادة">
                            <ExternalLink size={16} />
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
