'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSystem, wallpaperCss } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';
import { Lock, Flashlight, Camera, ChevronUp, X } from 'lucide-react';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/**
 * iOS Lock Screen — live Arabic clock, real notifications (respecting
 * per-app permissions + lock-screen visibility), flashlight/camera
 * shortcuts, battery pill, and swipe-up-to-unlock with smooth animation.
 */
export default function LockScreen() {
  const { setLocked, wallpaper, settings, notifications, dismissNotification, badges } = useSystem();
  const { openApp } = useOS();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [battery, setBattery] = useState(87);
  const [flashlightOn, setFlashlightOn] = useState(false);

  // Drag state for swipe-to-unlock
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Live clock + Arabic date + battery drain simulation
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'م' : 'ص';
      const h12 = h % 12 || 12;
      setTime(`${h12}:${m.toString().padStart(2, '0')}`);
      setDate(`${DAYS[now.getDay()]}، ${now.getDate()} ${MONTHS[now.getMonth()]}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setBattery((b) => (b > 65 ? b - 1 : b)), 60000);
    return () => clearInterval(id);
  }, []);

  const unlock = useCallback(() => {
    setUnlocking(true);
    setTimeout(() => {
      setLocked(false);
      setUnlocking(false);
      setDragY(0);
    }, 320);
  }, [setLocked]);

  const handleStart = useCallback(
    (y: number) => {
      if (unlocking) return;
      startY.current = y;
    },
    [unlocking]
  );

  const handleMove = useCallback(
    (y: number) => {
      if (startY.current == null) return;
      const delta = startY.current - y;
      if (delta > 0) setDragY(delta);
    },
    []
  );

  const handleEnd = useCallback(() => {
    if (startY.current == null) return;
    startY.current = null;
    if (dragY > 90) {
      unlock();
    } else {
      setDragY(0);
    }
  }, [dragY, unlock]);

  const maxDrag = 320;

  // Notifications shown on lock screen: respects lock visibility + per-app permissions
  const lockNotifs = settings.notifLockScreen
    ? notifications
        .filter((n) => settings.appNotifs[n.appId] !== false)
        .slice(0, 3)
    : [];

  const wpStyle = {
    backgroundImage: wallpaperCss(wallpaper.lock),
    backgroundSize: `${wallpaper.scale}%`,
    backgroundPosition: `${wallpaper.positionX}% ${wallpaper.positionY}%`,
    filter: wallpaper.blur > 0 ? `blur(${wallpaper.blur}px)` : undefined,
  };

  const batteryBadge = Object.values(badges).reduce((s, v) => s + v, 0);

  return (
    <div
      className="absolute inset-0 z-[80] flex flex-col items-center overflow-hidden bg-black select-none"
      style={{
        transform: unlocking
          ? 'translateY(-100%)'
          : `translateY(-${Math.min(dragY, maxDrag)}px) scale(${1 - Math.min(dragY, maxDrag) / 2500})`,
        transition:
          startY.current == null
            ? 'transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.3s'
            : 'none',
        opacity: unlocking ? 0 : 1,
        filter: `brightness(${settings.brightness}%)`,
      }}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => startY.current != null && handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={startY.current != null ? handleEnd : undefined}
    >
      {/* Wallpaper layer */}
      <div className="absolute inset-0 bg-cover bg-center" style={wpStyle} />
      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-black/25" />
      {/* Texture overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 85%, rgba(0,0,0,0.25) 0%, transparent 50%)',
        }}
      />

      {/* Lock icon */}
      <div className="z-10 mt-14 flex items-center justify-center">
        <Lock className="h-5 w-5 text-white/80" fill="currentColor" />
      </div>

      {/* Date & time */}
      <div className="z-10 mt-6 flex flex-col items-center">
        <p className="text-[15px] font-medium text-white/90 drop-shadow">{date}</p>
        <h1
          className="mt-1 text-[92px] font-light leading-none tracking-tight text-white tabular-nums"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}
        >
          {time}
        </h1>
        {batteryBadge > 0 && (
          <span className="mt-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {toAr(batteryBadge)} إشعار بانتظارك
          </span>
        )}
      </div>

      {/* Real notification previews */}
      <div className="z-10 mt-6 w-full flex-1 space-y-2 overflow-hidden px-5">
        {lockNotifs.map((n) => {
          const app = getApp(n.appId);
          return (
            <div
              key={n.id}
              className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/15 p-3.5 backdrop-blur-xl"
            >
              <button
                onClick={() => {
                  if (app) openApp(app.id);
                  unlock();
                }}
                className="flex min-w-0 flex-1 items-start gap-3 text-right"
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-black/20"
                >
                  {app && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={app.imageIcon} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-[13px] font-semibold text-white">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-white/50">الآن</span>
                  </div>
                  {settings.notifPreviews && (
                    <p className="mt-0.5 line-clamp-2 text-[12px] text-white/85">{n.body}</p>
                  )}
                </div>
              </button>
              <button
                onClick={() => dismissNotification(n.id)}
                className="pt-0.5 text-white/40 active:text-white"
                aria-label="حذف"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom shortcuts + swipe hint */}
      <div className="z-10 w-full px-8 pb-10">
        <div className="mb-10 flex items-center justify-between">
          {/* Flashlight */}
          <button
            onClick={() => setFlashlightOn((f) => !f)}
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-xl transition active:scale-90 ${
              flashlightOn
                ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.6)]'
                : 'bg-black/30 text-white'
            }`}
            aria-label="المصباح"
          >
            <Flashlight className="h-5 w-5" />
          </button>

          {/* Swipe hint */}
          <div className="flex flex-col items-center gap-1.5 text-white/70">
            <ChevronUp className="h-5 w-5 animate-bounce" />
            <span className="text-[11px]">اسحب للأعلى للفتح</span>
          </div>

          {/* Camera */}
          <button
            onClick={unlock}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-xl transition active:scale-90"
            aria-label="الكاميرا"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>

        {/* Home indicator on lock screen */}
        <div className="flex justify-center">
          <div className="h-[5px] w-32 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

function toAr(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}
