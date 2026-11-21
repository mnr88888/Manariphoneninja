'use client';

import { useEffect, useState } from 'react';
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
import { useWhatsAppSimulation } from './system/whatsappSimulation';
import HomeIndicator from './components/HomeIndicator';

type Overlay = 'none' | 'control' | 'notifications';

function PhoneShell() {
  const { activeApp, recentApps, screenMode, closing, goToHome, openSwitcher } = useOS();
  const { locked, settings } = useSystem();
  const [overlay, setOverlay] = useState<Overlay>('none');

  useWhatsAppSimulation();

  // Continuous home-indicator drag: progress 0..1 while dragging up from the
  // home indicator area. The open app visually follows the finger.
  const [dragProgress, setDragProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [dragMode, setDragMode] = useState<'home' | 'switcher'>('home');

  const homeAnim = screenMode === 'switcher' ? 'home-shrink' : '';

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-black"
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
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-neutral-900">
      {/* Phone bezel */}
      <div
        className="relative flex h-full max-h-[880px] w-full max-w-[420px] flex-col overflow-hidden rounded-[52px] border-[10px] border-neutral-800 bg-black shadow-2xl"
        style={{
          boxShadow:
            '0 0 0 2px #1a1a1a, 0 20px 60px rgba(0,0,0,0.6), inset 0 0 4px rgba(255,255,255,0.05)',
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute left-1/2 top-2 z-[60] flex h-8 w-[120px] -translate-x-1/2 items-center justify-center rounded-full bg-black">
          <div className="absolute right-3 h-3 w-3 rounded-full bg-neutral-700" />
          <div className="absolute left-3 h-2 w-2 rounded-full bg-neutral-800" />
        </div>

        <SystemProvider>
          <OSProvider>
            <PhoneShell />
          </OSProvider>
        </SystemProvider>
      </div>
    </div>
  );
}
