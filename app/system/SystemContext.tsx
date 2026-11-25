'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { EID_NOTIFICATIONS } from '../apps/ninja/data';

/* ============================================================
 * Types
 * ============================================================ */

export interface SystemContact {
  id: string;
  name: string;
  phone: string;
  color: string;
  favorite?: boolean;
}

export interface SystemNotification {
  id: string;
  appId: string;
  title: string;
  body: string;
  timestamp: number;
  read?: boolean;
  /** Deep-link destination inside the source app (e.g. a message id) */
  targetId?: string;
}

export type Appearance = 'light' | 'dark' | 'auto';
export type WallpaperTarget = 'home' | 'lock' | 'both';

export interface SystemSettings {
  wifi: boolean;
  bluetooth: boolean;
  airplaneMode: boolean;
  mobileData: boolean;
  focusMode: boolean;
  rotationLock: boolean;
  flashlight: boolean;
  darkMode: boolean;
  appearance: Appearance;
  brightness: number; // 0-100
  volume: number; // 0-100
  language: string;
  // Sounds & Haptics
  soundsEnabled: boolean;
  hapticsEnabled: boolean;
  keyboardClicks: boolean;
  // Notification preferences (system-wide)
  notifSound: boolean;
  notifLockScreen: boolean;
  notifBanners: boolean;
  notifPreviews: boolean;
  notifGrouped: boolean;
  notifBadges: boolean;
  /** Home screen icon appearance mode */
  iconAppearance: 'light' | 'dark' | 'tinted' | 'auto';
  showBatteryPercentage: boolean;
  lowPowerMode: boolean;
  /** Automatic simulated incoming WhatsApp messages */
  whatsappAutoMessages: boolean;
  // Per-app notification permissions (appId -> enabled)
  appNotifs: Record<string, boolean>;
}

export interface InstalledApp {
  id: string;
  page: number;
}

export interface WallpaperState {
  home: string;
  lock: string;
  blur: number; // 0-20 px
  scale: number; // 100-130 %
  positionX: number; // 0-100 %
  positionY: number; // 0-100 %
}

/** Icons per home-screen page: 4 columns x 5 rows, so every app fits on page 1 */
export const APPS_PER_PAGE = 20;

/** Payload for addNotification. `id` lets a caller re-deliver a known notification
 *  (e.g. a Ninja inbox message); `badge` sets the app's badge to an absolute count
 *  instead of the default +1. */
export type NewNotification = Omit<SystemNotification, 'id' | 'timestamp'> & {
  id?: string;
  badge?: number;
};

/* ============================================================
 * Sample data
 * ============================================================ */

const SAMPLE_CONTACTS: SystemContact[] = [
  { id: 'c1', name: 'أحمد العتيبي', phone: '٠٥٥١٢٣٤٥٦٧', color: '#FF3B30' },
  { id: 'c2', name: 'فاطمة الزهراء', phone: '٠٥٥٢٣٤٥٦٧٨', color: '#FF9F0A' },
  { id: 'c3', name: 'محمد سالم', phone: '٠٥٥٣٤٥٦٧٨٩', color: '#34C759' },
  { id: 'c4', name: 'نورة القحطاني', phone: '٠٥٥٤٥٦٧٨٩٠', color: '#007AFF' },
  { id: 'c5', name: 'خالد المطيري', phone: '٠٥٥٥٦٧٨٩٠١', color: '#5856D6' },
  { id: 'c6', name: 'سارة الحربي', phone: '٠٥٥٦٧٨٩٠١٢', color: '#FF2D55' },
  { id: 'c7', name: 'عبدالله الشمري', phone: '٠٥٥٧٨٩٠١٢٣', color: '#FF6B35' },
  { id: 'c8', name: 'ريم الدوسري', phone: '٠٥٥٨٩٠١٢٣٤', color: '#00C7BE' },
];

/* ============================================================
 * Built-in wallpaper gallery
 * ============================================================ */

