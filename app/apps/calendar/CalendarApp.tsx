'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';
import {
  usePersistentState,
  uid,
  ARABIC_WEEKDAYS_SHORT,
  ARABIC_MONTHS,
  toArabicDigits,
} from '../shared/utils';

interface CalEvent {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  time: string;
  reminder: boolean;
}

export default function CalendarApp() {
  const [events, setEvents] = usePersistentState<CalEvent[]>('cal-events', [
    { id: 'e1', title: 'اجتماع الفريق', date: new Date().toISOString().slice(0, 10), time: '10:00', reminder: true },
    { id: 'e2', title: 'موعد الطبيب', date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10), time: '14:30', reminder: true },
  ]);
  const [view, setView] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ title: '', time: '09:00', reminder: true });
  const [editId, setEditId] = useState<string | null>(null);

  const y = cursor.getFullYear();
  const m = cursor.getMonth();

  const firstDay = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  // getDay: 0=Sunday. In Arabic calendars, week starts Saturday. Adjust:
  // We use Sunday-start to keep it simple; weekday names are Sunday-first.
  const startOffset = firstDay.getDay();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weekDates = useMemo(() => {
    const base = new Date(selectedDate);
    const day = base.getDay();
    const start = new Date(base);
    start.setDate(base.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [selectedDate]);

  const dayEvents = (date: string) =>
    events.filter((e) => e.date === date).sort((a, b) => a.time.localeCompare(b.time));

  const saveEvent = () => {
    if (!draft.title.trim()) return;
    if (editId) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editId
            ? { ...e, title: draft.title, time: draft.time, reminder: draft.reminder }
            : e
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        { id: uid(), title: draft.title, date: selectedDate, time: draft.time, reminder: draft.reminder },
      ]);
    }
    setDraft({ title: '', time: '09:00', reminder: true });
    setEditId(null);
    setShowAdd(false);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-1">
        <button
          onClick={() => setCursor(new Date(y, m - 1, 1))}
          className="text-[#FF3B30]"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-black">
          {ARABIC_MONTHS[m]} {toArabicDigits(y)}
        </h1>
        <button
          onClick={() => setCursor(new Date(y, m + 1, 1))}
          className="text-[#FF3B30]"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Month/Week switch */}
      <div className="flex gap-2 px-4 pb-2">
        {(['month', 'week'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-full px-3 py-0.5 text-xs ${
              view === v ? 'bg-[#FF3B30] text-white' : 'bg-black/5 text-black'
            }`}
          >
            {v === 'month' ? 'شهر' : 'أسبوع'}
          </button>
        ))}
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 px-2 pb-1 text-center">
        {ARABIC_WEEKDAYS_SHORT.map((d) => (
          <span key={d} className="text-[11px] font-semibold text-black/40">
            {d}
          </span>
        ))}
      </div>

      {view === 'month' ? (
        <div className="grid grid-cols-7 gap-y-1 px-2">
          {cells.map((d, i) => {
            if (d == null) return <div key={i} />;
            const dateStr = `${y}-${(m + 1).toString().padStart(2, '0')}-${d
              .toString()
              .padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasEvent = dayEvents(dateStr).length > 0;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-full text-[15px] ${
                  isSelected
                    ? 'bg-[#FF3B30] text-white'
                    : isToday
                      ? 'text-[#FF3B30] font-bold'
                      : 'text-black'
                }`}
              >
                {toArabicDigits(d)}
                {hasEvent && (
                  <span
                    className={`h-1 w-1 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#FF3B30]'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 px-2">
          {weekDates.map((dateStr, i) => {
            const d = new Date(dateStr);
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex flex-col items-center rounded-[10px] py-1 ${
                  isSelected ? 'bg-[#FF3B30]' : 'bg-black/5'
                }`}
              >
                <span
                  className={`text-[10px] ${
                    isSelected ? 'text-white/80' : 'text-black/40'
                  }`}
                >
                  {ARABIC_WEEKDAYS_SHORT[d.getDay()]}
                </span>
                <span
                  className={`text-[15px] font-semibold ${
                    isSelected ? 'text-white' : 'text-black'
                  }`}
                >
                  {toArabicDigits(d.getDate())}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Events for selected day */}
      <div className="mt-2 flex items-center justify-between border-t border-black/10 px-4 pt-2">
        <h3 className="text-[15px] font-semibold text-black">
          أحداث {toArabicDigits(parseInt(selectedDate.slice(8)))}{' '}
          {ARABIC_MONTHS[parseInt(selectedDate.slice(5, 7)) - 1]}
        </h3>
        <button
          onClick={() => {
            setEditId(null);
            setDraft({ title: '', time: '09:00', reminder: true });
            setShowAdd(true);
          }}
          className="text-[#FF3B30]"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {dayEvents(selectedDate).length === 0 ? (
          <p className="mt-8 text-center text-sm text-black/40">
            لا توجد أحداث في هذا اليوم
          </p>
        ) : (
          dayEvents(selectedDate).map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setEditId(e.id);
                setDraft({ title: e.title, time: e.time, reminder: e.reminder });
                setShowAdd(true);
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-[12px] bg-black/5 px-3 py-2.5 text-right"
            >
              <div className="h-8 w-1 rounded-full bg-[#FF3B30]" />
              <div className="flex-1">
                <p className="text-[15px] text-black">{e.title}</p>
                <p className="flex items-center gap-1 text-[12px] text-black/50">
                  <Clock className="h-3 w-3" />
                  {e.time}
                  {e.reminder && ' · تذكير'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Add/Edit event sheet */}
      {showAdd && (
        <div
          className="absolute inset-0 z-40 flex flex-col justify-end bg-black/40"
          onClick={() => setShowAdd(false)}
        >
          <div
            className="rounded-t-[24px] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setShowAdd(false)} className="text-[#007AFF]">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-[17px] font-semibold">
                {editId ? 'تعديل الحدث' : 'حدث جديد'}
              </h3>
              <button onClick={saveEvent} className="text-[#007AFF] font-semibold">
                حفظ
              </button>
            </div>

            <input
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="عنوان الحدث"
              className="w-full rounded-[10px] bg-black/5 px-3 py-2.5 text-[15px] outline-none"
              dir="rtl"
            />
            <input
              type="time"
              value={draft.time}
              onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
              className="mt-3 w-full rounded-[10px] bg-black/5 px-3 py-2.5 text-[15px] outline-none"
            />
            <button
              onClick={() => setDraft((d) => ({ ...d, reminder: !d.reminder }))}
              className="mt-3 flex w-full items-center justify-between rounded-[10px] bg-black/5 px-3 py-2.5"
            >
              <span className="text-[15px]">تذكير</span>
              <span
                className={`relative h-6 w-10 rounded-full transition ${
                  draft.reminder ? 'bg-[#34C759]' : 'bg-black/20'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                    draft.reminder ? 'left-0.5' : 'right-0.5'
                  }`}
                />
              </span>
            </button>

            {editId && (
              <button
                onClick={() => {
                  setEvents((prev) => prev.filter((e) => e.id !== editId));
                  setShowAdd(false);
                  setEditId(null);
                }}
                className="mt-4 w-full rounded-[10px] bg-[#FF3B30]/10 py-2.5 text-[15px] text-[#FF3B30]"
              >
                حذف الحدث
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}
