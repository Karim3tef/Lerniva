import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata = {
  title: 'لرنيفا - منصة تعلم العلوم والتقنية والهندسة والرياضيات باللغة العربية',
  description: 'منصة تعليمية عربية متخصصة في مجالات STEM - العلوم والتقنية والهندسة والرياضيات. تعلم من أفضل المعلمين العرب بمحتوى عالي الجودة.',
  keywords: 'تعلم, عربي, STEM, علوم, تقنية, هندسة, رياضيات, دورات اونلاين',
  authors: [{ name: 'لرنيفا' }],
  openGraph: {
    title: 'لرنيفا - منصة تعلم STEM بالعربية',
    description: 'منصة تعليمية عربية متخصصة في مجالات STEM',
    locale: 'ar_SA',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "'Cairo', sans-serif" }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
