'use client';

import { useEffect, useRef, useState } from 'react';
import { OSProvider, useOS } from './OSContext';
import { SystemProvider, useSystem } from './system/SystemContext';
import StatusBar from './components/StatusBar';
import HomeScreen from './components/HomeScreen';
import AppRenderer from './components/AppRenderer';
import AppSwitcher from './components/AppSwitcher';
import HomeGesture from './components/HomeGesture';
import ControlCenter from './components/ControlCenter';
import NotificationCenter from './components/NotificationCenter';
import LockScreen from './components/LockScreen';
import DynamicIsland from './components/DynamicIsland';
import NotificationBanner from './components/NotificationBanner';
import { useNotificationSimulation } from './system/notificationSimulation';
import HomeIndicator from './components/HomeIndicator';

type Overlay = 'none' | 'control' | 'notifications';

function PhoneShell() {
  const { activeApp, recentApps, screenMode, closing, goToHome, openSwitcher } = useOS();
  const { locked, settings } = useSystem();
  const [overlay, setOverlay] = useState<Overlay>('none');

  useNotificationSimulation();

  // Continuous home-indicator drag: progress 0..1 while dragging up from the
  // home indicator area. The open app visually follows the finger.
  const [dragProgress, setDragProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [dragMode, setDragMode] = useState<'home' | 'switcher'>('home');

  const homeAnim = screenMode === 'switcher' ? 'home-shrink' : '';

  return (
    <div
      data-phone-screen
      data-appearance={settings.darkMode ? 'dark' : 'light'}
      className="phone-screen relative h-full w-full overflow-hidden bg-black"
      style={{
        filter: `brightness(${settings.brightness}%)`,
        transition: 'filter 0.2s',
      }}
    >
      <StatusBar dark />

      {/* Home screen */}
      <div
        className={`absolute inset-0 z-10 ${homeAnim}`}
        style={{
          visibility:
            screenMode === 'app' && activeApp && !closing ? 'hidden' : 'visible',
          transformOrigin: 'center center',
        }}
      >
        <HomeScreen />
      </div>

      {/* All opened apps kept mounted for state preservation */}
      {recentApps.map((appId) => (
        <AppRenderer
          key={appId}
          appId={appId}
          active={appId === activeApp && screenMode === 'app'}
          dragProgress={dragActive && appId === activeApp ? dragProgress : 0}
          dragMode={dragMode}
        />
      ))}

      {/* App switcher overlay */}
      {screenMode === 'switcher' && <AppSwitcher />}

      {/* Control Center */}
      {overlay === 'control' && (
        <ControlCenter onClose={() => setOverlay('none')} />
      )}

      {/* Notification Center */}
      {overlay === 'notifications' && (
        <NotificationCenter onClose={() => setOverlay('none')} />
      )}

      {/* Dynamic Island */}
      <DynamicIsland />

      {/* iOS top banner for incoming notifications (unlocked only) */}
      <NotificationBanner />

      {/* Lock Screen */}
      {locked && <LockScreen />}

      {/* Gesture handler */}
      <HomeGesture
        onOpenControlCenter={() => setOverlay('control')}
        onOpenNotificationCenter={() => setOverlay('notifications')}
        systemOverlayOpen={overlay !== 'none'}
        onCloseSystemOverlay={() => setOverlay('none')}
      />

      {/* Interactive home indicator */}
      <HomeIndicator
        onDragProgress={(progress, mode) => {
          setDragActive(true);
          setDragProgress(progress);
          setDragMode(mode);
        }}
        onDragEnd={(progress, mode) => {
          setDragActive(false);
          setDragProgress(0);
          if (progress >= 1) {
            if (mode === 'switcher') openSwitcher();
            else goToHome();
          }
        }}
      />
    </div>
  );
}

export default function PhoneFrame() {
  const stage = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ width: 390, height: 844, bezel: 10, scale: 1, ready: false });

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let request = 0;
    const measure = () => {
      cancelAnimationFrame(request);
      request = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        element.style.height = `${viewport?.height ?? window.innerHeight}px`;
        element.style.width = `${viewport?.width ?? window.innerWidth}px`;
        element.style.top = `${viewport?.offsetTop ?? 0}px`;
        element.style.left = `${viewport?.offsetLeft ?? 0}px`;
        const style = getComputedStyle(element);
        const width = Math.max(1, element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
        const height = Math.max(1, element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
        const compact = window.innerWidth <= 600 || window.matchMedia('(pointer: coarse) and (max-height: 600px)').matches;
        const bezel = compact ? 0 : 10;
        const logicalWidth = compact ? Math.max(360, Math.min(430, width)) : 390;
        const widthScale = Math.min(1, width / logicalWidth);
        const logicalHeight = compact ? Math.max(720, Math.min(956, height / widthScale)) : 844;
        const scale = Math.min(1, width / (logicalWidth + bezel * 2), height / (logicalHeight + bezel * 2));
        setFrame({ width: logicalWidth, height: logicalHeight, bezel, scale, ready: true });
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('scroll', measure);
    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('scroll', measure);
    };
  }, []);

  const outerWidth = frame.width + frame.bezel * 2;
  const outerHeight = frame.height + frame.bezel * 2;
  return (
    <div ref={stage} className="phone-stage fixed flex items-center justify-center bg-neutral-900">
      <div
        className="relative shrink-0"
        style={{
          width: outerWidth * frame.scale,
          height: outerHeight * frame.scale,
          visibility: frame.ready ? 'visible' : 'hidden',
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden border-solid border-neutral-800 bg-black"
          style={{
            width: outerWidth,
            height: outerHeight,
            borderWidth: frame.bezel,
            borderRadius: frame.bezel ? 52 : 0,
            transform: `scale(${frame.scale})`,
            transformOrigin: 'top left',
            boxShadow: frame.bezel ? '0 0 0 2px #1a1a1a, 0 20px 60px rgba(0,0,0,0.6)' : 'none',
          }}
        >
          <SystemProvider>
            <OSProvider>
              <PhoneShell />
            </OSProvider>
          </SystemProvider>
        </div>
      </div>
    </div>
  );
}
