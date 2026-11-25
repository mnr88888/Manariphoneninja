'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useOS } from '../OSContext';
import { phonePoint } from '../system/phoneGeometry';

interface HomeGestureProps {
  onOpenControlCenter: () => void;
  onOpenNotificationCenter: () => void;
  systemOverlayOpen: boolean;
  onCloseSystemOverlay: () => void;
}

/**
 * Global gesture handler. Detects:
 *  - Swipe up from bottom edge → home (quick flick) or app switcher (slow drag)
 *  - Swipe down from top-right → Control Center
 *  - Swipe down from top-left  → Notification Center
 *  - Swipe down while an overlay is open → close it
 * Works with touch and mouse events.
 */
export default function HomeGesture({
  onOpenControlCenter,
  onOpenNotificationCenter,
  systemOverlayOpen,
  onCloseSystemOverlay,
}: HomeGestureProps) {
  const { screenMode, goToHome, openSwitcher, closeSwitcher } = useOS();

  const startY = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startTime = useRef<number>(0);
  const dragging = useRef(false);
  const edge = useRef<'top-left' | 'top-right' | 'bottom' | null>(null);

  const HOME_THRESHOLD = 60; // quick flick or 60px+ drag = home
  const SWITCHER_THRESHOLD = 130; // slow, long drag = app switcher
  const TOP_ZONE = 44; // px from top for control/notification centers
  const BOTTOM_ZONE = 24; // px from bottom where home gesture starts

  const onDown = useCallback(
    (x: number, y: number) => {
      const point = phonePoint(x, y);
      if (!point.inside || document.querySelector('[data-lock-screen]')) return;
      x = point.x;
      y = point.y;
      const distFromBottom = point.height - y;
      if (y <= TOP_ZONE) {
        edge.current = x > point.width / 2 ? 'top-right' : 'top-left';
      } else if (distFromBottom <= BOTTOM_ZONE) {
        edge.current = 'bottom';
      } else {
        edge.current = null;
      }
      startY.current = y;
      startX.current = x;
      startTime.current = Date.now();
      dragging.current = true;
    },
    []
  );

  const onMove = useCallback((_x: number, _y: number) => {
    // no-op, direction decided on release
  }, []);

  const onUp = useCallback(
    (x: number, y: number) => {
      if (!dragging.current || startY.current == null) {
        dragging.current = false;
        return;
      }
      const point = phonePoint(x, y);
      x = point.x;
      y = point.y;
      const dx = x - startX.current;
      const dy = y - startY.current; // positive = downward
      const elapsed = Date.now() - startTime.current;
      const velocity = Math.abs(dy) / Math.max(elapsed, 1);

      dragging.current = false;
      const startEdge = edge.current;
      edge.current = null;
      startY.current = null;

      const vertical = Math.abs(dy) > Math.abs(dx);

      if (!vertical) return;

      // Swipe down from top → open system overlays
      if (startEdge === 'top-right' && dy > 30) {
        if (systemOverlayOpen) onCloseSystemOverlay();
        else onOpenControlCenter();
        return;
      }
      if (startEdge === 'top-left' && dy > 30) {
        if (systemOverlayOpen) onCloseSystemOverlay();
        else onOpenNotificationCenter();
        return;
      }

      // Swipe up from bottom edge
      if (startEdge === 'bottom' && dy < -20) {
        const delta = -dy;
        const isFlick = velocity > 0.5 || delta > HOME_THRESHOLD;

        if (screenMode === 'app') {
          // Slow long drag (low velocity, big distance) = switcher
          if (delta > SWITCHER_THRESHOLD && velocity < 0.4) {
            openSwitcher();
          } else if (isFlick) {
            goToHome();
          }
        } else if (screenMode === 'home') {
          if (delta > SWITCHER_THRESHOLD) openSwitcher();
        } else if (screenMode === 'switcher') {
          closeSwitcher();
        }
        return;
      }

      // Swipe down anywhere while switcher is open → close it
      if (screenMode === 'switcher' && dy > 60) {
        closeSwitcher();
      }
    },
    [
      screenMode,
      systemOverlayOpen,
      goToHome,
      openSwitcher,
      closeSwitcher,
      onOpenControlCenter,
      onOpenNotificationCenter,
      onCloseSystemOverlay,
    ]
  );

  useEffect(() => {
    const isStripGesture = (target: EventTarget | null) => target instanceof Element && !!target.closest('[data-home-gesture-strip]');
    const touchStart = (e: TouchEvent) => {
      if (isStripGesture(e.target)) return;
      if (e.touches.length > 0) onDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const touchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0)
        onUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    };
    const mouseDown = (e: MouseEvent) => {
      if (!isStripGesture(e.target)) onDown(e.clientX, e.clientY);
    };
    const mouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const mouseUp = (e: MouseEvent) => onUp(e.clientX, e.clientY);

    window.addEventListener('touchstart', touchStart, { passive: true });
    window.addEventListener('touchmove', touchMove, { passive: true });
    window.addEventListener('touchend', touchEnd, { passive: true });
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('touchstart', touchStart);
      window.removeEventListener('touchmove', touchMove);
      window.removeEventListener('touchend', touchEnd);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [onDown, onMove, onUp]);

  return null;
}
