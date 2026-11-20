'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneMissed,
  PhoneIncoming,
  PhoneOutgoing,
  Star,
  Delete,
  Search,
  UserPlus,
  ChevronLeft,
  MessageSquare,
  Info,
} from 'lucide-react';
import { usePersistentState, formatArabicTime } from '../shared/utils';
import { useSystem } from '../../system/SystemContext';

interface RecentCall {
  id: string;
  contactId: string | null;
  number: string;
  type: 'in' | 'out' | 'missed';
  timestamp: number;
}

type Tab = 'favorites' | 'recents' | 'contacts' | 'keypad';

export default function PhoneApp() {
  const { contacts, addContact, toggleFavorite } = useSystem();
  const [tab, setTab] = useState<Tab>('keypad');
  const [dialed, setDialed] = useState('');
  const [inCall, setInCall] = useState<{ name: string; number: string } | null>(
    null
  );
  const [callSeconds, setCallSeconds] = useState(0);
  const [recents, setRecents] = usePersistentState<RecentCall[]>('phone-recents', [
    { id: 'r1', contactId: 'c1', number: '', type: 'in', timestamp: Date.now() - 3600000 },
    { id: 'r2', contactId: 'c4', number: '', type: 'missed', timestamp: Date.now() - 7200000 },
    { id: 'r3', contactId: null, number: '٠٥٥٩٨٧٦٥٤٣', type: 'out', timestamp: Date.now() - 18000000 },
  ]);
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [recentsFilter, setRecentsFilter] = useState<'all' | 'missed'>('all');

  useEffect(() => {
    if (!inCall) return;
    const id = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [inCall]);

  const startCall = (name: string, number: string, contactId: string | null) => {
    setCallSeconds(0);
    setInCall({ name, number });
    setRecents((prev) => [
      {
        id: 'r-' + Date.now().toString(36),
        contactId,
        number,
        type: 'out',
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const pressDigit = (d: string) => setDialed((v) => v + d);

  const formatDialed = (v: string) => v;

  const contactForRecent = (r: RecentCall) =>
    r.contactId ? contacts.find((c) => c.id === r.contactId) : null;

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    return contacts.filter((c) => c.name.includes(search.trim()));
  }, [contacts, search]);

  /* ---------- In-call overlay ---------- */
  if (inCall) {
    return (
      <div className="absolute inset-0 flex flex-col items-center bg-gradient-to-b from-[#1C1C1E] to-black">
        <div className="h-12 shrink-0" />
        <div className="mt-16 flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-3xl font-bold text-white">
            {inCall.name[0]}
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white">
            {inCall.name}
          </h2>
          <p className="mt-1 text-sm text-white/60">{inCall.number}</p>
          <p className="mt-6 text-base tabular-nums text-white/80">
            {callSeconds === 0
              ? 'قيد الاتصال...'
              : `${Math.floor(callSeconds / 60)}:${(callSeconds % 60)
                  .toString()
                  .padStart(2, '0')}`}
          </p>
        </div>

        <div className="mt-auto mb-16 grid w-full max-w-[260px] grid-cols-3 gap-4">
          {[
            { label: 'كتم', icon: '🔇' },
            { label: 'لوحة الأرقام', icon: '⌨️' },
            { label: 'مكبر الصوت', icon: '🔊' },
          ].map((b) => (
            <button
              key={b.label}
              className="flex flex-col items-center gap-1 text-white/80"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl">
                {b.icon}
              </span>
              <span className="text-[11px]">{b.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setInCall(null)}
          className="mb-12 flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30] text-white shadow-lg active:scale-95"
        >
          <PhoneCall className="h-7 w-7 rotate-[135deg]" />
        </button>
      </div>
    );
  }

  /* ---------- Contact detail ---------- */
  const detailContact = contacts.find((c) => c.id === selectedContact);

  if (detailContact) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <div className="h-12 shrink-0" />
        <div className="flex h-11 items-center justify-between px-4">
          <button
            onClick={() => setSelectedContact(null)}
            className="text-[17px] text-[#007AFF] active:opacity-60"
          >
            رجوع
          </button>
          <button
            onClick={() => toggleFavorite(detailContact.id)}
            className="active:opacity-60"
          >
            <Star
              className={`h-6 w-6 ${
                detailContact.favorite
                  ? 'fill-[#FF9F0A] text-[#FF9F0A]'
                  : 'text-[#007AFF]'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ backgroundColor: detailContact.color }}
          >
            {detailContact.name[0]}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-black">
            {detailContact.name}
          </h2>
          <p className="text-sm text-black/50" dir="ltr">
            {detailContact.phone}
          </p>
        </div>

        <div className="flex justify-around border-y border-black/10 bg-white py-4">
          <button
            onClick={() =>
              startCall(detailContact.name, detailContact.phone, detailContact.id)
            }
            className="flex flex-col items-center gap-1 text-[#007AFF]"
          >
            <Phone className="h-6 w-6" />
            <span className="text-[11px]">اتصال</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#007AFF]">
            <MessageSquare className="h-6 w-6" />
            <span className="text-[11px]">رسالة</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#007AFF]">
            <Info className="h-6 w-6" />
            <span className="text-[11px]">تفاصيل</span>
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Keypad ---------- */
  const renderKeypad = () => (
    <div className="flex flex-1 flex-col items-center justify-end pb-4">
      <div
        className="mb-6 h-12 text-4xl font-light text-white"
        dir="ltr"
      >
        {formatDialed(dialed)}
      </div>
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {[
          ['١', '٢', '٣'],
          ['٤', '٥', '٦'],
          ['٧', '٨', '٩'],
          ['✳', '٠', '#'],
        ]
          .flat()
          .map((d, i) => (
            <button
              key={i}
              onClick={() => pressDigit(d)}
              className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white/10 text-3xl font-light text-white transition active:bg-white/25"
            >
              {d}
            </button>
          ))}
      </div>
      <div className="mt-4 flex w-full items-center justify-center gap-12">
        <div className="w-[74px]" />
        <button
          onClick={() => {
            if (!dialed) return;
            const match = contacts.find((c) => c.phone === dialed);
            startCall(match?.name ?? dialed, dialed, match?.id ?? null);
          }}
          className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[#34C759] text-white active:scale-95"
        >
          <Phone className="h-7 w-7" fill="currentColor" />
        </button>
        <button
          onClick={() => setDialed((v) => v.slice(0, -1))}
          className="flex h-[74px] w-[74px] items-center justify-center text-white/80"
        >
          {dialed && <Delete className="h-7 w-7" />}
        </button>
      </div>
    </div>
  );

  /* ---------- Recents ---------- */
  const renderRecents = () => (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pb-2 text-3xl font-bold text-white">الأحدث</h1>
      <div className="flex gap-2 px-4 pb-2">
        {(['all', 'missed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setRecentsFilter(f)}
            className={`rounded-full px-4 py-1 text-sm ${
              recentsFilter === f
                ? 'bg-white text-black'
                : 'bg-white/10 text-white'
            }`}
          >
            {f === 'all' ? 'الكل' : 'المفقودة'}
          </button>
        ))}
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {recents
          .filter((r) => recentsFilter === 'all' || r.type === 'missed')
          .map((r) => {
            const c = contactForRecent(r);
            return (
              <button
                key={r.id}
                onClick={() =>
                  startCall(c?.name ?? r.number, r.number || c?.phone || '', c?.id ?? null)
                }
                className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-2.5 text-right"
              >
                {r.type === 'missed' ? (
                  <PhoneMissed className="h-4 w-4 shrink-0 text-[#FF3B30]" />
                ) : r.type === 'in' ? (
                  <PhoneIncoming className="h-4 w-4 shrink-0 text-[#34C759]" />
                ) : (
                  <PhoneOutgoing className="h-4 w-4 shrink-0 text-white/50" />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span
                    className={`truncate text-[15px] ${
                      r.type === 'missed' ? 'text-[#FF3B30]' : 'text-white'
                    }`}
                  >
                    {c?.name ?? r.number}
                  </span>
                  <span className="text-[12px] text-white/50">
                    {formatArabicTime(r.timestamp)}
                  </span>
                </div>
                <Phone className="h-4 w-4 shrink-0 text-white/40" />
              </button>
            );
          })}
        {recents.length > 0 && (
          <button
            onClick={() => setRecents([])}
            className="mt-3 mx-auto block rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70"
          >
            مسح جميع المكالمات
          </button>
        )}
      </div>
    </div>
  );

  /* ---------- Contacts ---------- */
  const renderContacts = () => (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pb-2 text-3xl font-bold text-white">جهات الاتصال</h1>
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-[10px] bg-white/10 px-3 py-2">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث"
            className="w-full bg-transparent text-[15px] text-white placeholder-white/40 outline-none"
            dir="rtl"
          />
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {filteredContacts.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedContact(c.id)}
            className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-2.5 text-right"
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: c.color }}
            >
              {c.name[0]}
            </div>
            <span className="flex-1 text-[16px] text-white">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ---------- Favorites ---------- */
  const favorites = contacts.filter((c) => c.favorite);
  const renderFavorites = () => (
    <div className="flex flex-1 flex-col">
      <h1 className="px-4 pb-2 text-3xl font-bold text-white">المفضلة</h1>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <p className="mt-16 px-8 text-center text-sm text-white/50">
            لا توجد جهات اتصال مفضلة بعد.
            <br />
            أضف نجمة من صفحة جهة الاتصال.
          </p>
        ) : (
          favorites.map((c) => (
            <div
              key={c.id}
              className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-2.5"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name[0]}
              </div>
              <button
                onClick={() => setSelectedContact(c.id)}
                className="flex-1 text-right text-[16px] text-white"
              >
                {c.name}
              </button>
              <button
                onClick={() => startCall(c.name, c.phone, c.id)}
                className="text-[#34C759]"
              >
                <Phone className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <div className="h-12 shrink-0" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'keypad' && renderKeypad()}
        {tab === 'recents' && renderRecents()}
        {tab === 'contacts' && renderContacts()}
        {tab === 'favorites' && renderFavorites()}
      </div>

      {/* Tab bar */}
      <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-black/95 py-2 backdrop-blur-xl">
        {[
          { id: 'favorites', label: 'المفضلة', icon: <Star className="h-5 w-5" /> },
          { id: 'recents', label: 'الأحدث', icon: <PhoneMissed className="h-5 w-5" /> },
          { id: 'contacts', label: 'جهات الاتصال', icon: <UserPlus className="h-5 w-5" /> },
          { id: 'keypad', label: 'لوحة الأرقام', icon: <Phone className="h-5 w-5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              tab === t.id ? 'text-[#34C759]' : 'text-white/50'
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
