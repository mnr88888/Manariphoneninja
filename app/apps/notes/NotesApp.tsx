'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Folder, FolderOpen, Trash2, Pencil, X, Check } from 'lucide-react';
import { usePersistentState, uid, formatArabicDate } from '../shared/utils';

interface Note {
  id: string;
  title: string;
  body: string;
  folder: string;
  timestamp: number;
}

export default function NotesApp() {
  const [notes, setNotes] = usePersistentState<Note[]>('notes-app', [
    {
      id: 'n1',
      title: 'قائمة المشتريات',
      body: 'حليب\nخبز\nبيض\nتفاح',
      folder: 'شخصي',
      timestamp: Date.now() - 86400000,
    },
    {
      id: 'n2',
      title: 'أفكار للمشروع',
      body: 'تطبيق جديد للطقس\nتحسين واجهة الحاسبة',
      folder: 'عمل',
      timestamp: Date.now() - 3600000,
    },
  ]);
  const [folders, setFolders] = usePersistentState<string[]>('notes-folders', ['شخصي', 'عمل']);
  const [view, setView] = useState<'list' | 'note'>('list');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const activeNote = notes.find((n) => n.id === activeId);

  const filtered = useMemo(() => {
    let list = notes;
    if (folderFilter) list = list.filter((n) => n.folder === folderFilter);
    if (search.trim()) {
      const s = search.trim();
      list = list.filter(
        (n) => n.title.includes(s) || n.body.includes(s)
      );
    }
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [notes, search, folderFilter]);

  const createNote = () => {
    const n: Note = {
      id: uid(),
      title: 'ملاحظة جديدة',
      body: '',
      folder: folderFilter ?? 'شخصي',
      timestamp: Date.now(),
    };
    setNotes((prev) => [n, ...prev]);
    setActiveId(n.id);
    setView('note');
  };

  const updateNote = (patch: Partial<Note>) => {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId ? { ...n, ...patch, timestamp: Date.now() } : n
      )
    );
  };

  /* ---------- Note editor ---------- */
  if (view === 'note' && activeNote) {
    return (
      <div className="absolute inset-0 flex flex-col bg-[#FFF9E5]">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setView('list')}
            className="text-[#E6A800]"
          >
            تم
          </button>
          <span className="text-[12px] text-black/40">
            {formatArabicDate(activeNote.timestamp)}
          </span>
          <button
            onClick={() => {
              setNotes((prev) => prev.filter((n) => n.id !== activeId));
              setView('list');
            }}
            className="text-[#FF3B30]"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <input
          value={activeNote.title}
          onChange={(e) => updateNote({ title: e.target.value })}
          placeholder="العنوان"
          className="bg-transparent px-5 pb-2 text-xl font-bold text-black outline-none"
          dir="rtl"
        />
        <textarea
          value={activeNote.body}
          onChange={(e) => updateNote({ body: e.target.value })}
          placeholder="ابدأ الكتابة..."
          className="flex-1 bg-transparent px-5 py-2 text-[15px] leading-relaxed text-black outline-none"
          dir="rtl"
        />

        <button
          onClick={() => setShowFolderPicker(true)}
          className="flex items-center gap-1 border-t border-black/10 px-5 py-2 text-sm text-[#E6A800]"
        >
          <FolderOpen className="h-4 w-4" />
          {activeNote.folder}
        </button>

        {/* Folder picker */}
        {showFolderPicker && (
          <div
            className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40"
            onClick={() => setShowFolderPicker(false)}
          >
            <div
              className="rounded-t-[20px] bg-white p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <button onClick={() => setShowFolderPicker(false)}>
                  <X className="h-5 w-5 text-[#007AFF]" />
                </button>
                <span className="font-semibold">اختر مجلداً</span>
                <div className="w-5" />
              </div>
              {folders.map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    updateNote({ folder: f });
                    setShowFolderPicker(false);
                  }}
                  className="flex w-full items-center justify-between border-b border-black/5 py-2.5 text-right"
                >
                  <span className="text-[15px]">{f}</span>
                  {activeNote.folder === f && (
                    <Check className="h-4 w-4 text-[#007AFF]" />
                  )}
                </button>
              ))}
              <div className="mt-3 flex gap-2">
                <input
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="مجلد جديد"
                  className="flex-1 rounded-[10px] bg-black/5 px-3 py-2 text-sm outline-none"
                  dir="rtl"
                />
                <button
                  onClick={() => {
                    if (!newFolderName.trim()) return;
                    setFolders((prev) => [...prev, newFolderName.trim()]);
                    setNewFolderName('');
                  }}
                  className="rounded-[10px] bg-[#FFD60A] px-4 text-sm font-medium"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Notes list ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="text-3xl font-bold text-black">الملاحظات</h1>
        <button onClick={createNote} className="text-[#E6A800]">
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 rounded-[10px] bg-black/5 px-3 py-2">
          <Search className="h-4 w-4 text-black/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الملاحظات"
            className="w-full bg-transparent text-[15px] outline-none"
            dir="rtl"
          />
        </div>
      </div>

      {/* Folder chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        <button
          onClick={() => setFolderFilter(null)}
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
            folderFilter == null ? 'bg-black text-white' : 'bg-black/5 text-black'
          }`}
        >
          الكل
        </button>
        {folders.map((f) => (
          <button
            key={f}
            onClick={() => setFolderFilter(f)}
            className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs ${
              folderFilter === f ? 'bg-black text-white' : 'bg-black/5 text-black'
            }`}
          >
            <Folder className="h-3 w-3" />
            {f}
          </button>
        ))}
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-sm text-black/40">
            لا توجد ملاحظات مطابقة
          </p>
        ) : (
          filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                setActiveId(n.id);
                setView('note');
              }}
              className="mt-2 flex w-full items-center justify-between rounded-[12px] bg-white px-4 py-3 text-right"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-black">
                  {n.title}
                </p>
                <p className="truncate text-[13px] text-black/50">
                  {n.body.split('\n')[0] || 'بدون محتوى'}
                </p>
                <p className="mt-0.5 text-[11px] text-black/40">
                  {n.folder} · {formatArabicDate(n.timestamp)}
                </p>
              </div>
              <Pencil className="h-4 w-4 shrink-0 text-black/30" />
            </button>
          ))
        )}
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}