export const WALLPAPER_GALLERY: { id: string; name: string; css: string; group: string }[] = [
  // iOS 26 image wallpapers
  { id: 'ios26-default', name: 'آي أو إس ٢٦', css: 'url(/wallpapers/ios26-default.webp)', group: 'آي أو إس ٢٦' },
  { id: 'ios26-emerald', name: 'الزمرد', css: 'url(/wallpapers/ios26-emerald.webp)', group: 'آي أو إس ٢٦' },
  { id: 'ios26-sunrise', name: 'الشروق', css: 'url(/wallpapers/ios26-sunrise.webp)', group: 'آي أو إس ٢٦' },
  { id: 'ios26-orb', name: 'الفقاعة', css: 'url(/wallpapers/ios26-orb.webp)', group: 'آي أو إس ٢٦' },
  // Colorful
  { id: 'sunset', name: 'الغروب', css: 'linear-gradient(160deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)', group: 'ملونة' },
  { id: 'aurora', name: 'الشفق', css: 'linear-gradient(160deg, #00c6ff 0%, #7d2ae8 100%)', group: 'ملونة' },
  { id: 'candy', name: 'القطن', css: 'linear-gradient(160deg, #ff9a9e 0%, #fad0c4 50%, #fbc2eb 100%)', group: 'ملونة' },
  { id: 'mango', name: 'المانجو', css: 'linear-gradient(160deg, #ff8008 0%, #ffc837 100%)', group: 'ملونة' },
  // Abstract
  { id: 'prism', name: 'المنشور', css: 'linear-gradient(135deg, #434343 0%, #000000 60%, #533795 100%)', group: 'تجريدية' },
  { id: 'swirl', name: 'الدوامة', css: 'conic-gradient(from 180deg at 50% 50%, #3f51b1 0%, #5a55ae 20%, #7b4397 45%, #dc2424 80%, #3f51b1 100%)', group: 'تجريدية' },
  { id: 'mesh', name: 'الشبكة', css: 'radial-gradient(circle at 20% 30%, #0ea5e9 0%, transparent 45%), radial-gradient(circle at 80% 70%, #8b5cf6 0%, transparent 45%), #0f172a', group: 'تجريدية' },
  { id: 'silk', name: 'الحرير', css: 'linear-gradient(160deg, #ee9ca7 0%, #ffdde1 100%)', group: 'تجريدية' },
  // Gradient
  { id: 'ocean', name: 'المحيط', css: 'linear-gradient(160deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', group: 'تدرجات' },
  { id: 'forest', name: 'الغابة', css: 'linear-gradient(160deg, #134e5e 0%, #71b280 100%)', group: 'تدرجات' },
  { id: 'peach', name: 'الخوخ', css: 'linear-gradient(160deg, #ffecd2 0%, #fcb69f 100%)', group: 'تدرجات' },
  { id: 'royal', name: 'الملكي', css: 'linear-gradient(160deg, #141e30 0%, #243b55 100%)', group: 'تدرجات' },
  // Nature
  { id: 'desert', name: 'الصحراء', css: 'linear-gradient(160deg, #c79081 0%, #dfa579 100%)', group: 'طبيعة' },
  { id: 'sky', name: 'السماء', css: 'linear-gradient(180deg, #2980b9 0%, #6dd5fa 60%, #ffffff 100%)', group: 'طبيعة' },
  { id: 'meadow', name: 'المرج', css: 'linear-gradient(160deg, #093028 0%, #237a57 100%)', group: 'طبيعة' },
  { id: 'lavender', name: 'الخزامى', css: 'linear-gradient(160deg, #a18cd1 0%, #fbc2eb 100%)', group: 'طبيعة' },
  // Dark
  { id: 'night', name: 'الليل', css: 'linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', group: 'داكنة' },
  { id: 'carbon', name: 'الكربون', css: 'linear-gradient(160deg, #1c1c1e 0%, #2c2c2e 50%, #000000 100%)', group: 'داكنة' },
  { id: 'eclipse', name: 'الكسوف', css: 'radial-gradient(circle at 50% 35%, #3a3a3c 0%, #000000 70%)', group: 'داكنة' },
  { id: 'midnight', name: 'منتصف الليل', css: 'linear-gradient(180deg, #000428 0%, #004e92 100%)', group: 'داكنة' },
];

