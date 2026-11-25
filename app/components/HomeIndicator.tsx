'use client';

import { useCallback, useRef } from 'react';
import { useOS } from '../OSContext';
import { phonePoint } from '../system/phoneGeometry';

interface HomeIndicatorProps {
  onDragProgress: (progress: number, mode: 'home' | 'switcher') => void;
  onDragEnd: (progress: number, mode: 'home' | 'switcher') => void;
}

/**
 * Interactive iOS home indicator. Dragging up on it continuously animates the
 * current app toward the home screen (or the app switcher when the drag is
 * slow and long). Releasing below the threshold springs back.
 */
export default function HomeIndicator({ onDragProgress, onDragEnd }: HomeIndicatorProps) {
  const { screenMode } = useOS();
  const startY = useRef<number | null>(null);
  const startTime = useRef<number>(0);

  const DRAG_DISTANCE = 180; // px of upward drag for full transition
  const SWITCHER_DISTANCE = 300;

  const progressFor = useCallback((dy: number, slow: boolean) => {
    const d = slow ? SWITCHER_DISTANCE : DRAG_DISTANCE;
    return Math.max(0, Math.min(1, -dy / d));
  }, []);

  const handleDown = useCallback(
    (y: number) => {
      if (screenMode !== 'app' && screenMode !== 'home') return;
      startY.current = phonePoint(0, y).y;
      startTime.current = Date.now();
    },
    [screenMode]
  );

  const handleMove = useCallback(
    (y: number) => {
      if (startY.current == null) return;
      const dy = phonePoint(0, y).y - startY.current;
      if (dy >= 0) {
        onDragProgress(0, 'home');
        return;
      }
      const elapsed = Date.now() - startTime.current;
      const slow = elapsed > 350 && -dy > 100; // long press-drag = switcher
      onDragProgress(progressFor(dy, slow), slow ? 'switcher' : 'home');
    },
    [onDragProgress, progressFor]
  );

  const handleUp = useCallback(
    (y: number) => {
      if (startY.current == null) return;
      const dy = phonePoint(0, y).y - startY.current;
      const elapsed = Date.now() - startTime.current;
      startY.current = null;
      if (dy >= 0) {
        onDragEnd(0, 'home');
        return;
      }
      const slow = elapsed > 350 && -dy > 100;
      const mode = slow ? 'switcher' : 'home';
      const fast = elapsed < 250 && -dy > 40; // quick flick
      onDragProgress(fast ? 1 : progressFor(dy, slow), mode);
      onDragEnd(fast ? 1 : progressFor(dy, slow), mode);
    },
    [onDragEnd, onDragProgress, progressFor]
  );

  return (
    <div
      data-home-gesture-strip
      className="absolute bottom-0 left-0 right-0 z-[70] flex h-6 cursor-grab items-end justify-center pb-1.5 active:cursor-grabbing"
      onPointerDown={(e) => {
        if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        handleDown(e.clientY);
      }}
      onPointerMove={(e) => startY.current != null && handleMove(e.clientY)}
      onPointerUp={(e) => {
        handleUp(e.clientY);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        startY.current = null;
        onDragEnd(0, 'home');
      }}
      role="button"
      aria-label="شريط الصفحة الرئيسية"
      style={{ touchAction: 'none' }}
    >
      <div
        className="rounded-full"
        style={{
          width: 144,
          height: 5,
          backgroundColor: 'rgba(255,255,255,0.9)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
        }}
      />
    </div>
  );
}
