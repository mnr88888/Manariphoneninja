'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Pencil,
  ChevronLeft,
  ArrowUpCircle,
  Plus,
  Camera,
  Phone,
  Video,
  Info,
  Trash2,
} from 'lucide-react';
import { usePersistentState, uid, formatArabicTime } from '../shared/utils';
import { toArabicDigits } from '../shared/utils';

/* ============================================================
 * Types
 * ============================================================ */

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
}

interface Contact {
  id: string;
  name: string;
  /** avatar background color (hex) */
  color: string;
}

interface Conversation {
  id: string;
  contactId: string;
  messages: Message[];
  unread: number;
}

type View = 'list' | 'chat' | 'compose';

/* ============================================================
 * Sample data
 * ============================================================ */

const SAMPLE_CONTACTS: Contact[] = [
  { id: 'c1', name: 'أحمد العتيبي', color: '#FF3B30' },
  { id: 'c2', name: 'فاطمة الزهراء', color: '#FF9F0A' },
  { id: 'c3', name: 'محمد سالم', color: '#34C759' },
  { id: 'c4', name: 'نورة القحطاني', color: '#007AFF' },
  { id: 'c5', name: 'خالد المطيري', color: '#5856D6' },
  { id: 'c6', name: 'سارة الحربي', color: '#FF2D55' },
];

const now = Date.now();

const SAMPLE_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    contactId: 'c1',
    unread: 2,
    messages: [
      { id: uid(), text: 'السلام عليكم، كيف حالك؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 5 },
      { id: uid(), text: 'وعليكم السلام، الحمد لله بخير، وأنت؟', sender: 'me', timestamp: now - 1000 * 60 * 60 * 4 },
      { id: uid(), text: 'بخير والحمد لله. هل أكملنا العمل على المشروع؟', sender: 'them', timestamp: now - 1000 * 60 * 30 },
      { id: uid(), text: 'نعم، سأرسل لك التحديثات قريباً', sender: 'them', timestamp: now - 1000 * 60 * 25 },
    ],
  },
  {
    id: 'conv2',
    contactId: 'c2',
    unread: 0,
    messages: [
      { id: uid(), text: 'صباح الخير 🌞', sender: 'them', timestamp: now - 1000 * 60 * 60 * 24 },
      { id: uid(), text: 'صباح النور والسرور 😊', sender: 'me', timestamp: now - 1000 * 60 * 60 * 23 },
      { id: uid(), text: 'هل تحب أن نلتقي اليوم؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 22 },
      { id: uid(), text: 'بالتأكيد، في أي وقت يناسبك', sender: 'me', timestamp: now - 1000 * 60 * 60 * 21 },
      { id: uid(), text: 'ممتاز، سأحدد الموعد وأخبرك', sender: 'them', timestamp: now - 1000 * 60 * 60 * 20 },
    ],
  },
  {
    id: 'conv3',
    contactId: 'c3',
    unread: 1,
    messages: [
      { id: uid(), text: 'هل حضرت الاجتماع أمس؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 48 },
      { id: uid(), text: 'نعم، كان مفيداً جداً', sender: 'me', timestamp: now - 1000 * 60 * 60 * 47 },
      { id: uid(), text: 'أرسلت لك الملخص في البريد', sender: 'me', timestamp: now - 1000 * 60 * 60 * 46 },
      { id: uid(), text: 'وصلني، شكراً جزيلاً لك 👏', sender: 'them', timestamp: now - 1000 * 60 * 60 * 45 },
    ],
  },
  {
    id: 'conv4',
    contactId: 'c4',
    unread: 0,
    messages: [
      { id: uid(), text: 'مرحبا، هل وصلتك الوثائق؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 72 },
      { id: uid(), text: 'نعم، سأراجعها اليوم', sender: 'me', timestamp: now - 1000 * 60 * 60 * 71 },
      { id: uid(), text: 'تمام، بانتظار ملاحظاتك', sender: 'them', timestamp: now - 1000 * 60 * 60 * 70 },
    ],
  },
  {
    id: 'conv5',
    contactId: 'c5',
    unread: 0,
    messages: [
      { id: uid(), text: 'كل عام وأنت بخير 🎉', sender: 'them', timestamp: now - 1000 * 60 * 60 * 96 },
      { id: uid(), text: 'وأنت بخير وصحة وسلامة', sender: 'me', timestamp: now - 1000 * 60 * 60 * 95 },
      { id: uid(), text: 'الله يحفظك، نتقابل قريباً إن شاء الله', sender: 'them', timestamp: now - 1000 * 60 * 60 * 94 },
    ],
  },
  {
    id: 'conv6',
    contactId: 'c6',
    unread: 3,
    messages: [
      { id: uid(), text: 'هل يمكن أن تساعدني في أمر؟', sender: 'them', timestamp: now - 1000 * 60 * 15 },
      { id: uid(), text: 'أكيد، تفضلي', sender: 'me', timestamp: now - 1000 * 60 * 12 },
      { id: uid(), text: 'أحتاج نصائح حول تصميم التطبيق', sender: 'them', timestamp: now - 1000 * 60 * 8 },
      { id: uid(), text: 'بسرور، سأرسل لك بعض الأمثلة', sender: 'them', timestamp: now - 1000 * 60 * 3 },
      { id: uid(), text: 'وأي استفسار أنا جاهزة', sender: 'them', timestamp: now - 1000 * 60 * 1 },
    ],
  },
];

/* ============================================================
 * Helpers
 * ============================================================ */

/** Avatar: colored circle with the contact's first letter */
function Avatar({ contact, size = 44 }: { contact: Contact; size?: number }) {
  const initial = contact.name.trim().charAt(0);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        backgroundColor: contact.color,
        width: size,
        height: size,
        fontSize: size * 0.42,
      }}
    >
      {initial}
    </div>
  );
}

