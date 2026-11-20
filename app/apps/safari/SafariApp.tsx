'use client';

import { useState } from 'react';
import {
  Shield,
  RotateCcw,
  Share2,
  Copy,
  BookOpen,
  Plus,
  X,
  Search,
  Lock,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { usePersistentState, uid, formatArabicTime } from '../shared/utils';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
}

interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

interface Bookmark {
  id: string;
  url: string;
  title: string;
}

const SAMPLE_SITES: Record<
  string,
  { title: string; content: React.ReactNode }
> = {
  'google.com': {
    title: 'جوجل',
    content: (
      <div className="flex flex-col items-center pt-20">
        <p className="text-4xl font-bold">
          <span className="text-[#4285F4]">ج</span>
          <span className="text-[#EA4335]">و</span>
          <span className="text-[#FBBC05]">ج</span>
          <span className="text-[#4285F4]">ل</span>
          <span className="text-[#34A853]">e</span>
        </p>
        <div className="mt-8 w-4/5 rounded-full border border-gray-300 px-4 py-3">
          <p className="text-sm text-gray-500">ابحث في جوجل أو اكتب رابطاً</p>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="rounded bg-gray-100 px-4 py-2 text-sm">بحث</button>
          <button className="rounded bg-gray-100 px-4 py-2 text-sm">ضحأة</button>
        </div>
      </div>
    ),
  },
  'ar.wikipedia.org': {
    title: 'ويكيبيديا',
    content: (
      <div className="p-4">
        <h1 className="border-b border-gray-300 pb-2 text-2xl font-serif">
          الموسوعة الحرة
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-gray-800">
          ويكيبيديا هي موسوعة عالمية متعددة اللغات، مفتوحة المحتوى، يعمل عليها
          المتطوعون من جميع أنحاء العالم. تضم أكثر من ٦ ملايين مقالة بالعربية
          والإنجليزية وغيرها من اللغات.
        </p>
        <div className="mt-4 space-y-2">
          {['السعودية', 'تاريخ الجزيرة العربية', 'اللغة العربية'].map((s) => (
            <div
              key={s}
              className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#3366CC]"
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'aljazeera.net': {
    title: 'الجزيرة نت',
    content: (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-[#FA9000]">الجزيرة نت</h1>
        <div className="mt-4 space-y-3">
          {[
            'أخبار عاجلة: تطورات جديدة في المنطقة',
            'اقتصاد: ارتفاع أسعار النفط هذا الأسبوع',
            'تقنية: إطلاق منتجات ذكية جديدة',
            'رياضة: نتائج مباريات اليوم',
          ].map((headline) => (
            <div key={headline} className="border-b border-gray-100 pb-2">
              <p className="text-[15px] font-semibold text-gray-900">{headline}</p>
              <p className="mt-1 text-xs text-gray-500">
                نشرة إخبارية · قبل ساعة
              </p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'sahm.sa': {
    title: 'سهم',
    content: (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Globe className="h-16 w-16 text-[#007AFF]" />
        <h2 className="text-xl font-bold text-gray-900">موقع سهم</h2>
        <p className="text-sm text-gray-600">
          هذه صفحة ويب محاكاة لأغراض العرض. لا يتم الاتصال بأي خادم حقيقي.
        </p>
        <button className="rounded-full bg-[#007AFF] px-6 py-2 text-sm text-white">
          تصفح الموقع
        </button>
      </div>
    ),
  },
};

export default function SafariApp() {
  const [tabs, setTabs] = usePersistentState<Tab[]>('safari-tabs', [
    { id: 't1', url: 'google.com', title: 'جوجل', history: ['google.com'] },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('t1');
  const [showTabs, setShowTabs] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('safari-history', []);
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>(
    'safari-bookmarks',
    [
      { id: 'b1', url: 'ar.wikipedia.org', title: 'ويكيبيديا' },
      { id: 'b2', url: 'aljazeera.net', title: 'الجزيرة' },
    ]
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  const normalizeUrl = (input: string) => {
    const trimmed = input.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (SAMPLE_SITES[trimmed]) return trimmed;
    // Find matching site by title or partial url
    const match = Object.keys(SAMPLE_SITES).find(
      (k) => k.includes(trimmed) || trimmed.includes(k.split('.')[0])
    );
    return match ?? 'sahm.sa';
  };

  const navigate = (input: string) => {
    if (!input.trim()) return;
    const url = normalizeUrl(input);
    const title = SAMPLE_SITES[url]?.title ?? url;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? { ...t, url, title, history: [...t.history, url] }
          : t
      )
    );
    setHistory((prev) => [
      { id: uid(), url, title, timestamp: Date.now() },
      ...prev.filter((h) => h.url !== url),
    ].slice(0, 20));
    setAddressInput('');
  };

  const newTab = () => {
    const t: Tab = {
      id: uid(),
      url: 'google.com',
      title: 'جوجل',
      history: ['google.com'],
    };
    setTabs((prev) => [...prev, t]);
    setActiveTabId(t.id);
    setShowTabs(false);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const t: Tab = { id: uid(), url: 'google.com', title: 'جوجل', history: ['google.com'] };
        setActiveTabId(t.id);
        return [t];
      }
      if (id === activeTabId) setActiveTabId(next[0].id);
      return next;
    });
  };

  const site = activeTab ? SAMPLE_SITES[activeTab.url] : null;

  /* ---------- Tabs view ---------- */
  if (showTabs) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#1C1C1E]">
        <div className="h-12 shrink-0" />
        <div className="no-scrollbar flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTabId(t.id);
                  setShowTabs(false);
                }}
                className={`relative overflow-hidden rounded-[14px] border-2 ${
                  t.id === activeTabId ? 'border-white' : 'border-transparent'
                }`}
              >
                <div className="flex h-32 flex-col bg-white">
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1">
                    <Lock className="h-2.5 w-2.5 text-gray-400" />
                    <span className="truncate text-[9px] text-gray-500">
                      {t.url}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-center">
                    <span className="text-lg font-bold text-gray-700">
                      {t.title}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(t.id);
                  }}
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-[#2C2C2E] py-3 text-white">
          <button onClick={() => setShowTabs(false)} className="text-sm">
            تم
          </button>
          <button onClick={newTab} className="flex items-center gap-1 text-sm">
            <Plus className="h-4 w-4" />
            تبويب جديد
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Bookmarks view ---------- */
  if (showBookmarks) {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="h-12 shrink-0" />
        <div className="flex h-11 items-center justify-between px-4">
          <button
            onClick={() => setShowBookmarks(false)}
            className="text-[17px] text-[#007AFF]"
          >
            تم
          </button>
          <h2 className="text-[17px] font-semibold">المفضلة</h2>
          <div className="w-10" />
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto">
          {bookmarks.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                navigate(b.url);
                setShowBookmarks(false);
              }}
              className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-right"
            >
              <span className="text-[15px] text-black">{b.title}</span>
              <span className="text-[12px] text-black/40" dir="ltr">
                {b.url}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Browser view ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />

      {/* Page content */}
      <div className="no-scrollbar flex-1 overflow-y-auto bg-white">
        {site ? (
          site.content
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            صفحة غير متوفرة
          </div>
        )}
      </div>

      {/* Address bar */}
      <div className="shrink-0 border-t border-gray-200 bg-[#F8F8F8] px-3 py-2">
        <div className="mb-2 flex items-center gap-3 rounded-[12px] bg-gray-200/70 px-3 py-1.5">
          <Lock className="h-3.5 w-3.5 text-gray-500" />
          <input
            value={addressInput || activeTab?.url}
            onChange={(e) => setAddressInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') navigate(addressInput);
            }}
            onFocus={() => setAddressInput('')}
            placeholder="ابحث أو أدخل رابط الموقع"
            className="w-full bg-transparent text-[14px] text-black placeholder-gray-400 outline-none"
            dir="ltr"
          />
        </div>
        <div className="flex items-center justify-between px-2 text-[#007AFF]">
          <button onClick={() => setShowBookmarks(true)}>
            <BookOpen className="h-5 w-5" />
          </button>
          <button onClick={() => navigate(activeTab?.url ?? '')}>
            <RotateCcw className="h-5 w-5" />
          </button>
          <button onClick={() => setShowTabs(true)}>
            <Copy className="h-5 w-5" />
          </button>
          <button onClick={newTab}>
            <Plus className="h-5 w-5" />
          </button>
          <button>
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 justify-center bg-[#F8F8F8] pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}
