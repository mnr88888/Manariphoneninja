
'use client';

import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';
import { useRef, useState } from 'react';

function AppCard({
  appId,
  active,
  onOpen,
  onKill,
}: {
  appId: string;
  active: boolean;
  onOpen: () => void;
  onKill: () => void;
}) {
  const app = getApp(appId);

  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const pointerId = useRef<number | null>(null);

  if (!app) return null;

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (removing) return;

    e.currentTarget.setPointerCapture(e.pointerId);

    pointerId.current = e.pointerId;
    startY.current = e.clientY;
    currentY.current = 0;

    setDragging(true);
  };

  const handlePointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!dragging || pointerId.current !== e.pointerId) return;

    const distance = e.clientY - startY.current;

    currentY.current = distance;

    // Only allow upward dragging.
    setDragY(Math.min(0, distance));
  };

  const finishDrag = () => {
    if (!dragging) return;

    setDragging(false);
    pointerId.current = null;

    if (currentY.current < -110) {
      setRemoving(true);
      setDragY(-window.innerHeight);

      setTimeout(() => {
        onKill();
      }, 220);
    } else {
      setDragY(0);
      currentY.current = 0;
    }
  };

  return (
    <div
      className="flex shrink-0 flex-col items-center gap-3"
      style={{
        transform: `translateY(${dragY}px)`,
        opacity: removing ? 0 : 1,
        transition: dragging
          ? 'none'
          : 'transform 0.25s ease, opacity 0.2s ease',
      }}
    >
      <span className="text-xs font-medium text-white">
        {app.name}
      </span>

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        className="relative h-[440px] w-[230px] overflow-hidden rounded-[28px] touch-pan-x select-none"
        style={{
          border: active
            ? '2px solid rgba(255,255,255,0.65)'
            : '2px solid rgba(255,255,255,0.15)',
          boxShadow: '0 15px 40px rgba(0,0,0,0.5)',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        <button
          onClick={onOpen}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black"
          aria-label={`فتح ${app.name}`}
        >
          <img
            src={app.imageIcon}
            alt=""
            draggable={false}
            className="h-20 w-20 rounded-[18px] object-cover shadow-lg"
          />

          <span className="mt-3 text-sm text-white/80">
            {app.name}
          </span>
        </button>

        {/* Invisible gesture layer */}
        <div
          className="absolute inset-0 z-10"
          style={{
            touchAction: 'pan-x',
          }}
        />
      </div>

      <button
        onClick={() => {
          setRemoving(true);
          setTimeout(onKill, 220);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white active:scale-90"
        aria-label={`إغلاق ${app.name}`}
      >
        <span className="text-lg leading-none">−</span>
      </button>
    </div>
  );
}

export default function AppSwitcher() {
  const {
    recentApps,
    switchToApp,
    killApp,
    closeSwitcher,
    activeApp,
  } = useOS();

  return (
    <div
      className="switcher-fade absolute inset-0 z-40 flex flex-col bg-black/90 backdrop-blur-xl"
      onClick={closeSwitcher}
    >
      <div className="h-12 shrink-0" />

      {recentApps.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-white/60">
          لا توجد تطبيقات مفتوحة مؤخراً
        </div>
      ) : (
        <div
          className="no-scrollbar flex flex-1 items-center gap-5 overflow-x-auto overflow-y-hidden px-6 py-4"
          onClick={e => e.stopPropagation()}
        >
          {recentApps.map(appId => (
            <AppCard
              key={appId}
              appId={appId}
              active={appId === activeApp}
              onOpen={() => switchToApp(appId)}
              onKill={() => killApp(appId)}
            />
          ))}
        </div>
      )}

      <div className="flex shrink-0 justify-center pb-2">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
