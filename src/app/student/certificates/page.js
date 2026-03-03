'use client';

import { useState, useEffect } from 'react';
import { Menu, Award, Download, Loader2 } from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { STUDENT_NAVIGATION } from '@/constants';
import { createClient } from '@/lib/supabase';
import { formatDate } from '@/lib/helpers';

const downloadCertificate = async (cert) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', format: 'a4' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(40);
  doc.text('Certificate of Completion', 148, 60, { align: 'center' });
  doc.setFontSize(20);
  doc.text('Lerniva - \u0644\u0631\u0646\u064a\u0641\u0627', 148, 80, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', 148, 105, { align: 'center' });
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(cert.users?.full_name || 'Student', 148, 120, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the course', 148, 135, { align: 'center' });
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(cert.courses?.title || '', 148, 150, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Issued on: ${new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    148,
    170,
    { align: 'center' }
  );
  doc.save(`Lerniva-Certificate-${cert.courses?.title || 'Course'}.pdf`);
};

export default function CertificatesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from('certificates')
        .select('*, courses(id, title, users(full_name))')
        .eq('student_id', user.id)
        .order('issued_at', { ascending: false });

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

                    <button
                      onClick={() => handleDownload(cert)}
                      disabled={downloading === cert.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                      {downloading === cert.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      تنزيل PDF
                    </button>
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
