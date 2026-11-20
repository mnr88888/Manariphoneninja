'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Phone,
  MessageSquare,
  Star,
  Trash2,
  Pencil,
  X,
  Check,
} from 'lucide-react';
import { useSystem } from '../../system/SystemContext';

export default function ContactsApp() {
  const { contacts, addContact, updateContact, deleteContact, toggleFavorite } =
    useSystem();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState({ name: '', phone: '' });

  const filtered = useMemo(
    () =>
      contacts.filter((c) => c.name.includes(search.trim())),
    [contacts, search]
  );

  // Group by first letter (Arabic)
  const grouped = useMemo(() => {
    const map = new Map<string, typeof contacts>();
    filtered.forEach((c) => {
      const letter = c.name[0];
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(c);
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0], 'ar')
    );
  }, [filtered]);

  const selected = contacts.find((c) => c.id === selectedId);

  const saveContact = () => {
    if (!draft.name.trim()) return;
    if (editMode && selected) {
      updateContact(selected.id, { name: draft.name, phone: draft.phone });
    } else {
      addContact({ name: draft.name, phone: draft.phone });
    }
    setShowForm(false);
    setEditMode(false);
    setDraft({ name: '', phone: '' });
  };

  /* ---------- Contact detail ---------- */
  if (selected) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setSelectedId(null)}
            className="text-[17px] text-[#007AFF]"
          >
            رجوع
          </button>
          <div className="flex gap-4">
            <button
              onClick={() => toggleFavorite(selected.id)}
              className="active:opacity-60"
            >
              <Star
                className={`h-6 w-6 ${
                  selected.favorite
                    ? 'fill-[#FF9F0A] text-[#FF9F0A]'
                    : 'text-[#FF9F0A]'
                }`}
              />
            </button>
            <button
              onClick={() => {
                setEditMode(true);
                setDraft({ name: selected.name, phone: selected.phone });
                setShowForm(true);
              }}
              className="text-[#007AFF]"
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ backgroundColor: selected.color }}
          >
            {selected.name[0]}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-black">
            {selected.name}
          </h2>
          {selected.favorite && (
            <p className="mt-1 text-xs text-[#FF9F0A]">★ مفضل</p>
          )}
        </div>

        <div className="mx-4 rounded-[12px] bg-white">
          <div className="border-b border-black/5 px-4 py-3">
            <p className="text-[12px] text-black/50">الهاتف</p>
            <p className="text-[16px] text-black" dir="ltr">
              {selected.phone}
            </p>
          </div>
          <div className="px-4 py-3">
            <p className="text-[12px] text-black/50">البريد الإلكتروني</p>
            <p className="text-[16px] text-black" dir="ltr">
              {selected.name.replace(/\s/g, '.').toLowerCase()}@example.com
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-around">
          <button
            onClick={() => window.alert('لا يمكن إجراء مكالمة حقيقية — هذه محاكاة')}
            className="flex flex-col items-center gap-1 text-[#007AFF]"
          >
            <Phone className="h-6 w-6" />
            <span className="text-[11px]">اتصال</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#007AFF]">
            <MessageSquare className="h-6 w-6" />
            <span className="text-[11px]">رسالة</span>
          </button>
        </div>

        <button
          onClick={() => {
            deleteContact(selected.id);
            setSelectedId(null);
          }}
          className="mt-8 mx-4 rounded-[12px] bg-[#FF3B30]/10 py-3 text-center text-[15px] text-[#FF3B30]"
        >
          حذف جهة الاتصال
        </button>

        {/* Edit form */}
        {showForm && (
          <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setShowForm(false)}>
            <div
              className="rounded-t-[24px] bg-white p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <button onClick={() => setShowForm(false)}>
                  <X className="h-5 w-5 text-[#007AFF]" />
                </button>
                <span className="font-semibold">تعديل جهة الاتصال</span>
                <button onClick={saveContact}>
                  <Check className="h-5 w-5 text-[#007AFF]" />
                </button>
              </div>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="الاسم"
                className="w-full rounded-[10px] bg-black/5 px-3 py-2.5 outline-none"
                dir="rtl"
              />
              <input
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                placeholder="رقم الهاتف"
                className="mt-3 w-full rounded-[10px] bg-black/5 px-3 py-2.5 outline-none"
                dir="rtl"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Contact list ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="text-3xl font-bold text-black">جهات الاتصال</h1>
        <button
          onClick={() => {
            setEditMode(false);
            setDraft({ name: '', phone: '' });
            setShowForm(true);
          }}
          className="text-[#007AFF]"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-[10px] bg-black/5 px-3 py-2">
          <Search className="h-4 w-4 text-black/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث"
            className="w-full bg-transparent text-[15px] outline-none"
            dir="rtl"
          />
        </div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {grouped.map(([letter, list]) => (
          <div key={letter} className="mb-3">
            <p className="pb-1 pr-1 text-[13px] font-semibold text-black/40">
              {letter}
            </p>
            <div className="overflow-hidden rounded-[12px] bg-white">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className="flex w-full items-center gap-3 border-b border-black/5 px-4 py-2.5 text-right last:border-0"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.name[0]}
                  </div>
                  <span className="flex-1 text-[16px] text-black">{c.name}</span>
                  {c.favorite && (
                    <Star className="h-4 w-4 fill-[#FF9F0A] text-[#FF9F0A]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="mt-16 text-center text-sm text-black/40">
            لا توجد نتائج
          </p>
        )}
      </div>

      {/* Add form */}
      {showForm && !editMode && (
        <div className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40" onClick={() => setShowForm(false)}>
          <div
            className="rounded-t-[24px] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setShowForm(false)}>
                <X className="h-5 w-5 text-[#007AFF]" />
              </button>
              <span className="font-semibold">جهة اتصال جديدة</span>
              <button onClick={saveContact}>
                <Check className="h-5 w-5 text-[#007AFF]" />
              </button>
            </div>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="الاسم"
              className="w-full rounded-[10px] bg-black/5 px-3 py-2.5 outline-none"
              dir="rtl"
            />
            <input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="رقم الهاتف"
              className="mt-3 w-full rounded-[10px] bg-black/5 px-3 py-2.5 outline-none"
              dir="rtl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
