'use client';

import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';
import { ChevronRight } from 'lucide-react';

/**
 * Generic app placeholder screen shown while individual app features
 * are still under development. Gives a polished, app-specific look.
 * A "go home" button is included as an alternative to the swipe gesture.
 */
export default function AppPlaceholder({ appId }: { appId: string }) {
  const { goToHome } = useOS();
  const app = getApp(appId);

  if (!app) return null;

  return (
    <div
      className={`absolute inset-0 flex flex-col bg-gradient-to-b ${app.gradient}`}
    >
      {/* Status area spacer — keeps content below the status bar */}
      <div className="h-12 shrink-0" />

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center text-white">
        <div className="mb-5 h-24 w-24 overflow-hidden rounded-[24px] shadow-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={app.imageIcon} alt="" className="h-full w-full object-cover" />
        </div>
        <h1 className="mb-2 text-2xl font-bold">{app.name}</h1>
        <p className="max-w-[260px] text-sm text-white/80 leading-relaxed">
          هذا التطبيق قيد التطوير. ستعمل الميزات الكاملة قريباً.
        </p>
        <p className="mt-4 max-w-[240px] text-xs text-white/60">
          اسحب من أسفل الشاشة للأعلى للعودة إلى الشاشة الرئيسية
        </p>
      </div>

      {/* Home button — alternative to swipe gesture */}
      <div className="flex shrink-0 justify-center pb-2">
        <button
          onClick={goToHome}
          className="mb-1 flex h-9 w-36 items-center justify-center gap-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white transition active:scale-95"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          الشاشة الرئيسية
        </button>
      </div>
    </div>
  );
}