const DEFAULT_WALLPAPER_CSS = 'url(/wallpapers/ios26-default.webp)';

const DEFAULT_WALLPAPER: WallpaperState = {
  home: DEFAULT_WALLPAPER_CSS,
  lock: DEFAULT_WALLPAPER_CSS,
  blur: 0,
  scale: 100,
  positionX: 50,
  positionY: 50,
};

const DEFAULT_SETTINGS: SystemSettings = {
  wifi: true,
  bluetooth: true,
  airplaneMode: false,
  mobileData: true,
  focusMode: false,
  rotationLock: false,
  flashlight: false,
  darkMode: false,
  appearance: 'light',
  brightness: 80,
  volume: 60,
  language: 'ar',
  soundsEnabled: true,
  hapticsEnabled: true,
  keyboardClicks: true,
  notifSound: true,
  notifLockScreen: true,
  notifBanners: true,
  notifPreviews: true,
  notifGrouped: true,
  notifBadges: true,
  iconAppearance: 'light',
  showBatteryPercentage: true,
  lowPowerMode: false,
  whatsappAutoMessages: true,
  appNotifs: {},
};

/* ============================================================
 * Persistence helpers
 * ============================================================ */

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw != null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors (large uploaded images)
  }
}

/* ============================================================
 * Context definition
 * ============================================================ */

interface SystemContextValue {
  // Contacts (shared across apps)
  contacts: SystemContact[];
  addContact: (c: Omit<SystemContact, 'id' | 'color'> & { color?: string }) => void;
  updateContact: (id: string, patch: Partial<SystemContact>) => void;
  deleteContact: (id: string) => void;
  toggleFavorite: (id: string) => void;

  // Notifications
  notifications: SystemNotification[];
  addNotification: (n: NewNotification) => void;
  /** Latest notification to show as a top banner (null when none) */
  banner: SystemNotification | null;
  dismissBanner: () => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (n: SystemNotification) => void;
  openNotification: (n: SystemNotification) => void;
  /** Set when a notification is tapped; consumed by the target app */
  pendingDeepLink: { appId: string; targetId?: string; ts: number } | null;
  consumeDeepLink: () => void;

  // Badges
  badges: Record<string, number>;
  setBadge: (appId: string, count: number) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (patch: Partial<SystemSettings>) => void;
  isAppNotifEnabled: (appId: string) => boolean;
  /** Effective dark mode (appearance light/dark/auto resolved) */
  isDark: boolean;

  // Wallpaper
  wallpaper: WallpaperState;
  uploadedWallpapers: string[]; // data URIs
  setWallpaper: (target: WallpaperTarget, value: string) => void;
  updateWallpaperMeta: (patch: Partial<Omit<WallpaperState, 'home' | 'lock'>>) => void;
  addUploadedWallpaper: (dataUri: string) => void;
  removeUploadedWallpaper: (dataUri: string) => void;

  // Home screen arrangement
  homePages: string[][]; // array of pages, each page is list of app ids
  moveAppToPage: (appId: string, page: number, index?: number) => void;
  reorderAppOnPage: (page: number, fromIndex: number, toIndex: number) => void;
  removeApp: (appId: string) => void;
  restoreApp: (appId: string) => void;
  removedApps: string[];

