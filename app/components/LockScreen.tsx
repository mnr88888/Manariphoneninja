
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSystem, wallpaperCss } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';
import { phonePoint } from '../system/phoneGeometry';
import { Lock, Flashlight, Camera, ChevronUp, X } from 'lucide-react';
// The single PhoneFrame feed delivers actual messages for all six applications.
const MAX_VISIBLE = 3;

const DAYS = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت',
];

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function LockScreen() {
  const {
    setLocked,
    wallpaper,
    settings,
    updateSettings,
    notifications,
    dismissNotification,
    openNotification,
  } = useSystem();

  const { openApp } = useOS();

  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [battery, setBattery] = useState(87);
  const flashlightOn = settings.flashlight;

  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  // Only notifications that arrive while this screen is on are shown here
  const wakeAt = useRef(Date.now());
  const unlockingRef = useRef(false);
  const [leaving, setLeaving] = useState<string[]>([]);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      const h12 = h % 12 || 12;

      setTime(
        `${h12}:${m.toString().padStart(2, '0')}`
      );

      setDate(
        `${DAYS[now.getDay()]}، ${now.getDate()} ${MONTHS[now.getMonth()]}`
      );
    };

    update();

    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setBattery(b => (b > 65 ? b - 1 : b));
    }, 60000);

    return () => clearInterval(id);
  }, []);

  // Refresh relative timestamps ("الآن" -> "منذ ٢ د")
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);

  const dismissWithAnimation = useCallback(
    (id: string) => {
      setLeaving((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setTimeout(() => {
        dismissNotification(id);
        setLeaving((prev) => prev.filter((x) => x !== id));
      }, 280);
    },
    [dismissNotification]
  );

  const unlock = useCallback(() => {
    if (unlocking) return;

    unlockingRef.current = true;
    setUnlocking(true);

    setTimeout(() => {
      setLocked(false);
      setUnlocking(false);
      setDragY(0);
    }, 320);
  }, [setLocked, unlocking]);

  const handleStart = useCallback((y: number) => {
    if (unlocking) return;
    startY.current = phonePoint(0, y).y;
  }, [unlocking]);

  const handleMove = useCallback((y: number) => {
    if (startY.current === null) return;

    const delta = startY.current - phonePoint(0, y).y;

    if (delta > 0) {
      setDragY(Math.min(delta, 320));
    }
  }, []);

  const handleEnd = useCallback(() => {
    if (startY.current === null) return;

    startY.current = null;

    if (dragY > 90) {
      unlock();
    } else {
      setDragY(0);
    }
  }, [dragY, unlock]);

  const arrived = settings.notifLockScreen
    ? notifications.filter(
        n => n.timestamp >= wakeAt.current && settings.appNotifs[n.appId] !== false
      )
    : [];
  const lockNotifs = arrived.slice(0, MAX_VISIBLE);
  const hiddenCount = arrived.length - lockNotifs.length;

  const wpStyle = {
    backgroundImage: wallpaperCss(wallpaper.lock),
    backgroundSize: `${wallpaper.scale}%`,
    backgroundPosition: `${wallpaper.positionX}% ${wallpaper.positionY}%`,
    filter: wallpaper.blur > 0
      ? `blur(${wallpaper.blur}px)`
      : undefined,
  };

  return (
    <div
      data-lock-screen="true"
      className="absolute inset-0 z-[80] flex flex-col items-center overflow-hidden select-none"
      style={{
        backgroundColor: '#f5f5f7',
        transform: unlocking
          ? 'translateY(-100%)'
          : `translateY(-${Math.min(dragY, 320)}px) scale(${1 - Math.min(dragY, 320) / 2500})`,
        transition:
          startY.current === null
            ? 'transform 0.35s cubic-bezier(0.32,0.72,0,1), opacity 0.3s'
            : 'none',
        opacity: unlocking ? 0 : 1,
        touchAction: 'none',
      }}
      onTouchStart={e => handleStart(e.touches[0].clientY)}
      onTouchMove={e => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={e => handleStart(e.clientY)}
      onMouseMove={e => {
        if (startY.current !== null) handleMove(e.clientY);
      }}
      onMouseUp={handleEnd}
      onMouseLeave={() => {
        if (startY.current !== null) handleEnd();
      }}
    >
      {/* Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={wpStyle}
      />

      {/* Light appearance overlay */}
      <div className="absolute inset-0 bg-white/10" />

      {/* Lock icon */}
      <div className="lock-top z-10 mt-14 shrink-0 flex items-center justify-center">
        <div className="liquid-glass flex h-9 w-9 items-center justify-center rounded-full">
          <Lock className="h-4 w-4 text-black/75" />
        </div>
      </div>

      {/* Date and clock */}
      <div className="lock-date-clock z-10 mt-5 shrink-0 flex flex-col items-center">
        <p
          className="text-[15px] font-semibold text-black/75"
          style={{ textShadow: '0 1px 8px rgba(255,255,255,0.4)' }}
        >
          {date}
        </p>

        <h1
          dir="ltr"
          data-lock-clock
          className="lock-clock mt-1 font-light leading-none tracking-tight text-black/80 tabular-nums"
          style={{
            textShadow: '0 2px 18px rgba(255,255,255,0.35)',
          }}
        >
          {time}
        </h1>
      </div>

      {/* Notifications — anchored to the bottom, newest on top, rolling up like iOS */}
      <div className="z-10 mt-4 flex min-h-0 w-full flex-1 flex-col justify-end gap-2 overflow-hidden px-5 pb-3">
        {lockNotifs.map(n => {
          const app = getApp(n.appId);
          const isLeaving = leaving.includes(n.id);

          return (
            <div
              key={n.id + '-' + n.timestamp}
              className={isLeaving ? 'lock-notif-out' : 'lock-notif-in'}
            >
              <div className="liquid-glass flex items-start gap-3 rounded-[24px] p-3.5">
                <button
                  data-notification-app={n.appId}
                  data-notification-id={n.id}
                  onClick={() => {
                    openNotification(n);
                    if (app) openApp(app.id);
                    unlock();
                  }}
                  className="flex min-w-0 flex-1 items-start gap-3 text-right"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-black/5">
                    {app && (
                      <img
                        src={app.imageIcon}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-bold text-black/90">
                        {n.title}
                      </span>

                      <span className="shrink-0 text-[10px] text-black/40">
                        {relTime(now - n.timestamp)}
                      </span>
                    </div>

                    {settings.notifPreviews && (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-black/65">
                        {n.body}
                      </p>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => dismissWithAnimation(n.id)}
                  className="pt-0.5 text-black/35 active:text-black/70"
                  aria-label="حذف الإشعار"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {hiddenCount > 0 && (
          <div className="flex justify-center">
            <span className="liquid-glass rounded-full px-4 py-1.5 text-[11px] font-semibold text-black/70">
              +{toAr(hiddenCount)} {hiddenCount === 1 ? 'إشعار إضافي' : 'إشعارات إضافية'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom shortcuts */}
      <div className="lock-shortcuts z-10 w-full shrink-0 px-8 pb-6">
        <div className="lock-shortcuts-row mb-8 flex items-center justify-between">

          {/* Flashlight */}
          <button
            onClick={() => updateSettings({ flashlight: !flashlightOn })}
            data-active={flashlightOn}
            className={`liquid-glass flex h-12 w-12 items-center justify-center rounded-full transition active:scale-90 ${
              flashlightOn
                ? 'text-black'
                : 'text-black/80'
            }`}
            aria-label="المصباح"
          >
            <Flashlight className="h-5 w-5" />
          </button>

          {/* Swipe hint */}
          <div className="flex flex-col items-center gap-1.5 text-black/65">
            <ChevronUp className="h-5 w-5 animate-bounce" />
            <span className="text-[11px] font-medium">
              اسحب للأعلى للفتح
            </span>
          </div>

          {/* Camera */}
          <button
            onClick={() => { openApp('camera'); unlock(); }}
            className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full text-black transition active:scale-90"
            aria-label="الكاميرا"
          >
            <Camera className="h-5 w-5" />
          </button>
        </div>

        {/* Home indicator */}
        <div className="flex justify-center">
          <div className="h-[5px] w-32 rounded-full bg-black/75" />
        </div>
      </div>
    </div>
  );
}

function toAr(n: number): string {
  return String(n).replace(
    /[0-9]/g,
    d => '٠١٢٣٤٥٦٧٨٩'[+d]
  );
}

/** iOS-style short relative time for lock screen cards */
function relTime(diffMs: number): string {
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${toAr(mins)} د`;
  return `منذ ${toAr(Math.floor(mins / 60))} س`;
}
