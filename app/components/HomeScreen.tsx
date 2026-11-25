'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSystem, wallpaperCss } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { getApp, DOCK_APPS, DOCK_APP_MAP } from '../apps/registry';
import AppIcon from './AppIcon';
import { Plus } from 'lucide-react';

/**
 * iOS home screen with swipeable pages, tap-to-jump page dots,
 * long-press edit (jiggle) mode, and dock fixed across all pages.
 */
export default function HomeScreen() {
  const { openApp } = useOS();
  const {
    homePages,
    badges,
    settings,
    wallpaper,
    removeApp,
    restoreApp,
    removedApps,
  } = useSystem();

  const [page, setPage] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const dragId = useRef<string | null>(null);
  const dragFromPage = useRef(0);
  const dragFromIndex = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Swipe state
  const pagesRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const totalPages = Math.max(homePages.length, 1);

  const clampPage = useCallback(
    (p: number) => Math.min(Math.max(p, 0), totalPages - 1),
    [totalPages]
  );

  // ---- Swipe handling (touch + mouse) ----
  const onTouchStart = useCallback((x: number, y: number) => {
    touchStartX.current = x;
    touchStartY.current = y;
    setDragging(true);
  }, []);

  const onTouchMove = useCallback(
    (x: number, y: number) => {
      if (touchStartX.current == null || touchStartY.current == null) return;
      const dx = x - touchStartX.current;
      const dy = y - touchStartY.current;
      // Only respond to clearly horizontal drags; let vertical go to scroll
      if (Math.abs(dx) > Math.abs(dy) * 1.4) setDragX(dx);
      else setDragX(0);
    },
    []
  );

  const onTouchEnd = useCallback(() => {
    if (touchStartX.current == null) return;
    touchStartX.current = null;
    touchStartY.current = null;
    setDragging(false);
    setDragX((dx) => {
      if (dx < -60) setPage((p) => clampPage(p + 1)); // swipe left → next
      else if (dx > 60) setPage((p) => clampPage(p - 1)); // swipe right → prev
      return 0;
    });
  }, [clampPage]);

  const startLongPress = (appId: string, pageIndex: number, index: number) => {
    longPressTimer.current = setTimeout(() => {
      setEditMode(true);
      dragId.current = appId;
      dragFromPage.current = pageIndex;
      dragFromIndex.current = index;
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleIconPress = (appId: string) => {
    if (editMode) return;
    openApp(appId);
  };

  const dockApps = DOCK_APPS.map((id) => getApp(id)!).filter(Boolean);

  const wpStyle = {
    backgroundImage: wallpaperCss(wallpaper.home),
    backgroundSize: `${wallpaper.scale}%`,
    backgroundPosition: `${wallpaper.positionX}% ${wallpaper.positionY}%`,
    filter: wallpaper.blur > 0 ? `blur(${wallpaper.blur}px)` : undefined,
  };

  // Page track is explicitly LTR regardless of the document's RTL direction:
  // page N+1 is always to the RIGHT of page N, so translateX(-100% * page)
  // reveals the next page and swiping left goes forward. Inside each page the
  // grid is RTL so Arabic app order (first app top-right) is preserved.
  const baseTranslate = -(page * 100); // percent
  const dragPct = dragging ? (dragX / (pagesRef.current?.getBoundingClientRect().width || 390)) * 100 : 0;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-black">
      {/* Wallpaper layer */}
      <div className="absolute inset-0 bg-cover bg-center" style={wpStyle} />
      {/* Texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.2) 0%, transparent 50%)',
        }}
      />

      {/* Edit mode banner */}
      {editMode && (
        <div className="relative z-20 flex items-center justify-between bg-black/60 px-6 py-2">
          <button
            onClick={() => setEditMode(false)}
            className="rounded-full bg-white/20 px-3 py-1 text-xs text-white"
          >
            تم
          </button>
          <span className="text-xs text-white/80">اضغط مطولاً على أيقونة للتحريك</span>
        </div>
      )}

      {/* App pages */}
      <div
        ref={pagesRef}
        className="relative min-h-0 flex-1 touch-pan-y overflow-hidden"
        onTouchStart={(e) => onTouchStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => onTouchMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => onTouchStart(e.clientX, e.clientY)}
        onMouseMove={(e) => dragging && onTouchMove(e.clientX, e.clientY)}
        onMouseUp={onTouchEnd}
        onMouseLeave={dragging ? onTouchEnd : undefined}
      >
        <div
          dir="ltr"
          className="flex h-full flex-row"
          style={{
            transform: `translateX(calc(${baseTranslate}% + ${dragPct}%))`,
            transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          }}
        >
          {homePages.map((pageApps, pi) => (
            <div key={pi} dir="rtl" className="h-full w-full shrink-0 overflow-hidden px-6 pb-2 pt-14">
              <div className="home-app-grid grid grid-cols-4 gap-x-4 gap-y-4">
                {pageApps.map((appId, idx) => {
                  const app = getApp(appId);
                  if (!app) return null;
                  return (
                    <div
                      key={appId}
                      className="relative"
                      onMouseDown={() => startLongPress(appId, pi, idx)}
                      onMouseUp={cancelLongPress}
                      onMouseLeave={cancelLongPress}
                      onTouchStart={() => startLongPress(appId, pi, idx)}
                      onTouchEnd={cancelLongPress}
                    >
                      <div className={editMode ? 'animate-pulse' : ''}>
                        <AppIcon app={app} onPress={handleIconPress} badge={settings.notifBadges ? badges[appId] : undefined} />
                      </div>
                      {editMode && (
                        <button
                          onClick={() => removeApp(appId)}
                          className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white shadow-md"
                        >
                          <span className="text-xs">−</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Page dots — tap to jump */}
      {totalPages > 1 && (
        <div className="relative z-10 mb-2 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === page ? 'bg-white scale-110' : 'bg-white/40'
              }`}
              style={{ minWidth: 8 }}
              aria-label={`صفحة ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Dock — fixed across all pages, Liquid Glass */}
      <div className="relative z-10 px-4 pb-3">
        <div
          className="liquid-glass-dark rounded-[32px] p-3"
        >
          <div className="flex items-end justify-around gap-2">
            {dockApps.map((app) => {
              const openId = DOCK_APP_MAP[app.id] ?? app.id;
              return (
                <AppIcon
                  key={app.id}
                  app={app}
                  onPress={() => handleIconPress(openId)}
                  showLabel={false}
                  badge={settings.notifBadges ? badges[openId] : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Home indicator */}
      <div className="relative z-10 flex flex-col items-center pb-2">
        <div className="h-[5px] w-36 rounded-full bg-white/90 shadow-sm" />
      </div>

      {/* Restore sheet */}
      {editMode && removedApps.length > 0 && (
        <div className="liquid-glass absolute bottom-24 right-4 z-30 rounded-[24px] p-3">
          <p className="mb-2 text-xs font-semibold text-black">تطبيقات محذوفة</p>
          <div className="flex flex-wrap gap-2">
            {removedApps.map((id) => {
              const app = getApp(id);
              if (!app) return null;
              return (
                <button
                  key={id}
                  onClick={() => restoreApp(id)}
                  className="flex items-center gap-1 rounded-full bg-black/5 px-2 py-1 text-xs text-black"
                >
                  <Plus className="h-3 w-3" />
                  {app.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
