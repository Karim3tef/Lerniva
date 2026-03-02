import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import LoginForm from '@/components/forms/LoginForm';

export const metadata = {
  title: 'تسجيل الدخول - لرنيفا',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-colors">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">
              لرن<span className="text-indigo-600">يفا</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 mb-2">مرحباً بعودتك!</h1>
          <p className="text-gray-500 text-sm">سجّل دخولك للمتابعة في رحلة التعلم</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2024 لرنيفا - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