/** Short relative time used in the conversation list */
function listTimestampLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return toArabicDigits(formatArabicTime(d));
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return 'أمس';
  const diffDays = Math.floor((today.getTime() - timestamp) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[d.getDay()];
  }
  return toArabicDigits(`${d.getDate()}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`);
}

/* ============================================================
 * Main component
 * ============================================================ */

export default function MessagesApp() {
  const [contacts, setContacts] = usePersistentState<Contact[]>('messages.contacts', SAMPLE_CONTACTS);
  const [conversations, setConversations] = usePersistentState<Conversation[]>(
    'messages.conversations',
    SAMPLE_CONVERSATIONS
  );

  const [view, setView] = useState<View>('list');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [composeRecipient, setComposeRecipient] = useState<string>('');
  const [composeBody, setComposeBody] = useState('');

  // Contacts lookup
  const contactById = useMemo(() => {
    const m = new Map<string, Contact>();
    contacts.forEach((c) => m.set(c.id, c));
    return m;
  }, [contacts]);

  // Sorted conversations: most recent first
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aLast = a.messages.length ? a.messages[a.messages.length - 1].timestamp : 0;
      const bLast = b.messages.length ? b.messages[b.messages.length - 1].timestamp : 0;
      return bLast - aLast;
    });
  }, [conversations]);

  /* ---------- conversation list ---------- */
  const [search, setSearch] = useState('');

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return sortedConversations;
    const q = search.trim().toLowerCase();
    return sortedConversations.filter((conv) => {
      const contact = contactById.get(conv.contactId);
      const name = contact ? contact.name.toLowerCase() : '';
      const lastMsg = conv.messages.length ? conv.messages[conv.messages.length - 1].text.toLowerCase() : '';
      return name.includes(q) || lastMsg.includes(q);
    });
  }, [sortedConversations, search, contactById]);

  const openConversation = useCallback((convId: string) => {
    setActiveConvId(convId);
    setView('chat');
    // mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c))
    );
  }, [setConversations]);

  const handleDeleteConversation = useCallback(
    (convId: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setView('list');
      }
    },
    [setConversations, activeConvId]
  );

  /* ---------- chat send ---------- */
  const sendMessage = useCallback(
    (convId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const msg: Message = {
        id: uid(),
        text: trimmed,
        sender: 'me',
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, msg] } : c
        )
      );
    },
    [setConversations]
  );

  // Simulate a reply for fun when we send a message in chat view
  const simulateReply = useCallback(
    (convId: string) => {
      const replies = [
        'تمام 👍',
        'فهمت قصدك',
        'شكراً لك على التوضيح',
        'حسناً، سأرد عليك قريباً',
        'ممتاز، فكرة جيدة',
        'أوافقك الرأي',
        'سأفكر في الأمر',
        'بالتأكيد، لا مانع',
      ];
      const text = replies[Math.floor(Math.random() * replies.length)];
      const msg: Message = {
        id: uid(),
        text,
        sender: 'them',
        timestamp: Date.now() + 1000,
      };
      // slight delay so the reply feels natural
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            // if user is viewing this chat, don't mark unread
            const isViewing = activeConvId === convId && view === 'chat';
            return {
              ...c,
              messages: [...c.messages, msg],
              unread: isViewing ? 0 : c.unread + 1,
            };
          })
        );
      }, 1400);
    },
    [setConversations, activeConvId, view]
  );

  /* ---------- compose: create new conversation ---------- */
  const startNewConversation = useCallback(
    (recipientName: string, body: string) => {
      const name = recipientName.trim();
      const text = body.trim();
      if (!name) return;

      // Look for an existing contact by name (case-insensitive)
      const existingContact = contacts.find(
        (c) => c.name.trim().toLowerCase() === name.toLowerCase()
      );

      let contactId: string;
      if (existingContact) {
        contactId = existingContact.id;
      } else {
        // Create a brand-new contact persisted with the contacts list
        contactId = uid();
        const colors = ['#FF3B30', '#FF9F0A', '#34C759', '#007AFF', '#5856D6', '#FF2D55', '#AF52DE', '#5AC8FA'];
        const newContact: Contact = {
          id: contactId,
          name,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
        // Persist contact via a side update of the contacts state.
        setContacts((prev) => [...prev, newContact]);
      }

      // Find an existing conversation with this contact
      const existingConv = conversations.find((c) => c.contactId === contactId);
      const convId = existingConv ? existingConv.id : uid();

      if (existingConv) {
        if (text) {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId
                ? {
                    ...c,
                    messages: [
                      ...c.messages,
                      { id: uid(), text, sender: 'me', timestamp: Date.now() },
                    ],
                  }
                : c
            )
          );
        }
      } else {
        const newConv: Conversation = {
          id: convId,
          contactId,
          unread: 0,
          messages: text
            ? [{ id: uid(), text, sender: 'me', timestamp: Date.now() }]
            : [],
        };
        setConversations((prev) => [...prev, newConv]);
      }

      setActiveConvId(convId);
      setView('chat');
      setComposeRecipient('');
      setComposeBody('');
    },
    [contacts, conversations, setContacts, setConversations]
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-white" dir="rtl">
      {/* Status bar spacer */}
      <div className="h-12 shrink-0" />

      {view === 'list' && (
        <ConversationList
          conversations={filteredConversations}
          contactById={contactById}
          search={search}
          onSearch={setSearch}
          onOpen={openConversation}
          onCompose={() => setView('compose')}
          onDelete={handleDeleteConversation}
        />
      )}

      {view === 'chat' && activeConvId && (
        <ChatView
          conversation={conversations.find((c) => c.id === activeConvId)!}
          contact={contactById.get(
            conversations.find((c) => c.id === activeConvId)!.contactId
          )!}
          onBack={() => {
            setView('list');
            setActiveConvId(null);
          }}
          onSend={(text) => {
            sendMessage(activeConvId, text);
            simulateReply(activeConvId);
          }}
          onDelete={() => handleDeleteConversation(activeConvId)}
        />
      )}

      {view === 'compose' && (
        <ComposeView
          contacts={contacts}
          recipient={composeRecipient}
          onRecipientChange={setComposeRecipient}
          body={composeBody}
          onBodyChange={setComposeBody}
          onCancel={() => {
            setView('list');
            setComposeRecipient('');
            setComposeBody('');
          }}
          onSend={() => startNewConversation(composeRecipient, composeBody)}
        />
      )}

      {/* Home indicator */}
      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}

