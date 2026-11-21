
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';

export type ScreenMode = 'home' | 'app' | 'switcher';

export interface OSState {
  activeApp: string | null;
  recentApps: string[];
  appStates: Record<string, unknown>;
  screenMode: ScreenMode;
  closing: boolean;
  opening: boolean;
}

interface OSContextValue extends OSState {
  openApp: (appId: string) => void;
  closeApp: () => void;
  goToHome: () => void;
  openSwitcher: () => void;
  closeSwitcher: () => void;
  switchToApp: (appId: string) => void;
  killApp: (appId: string) => void;
  setAppState: (appId: string, state: unknown) => void;
  getAppState: <T = unknown>(appId: string) => T | undefined;
}

const OSContext = createContext<OSContextValue | null>(null);

export function OSProvider({ children }: { children: ReactNode }) {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [recentApps, setRecentApps] = useState<string[]>([]);
  const [appStates, setAppStates] = useState<Record<string, unknown>>({});
  const [screenMode, setScreenMode] = useState<ScreenMode>('home');
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const pushRecent = useCallback((appId: string) => {
    setRecentApps(prev => [appId, ...prev.filter(id => id !== appId)]);
  }, []);

  const openApp = useCallback((appId: string) => {
    clearTimers();
    setClosing(false);
    setOpening(true);
    setActiveApp(appId);
    setScreenMode('app');
    pushRecent(appId);

    timers.current.push(
      setTimeout(() => setOpening(false), 320)
    );
  }, [clearTimers, pushRecent]);

  const closeApp = useCallback(() => {
    clearTimers();
    setClosing(true);
    setScreenMode('home');

    timers.current.push(
      setTimeout(() => {
        setClosing(false);
        setActiveApp(null);
      }, 280)
    );
  }, [clearTimers]);

  const goToHome = useCallback(() => {
    closeApp();
  }, [closeApp]);

  const openSwitcher = useCallback(() => {
    clearTimers();
    setClosing(false);
    setOpening(false);
    setScreenMode('switcher');
  }, [clearTimers]);

  const closeSwitcher = useCallback(() => {
    clearTimers();
    setScreenMode(activeApp ? 'app' : 'home');
  }, [activeApp, clearTimers]);

  const switchToApp = useCallback((appId: string) => {
    clearTimers();
    setClosing(false);
    setOpening(true);
    setActiveApp(appId);
    setScreenMode('app');
    pushRecent(appId);

    timers.current.push(
      setTimeout(() => setOpening(false), 320)
    );
  }, [clearTimers, pushRecent]);

  // Completely remove an app from the recent apps list.
  const killApp = useCallback((appId: string) => {
    clearTimers();

    setRecentApps(prev => prev.filter(id => id !== appId));

    setAppStates(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });

    if (activeApp === appId) {
      setClosing(false);
      setOpening(false);
      setActiveApp(null);
      setScreenMode('home');
    }
  }, [activeApp, clearTimers]);

  const setAppState = useCallback((appId: string, state: unknown) => {
    setAppStates(prev => ({
      ...prev,
      [appId]: state,
    }));
  }, []);

  const getAppState = useCallback(
    <T,>(appId: string): T | undefined =>
      appStates[appId] as T | undefined,
    [appStates]
  );

  return (
    <OSContext.Provider
      value={{
        activeApp,
        recentApps,
        appStates,
        screenMode,
        closing,
        opening,
        openApp,
        closeApp,
        goToHome,
        openSwitcher,
        closeSwitcher,
        switchToApp,
        killApp,
        setAppState,
        getAppState,
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  const ctx = useContext(OSContext);

  if (!ctx) {
    throw new Error('useOS must be used within OSProvider');
  }

  return ctx;
}
