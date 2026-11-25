import './globals.css';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

const arabicFont = localFont({
  src: [
    { path: '../public/fonts/IBMPlexSansArabic-Light.woff2', weight: '300', style: 'normal' },
    { path: '../public/fonts/IBMPlexSansArabic-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/IBMPlexSansArabic-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../public/fonts/IBMPlexSansArabic-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../public/fonts/IBMPlexSansArabic-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-arabic',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'محاكي آيفون',
  description: 'محاكي آيفون تفاعلي في المتصفح',
  viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={arabicFont.variable}>
      <body>{children}</body>
    </html>
  );
}
