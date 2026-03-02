'use client';

import Link from 'next/link';
import { GraduationCap, Mail, Phone, Twitter, Youtube, Linkedin } from 'lucide-react';
import { FOOTER_LINKS } from '@/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <span className="text-2xl font-black text-white">
                لرن<span className="text-indigo-400">يفا</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-sm">
              منصة تعليمية عربية متخصصة في مجالات العلوم والتقنية والهندسة والرياضيات.
              نؤمن بأن التعليم الجيد يجب أن يكون متاحاً للجميع بلغتهم الأم.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Twitter, href: '#', label: 'تويتر' },
                { icon: Youtube, href: '#', label: 'يوتيوب' },
                { icon: Linkedin, href: '#', label: 'لينكدإن' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-indigo-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.values(FOOTER_LINKS).map((section) => (
            <div key={section.title}>
              <h3 className="font-bold text-white mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <a href="mailto:support@lerniva.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail size={16} />
              support@lerniva.com
            </a>
            <a href="tel:+966500000000" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone size={16} />
              +966 50 000 0000
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {currentYear} لرنيفا. جميع الحقوق محفوظة.</p>
          <p>صُنع بـ ❤️ لكل طالب علم عربي</p>
        </div>
      </div>
    </footer>
  );
}
