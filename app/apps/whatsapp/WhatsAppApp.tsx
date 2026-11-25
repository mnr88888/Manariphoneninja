'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MessageCircle,
  Camera,
  Settings,
  Phone,
  Video,
  MoreVertical,
  Send,
  Mic,
  ArrowLeft,
  Plus,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  X,
  Trash2,
  Users,
} from 'lucide-react';
import { usePersistentState, formatArabicTime } from '../shared/utils';
import { useSystem } from '../../system/SystemContext';
import { useOS } from '../../OSContext';
import {
  type WAContact,
  type WAChat,
  SAMPLE_CONTACTS,
  SAMPLE_CHATS,
  HOUR,
  WA_CHATS_KEY,
  WA_CONTACTS_KEY,
  WA_STORE_EVENT,
  NINJA_CONTACT_ID,
  PROJECT_MEMBERS,
  ensureWhatsAppStore,
  updateWhatsAppChats,
  markWhatsAppChatRead,
  setActiveWhatsAppConversation,
  sendWhatsAppMessage,
  deliverWhatsAppReply,
} from '../../system/whatsappStore';

/* Types & sample data live in ../../system/whatsappStore (shared with the incoming-message engine) */

type WAView = 'chats' | 'chat' | 'calls' | 'status' | 'settings' | 'contact-info';

interface WARecentCall {
  id: string;
  contactId: string;
  type: 'in' | 'out' | 'missed';
  timestamp: number;
}

/* ============================================================
 * Main component
 * ============================================================ */

/** No mount-time autosave: initial samples can never overwrite engine messages. */
function useWhatsAppStore() {
  const [store, setStore] = useState<{ chats: WAChat[]; contacts: WAContact[] }>({
    chats: SAMPLE_CHATS, contacts: SAMPLE_CONTACTS,
  });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reload = () => {
      setStore(ensureWhatsAppStore());
      setReady(true);
    };
    const onChange = (event: Event) => {
      const key = (event as CustomEvent<{ key?: string }>).detail?.key;
      if (key === WA_CHATS_KEY || key === WA_CONTACTS_KEY) reload();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === WA_CHATS_KEY || event.key === WA_CONTACTS_KEY) reload();
    };
    window.addEventListener(WA_STORE_EVENT, onChange);
    window.addEventListener('wa-sim-message', reload);
    window.addEventListener('storage', onStorage);
    // Migrate before reading/loading. Register first so no commit is missed.
    reload();
    return () => {
      window.removeEventListener(WA_STORE_EVENT, onChange);
      window.removeEventListener('wa-sim-message', reload);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const setChats = useCallback((update: WAChat[] | ((chats: WAChat[]) => WAChat[])) => {
    const chats = updateWhatsAppChats(update);
    setStore((current) => ({ ...current, chats }));
  }, []);
  return { ...store, ready, setChats };
}

