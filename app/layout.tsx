import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'محاكي آيفون',
  description: 'محاكي آيفون تفاعلي في المتصفح',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
