'use client';

import { useSystem, WALLPAPER_GALLERY } from '../../system/SystemContext';
import { Section, ListRow, SearchBar } from '../shared/AppShell';
import { useRef, useState } from 'react';
import { APPS } from '../../apps/registry';
import {
  Wifi,
  Bluetooth,
  Plane,
  Moon,
  Sun,
  Monitor,
  Volume2,
  Bell,
  Battery,
  Globe,
  Lock,
  Image as ImageIcon,
  Info,
  ChevronLeft,
  Antenna,
  Focus,
  Home,
  RotateCcw,
  Upload,
  Trash2,
  Check,
  Sparkles,
  Eye,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { getApp } from '../../apps/registry';

type View =
  | 'root'
  | 'wifi'
  | 'bluetooth'
  | 'notifications'
  | 'sounds'
  | 'focus'
  | 'general'
  | 'display'
  | 'wallpaper'
  | 'battery'
  | 'privacy'
  | 'language'
  | 'homescreen'
  | 'about';

/**
 * iOS Settings app — every row opens a real, working page.
 */
export default function SettingsApp() {
  const {
    settings,
    updateSettings,
    wallpaper,
    setWallpaper,
    updateWallpaperMeta,
    uploadedWallpapers,
    addUploadedWallpaper,
    removeUploadedWallpaper,
    homePages,
    isDark,
    isAppNotifEnabled,
    notifications,
    clearNotifications,
  } = useSystem();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('root');
  const [subView, setSubView] = useState<View | null>(null);
  const [previewTarget, setPreviewTarget] = useState<'home' | 'lock' | 'both'>('both');
  const fileInput = useRef<HTMLInputElement>(null);

  const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-[#34C759]' : 'bg-black/20'}`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
          on ? 'left-0.5' : 'right-0.5'
        }`}
      />
    </button>
  );

  const PageHeader = ({ title }: { title: string }) => (
    <>
      <div className="h-12 shrink-0" />
      <div className="flex h-11 items-center px-4">
        <button onClick={() => setView('root')} className="flex items-center text-[17px] text-[#007AFF] active:opacity-60">
          <ChevronLeft className="h-6 w-6" />
          رجوع
        </button>
      </div>
      <h2 className="px-5 pb-3 text-center text-lg font-semibold">{title}</h2>
    </>
  );

  const handleUpload = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('الرجاء اختيار صورة بصيغة JPG أو PNG أو WEBP');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      addUploadedWallpaper(dataUri);
      setWallpaper(previewTarget, dataUri);
    };
    reader.readAsDataURL(file);
  };

  // ---------- ROOT ----------
  if (view === 'root') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <div className="h-12 shrink-0" />
        <h1 className="px-5 pb-2 text-3xl font-bold text-black">الإعدادات</h1>
        <div className="px-4 pb-2">
          <SearchBar value={search} onChange={setSearch} placeholder="بحث" />
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow
              icon={<Plane className="h-4 w-4" />}
              iconBg="bg-[#FF9F0A]"
              title="وضع الطيران"
              accessory={<Toggle on={settings.airplaneMode} onChange={(v) => updateSettings({ airplaneMode: v })} />}
              lastInSection
            />
          </Section>

          <Section>
            <ListRow icon={<Wifi className="h-4 w-4" />} iconBg="bg-[#007AFF]" title="واي فاي" value={settings.wifi ? 'مفعّل' : 'غير مفعّل'} showChevron onClick={() => setView('wifi')} />
            <ListRow icon={<Bluetooth className="h-4 w-4" />} iconBg="bg-[#007AFF]" title="بلوتوث" value={settings.bluetooth ? 'مفعّل' : 'غير مفعّل'} showChevron onClick={() => setView('bluetooth')} />
            <ListRow icon={<Antenna className="h-4 w-4" />} iconBg="bg-[#34C759]" title="بيانات الجوال" accessory={<Toggle on={settings.mobileData} onChange={(v) => updateSettings({ mobileData: v })} />} lastInSection />
          </Section>

          <Section>
            <ListRow icon={<Bell className="h-4 w-4" />} iconBg="bg-[#FF3B30]" title="الإشعارات" showChevron onClick={() => setView('notifications')} />
            <ListRow icon={<Volume2 className="h-4 w-4" />} iconBg="bg-[#FF3B30]" title="الأصوات واللمس" showChevron onClick={() => setView('sounds')} />
            <ListRow icon={<Focus className="h-4 w-4" />} iconBg="bg-[#5E5CE6]" title="التركيز" value={settings.focusMode ? 'مفعّل' : ''} showChevron onClick={() => setView('focus')} lastInSection />
          </Section>

          <Section>
            <ListRow icon={<Home className="h-4 w-4" />} iconBg="bg-[#0A84FF]" title="عام" showChevron onClick={() => setView('general')} />
            <ListRow icon={<Monitor className="h-4 w-4" />} iconBg="bg-[#007AFF]" title="العرض والسطوع" showChevron onClick={() => setView('display')} />
            <ListRow icon={<ImageIcon className="h-4 w-4" />} iconBg="bg-[#30D158]" title="الخلفية" showChevron onClick={() => setView('wallpaper')} />
            <ListRow icon={<Battery className="h-4 w-4" />} iconBg="bg-[#34C759]" title="البطارية" value="٨٧٪" showChevron onClick={() => setView('battery')} />
            <ListRow icon={<Lock className="h-4 w-4" />} iconBg="bg-[#5856D6]" title="الخصوصية والأمان" showChevron onClick={() => setView('privacy')} />
            <ListRow icon={<Globe className="h-4 w-4" />} iconBg="bg-[#007AFF]" title="اللغة والمنطقة" value="العربية" showChevron onClick={() => setView('language')} lastInSection />
          </Section>

          <Section>
            <ListRow icon={<Home className="h-4 w-4" />} iconBg="bg-[#5856D6]" title="الشاشة الرئيسية" showChevron onClick={() => setView('homescreen')} lastInSection />
          </Section>

          <Section>
            <ListRow icon={<Info className="h-4 w-4" />} iconBg="bg-[#8E8E93]" title="حول هذا الجهاز" showChevron onClick={() => setView('about')} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- WIFI ----------
  if (view === 'wifi') {
    const networks = ['شبكة المنزل', 'STC_Fiber_5G', 'مقهى الجوار', 'Zain-4G'];
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="واي فاي" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow title="واي فاي" accessory={<Toggle on={settings.wifi} onChange={(v) => updateSettings({ wifi: v })} />} lastInSection />
          </Section>
          {settings.wifi && (
            <Section header="الشبكات المتاحة">
              {networks.map((n, i) => (
                <ListRow key={n} title={n} accessory={i === 0 ? <Check className="h-4 w-4 text-[#007AFF]" /> : undefined} lastInSection={i === networks.length - 1} />
              ))}
            </Section>
          )}
        </div>
      </div>
    );
  }

  // ---------- BLUETOOTH ----------
  if (view === 'bluetooth') {
    const devices = ['سماعات AirPods Pro', 'سماعة السيارة', 'ساعة آبل'];
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="بلوتوث" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow title="بلوتوث" accessory={<Toggle on={settings.bluetooth} onChange={(v) => updateSettings({ bluetooth: v })} />} lastInSection />
          </Section>
          {settings.bluetooth && (
            <Section header="الأجهزة المقترنة">
              {devices.map((d, i) => (
                <ListRow key={d} title={d} accessory={<Check className="h-4 w-4 text-[#007AFF]" />} lastInSection={i === devices.length - 1} />
              ))}
            </Section>
          )}
        </div>
      </div>
    );
  }

  // ---------- NOTIFICATIONS (fully functional) ----------
  if (view === 'notifications') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="الإشعارات" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section header="إعدادات العرض">
            <ListRow title="إظهار على شاشة القفل" accessory={<Toggle on={settings.notifLockScreen} onChange={(v) => updateSettings({ notifLockScreen: v })} />} />
            <ListRow title="التنبيهات المنبثقة" accessory={<Toggle on={settings.notifBanners} onChange={(v) => updateSettings({ notifBanners: v })} />} />
            <ListRow title="إظهار المعاينات" accessory={<Toggle on={settings.notifPreviews} onChange={(v) => updateSettings({ notifPreviews: v })} />} />
            <ListRow title="تجميع الإشعارات" accessory={<Toggle on={settings.notifGrouped} onChange={(v) => updateSettings({ notifGrouped: v })} />} lastInSection />
          </Section>

          <Section header="الصوت والشارات">
            <ListRow title="صوت الإشعار" accessory={<Toggle on={settings.notifSound} onChange={(v) => updateSettings({ notifSound: v })} />} />
            <ListRow title="شارات التطبيقات" accessory={<Toggle on={settings.notifBadges} onChange={(v) => updateSettings({ notifBadges: v })} />} lastInSection />
          </Section>

          <Section header="التطبيقات">
            {APPS.filter((a) => !a.inDock)
              .map((app, i) => (
                  <ListRow
                    key={app.id}
                    icon={
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={app.imageIcon} alt="" className="h-full w-full object-cover" />
                    }
                    iconBg="bg-black/5 overflow-hidden"
                    title={app.name}
                    accessory={
                      <Toggle
                        on={isAppNotifEnabled(app.id)}
                        onChange={(v) => updateSettings({ appNotifs: { ...settings.appNotifs, [app.id]: v } })}
                      />
                    }
                    lastInSection={i === APPS.filter((a) => !a.inDock).length - 1}
                  />
              ))}
          </Section>

          <Section header="استلام رسالة الآن" footer="اختاري التطبيق: تُضاف رسالة حقيقية إلى صندوقه أولًا، ثم يظهر إشعارها.">
            {APPS.filter((app) => ['whatsapp', 'mail', 'messages', 'instagram', 'x', 'ninja'].includes(app.id)).map((app, index) => (
              <ListRow key={app.id} title={`رسالة من ${app.name}`} showChevron onClick={() => window.dispatchEvent(new CustomEvent('simulator-deliver-message', { detail: { appId: app.id } }))} lastInSection={index === 5} />
            ))}
          </Section>

          <Section header="الإشعارات الحالية">
            <ListRow title={notifications.length ? `${notifications.length} إشعار` : 'لا توجد إشعارات'} accessory={notifications.length > 0 ? <button onClick={clearNotifications} className="text-[13px] text-red-500">مسح الكل</button> : undefined} lastInSection />
          </Section>

          <Section header="الرسائل التلقائية في المحاكي" footer="تصل رسالة جديدة كل ١٠ ثوانٍ بالتناوب من واتساب والبريد والرسائل وإنستقرام وX ونينجا، وتُحفظ داخل التطبيق نفسه.">
            <ListRow title="الإشعارات المتنوعة تلقائيًا" accessory={<Toggle on={settings.autoNotifications !== false} onChange={(v) => updateSettings({ autoNotifications: v })} />} />
            <ListRow title="تضمين رسائل واتساب" accessory={<Toggle on={settings.whatsappAutoMessages !== false} onChange={(v) => updateSettings({ whatsappAutoMessages: v })} />} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- SOUNDS & HAPTICS ----------
  if (view === 'sounds') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="الأصوات واللمس" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section header="مستوى الصوت">
            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-black/40" />
                <input type="range" min={0} max={100} value={settings.volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
                <Volume2 className="h-6 w-6 text-black" />
              </div>
            </div>
          </Section>
          <Section header="ردود اللمس">
            <ListRow title="ردود لمس النظام" accessory={<Toggle on={settings.hapticsEnabled} onChange={(v) => updateSettings({ hapticsEnabled: v })} />} />
            <ListRow title="أصوات النظام" accessory={<Toggle on={settings.soundsEnabled} onChange={(v) => updateSettings({ soundsEnabled: v })} />} />
            <ListRow title="صوت لوحة المفاتيح" accessory={<Toggle on={settings.keyboardClicks} onChange={(v) => updateSettings({ keyboardClicks: v })} />} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- FOCUS ----------
  if (view === 'focus') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="التركيز" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section footer="عند تفعيل وضع التركيز، تُخفى الإشعارات الجديدة حتى إيقافه.">
            <ListRow icon={<Focus className="h-4 w-4" />} iconBg="bg-[#5E5CE6]" title="عدم الإزعاج" accessory={<Toggle on={settings.focusMode} onChange={(v) => updateSettings({ focusMode: v })} />} lastInSection />
          </Section>
          <Section header="خيارات سريعة">
            <ListRow title="وضع الطيران" accessory={<Toggle on={settings.airplaneMode} onChange={(v) => updateSettings({ airplaneMode: v })} />} />
            <ListRow title="قفل التدوير" accessory={<Toggle on={settings.rotationLock} onChange={(v) => updateSettings({ rotationLock: v })} />} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- GENERAL ----------
  if (view === 'general') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="عام" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow title="حول هذا الجهاز" showChevron onClick={() => setSubView('about')} />
            <ListRow title="اللغة والمنطقة" value="العربية" showChevron onClick={() => setSubView('language')} lastInSection />
          </Section>
          <Section header="مظهر النظام">
            <ListRow title="العرض والسطوع" showChevron onClick={() => setSubView('display')} />
            <ListRow title="الخلفية" showChevron onClick={() => setSubView('wallpaper')} lastInSection />
          </Section>
        </div>
        {subView === 'about' && <AboutSheet onClose={() => setSubView(null)} />}
        {subView === 'language' && <LanguageSheet onClose={() => setSubView(null)} />}
      </div>
    );
  }

  // ---------- DISPLAY & BRIGHTNESS ----------
  if (view === 'display') {
    const appearances = [
      { id: 'light' as const, label: 'فاتح', icon: <Sun className="h-4 w-4" /> },
      { id: 'dark' as const, label: 'داكن', icon: <Moon className="h-4 w-4" /> },
      { id: 'auto' as const, label: 'تلقائي', icon: <Sparkles className="h-4 w-4" /> },
    ];
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="العرض والسطوع" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section header="السطوع">
            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-black/40" />
                <input type="range" min={20} max={100} value={settings.brightness} onChange={(e) => updateSettings({ brightness: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
                <Sun className="h-6 w-6 text-black" />
              </div>
            </div>
          </Section>

          <Section header="المظهر">
            {appearances.map((a, i) => (
              <ListRow
                key={a.id}
                icon={a.icon}
                iconBg="bg-[#5856D6]"
                title={a.label}
                value={a.id === 'auto' ? 'ليلًا ونهارًا' : undefined}
                accessory={settings.appearance === a.id ? <Check className="h-4 w-4 text-[#007AFF]" /> : undefined}
                onClick={() => updateSettings({ appearance: a.id })}
                lastInSection={i === appearances.length - 1}
              />
            ))}
          </Section>

          <Section header="مظهر الأيقونات" footer="يُطبق على كل أيقونات الشاشة الرئيسية. في الوضع التلقائي تتبع الأيقونات مظهر النظام.">
            {([
              { id: 'light' as const, label: 'فاتح' },
              { id: 'dark' as const, label: 'داكن' },
              { id: 'tinted' as const, label: 'ملوّن' },
              { id: 'auto' as const, label: 'تلقائي' },
            ]).map((m, i) => (
              <ListRow
                key={m.id}
                title={m.label}
                accessory={settings.iconAppearance === m.id ? <Check className="h-4 w-4 text-[#007AFF]" /> : undefined}
                onClick={() => updateSettings({ iconAppearance: m.id })}
                lastInSection={i === 3}
              />
            ))}
          </Section>

          <Section header="الصوت">
            <div className="bg-white px-4 py-4">
              <div className="flex items-center gap-3">
                <Volume2 className="h-5 w-5 text-black/40" />
                <input type="range" min={0} max={100} value={settings.volume} onChange={(e) => updateSettings({ volume: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
                <Volume2 className="h-6 w-6 text-black" />
              </div>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  // ---------- WALLPAPER (gallery + upload + preview) ----------
  if (view === 'wallpaper') {
    const groups = Array.from(new Set(WALLPAPER_GALLERY.map((w) => w.group)));
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="الخلفية" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          {/* Target selector */}
          <Section header="تطبيق على">
            <div className="flex gap-2 bg-white p-3">
              {(
                [
                  { id: 'both' as const, label: 'كل الشاشات' },
                  { id: 'home' as const, label: 'الرئيسية فقط' },
                  { id: 'lock' as const, label: 'القفل فقط' },
                ]
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPreviewTarget(t.id)}
                  className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${
                    previewTarget === t.id ? 'bg-[#007AFF] text-white' : 'bg-black/5 text-black/60'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Upload */}
          <Section header="صورة من جهازك">
            <div className="bg-white p-4">
              <input ref={fileInput} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
              <button
                onClick={() => fileInput.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/15 py-6 text-[14px] font-semibold text-black/60 active:bg-black/5"
              >
                <Upload className="h-5 w-5" />
                اختر صورة (JPG · PNG · WEBP)
              </button>
              {uploadedWallpapers.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {uploadedWallpapers.map((u) => (
                    <div key={u.slice(-30)} className="relative">
                      <button onClick={() => setWallpaper(previewTarget, u)} className="block w-full overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={u} alt="خلفية مرفوعة" className="h-20 w-full object-cover" />
                      </button>
                      <button
                        onClick={() => removeUploadedWallpaper(u)}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Adjustments */}
          <Section header="تعديل الخلفية">
            <div className="flex flex-col gap-3 bg-white px-4 py-4">
              <div>
                <p className="pb-1 text-[13px] text-black/60">تكبير ({wallpaper.scale}٪)</p>
                <input type="range" min={100} max={160} value={wallpaper.scale} onChange={(e) => updateWallpaperMeta({ scale: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
              </div>
              <div>
                <p className="pb-1 text-[13px] text-black/60">ضباب ({wallpaper.blur} بكسل)</p>
                <input type="range" min={0} max={20} value={wallpaper.blur} onChange={(e) => updateWallpaperMeta({ blur: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
              </div>
              <div>
                <p className="pb-1 text-[13px] text-black/60">الموضع الأفقي</p>
                <input type="range" min={0} max={100} value={wallpaper.positionX} onChange={(e) => updateWallpaperMeta({ positionX: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
              </div>
              <div>
                <p className="pb-1 text-[13px] text-black/60">الموضع العمودي</p>
                <input type="range" min={0} max={100} value={wallpaper.positionY} onChange={(e) => updateWallpaperMeta({ positionY: Number(e.target.value) })} className="w-full accent-[#007AFF]" />
              </div>
            </div>
          </Section>

          {/* Gallery by group */}
          {groups.map((g) => (
            <Section key={g} header={g}>
              <div className="grid grid-cols-2 gap-3 bg-white p-3">
                {WALLPAPER_GALLERY.filter((w) => w.group === g).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setWallpaper(previewTarget, w.css)}
                    className={`overflow-hidden rounded-[14px] border-4 transition ${wallpaper.home === w.css || wallpaper.lock === w.css ? 'border-[#007AFF]' : 'border-transparent'}`}
                  >
                    <div className="flex h-24 items-end justify-center pb-1.5" style={{ background: w.css }}>
                      <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] text-white">{w.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Section>
          ))}
        </div>
      </div>
    );
  }

  // ---------- BATTERY ----------
  if (view === 'battery') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="البطارية" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <div className="bg-white p-5 text-center">
              <p className="text-[48px] font-light text-black">٨٧٪</p>
              <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-black/10">
                <div className="h-full rounded-full bg-[#34C759]" style={{ width: '87%' }} />
              </div>
              <p className="mt-2 text-[13px] text-black/50">الوقت المتبقي التقريبي: ٩ ساعات</p>
            </div>
          </Section>
          <Section header="خيارات الطاقة">
            <ListRow title="وضع الطاقة المنخفضة" accessory={<Toggle on={settings.lowPowerMode} onChange={(v) => updateSettings({ lowPowerMode: v })} />} />
            <ListRow title="نسبة البطارية" accessory={<Toggle on={settings.showBatteryPercentage} onChange={(v) => updateSettings({ showBatteryPercentage: v })} />} />
            <ListRow title="سطوع تلقائي" accessory={<Toggle on onChange={() => {}} />} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- PRIVACY & SECURITY ----------
  if (view === 'privacy') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="الخصوصية والأمان" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section footer="هذا الجهاز محاكى — جميع البيانات محفوظة محليًا على جهازك فقط.">
            <ListRow icon={<ShieldCheck className="h-4 w-4" />} iconBg="bg-[#5856D6]" title="حماية الجهاز" value="مفعّلة" />
            <ListRow icon={<Eye className="h-4 w-4" />} iconBg="bg-[#0A84FF]" title="تتبع الإعلانات" accessory={<Toggle on={false} onChange={() => {}} />} />
            <ListRow icon={<Layers className="h-4 w-4" />} iconBg="bg-[#34C759]" title="تحليلات" accessory={<Toggle on={false} onChange={() => {}} />} lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- LANGUAGE ----------
  if (view === 'language') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="اللغة والمنطقة" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow title="اللغة" value="العربية" accessory={<Check className="h-4 w-4 text-[#007AFF]" />} />
            <ListRow title="المنطقة" value="السعودية" />
            <ListRow title="التقويم" value="الهجري / الميلادي" lastInSection />
          </Section>
          <p className="px-6 text-center text-xs text-black/40">اللغة الافتراضية للنظام هي العربية مع تخطيط كامل من اليمين لليسار.</p>
        </div>
      </div>
    );
  }

  // ---------- HOME SCREEN SETTINGS ----------
  if (view === 'homescreen') {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <PageHeader title="إعدادات الشاشة الرئيسية" />
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          <Section>
            <ListRow title="عدد الصفحات" value={`${homePages.length}`} />
            <ListRow title="ترتيب الأيقونات" value="مخصص" lastInSection />
          </Section>
        </div>
      </div>
    );
  }

  // ---------- ABOUT ----------
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
      <PageHeader title="حول" />
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <Section>
          <ListRow title="الاسم" value="آيفون" />
          <ListRow title="النظام" value="iOS 26" />
          <ListRow title="الموديل" value="آيفون ١٦ برو" />
          <ListRow title="السعة" value="٢٥٦ غيغابايت" />
          <ListRow title="اللغة" value="العربية" />
          <ListRow title="الاتجاه" value="من اليمين لليسار (RTL)" lastInSection />
        </Section>
        <p className="px-6 text-center text-xs text-black/40">هذا جهاز محاكى للعرض التعليمي فقط، وليس جهاز آبل حقيقي.</p>
      </div>
    </div>
  );
}

/* ---------- Sheets used from General ---------- */

function AboutSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex h-11 items-center px-4">
        <button onClick={onClose} className="flex items-center text-[17px] text-[#007AFF] active:opacity-60">
          <ChevronLeft className="h-6 w-6" />
          رجوع
        </button>
      </div>
      <h2 className="px-5 pb-3 text-center text-lg font-semibold">حول</h2>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <Section>
          <ListRow title="النظام" value="iOS 26" />
          <ListRow title="الموديل" value="آيفون ١٦ برو" lastInSection />
        </Section>
      </div>
    </div>
  );
}

function LanguageSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex h-11 items-center px-4">
        <button onClick={onClose} className="flex items-center text-[17px] text-[#007AFF] active:opacity-60">
          <ChevronLeft className="h-6 w-6" />
          رجوع
        </button>
      </div>
      <h2 className="px-5 pb-3 text-center text-lg font-semibold">اللغة والمنطقة</h2>
      <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <Section>
          <ListRow title="اللغة" value="العربية" accessory={<Check className="h-4 w-4 text-[#007AFF]" />} lastInSection />
        </Section>
      </div>
    </div>
  );
}
