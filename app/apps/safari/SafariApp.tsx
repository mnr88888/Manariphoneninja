'use client';

import { useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Globe,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { usePersistentState, uid } from '../shared/utils';

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex?: number;
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

const GOOGLE_HOME = 'https://www.google.com/webhp?igu=1';
const googleSearch = (query: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(query.trim())}&igu=1`;
const titleFor = (url: string) => {
  try {
    const parsed = new URL(url);
    const query = parsed.searchParams.get('q');
    return query ? `بحث: ${query}` : 'Google';
  } catch {
    return 'Google';
  }
};

export default function SafariApp() {
  const [tabs, setTabs] = usePersistentState<Tab[]>('safari-tabs', [
    { id: 't1', url: GOOGLE_HOME, title: 'Google', history: [GOOGLE_HOME], historyIndex: 0 },
  ]);
  const [activeTabId, setActiveTabId] = useState('t1');
  const [showTabs, setShowTabs] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('safari-history', []);
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>('safari-bookmarks', []);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const currentUrl = activeTab?.url ?? GOOGLE_HOME;

  const navigate = (input: string) => {
    const value = input.trim();
    if (!value) return;
    const isWebUrl = /^(https?:\/\/|www\.)/i.test(value) || /^[\w-]+\.[a-z]{2,}/i.test(value);
    const url = isWebUrl
      ? (value.startsWith('http') ? value : `https://${value}`)
      : googleSearch(value);
    const title = isWebUrl ? titleFor(url) : `بحث: ${value}`;
    setTabs((prev) => prev.map((tab) => {
      if (tab.id !== activeTabId) return tab;
      const nextHistory = [...tab.history.slice(0, (tab.historyIndex ?? tab.history.length - 1) + 1), url];
      return { ...tab, url, title, history: nextHistory, historyIndex: nextHistory.length - 1 };
    }));
    setHistory((prev) => [
      { id: uid(), url, title, timestamp: Date.now() },
      ...prev.filter((entry) => entry.url !== url),
    ].slice(0, 30));
    setAddressInput('');
  };

  const moveHistory = (direction: -1 | 1) => {
    if (!activeTab) return;
    const index = activeTab.historyIndex ?? activeTab.history.length - 1;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= activeTab.history.length) return;
    const url = activeTab.history[nextIndex];
    setTabs((prev) => prev.map((tab) => tab.id === activeTabId
      ? { ...tab, url, title: titleFor(url), historyIndex: nextIndex }
      : tab));
  };

  const newTab = () => {
    const tab: Tab = { id: uid(), url: GOOGLE_HOME, title: 'Google', history: [GOOGLE_HOME], historyIndex: 0 };
    setTabs((prev) => [...prev, tab]);
    setActiveTabId(tab.id);
    setShowTabs(false);
  };

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((tab) => tab.id !== id);
      if (!next.length) {
        const tab: Tab = { id: uid(), url: GOOGLE_HOME, title: 'Google', history: [GOOGLE_HOME], historyIndex: 0 };
        setActiveTabId(tab.id);
        return [tab];
      }
      if (id === activeTabId) setActiveTabId(next[0].id);
      return next;
    });
  };

  const openExternal = () => {
    if (typeof window !== 'undefined') window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  if (showTabs) return (
    <div className="absolute inset-0 flex flex-col bg-[#1c1c1e]">
      <div className="h-12 shrink-0" />
      <div className="no-scrollbar flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-4">
          {tabs.map((tab) => (
            <div key={tab.id} className={`relative overflow-hidden rounded-[14px] border-2 ${tab.id === activeTabId ? 'border-white' : 'border-transparent'}`}>
              <button onClick={() => { setActiveTabId(tab.id); setShowTabs(false); }} className="flex h-32 w-full flex-col bg-white text-left">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1"><Lock className="h-2.5 w-2.5 text-gray-400" /><span className="truncate text-[9px] text-gray-500" dir="ltr">{tab.url}</span></div>
                <div className="flex flex-1 items-center justify-center"><span className="max-w-[90%] truncate text-lg font-bold text-gray-700">{tab.title}</span></div>
              </button>
              <button onClick={() => closeTab(tab.id)} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-[#2c2c2e] py-3 text-white"><button onClick={() => setShowTabs(false)}>تم</button><button onClick={newTab} className="flex items-center gap-1"><Plus className="h-4 w-4" />تبويب جديد</button></div>
    </div>
  );

  if (showBookmarks) return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />
      <div className="flex h-11 items-center justify-between px-4"><button onClick={() => setShowBookmarks(false)} className="text-[#007aff]">تم</button><h2 className="text-[17px] font-semibold">المفضلة والسجل</h2><div className="w-10" /></div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {bookmarks.length > 0 && <p className="px-4 pb-2 pt-4 text-xs font-semibold text-gray-500">المفضلة</p>}
        {bookmarks.map((bookmark) => <button key={bookmark.id} onClick={() => { navigate(bookmark.url); setShowBookmarks(false); }} className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-right"><span>{bookmark.title}</span><span className="max-w-[55%] truncate text-xs text-black/40" dir="ltr">{bookmark.url}</span></button>)}
        <p className="px-4 pb-2 pt-4 text-xs font-semibold text-gray-500">السجل</p>
        {history.map((entry) => <button key={entry.id} onClick={() => { navigate(entry.url); setShowBookmarks(false); }} className="flex w-full items-center justify-between border-b border-gray-100 px-4 py-3 text-right"><span>{entry.title}</span><span className="max-w-[55%] truncate text-xs text-black/40" dir="ltr">{entry.url}</span></button>)}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />
      <div className="relative flex-1 overflow-hidden bg-white">
        <iframe key={currentUrl} src={currentUrl} title={activeTab?.title ?? 'Google'} className="h-full w-full border-0" />
        <button onClick={openExternal} className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/70 px-3 py-2 text-xs text-white backdrop-blur-md"><Globe className="h-3.5 w-3.5" />فتح خارج Safari</button>
      </div>
      <div className="shrink-0 border-t border-white/60 bg-white/75 px-3 pb-2 pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2 rounded-[13px] border border-black/5 bg-black/[0.07] px-3 py-1.5"><Lock className="h-3.5 w-3.5 shrink-0 text-gray-500" /><input value={addressInput || currentUrl} onChange={(event) => setAddressInput(event.target.value)} onFocus={() => setAddressInput(currentUrl)} onKeyDown={(event) => { if (event.key === 'Enter') navigate(addressInput); }} className="w-full bg-transparent text-[13px] text-black outline-none" dir="ltr" /><Search className="h-4 w-4 shrink-0 text-gray-500" /></div>
        <button onClick={() => navigate('رمضان نينجا')} className="mb-2 w-full rounded-xl bg-[#007aff]/10 py-1.5 text-sm font-medium text-[#007aff]">رمضان نينجا</button>
        <div className="flex items-center justify-between px-1 text-[#007aff]"><button onClick={() => moveHistory(-1)}><ChevronLeft className="h-5 w-5" /></button><button onClick={() => moveHistory(1)}><ChevronRight className="h-5 w-5" /></button><button onClick={() => navigate(currentUrl)}><RotateCcw className="h-5 w-5" /></button><button onClick={() => setShowBookmarks(true)}><BookOpen className="h-5 w-5" /></button><button onClick={() => setShowTabs(true)}><Copy className="h-5 w-5" /></button><button onClick={newTab}><Plus className="h-5 w-5" /></button><button onClick={openExternal}><Share2 className="h-5 w-5" /></button></div>
      </div>
      <div className="flex shrink-0 justify-center bg-white/75 pb-1.5"><div className="h-[5px] w-36 rounded-full bg-black/80" /></div>
    </div>
  );
}