  // Lock screen
  locked: boolean;
  setLocked: (locked: boolean) => void;
  ninjaCampaign: NinjaCampaign;
  updateNinjaCampaign: (patch: Partial<NinjaCampaign>) => void;
  ninjaProfile: NinjaProfile;
  updateNinjaProfile: (patch: Partial<NinjaProfile>) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

/* ============================================================
 * Ninja brand account + campaign (shared by Instagram & X)
 * ============================================================ */

export interface NinjaProfile {
  name: string; // display name
  username: string; // @handle
  bio: string;
  avatar: string; // image path or data URI
  followers: number;
  following: number;
}

export interface NinjaCampaign {
  /** 'draft' | 'published' */
  status: 'draft' | 'published';
  image: string; // image path or data URI (user uploads)
  title: string;
  description: string;
  hashtag: string;
  updatedAt: number;
}

/** Official Ninja campaign hashtag (locked) */
export const NINJA_HASHTAG = '#رمضان_مع_نينجا_احلى';

const DEFAULT_NINJA_PROFILE: NinjaProfile = {
  name: 'Ninja',
  username: 'ninja',
  bio: 'توصيل البقالة في دقائق 🛵 | عروض حصرية كل يوم',
  avatar: '/ninja.webp',
  followers: 128000,
  following: 42,
};

const DEFAULT_CAMPAIGN: NinjaCampaign = {
  status: 'draft',
  image: '',
  title: '',
  description: '',
  hashtag: NINJA_HASHTAG,
  updatedAt: 0,
};

/* ============================================================
 * Notification feedback (sound + haptics)
 * ============================================================ */

/** Short three-note chime, in the spirit of the iPhone "Tri-tone" alert */
function playNotificationChime(volume: number) {
  try {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0.08 * (volume / 100);
    master.connect(ctx.destination);
    const notes = [1318.5, 1568, 2093]; // E6, G6, C7
    notes.forEach((freq, i) => {
      const t0 = ctx.currentTime + i * 0.11;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(1, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
      osc.connect(gain).connect(master);
      osc.start(t0);
      osc.stop(t0 + 0.34);
    });
    setTimeout(() => void ctx.close(), 900);
  } catch {
    // audio unavailable
  }
}

function vibrateNotification() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([18, 45, 18]);
    }
  } catch {
    // vibration unavailable
  }
}

/* ============================================================
 * Provider
 * ============================================================ */

