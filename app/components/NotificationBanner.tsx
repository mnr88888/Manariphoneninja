'use client';

import { useEffect, useRef, useState } from 'react';
import { useSystem } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';

/** How long the banner stays on screen before sliding back up */
const BANNER_MS = 4800;

/**
 * iOS heads-up notification banner. Drops out of the Dynamic Island when a
 * notification arrives while the phone is unlocked; tap to open the app (and
 * the exact conversation), swipe up or wait to dismiss.
 */
export default function NotificationBanner() {
  const { banner, dismissBanner, openNotification, locked, settings } = useSystem();
  const { openApp } = useOS();
  const [leaving, setLeaving] = useState(false);
  const startY = useRef<number | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const outTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (outTimer.current) clearTimeout(outTimer.current);
    hideTimer.current = null;
    outTimer.current = null;
  };

  const hide = () => {
    clearTimers();
    setLeaving(true);
    outTimer.current = setTimeout(() => {
      dismissBanner();
      setLeaving(false);
    }, 300);
  };

  // (Re)start the auto-hide countdown for every new banner
  useEffect(() => {
    clearTimers();
    setLeaving(false);
    if (!banner) return;
    hideTimer.current = setTimeout(hide, BANNER_MS);
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner?.id, banner?.timestamp]);

  // Locking the phone hides any banner immediately
  useEffect(() => {
    if (locked && banner) {
      clearTimers();
      dismissBanner();
      setLeaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked]);

  if (!banner || locked || !settings.notifBanners) return null;

  const app = getApp(banner.appId);

  const open = () => {
    clearTimers();
    openNotification(banner);
    if (app) openApp(app.id);
    dismissBanner();
  };

  return (
    <div
      key={`${banner.id}-${banner.timestamp}`}
      className={`absolute left-2.5 right-2.5 top-[46px] z-[65] ${leaving ? 'banner-out' : 'banner-in'}`}
      onTouchStart={(e) => {
        startY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        if (startY.current != null && startY.current - e.changedTouches[0].clientY > 16) hide();
        startY.current = null;
      }}
    >
      <button
        onClick={open}
        className="flex w-full items-center gap-3 rounded-[26px] border border-white/15 px-3.5 py-3 text-right shadow-[0_10px_34px_rgba(0,0,0,0.35)] active:scale-[0.98]"
        style={{
          background: 'rgba(28,28,30,0.82)',
          backdropFilter: 'blur(28px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white/10">
          {app && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={app.imageIcon} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[14px] font-bold text-white">{banner.title}</span>
            <span className="shrink-0 text-[11px] text-white/55">الآن</span>
          </div>
          {settings.notifPreviews && (
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-white/85">{banner.body}</p>
          )}
        </div>
      </button>
    </div>
  );
}
