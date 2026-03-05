'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-black text-gray-900 mb-3">تواصل معنا</h1>
            <p className="text-gray-500">نحن هنا للمساعدة. أرسل رسالتك وسنرد في أقرب وقت.</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-5">معلومات التواصل</h2>
                <div className="space-y-4">
                  {[
                    { icon: Mail, label: 'البريد الإلكتروني', value: 'support@lerniva.com', href: 'mailto:support@lerniva.com' },
                    { icon: Phone, label: 'الهاتف', value: '+966 50 000 0000', href: 'tel:+966500000000' },
                    { icon: MapPin, label: 'الموقع', value: 'الرياض، المملكة العربية السعودية', href: '#' },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <a key={label} href={href} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 transition-colors">
                        <Icon size={18} className="text-indigo-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-semibold text-gray-700">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">ساعات العمل</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  الأحد – الخميس: 9:00 ص – 6:00 م<br />
                  الجمعة والسبت: مغلق<br />
                  <span className="text-indigo-600 font-semibold">الدعم الإلكتروني: 24/7</span>
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                {submitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال رسالتك!</h3>
                    <p className="text-gray-500 text-sm">سنتواصل معك في أقرب وقت ممكن.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الاسم الكامل *</label>
                        <input
                          type="text"
                          required
                          placeholder="أدخل اسمك"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          required
                          placeholder="example@email.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الموضوع *</label>
                      <select
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        <option value="">اختر الموضوع</option>
                        <option value="technical">مشكلة تقنية</option>
                        <option value="billing">استفسار عن الدفع</option>
                        <option value="content">محتوى الدورات</option>
                        <option value="account">مشكلة في الحساب</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">الرسالة *</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="اكتب رسالتك هنا..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      size="lg"
                      loading={loading}
                      leftIcon={<Send size={18} />}
                    >
                      إرسال الرسالة
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
