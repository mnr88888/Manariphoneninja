'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Send, Search } from 'lucide-react';
import { useSystem } from '../../system/SystemContext';
import { useOS } from '../../OSContext';
import { SocialAppId, SocialThread, SOCIAL_KEYS, SOCIAL_SEEDS } from '../../system/inboxDelivery';
import { makeMessageId } from '../../system/storage';
import { formatArabicTime, usePersistentState } from './utils';

export default function SocialInbox({ appId, activity = false, onClose }: {
  appId: SocialAppId;
  activity?: boolean;
  onClose: () => void;
}) {
  const [threads, setThreads] = usePersistentState<SocialThread[]>(SOCIAL_KEYS[appId], SOCIAL_SEEDS[appId]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const { pendingDeepLink, consumeDeepLink, isDark, notifications, markNotificationRead, locked } = useSystem();
  const { activeApp, screenMode } = useOS();
  const thread = threads.find((t) => t.id === activeId);
  const accent = appId === 'instagram' ? '#833AB4' : '#1D9BF0';
  const text = isDark ? 'text-white' : 'text-black';
  const muted = isDark ? 'text-white/50' : 'text-black/50';
  const surface = isDark ? 'bg-[#181818]' : 'bg-white';
  const border = isDark ? 'border-white/10' : 'border-black/10';

  useEffect(() => {
    if (pendingDeepLink?.appId !== appId || activity) return;
    const target = pendingDeepLink.targetId;
    if (!target || !threads.some((t) => t.id === target)) return;
    setActiveId(target);
    setFocusMessageId(pendingDeepLink.messageId ?? null);
    consumeDeepLink();
  }, [pendingDeepLink, appId, threads, consumeDeepLink, activity]);

  useEffect(() => {
    if (!activeId || activeApp !== appId || screenMode !== 'app' || locked) return;
    if (thread?.messages.some((m) => m.sender === 'them' && !m.read)) {
      setThreads((prev) => prev.map((t) => t.id === activeId ? { ...t, messages: t.messages.map((m) => ({ ...m, read: true })) } : t));
    }
    notifications.filter((n) => n.appId === appId && n.targetId === activeId && !n.read).forEach(markNotificationRead);
  }, [activeId, thread, activeApp, screenMode, locked, appId, notifications, markNotificationRead, setThreads]);

  useEffect(() => {
    const node = focusMessageId ? Array.from(container.current?.querySelectorAll<HTMLElement>('[data-message-id]') ?? []).find((e) => e.dataset.messageId === focusMessageId) : null;
    if (node) node.scrollIntoView({ block: 'center' });
    else bottom.current?.scrollIntoView({ block: 'end' });
  }, [thread?.messages.length, activeId, focusMessageId]);

  const send = () => {
    if (!thread || !draft.trim()) return;
    const message = { id: makeMessageId('outgoing'), text: draft.trim(), sender: 'me' as const, timestamp: Date.now(), read: true };
    setThreads((prev) => prev.map((t) => t.id === thread.id ? { ...t, messages: [...t.messages, message] } : t));
    setDraft('');
    setFocusMessageId(null);
  };

  return (
    <section className={`flex min-h-0 flex-1 flex-col ${surface} ${text}`} dir="rtl" data-inbox-app={appId}>
      <header className={`flex shrink-0 items-center gap-3 border-b px-4 py-3 ${border}`}>
        <button aria-label="رجوع للمحادثات" onClick={() => thread ? setActiveId(null) : onClose()}><ArrowRight size={21} /></button>
        {thread && <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: thread.color }}>{thread.name[0]}</span>}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[16px] font-bold">{thread?.name ?? (activity ? 'النشاط والرسائل الجديدة' : 'الرسائل')}</h2>
          {thread && <p className={`text-[10px] ${muted}`}>محادثة مباشرة</p>}
        </div>
      </header>
      {!thread ? <>
        <label className={`mx-4 my-3 flex items-center gap-2 rounded-xl px-3 py-2 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
          <Search size={17} className={muted} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث في المحادثات" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </label>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-8">
          {[...threads].sort((a, b) => (b.messages.at(-1)?.timestamp ?? 0) - (a.messages.at(-1)?.timestamp ?? 0)).filter((t) => t.name.includes(search) || t.messages.some((m) => m.text.includes(search))).map((t) => {
            const last = t.messages.at(-1);
            const unread = t.messages.filter((m) => m.sender === 'them' && !m.read).length;
            return <button key={t.id} data-thread-id={t.id} onClick={() => { setActiveId(t.id); setFocusMessageId(null); }} className={`flex w-full items-center gap-3 border-b px-4 py-4 text-right ${border}`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white" style={{ background: t.color }}>{t.name[0]}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2"><b className="truncate text-[14px]">{t.name}</b><span className={`text-[10px] ${muted}`}>{last && formatArabicTime(last.timestamp)}</span></span>
                <span className={`mt-1 block truncate text-[12px] ${muted}`}>{last?.sender === 'me' ? 'أنت: ' : ''}{last?.text}</span>
              </span>
              {unread > 0 && <span className="rounded-full px-2 py-0.5 text-[11px] text-white" style={{ background: accent }}>{unread}</span>}
            </button>;
          })}
        </div>
      </> : <>
        <div ref={container} className="no-scrollbar flex-1 overflow-y-auto px-4 py-4">
          {thread.messages.map((m) => <div key={m.id} data-message-id={m.id} className={`mb-3 flex ${m.sender === 'me' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.sender === 'me' ? 'text-white' : isDark ? 'bg-white/10' : 'bg-black/5'}`} style={m.sender === 'me' ? { background: accent } : undefined}>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{m.text}</p>
              <p className="mt-1 text-left text-[10px] opacity-60">{formatArabicTime(m.timestamp)}</p>
            </div>
          </div>)}
          <div ref={bottom} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className={`flex shrink-0 items-center gap-2 border-t px-3 pb-7 pt-3 ${border}`}>
          <input aria-label="اكتب رسالة" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="اكتب رسالة..." className={`min-w-0 flex-1 rounded-full px-4 py-2 text-sm outline-none ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
          <button aria-label="إرسال الرسالة" disabled={!draft.trim()} className="rounded-full p-2 text-white disabled:opacity-40" style={{ background: accent }}><Send size={18} /></button>
        </form>
      </>}
    </section>
  );
}
