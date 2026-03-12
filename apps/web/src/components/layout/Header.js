'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, GraduationCap, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';
import { NAVIGATION } from '@/constants';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, profile, logout, getRole } = useAuthStore();

  const role = getRole();
  const dashboardPath = role === 'admin' ? '/admin/dashboard' :
    role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'المستخدم';

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-gray-900">
              لرن<span className="text-indigo-600">يفا</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">
                      {displayName.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-700">
                    {displayName}
                  </span>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-20">
                      <Link
                        href={dashboardPath}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        لوحة التحكم
                      </Link>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        الملف الشخصي
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-right"
                      >
                        <LogOut size={16} />
                        تسجيل الخروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">ابدأ مجاناً</Button>
                </Link>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 mt-4">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" size="sm" fullWidth>تسجيل الدخول</Button>
                </Link>
                <Link href="/register" className="flex-1">
                  <Button size="sm" fullWidth>ابدأ مجاناً</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