export function SystemProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<SystemContact[]>(SAMPLE_CONTACTS);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [locked, setLocked] = useState(true);
  const [wallpaper, setWallpaperState] = useState<WallpaperState>(DEFAULT_WALLPAPER);
  const [uploadedWallpapers, setUploadedWallpapers] = useState<string[]>([]);
  const [removedApps, setRemovedApps] = useState<string[]>([]);
  const [homePages, setHomePages] = useState<string[][]>([]);
  const [clockHour, setClockHour] = useState(new Date().getHours());

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    const storedContacts = loadJSON<SystemContact[] | null>('ios-contacts', null);
    if (storedContacts) setContacts(storedContacts);

    const storedSettings = loadJSON<Partial<SystemSettings> | null>('ios-settings', null);
    if (storedSettings) setSettings({ ...DEFAULT_SETTINGS, ...storedSettings });

    const storedBadges = loadJSON<Record<string, number> | null>('ios-badges', null);
    if (storedBadges) setBadges(storedBadges);

    const storedNotifs = loadJSON<SystemNotification[] | null>('ios-notifications', null);
    if (storedNotifs && storedNotifs.length > 0) {
      // Migrate legacy Ninja ids (ninja-eid-N) so they match the Ninja inbox ids
      setNotifications(
        storedNotifs.map((n) =>
          n.id.startsWith('ninja-eid-')
            ? { ...n, id: n.id.replace('ninja-eid-', 'ninja-ramadan-'), targetId: n.id.replace('ninja-eid-', 'ninja-ramadan-') }
            : n
        )
      );
    } else {
      // Seed on first run. Ninja notifications use stable ids shared with the
      // Ninja inbox (ninja-eid-N) so both views stay synchronized and no
      // duplicates appear after a refresh.
      const ninjaSeeds: SystemNotification[] = EID_NOTIFICATIONS.map((n, i) => ({
        id: `ninja-ramadan-${i}`,
        appId: 'ninja',
        title: n.title,
        body: n.body,
        targetId: `ninja-ramadan-${i}`,
        timestamp: Date.now() - (i + 1) * 30 * 60000,
      }));
      setNotifications([
        { id: 's1', appId: 'whatsapp', title: 'واتساب', body: 'أحمد العتيبي: عيدكم مبارك! 🌙', timestamp: Date.now() - 5 * 60000 },
        ...ninjaSeeds,
        { id: 's2', appId: 'messages', title: 'الرسائل', body: 'نورة القحطاني: هل جهزت للتجمعات؟', timestamp: Date.now() - 18 * 60000 },
        { id: 's4', appId: 'mail', title: 'البريد', body: 'فاتورة طلبك الأخير من نينجا', timestamp: Date.now() - 90 * 60000 },
      ]);
    }

    // Wallpaper: migrate from legacy single-gradient storage if present
    const legacy = loadJSON<string | null>('ios-wallpaper', null);
    const storedWp = loadJSON<WallpaperState | null>('ios-wallpaper-v2', null);
    if (storedWp) {
      setWallpaperState({ ...DEFAULT_WALLPAPER, ...storedWp });
    } else if (legacy) {
      setWallpaperState({ ...DEFAULT_WALLPAPER, home: legacy, lock: legacy });
    }

    const storedUploads = loadJSON<string[] | null>('ios-wallpaper-uploads', null);
    if (storedUploads) setUploadedWallpapers(storedUploads);

    const storedRemoved = loadJSON<string[]>('ios-removed-apps', []);
    if (storedRemoved.length > 0) setRemovedApps(storedRemoved);

    const storedPages = loadJSON<string[][] | null>('ios-home-pages', null);
    // Always repaginate on load: page 1 fills first (APPS_PER_PAGE apps), overflow goes
    // to page 2, 3, ... This repairs stale stored layouts where apps overflowed
    // page 1 or were appended to the wrong page, while preserving app order.
    import('../apps/registry').then(({ APPS, HOME_APPS }) => {
      const known = new Set(APPS.map((a) => a.id));
      const removedIds = new Set(storedRemoved);
      const order = storedPages ? [...storedPages.flat(), ...HOME_APPS] : HOME_APPS;
      const seen = new Set<string>();
      const ordered = order.filter((id) => {
        if (seen.has(id) || removedIds.has(id) || !known.has(id)) return false;
        seen.add(id);
        return true;
      });
      const pages: string[][] = [];
      for (let i = 0; i < ordered.length; i += APPS_PER_PAGE) {
        pages.push(ordered.slice(i, i + APPS_PER_PAGE));
      }
      if (pages.length === 0) pages.push([]);
      setHomePages(pages);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Persist on change ----
  useEffect(() => saveJSON('ios-contacts', contacts), [contacts]);
  useEffect(() => saveJSON('ios-settings', settings), [settings]);
  useEffect(() => saveJSON('ios-badges', badges), [badges]);
  useEffect(() => saveJSON('ios-notifications', notifications), [notifications]);
  useEffect(() => saveJSON('ios-wallpaper-v2', wallpaper), [wallpaper]);
  useEffect(() => saveJSON('ios-wallpaper-uploads', uploadedWallpapers), [uploadedWallpapers]);
  useEffect(() => saveJSON('ios-removed-apps', removedApps), [removedApps]);
  useEffect(() => saveJSON('ios-home-pages', homePages), [homePages]);

  // ---- Hourly tick for auto appearance ----
  useEffect(() => {
    const t = setInterval(() => setClockHour(new Date().getHours()), 60000);
    return () => clearInterval(t);
  }, []);

  // ---- Contacts operations ----
  const addContact = useCallback(
    (c: Omit<SystemContact, 'id' | 'color'> & { color?: string }) => {
      const colors = ['#FF3B30', '#FF9F0A', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#00C7BE'];
      const contact: SystemContact = {
        id: 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        color: c.color ?? colors[Math.floor(Math.random() * colors.length)],
        ...c,
      };
      setContacts((prev) => [...prev, contact]);
    },
    []
  );

  const updateContact = useCallback((id: string, patch: Partial<SystemContact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, favorite: !c.favorite } : c))
    );
  }, []);

  // ---- Notification operations (respect per-app + system prefs) ----
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);
  const notificationsRef = useRef(notifications);
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Top banner (iOS heads-up notification) shown while the phone is unlocked
  const [banner, setBanner] = useState<SystemNotification | null>(null);
  const dismissBanner = useCallback(() => setBanner(null), []);

  const addNotification = useCallback((n: NewNotification) => {
    const s = settingsRef.current;
    const appAllowed = s.appNotifs[n.appId] !== false;
    if (!appAllowed || s.focusMode) return;

    if (s.notifSound && s.soundsEnabled) playNotificationChime(s.volume);
    if (s.hapticsEnabled) vibrateNotification();

    const { id: customId, badge: badgeOverride, ...rest } = n;
    const id = customId ?? 'n-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    // Re-delivering a notification that is still unread must not inflate the badge
    const existing = customId ? notificationsRef.current.find((x) => x.id === customId) : undefined;
    const notif: SystemNotification = { ...rest, id, timestamp: Date.now(), read: false };

    setNotifications((prev) => {
      const next = [notif, ...prev.filter((x) => x.id !== id)];
      return s.notifGrouped ? next.slice(0, 30) : next.slice(0, 8);
    });
    setBadges((prev) => ({
      ...prev,
      [n.appId]: badgeOverride ?? (prev[n.appId] ?? 0) + (existing && !existing.read ? 0 : 1),
    }));

    if (!lockedRef.current && s.notifBanners) setBanner(notif);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setBadges({});
  }, []);

  const markNotificationRead = useCallback((n: SystemNotification) => {
    if (n.read) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setBadges((prev) => ({ ...prev, [n.appId]: Math.max(0, (prev[n.appId] ?? 1) - 1) }));
  }, []);

  const [pendingDeepLink, setPendingDeepLink] = useState<{
    appId: string;
    targetId?: string;
    ts: number;
  } | null>(null);

  const consumeDeepLink = useCallback(() => setPendingDeepLink(null), []);

  const openNotification = useCallback(
    (n: SystemNotification) => {
      markNotificationRead(n);
      setPendingDeepLink({ appId: n.appId, targetId: n.targetId ?? n.id, ts: Date.now() });
    },
    [markNotificationRead]
  );

  const setBadge = useCallback((appId: string, count: number) => {
    setBadges((prev) => ({ ...prev, [appId]: count }));
  }, []);

  // ---- Settings ----
  const updateSettings = useCallback((patch: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const isAppNotifEnabled = useCallback(
    (appId: string) => settings.appNotifs[appId] !== false,
    [settings.appNotifs]
  );

  // ---- Effective appearance ----
  // Default is light. 'auto' (off unless the user picks it) tracks clock hour.
  const isDark = useMemo(() => {
    if (settings.appearance === 'dark') return true;
    if (settings.appearance === 'light') return false;
    return clockHour >= 19 || clockHour < 7; // auto: night hours
  }, [settings.appearance, clockHour]);

  // Keep legacy darkMode flag in sync for existing consumers
  useEffect(() => {
    setSettings((prev) => (prev.darkMode === isDark ? prev : { ...prev, darkMode: isDark }));
  }, [isDark]);

  // ---- Ninja campaign (shared between Instagram and X) ----
  const [ninjaCampaign, setNinjaCampaign] = useState<NinjaCampaign>(DEFAULT_CAMPAIGN);
  const [ninjaProfile, setNinjaProfile] = useState<NinjaProfile>(DEFAULT_NINJA_PROFILE);

  useEffect(() => {
    const storedCampaign = loadJSON<NinjaCampaign | null>('ninja-campaign', null);
    // The campaign hashtag is locked: always use the current one (overrides older saved values)
    if (storedCampaign) setNinjaCampaign({ ...DEFAULT_CAMPAIGN, ...storedCampaign, hashtag: NINJA_HASHTAG });
    const storedProfile = loadJSON<NinjaProfile | null>('ninja-profile', null);
    if (storedProfile) setNinjaProfile({ ...DEFAULT_NINJA_PROFILE, ...storedProfile });
  }, []);

  useEffect(() => saveJSON('ninja-campaign', ninjaCampaign), [ninjaCampaign]);
  useEffect(() => saveJSON('ninja-profile', ninjaProfile), [ninjaProfile]);

  const updateNinjaCampaign = useCallback((patch: Partial<NinjaCampaign>) => {
    setNinjaCampaign((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateNinjaProfile = useCallback((patch: Partial<NinjaProfile>) => {
    setNinjaProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  // ---- Wallpaper operations ----
  const setWallpaper = useCallback((target: WallpaperTarget, value: string) => {
    setWallpaperState((prev) => ({
      ...prev,
      home: target === 'lock' ? prev.home : value,
      lock: target === 'home' ? prev.lock : value,
    }));
  }, []);

  const updateWallpaperMeta = useCallback(
    (patch: Partial<Omit<WallpaperState, 'home' | 'lock'>>) => {
      setWallpaperState((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const addUploadedWallpaper = useCallback((dataUri: string) => {
    setUploadedWallpapers((prev) => {
      if (prev.includes(dataUri)) return prev;
      return [dataUri, ...prev].slice(0, 12);
    });
  }, []);

  const removeUploadedWallpaper = useCallback((dataUri: string) => {
    setUploadedWallpapers((prev) => prev.filter((u) => u !== dataUri));
  }, []);

  // ---- Home screen arrangement ----
  const moveAppToPage = useCallback((appId: string, page: number, index?: number) => {
    setHomePages((pages) => {
      const next = pages.map((p) => p.filter((id) => id !== appId));
      if (next[page]) {
        if (index == null || index >= next[page].length) next[page].push(appId);
        else next[page].splice(index, 0, appId);
      }
      return next;
    });
  }, []);

  const reorderAppOnPage = useCallback(
    (page: number, fromIndex: number, toIndex: number) => {
      setHomePages((pages) => {
        const next = [...pages];
        const p = [...next[page]];
        const [moved] = p.splice(fromIndex, 1);
        p.splice(toIndex, 0, moved);
        next[page] = p;
        return next;
      });
    },
    []
  );

  const removeApp = useCallback((appId: string) => {
    setHomePages((pages) => pages.map((p) => p.filter((id) => id !== appId)));
    setRemovedApps((prev) => [...prev, appId]);
  }, []);

  const restoreApp = useCallback((appId: string) => {
    setRemovedApps((prev) => prev.filter((id) => id !== appId));
    setHomePages((pages) => {
      if (pages.some((p) => p.includes(appId))) return pages;
      const next = pages.map((p) => [...p]);
      if (next.length === 0) {
        next.push([appId]);
        return next;
      }
      const last = next[next.length - 1];
      if (last.length >= APPS_PER_PAGE) next.push([appId]);
      else last.push(appId);
      return next;
    });
  }, []);

  return (
    <SystemContext.Provider
      value={{
        contacts,
        addContact,
        updateContact,
        deleteContact,
        toggleFavorite,
        notifications,
        addNotification,
        banner,
        dismissBanner,
        dismissNotification,
        clearNotifications,
        markNotificationRead,
        openNotification,
        pendingDeepLink,
        consumeDeepLink,
        badges,
        setBadge,
        settings,
        updateSettings,
        isAppNotifEnabled,
        isDark,
        wallpaper,
        uploadedWallpapers,
        setWallpaper,
        updateWallpaperMeta,
        addUploadedWallpaper,
        removeUploadedWallpaper,
        homePages,
        moveAppToPage,
        reorderAppOnPage,
        removeApp,
        restoreApp,
        removedApps,
        locked,
        setLocked,
        ninjaCampaign,
        updateNinjaCampaign,
        ninjaProfile,
        updateNinjaProfile,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used within SystemProvider');
  return ctx;
}

/** Build a CSS backgroundImage value that works for gradients AND uploaded images */
export function wallpaperCss(w: string): string {
  if (w.startsWith('data:') || w.startsWith('url(')) {
    return w.startsWith('url(') ? w : `url(${w})`;
  }
  return w;
}