/* ============================================================
 * Conversation list
 * ============================================================ */

interface ListProps {
  conversations: Conversation[];
  contactById: Map<string, Contact>;
  search: string;
  onSearch: (v: string) => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
  onDelete: (id: string) => void;
}

function ConversationList({
  conversations,
  contactById,
  search,
  onSearch,
  onOpen,
  onCompose,
  onDelete,
}: ListProps) {
  // Swipe-to-delete state
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Close any open swipe when tapping elsewhere
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuOpenId) setMenuOpenId(null);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [menuOpenId]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <button
          onClick={onCompose}
          className="flex items-center text-[#007AFF] active:opacity-60"
          aria-label="رسالة جديدة"
        >
          <Pencil className="h-[22px] w-[22px]" strokeWidth={1.8} />
        </button>
        <h1 className="text-[17px] font-semibold text-black">الرسائل</h1>
        <div className="w-[22px]" />
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-[10px] bg-black/[0.06] px-2.5 py-1.5">
          <Search className="h-4 w-4 shrink-0 text-black/40" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="بحث"
            className="w-full bg-transparent text-[16px] text-black placeholder-black/40 outline-none"
            dir="rtl"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/30 text-white"
              aria-label="مسح"
            >
              <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={3}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-y-auto no-scrollbar">
        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
            <div className="mb-3 text-black/20">
              <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <p className="text-[15px] text-black/40">
              {search ? 'لا توجد نتائج مطابقة' : 'لا توجد رسائل بعد'}
            </p>
          </div>
        )}

        <ul className="flex flex-col">
          {conversations.map((conv) => {
            const contact = contactById.get(conv.contactId);
            if (!contact) return null;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const lastText = lastMsg ? lastMsg.text : '';
            const isMe = lastMsg ? lastMsg.sender === 'me' : false;
            const timeLabel = lastMsg ? listTimestampLabel(lastMsg.timestamp) : '';
            const isSwiped = swipedId === conv.id;
            const menuOpen = menuOpenId === conv.id;

            return (
              <li key={conv.id} className="relative overflow-hidden border-b border-black/[0.07]">
                {/* Delete action revealed by swipe / behind the row */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="flex h-full items-center bg-[#FF3B30] px-5 text-white active:bg-[#FF453A]"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Sliding row */}
                <div
                  className="relative z-10 flex items-center gap-3 bg-white px-3 py-2.5 transition-transform duration-200 active:bg-black/[0.04]"
                  style={{
                    transform: isSwiped ? 'translateX(80px)' : 'translateX(0)',
                  }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar contact={contact} size={48} />
                  </div>

                  {/* Content */}
                  <button
                    onClick={() => onOpen(conv.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setMenuOpenId(menuOpen ? null : conv.id);
                      setSwipedId(null);
                    }}
                    className="flex min-w-0 flex-1 flex-col text-right"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate text-[16px] font-semibold text-black">
                        {contact.name}
                        {conv.unread > 0 && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-[#007AFF]" />
                        )}
                      </span>
                      <span
                        className={`shrink-0 text-[13px] ${
                          conv.unread > 0 ? 'text-[#007AFF] font-semibold' : 'text-black/50'
                        }`}
                      >
                        {timeLabel}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1">
                      <span
                        className={`truncate text-[14px] ${
                          conv.unread > 0 ? 'text-black' : 'text-black/50'
                        }`}
                      >
                        {isMe && <span className="text-black/40">أنا: </span>}
                        {lastText || 'لا توجد رسائل'}
                      </span>
                    </div>
                  </button>

                  {/* Swipe affordance / chevron to reveal delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSwipedId(isSwiped ? null : conv.id);
                      setMenuOpenId(null);
                    }}
                    className="flex shrink-0 items-center px-1 text-black/30 active:text-black/50"
                    aria-label="خيارات"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Long-press context menu */}
                {menuOpen && (
                  <div className="absolute left-3 top-2 z-30 w-40 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(null);
                        onOpen(conv.id);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-right text-[14px] text-black active:bg-black/5"
                    >
                      <Info className="h-4 w-4 text-[#007AFF]" />
                      فتح المحادثة
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(null);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-right text-[14px] text-black active:bg-black/5"
                    >
                      <Phone className="h-4 w-4 text-[#34C759]" />
                      اتصال
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(null);
                        onDelete(conv.id);
                      }}
                      className="flex w-full items-center gap-2 border-t border-black/5 px-3 py-2.5 text-right text-[14px] text-[#FF3B30] active:bg-black/5"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف المحادثة
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
 * Chat view
 * ============================================================ */

interface ChatProps {
  conversation: Conversation;
  contact: Contact;
  onBack: () => void;
  onSend: (text: string) => void;
  onDelete: () => void;
}

function ChatView({ conversation, contact, onBack, onSend, onDelete }: ChatProps) {
  const [input, setInput] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
 el.scrollTop = el.scrollHeight; }
  }, [conversation.messages.length]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
  };

  // Group messages by day for time separators
  const grouped = useMemo(() => {
    const groups: { label: string; items: Message[] }[] = [];
    conversation.messages.forEach((m) => {
      const label = dayLabel(m.timestamp);
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push(m);
      } else {
        groups.push({ label, items: [m] });
      }
    });
    return groups;
  }, [conversation.messages]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-black/[0.06] px-2">
        <button
          onClick={onBack}
          className="flex items-center text-[#007AFF] active:opacity-60"
          aria-label="رجوع"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.4} />
          <span className="-mr-1 text-[17px]">الرسائل</span>
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="flex flex-col items-center"
        >
          <span className="max-w-[140px] truncate text-[15px] font-semibold text-black">
            {contact.name}
          </span>
        </button>

        <button
          onClick={() => setShowInfo(true)}
          className="flex items-center text-[#007AFF] active:opacity-60"
          aria-label="معلومات"
        >
          <Info className="h-[22px] w-[22px]" strokeWidth={1.8} />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar p-3"
      >
        {grouped.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-1.5">
            {/* Time separator */}
            <div className="my-1.5 flex justify-center">
              <span className="rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-medium text-black/50">
                {toArabicDigits(group.label)}
              </span>
            </div>

            {group.items.map((m, idx) => {
              const isMe = m.sender === 'me';
              const prev = group.items[idx - 1];
              const showAvatar = !prev || prev.sender !== m.sender;
              // Show a small time stamp before a sender change or every few messages
              const next = group.items[idx + 1];
              const showTime = !next || next.sender !== m.sender;
              return (
                <div key={m.id} className="flex flex-col">
                  <div
                    className={`flex items-end gap-1.5 ${
                      isMe ? 'justify-start' : 'justify-end'
                    }`}
                    dir="rtl"
                  >
                    {/* Received avatar on the right side */}
                    {!isMe && showAvatar ? (
                      <Avatar contact={contact} size={28} />
                    ) : (
                      !isMe && <div className="w-7 shrink-0" />
                    )}

                    {/* Bubble */}
                    <div
                      className={`max-w-[75%] whitespace-pre-wrap break-words px-3.5 py-2 text-[16px] leading-snug ${
                        isMe
                          ? 'self-end rounded-[18px] rounded-bl-[4px] bg-[#007AFF] text-white'
                          : 'self-start rounded-[18px] rounded-br-[4px] bg-[#E9E9EB] text-black'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                  {showTime && (
                    <div
                      className={`mt-1 mb-1.5 text-[11px] text-black/40 ${
                        isMe ? 'text-left pr-1' : 'text-right pl-9'
                      }`}
                      dir="rtl"
                    >
                      {toArabicDigits(formatArabicTime(m.timestamp))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-black/[0.08] px-2 pb-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#007AFF]/10 text-[#007AFF] active:opacity-60"
            aria-label="إضافة"
          >
            <Plus className="h-5 w-5" strokeWidth={2.2} />
          </button>

          <div className="relative flex flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="رسالة..."
              className="w-full rounded-[18px] border border-black/15 bg-white px-3.5 py-2 text-[16px] text-black placeholder-black/40 outline-none focus:border-[#007AFF]/40"
              dir="rtl"
            />
            <button
              className="absolute left-1 flex h-7 w-7 items-center justify-center text-black/40 active:opacity-60"
              aria-label="كاميرا"
            >
              <Camera className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`flex h-8 w-8 shrink-0 items-center justify-center transition active:scale-95 ${
              input.trim() ? 'text-[#007AFF]' : 'text-black/20'
            }`}
            aria-label="إرسال"
          >
            <ArrowUpCircle className="h-8 w-8" fill={input.trim() ? '#007AFF' : 'transparent'} strokeWidth={input.trim() ? 0 : 2} />
          </button>
        </div>
      </div>

      {/* Info sheet */}
      {showInfo && (
        <InfoSheet
          contact={contact}
          onClose={() => setShowInfo(false)}
          onDelete={() => {
            setShowInfo(false);
            onDelete();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
 * Compose new message
 * ============================================================ */

interface ComposeProps {
  contacts: Contact[];
  recipient: string;
  onRecipientChange: (v: string) => void;
  body: string;
  onBodyChange: (v: string) => void;
  onCancel: () => void;
  onSend: () => void;
}

function ComposeView({
  contacts,
  recipient,
  onRecipientChange,
  body,
  onBodyChange,
  onCancel,
  onSend,
}: ComposeProps) {
  const suggestions = useMemo(() => {
    const q = recipient.trim().toLowerCase();
    if (!q) return contacts.slice(0, 5);
    return contacts.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 6);
  }, [contacts, recipient]);

  const canSend = recipient.trim().length > 0 && body.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex h-11 shrink-0 items-center justify-between px-4">
        <button
          onClick={onCancel}
          className="text-[17px] text-[#007AFF] active:opacity-60"
        >
          إلغاء
        </button>
        <h1 className="text-[17px] font-semibold text-black">رسالة جديدة</h1>
        <button
          onClick={onSend}
          disabled={!canSend}
          className={`text-[17px] font-semibold active:opacity-60 ${
            canSend ? 'text-[#007AFF]' : 'text-black/25'
          }`}
        >
          إرسال
        </button>
      </div>

      {/* Recipient field */}
      <div className="flex items-start gap-2 border-b border-black/[0.07] px-3 py-2.5">
        <span className="mt-1.5 text-[16px] font-semibold text-black">إلى:</span>
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          <input
            type="text"
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder="جهة اتصال"
            className="min-w-[120px] flex-1 bg-transparent text-[16px] text-black placeholder-black/40 outline-none"
            dir="rtl"
            autoFocus
          />
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="border-b border-black/[0.07]">
          {suggestions.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onRecipientChange(c.name)}
                className="flex w-full items-center gap-3 px-3 py-2 text-right active:bg-black/[0.04]"
              >
                <Avatar contact={c} size={36} />
                <span className="truncate text-[16px] text-black">{c.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Message body */}
      <div className="flex flex-1 flex-col px-3 py-3">
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="min-h-[120px] flex-1 resize-none bg-transparent text-[16px] leading-relaxed text-black placeholder-black/40 outline-none"
          dir="rtl"
        />
      </div>
    </div>
  );
}

/* ============================================================
 * Info sheet (chat detail)
 * ============================================================ */

function InfoSheet({
  contact,
  onClose,
  onDelete,
}: {
  contact: Contact;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 flex flex-col items-center rounded-t-[20px] bg-white px-6 pb-6 pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 h-1.5 w-10 rounded-full bg-black/15" />
        <Avatar contact={contact} size={72} />
        <h2 className="mt-3 text-[20px] font-semibold text-black">{contact.name}</h2>
        <p className="mt-1 text-[13px] text-black/50">جهة اتصال</p>

        <div className="mt-5 flex w-full gap-3">
          <button className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-black/[0.05] py-3 text-[#007AFF] active:opacity-70">
            <Phone className="h-6 w-6" />
            <span className="text-[12px] font-medium">اتصال</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-black/[0.05] py-3 text-[#007AFF] active:opacity-70">
            <Video className="h-6 w-6" />
            <span className="text-[12px] font-medium">فيديو</span>
          </button>
          <button className="flex flex-1 flex-col items-center gap-1 rounded-2xl bg-black/[0.05] py-3 text-[#007AFF] active:opacity-70">
            <Info className="h-6 w-6" />
            <span className="text-[12px] font-medium">معلومات</span>
          </button>
        </div>

        <button
          onClick={onDelete}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF3B30]/10 py-3.5 text-[16px] font-semibold text-[#FF3B30] active:opacity-70"
        >
          <Trash2 className="h-5 w-5" />
          حذف المحادثة
        </button>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl bg-black/[0.05] py-3.5 text-[16px] font-medium text-black active:opacity-70"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}

/* ============================================================
 * Local helpers
 * ============================================================ */

/** Day label used to group messages inside a chat. */
function dayLabel(timestamp: number): string {
  const d = new Date(timestamp);
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'اليوم';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return 'أمس';
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