function ContactAvatar({ contact, size = 'list' }: { contact: WAContact; size?: 'header' | 'list' | 'info' }) {
  const sizing = size === 'info' ? 'h-20 w-20 text-2xl' : size === 'header' ? 'h-9 w-9 text-sm' : 'h-12 w-12 text-lg';
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${sizing}`}
      style={{ backgroundColor: contact.color }}>
      {contact.id === NINJA_CONTACT_ID || contact.kind === 'ninja' ? (
        // Existing local brand asset; no remote image or new asset required.
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/ninja.webp" alt="نينجا" className="h-full w-full object-cover" />
      ) : contact.kind === 'group' ? (
        <Users className={size === 'info' ? 'h-10 w-10' : size === 'header' ? 'h-5 w-5' : 'h-6 w-6'} aria-label="مجموعة" />
      ) : contact.name.charAt(0)}
    </div>
  );
}

export default function WhatsAppApp() {
  const { chats, contacts, ready, setChats } = useWhatsAppStore();
  const { pendingDeepLink, consumeDeepLink, setBadge, badges, settings, locked, notifications, markNotificationRead } = useSystem();
  const { openApp, activeApp, screenMode } = useOS();
  const [tab, setTab] = useState<'chats' | 'calls' | 'status' | 'settings'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [focusMessageId, setFocusMessageId] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [showAttach, setShowAttach] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [recentCalls, setRecentCalls] = usePersistentState<WARecentCall[]>(
    'wa-calls',
    [
      { id: 'r1', contactId: 'c1', type: 'in', timestamp: Date.now() - 2 * HOUR },
      { id: 'r2', contactId: 'c4', type: 'missed', timestamp: Date.now() - 5 * HOUR },
      { id: 'r3', contactId: 'c3', type: 'out', timestamp: Date.now() - 8 * HOUR },
    ]
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const replyTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const activeContact = activeChat
    ? contacts.find((c) => c.id === activeChat.contactId) ?? {
      id: activeChat.contactId, name: activeChat.name || 'جهة اتصال محفوظة', color: '#607D8B',
      kind: activeChat.isGroup ? 'group' as const : 'person' as const,
    }
    : null;
  const groupMembers = activeChat?.isGroup ? activeChat.participants ?? PROJECT_MEMBERS : [];

  useEffect(() => () => {
    replyTimers.current.forEach(clearTimeout);
    replyTimers.current.clear();
  }, []);

  useEffect(() => {
    const node = focusMessageId ? Array.from(messageListRef.current?.querySelectorAll<HTMLElement>('[data-message-id]') ?? []).find((e) => e.dataset.messageId === focusMessageId) : null;
    if (node) node.scrollIntoView({ block: 'center' });
    else messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages.length, activeChatId, focusMessageId]);

  useEffect(() => {
    if (recording) {
      recInterval.current = setInterval(
        () => setRecSeconds((s) => s + 1),
        1000
      );
    } else {
      if (recInterval.current) clearInterval(recInterval.current);
      setRecSeconds(0);
    }
    return () => {
      if (recInterval.current) clearInterval(recInterval.current);
    };
  }, [recording]);

  // Sync the system WhatsApp badge with real unread count
  const totalUnread = chats.reduce((s, c) => s + c.unread, 0);
  useEffect(() => {
    if (ready && badges.whatsapp !== totalUnread) {
      setBadge('whatsapp', totalUnread);
    }
  }, [ready, totalUnread, badges.whatsapp, setBadge]);

  // Deep link from Notification Center: open the exact conversation
  useEffect(() => {
    if (
      ready && pendingDeepLink &&
      pendingDeepLink.appId === 'whatsapp' &&
      pendingDeepLink.targetId
    ) {
      const chatId = pendingDeepLink.targetId;
      if (!chats.some((c) => c.id === chatId)) return;
      setFocusMessageId(pendingDeepLink.messageId ?? null);
      setTab('chats');
      setActiveChatId(chatId);
      setShowContactInfo(false);
      consumeDeepLink();
    }
  }, [pendingDeepLink, consumeDeepLink, setChats, chats, ready]);

  // The engine knows which conversation is genuinely visible (not just mounted).
  useEffect(() => {
    setActiveWhatsAppConversation(activeApp === 'whatsapp' && screenMode === 'app' && !locked ? activeChatId : null);
    return () => setActiveWhatsAppConversation(null);
  }, [activeChatId, activeApp, screenMode, locked]);

  // Includes newly incoming messages and cross-tab writes while the chat is open.
  useEffect(() => {
    if (!activeChatId || activeApp !== 'whatsapp' || screenMode !== 'app' || locked) return;
    if (activeChat?.unread) markWhatsAppChatRead(activeChatId);
    notifications.filter((n) => n.appId === 'whatsapp' && n.targetId === activeChatId && !n.read).forEach(markNotificationRead);
  }, [activeChatId, activeApp, screenMode, locked, activeChat?.unread, notifications, markNotificationRead]);

  const getContact = (id: string): WAContact => contacts.find((c) => c.id === id)
    ?? { id, name: chats.find((chat) => chat.contactId === id)?.name || 'جهة اتصال محفوظة', color: '#607D8B' };

  const sendMessage = (text: string, type: 'text' | 'voice' = 'text', duration?: number) => {
    if (!activeChatId) return;
    const chatId = activeChatId;
    setFocusMessageId(null);
    sendWhatsAppMessage(chatId, text, type, duration);
    // Capture the target, not component state. Shared delivery picks the right
    // group participant, Ninja-only promotion, or personal reply pool.
    const timer = setTimeout(() => {
      replyTimers.current.delete(timer);
      deliverWhatsAppReply(chatId, text);
    }, 1500 + Math.random() * 2000);
    replyTimers.current.add(timer);
  };

  const filteredChats = useMemo(() => {
    const sorted = [...chats].sort((a, b) =>
      (b.messages[b.messages.length - 1]?.timestamp ?? 0) - (a.messages[a.messages.length - 1]?.timestamp ?? 0));
    if (!search.trim()) return sorted;
    const s = search.trim();
    return sorted.filter((c) => {
      const contact = getContact(c.contactId);
      const inName = contact?.name.includes(s);
      const inMsg = c.messages.some((m) => m.text.includes(s));
      return inName || inMsg;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chats, search, contacts]);

  const lastMessage = (chat: WAChat) =>
    chat.messages[chat.messages.length - 1];

  /* ---------- Individual chat view ---------- */
  if (activeChat && activeContact) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#0B141A]">
        <div className="h-12 shrink-0" />

        {/* Chat header */}
        <div className="flex shrink-0 items-center gap-2 bg-[#202C33] px-2 py-2">
          <button
            onClick={() => {
              setActiveChatId(null);
              setShowContactInfo(false);
              setActiveWhatsAppConversation(null);
              setDraft('');
            }}
            className="text-white active:opacity-60"
          >
            <ArrowLeft className="h-5 w-5 rotate-180" />
          </button>
          <button
            onClick={() => setShowContactInfo(true)}
            className="flex flex-1 items-center gap-2 text-right"
          >
            <ContactAvatar contact={activeContact} size="header" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white">
                {activeContact.name}
              </p>
              <p className="truncate text-[11px] text-white/60">
                {activeChat.isGroup ? `٥ أعضاء · ${groupMembers.map((member) => member.id === 'me' ? 'أنتِ' : member.name).join('، ')}` : 'متصل الآن'}
              </p>
            </div>
          </button>
          <button className="p-1.5 text-white/80">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-1.5 text-white/80">
            <Phone className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={messageListRef} className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
          <div className="flex flex-col gap-1.5">
            {activeChat.messages.map((m) => (
              <div
                key={m.id}
                data-message-id={m.id}
                className={`flex ${m.sender === 'me' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[78%] rounded-[14px] px-3 py-2 ${
                    m.sender === 'me'
                      ? 'rounded-bl-sm bg-[#005C4B] text-white'
                      : 'rounded-br-sm bg-[#202C33] text-white'
                  }`}
                >
                  {activeChat.isGroup && (
                    <p className="mb-0.5 text-[11px] font-semibold"
                      style={{ color: groupMembers.find((member) => member.id === m.senderId)?.color || '#A78BFA' }}>
                      {m.sender === 'me' ? 'منار · أنتِ' : m.senderName || 'ريم'}
                    </p>
                  )}
                  {m.type === 'voice' ? (
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      <span className="text-[13px]">
                        رسالة صوتية · {m.duration} ثانية
                      </span>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-relaxed">{m.text}</p>
                  )}
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-white/50">
                      {formatArabicTime(m.timestamp)}
                    </span>
                    {m.sender === 'me' && (
                      <CheckCheck className="h-3.5 w-3.5 text-[#53BDEB]" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="shrink-0 bg-[#202C33] px-2 py-2">
          {showAttach && (
            <div className="mb-2 grid grid-cols-4 gap-2 rounded-[16px] bg-[#111B21] p-3">
              {[
                { label: 'صورة', color: '#A542E0', icon: <Camera className="h-5 w-5" /> },
                { label: 'كاميرا', color: '#FF3B30', icon: <Camera className="h-5 w-5" /> },
                { label: 'مستند', color: '#5E5CE6', icon: <Paperclip className="h-5 w-5" /> },
                { label: 'جهة اتصال', color: '#34C759', icon: <MessageCircle className="h-5 w-5" /> },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setShowAttach(false)}
                  className="flex flex-col items-center gap-1 rounded-[12px] bg-white/5 py-3 active:scale-95"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.icon}
                  </div>
                  <span className="text-[11px] text-white/80">{a.label}</span>
                </button>
              ))}
            </div>
          )}

          {recording ? (
            <div className="flex items-center gap-3 rounded-full bg-[#111B21] px-4 py-2.5">
              <button onClick={() => setRecording(false)} className="text-white/70">
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="flex flex-1 items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm text-white tabular-nums">
                  {Math.floor(recSeconds / 60)}:
                  {(recSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button
                onClick={() => {
                  sendMessage(`رسالة صوتية (${recSeconds} ثانية)`, 'voice', recSeconds);
                  setRecording(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowAttach((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111B21] text-white/70"
              >
                <Plus className="h-5 w-5" />
              </button>
              <div className="flex flex-1 items-center gap-2 rounded-full bg-[#111B21] px-4 py-2">
                <Smile className="h-5 w-5 shrink-0 text-white/50" />
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.trim()) {
                      sendMessage(draft.trim());
                      setDraft('');
                    }
                  }}
                  placeholder="اكتب رسالة"
                  className="w-full bg-transparent text-[14px] text-white placeholder-white/40 outline-none"
                  dir="rtl"
                />
                <Paperclip className="h-5 w-5 shrink-0 text-white/50" />
              </div>
              {draft.trim() ? (
                <button
                  onClick={() => {
                    sendMessage(draft.trim());
                    setDraft('');
                  }}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
                >
                  <Send className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => setRecording(true)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contact info sheet */}
        {showContactInfo && (
          <div
            className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50"
            onClick={() => setShowContactInfo(false)}
          >
            <div
              className="no-scrollbar max-h-[80%] overflow-y-auto rounded-t-[24px] bg-[#202C33] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center pb-6">
                <ContactAvatar contact={activeContact} size="info" />
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {activeContact.name}
                </h3>
                <p className="text-sm text-white/60">{activeContact.about}</p>
                {activeChat.isGroup && <p className="mt-1 text-sm text-[#25D366]">مجموعة · ٥ أعضاء</p>}
              </div>
              {activeChat.isGroup && (
                <div className="mb-4 border-t border-white/10 pt-4">
                  <p className="mb-3 text-sm font-semibold text-white/70">الأعضاء · ٥</p>
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 py-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: member.color }}>{member.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm text-white">{member.name}{member.id === 'me' ? ' (أنتِ)' : ''}</p>
                        <p className="text-[11px] text-white/50">{member.id === 'me' ? 'مشرفة المجموعة' : 'زميلة المشروع'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-around border-t border-white/10 pt-4 text-white/80">
                <button className="flex flex-col items-center gap-1 text-[#25D366]">
                  <Phone className="h-5 w-5" />
                  <span className="text-[11px]">اتصال</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#25D366]">
                  <Video className="h-5 w-5" />
                  <span className="text-[11px]">فيديو</span>
                </button>
                <button
                  onClick={() => setShowContactInfo(false)}
                  className="flex flex-col items-center gap-1 text-[#25D366]"
                >
                  <X className="h-5 w-5" />
                  <span className="text-[11px]">إغلاق</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Chats list view ---------- */
  const renderChats = () => (
    <>
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="text-2xl font-bold text-white">المحادثات</h1>
        <div className="flex gap-4 text-white/80">
          <Camera className="h-5 w-5" />
          <Search className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-full bg-[#202C33] px-4 py-2">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في المحادثات"
            className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
            dir="rtl"
          />
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {filteredChats.map((chat) => {
          const contact = getContact(chat.contactId);
          const last = lastMessage(chat);
          return (
            <button
              key={chat.id}
              onClick={() => {
                setFocusMessageId(null);
                setActiveChatId(chat.id);
                setShowContactInfo(false);
                setDraft('');
                if (activeApp === 'whatsapp' && screenMode === 'app' && !locked) setActiveWhatsAppConversation(chat.id);
                markWhatsAppChatRead(chat.id);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-right transition active:bg-white/5"
            >
              <ContactAvatar contact={contact} />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[15px] font-semibold text-white">
                    {contact?.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-white/50">
                    {formatArabicTime(last?.timestamp ?? Date.now())}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate text-[13px] text-white/60">
                    {chat.isGroup && last ? `${last.sender === 'me' ? 'أنتِ' : last.senderName || 'ريم'}: ` : ''}
                    {last?.type === 'voice'
                      ? 'رسالة صوتية'
                      : last?.text}
                  </span>
                  {chat.unread > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#25D366] px-1.5 text-[11px] font-bold text-black">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  /* ---------- Calls view ---------- */
  const renderCalls = () => (
    <>
      <h1 className="px-4 pb-3 text-2xl font-bold text-white">المكالمات</h1>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {recentCalls.map((call) => {
          const contact = getContact(call.contactId);
          return (
            <div
              key={call.id}
              className="flex w-full items-center gap-3 px-4 py-2.5"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ backgroundColor: contact?.color }}
              >
                {contact?.name[0]}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span
                  className={`truncate text-[15px] font-medium ${
                    call.type === 'missed' ? 'text-[#FF3B30]' : 'text-white'
                  }`}
                >
                  {contact?.name}
                </span>
                <div className="flex items-center gap-1 text-[12px] text-white/50">
                  {call.type === 'in' && (
                    <PhoneIncoming className="h-3 w-3 text-[#34C759]" />
                  )}
                  {call.type === 'out' && (
                    <PhoneOutgoing className="h-3 w-3 text-[#0A84FF]" />
                  )}
                  {call.type === 'missed' && (
                    <PhoneMissed className="h-3 w-3 text-[#FF3B30]" />
                  )}
                  {formatArabicTime(call.timestamp)}
                </div>
              </div>
              <Phone className="h-5 w-5 text-[#25D366]" />
            </div>
          );
        })}
      </div>
    </>
  );

  /* ---------- Status view ---------- */
  const renderStatus = () => (
    <>
      <h1 className="px-4 pb-3 text-2xl font-bold text-white">التحديثات</h1>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4">
        {/* My status */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#25D366] bg-[#202C33]">
            <Plus className="h-5 w-5 text-[#25D366]" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">حالتي</p>
            <p className="text-[12px] text-white/50">انقر لإضافة تحديث</p>
          </div>
        </div>
        <p className="py-2 text-[12px] font-semibold text-white/50">
          التحديثات الأخيرة
        </p>
        {contacts.slice(0, 5).map((c, i) => (
          <div key={c.id} className="flex items-center gap-3 py-2">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#25D366] p-0.5"
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-full text-base font-bold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name[0]}
              </div>
            </div>
            <div>
              <p className="text-[15px] font-medium text-white">{c.name}</p>
              <p className="text-[12px] text-white/50">
                منذ {i + 1} ساعة
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /* ---------- Settings view ---------- */
  const renderSettings = () => (
    <>
      <h1 className="px-4 pb-3 text-2xl font-bold text-white">الإعدادات</h1>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4">
        <div className="flex items-center gap-4 rounded-[16px] bg-[#202C33] p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-2xl font-bold text-white">
            أن
          </div>
          <div>
            <p className="text-lg font-semibold text-white">منار</p>
            <p className="text-[13px] text-white/60">
              متاح · ٠٥٥١٢٣٤٥٦٧
            </p>
          </div>
        </div>

        {[
          { title: 'الرسائل', value: 'الإشعارات مفعلة' },
          { title: 'الخصوصية', value: 'الجميع' },
          { title: 'تخزين البيانات', value: '٢.٤ غيغابايت' },
          { title: 'المساعدة', value: '' },
        ].map((row, i) => (
          <div
            key={i}
            className="mt-3 flex items-center justify-between rounded-[12px] bg-[#202C33] px-4 py-3"
          >
            <span className="text-[15px] text-white">{row.title}</span>
            <span className="text-[13px] text-white/50">{row.value}</span>
          </div>
        ))}

        <button
          onClick={() => {
            replyTimers.current.forEach(clearTimeout);
            replyTimers.current.clear();
            setChats(JSON.parse(JSON.stringify(SAMPLE_CHATS)) as WAChat[]);
          }}
          className="mt-6 w-full rounded-[12px] bg-[#202C33] px-4 py-3 text-center text-[15px] text-[#FF3B30]"
        >
          إعادة تعيين المحادثات
        </button>
      </div>
    </>
  );

  /* ---------- Root render ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0B141A]">
      <div className="h-12 shrink-0" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'chats' && renderChats()}
        {tab === 'calls' && renderCalls()}
        {tab === 'status' && renderStatus()}
        {tab === 'settings' && renderSettings()}
      </div>

      {/* Bottom tabs */}
      <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-[#111B21] py-2">
        {[
          { id: 'chats', label: 'المحادثات', icon: <MessageCircle className="h-5 w-5" /> },
          { id: 'calls', label: 'المكالمات', icon: <Phone className="h-5 w-5" /> },
          { id: 'status', label: 'التحديثات', icon: <Camera className="h-5 w-5" /> },
          { id: 'settings', label: 'الإعدادات', icon: <Settings className="h-5 w-5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 transition active:scale-95 ${
              tab === t.id ? 'text-[#25D366]' : 'text-white/50'
            }`}
          >
            {t.icon}
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
