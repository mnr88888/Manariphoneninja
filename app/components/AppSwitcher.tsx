'use client';

import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';

/**
 * iOS-style app switcher. Displays horizontally-scrollable cards of
 * recently opened apps. Tap a card to switch to it; swipe up (or tap X)
 * to kill an app. Tapping the background returns to the previous screen.
 */
export default function AppSwitcher() {
  const { recentApps, switchToApp, killApp, closeSwitcher, activeApp } =
    useOS();

  return (
    <div
      className="switcher-fade absolute inset-0 z-40 flex flex-col bg-black/90 backdrop-blur-xl"
      onClick={closeSwitcher}
    >
      {/* Status spacer */}
      <div className="h-12 shrink-0" />

      {recentApps.length === 0 ? (
        <div
          className="flex flex-1 flex-col items-center justify-center text-white/60"
          onClick={(e) => {
            e.stopPropagation();
            closeSwitcher();
          }}
        >
          <p className="text-sm">لا توجد تطبيقات مفتوحة مؤخراً</p>
          <p className="mt-1 text-xs text-white/40">
            اسحب للأسفل أو انقر للعودة
          </p>
        </div>
      ) : (
        <div
          className="no-scrollbar flex flex-1 items-center gap-4 overflow-x-auto overflow-y-hidden px-6 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          {recentApps.map((appId) => {
            const app = getApp(appId);
            if (!app) return null;
            const isActive = appId === activeApp;

            return (
              <div
                key={appId}
                className="card-in flex shrink-0 flex-col items-center gap-2"
              >
                {/* App name label */}
                <span className="text-xs font-medium text-white/90">
                  {app.name}
                </span>

                {/* Card thumbnail — tapping switches to the app */}
                <button
                  onClick={() => switchToApp(appId)}
                  className={`relative h-[440px] w-[230px] overflow-hidden rounded-[28px] border-2 ${
                    isActive ? 'border-white/40' : 'border-white/10'
                  } bg-black shadow-2xl transition-transform active:scale-95`}
                >
                  {/* Preview content */}
                  <div className="flex h-full flex-col items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={app.imageIcon}
                      alt=""
                      className="h-20 w-20 rounded-[16px] object-cover shadow-lg"
                    />
                    <span className="mt-3 text-sm text-white/70">
                      {app.name}
                    </span>
                  </div>
                </button>

                {/* Kill button (swipe-up icon) */}
                <button
                  onClick={() => killApp(appId)}
                  className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white/80 transition active:scale-90 hover:bg-white/25"
                  aria-label="إغلاق التطبيق"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Home indicator hint at bottom */}
      <div className="flex shrink-0 justify-center pb-2">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
