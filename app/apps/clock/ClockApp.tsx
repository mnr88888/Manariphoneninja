'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Play, Pause, Trash2, RefreshCw } from 'lucide-react';
import { usePersistentState, uid, toArabicDigits } from '../shared/utils';

interface Alarm {
  id: string;
  time: string;
  label: string;
  enabled: boolean;
}

const WORLD_CITIES = [
  { city: 'الرياض', offset: 0 },
  { city: 'القاهرة', offset: -1 },
  { city: 'دبي', offset: 1 },
  { city: 'لندن', offset: -3 },
  { city: 'نيويورك', offset: -8 },
  { city: 'طوكيو', offset: 6 },
];

type Tab = 'world' | 'alarms' | 'stopwatch' | 'timer';

export default function ClockApp() {
  const [tab, setTab] = useState<Tab>('world');
  const [now, setNow] = useState(new Date());
  const [alarms, setAlarms] = usePersistentState<Alarm[]>('clock-alarms', [
    { id: 'a1', time: '07:00', label: 'الاستيقاظ', enabled: true },
    { id: 'a2', time: '13:30', label: 'الغداء', enabled: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [draftTime, setDraftTime] = useState('08:00');
  const [draftLabel, setDraftLabel] = useState('');

  // Stopwatch
  const [swRunning, setSwRunning] = useState(false);
  const [swMs, setSwMs] = useState(0);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  const [timerSecs, setTimerSecs] = useState(300);
  const [timerLeft, setTimerLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwMs((v) => v + 10), 10);
    } else if (swRef.current) {
      clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
  }, [swRunning]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimerLeft((v) => {
          if (v <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return v - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatSw = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <div className="h-12 shrink-0" />

      {/* World clock */}
      {tab === 'world' && (
        <div className="no-scrollbar flex-1 overflow-y-auto px-4">
          <h1 className="py-2 text-2xl font-bold text-white">الساعة العالمية</h1>
          {WORLD_CITIES.map(({ city, offset }) => {
            const local = new Date(now.getTime() + offset * 3600000);
            let h = local.getHours();
            const m = local.getMinutes();
            const ampm = h >= 12 ? 'م' : 'ص';
            h = h % 12 || 12;
            return (
              <div
                key={city}
                className="flex items-center justify-between border-b border-white/10 py-3"
              >
                <div>
                  <p className="text-[12px] text-white/50">
                    {offset === 0 ? 'اليوم' : offset > 0 ? `+${offset} ساعات` : `${offset} ساعات`}
                  </p>
                  <p className="text-[17px] text-white">{city}</p>
                </div>
                <p className="text-2xl font-light text-white tabular-nums">
                  {h}:{m.toString().padStart(2, '0')} {ampm}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Alarms */}
      {tab === 'alarms' && (
        <div className="flex flex-1 flex-col overflow-hidden px-4">
          <div className="flex items-center justify-between py-2">
            <h1 className="text-2xl font-bold text-white">المنبهات</h1>
            <button onClick={() => setShowAdd(true)} className="text-[#FF9F0A]">
              <Plus className="h-6 w-6" />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto">
            {alarms.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between border-b border-white/10 py-3"
              >
                <button
                  onClick={() =>
                    setAlarms((prev) =>
                      prev.map((x) =>
                        x.id === a.id ? { ...x, enabled: !x.enabled } : x
                      )
                    )
                  }
                  className={`relative h-6 w-10 rounded-full transition ${
                    a.enabled ? 'bg-[#34C759]' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                      a.enabled ? 'left-0.5' : 'right-0.5'
                    }`}
                  />
                </button>
                <div className="text-right">
                  <p
                    className={`text-2xl font-light tabular-nums ${
                      a.enabled ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {a.time}
                  </p>
                  <p className="text-[12px] text-white/50">{a.label}</p>
                </div>
                <button
                  onClick={() =>
                    setAlarms((prev) => prev.filter((x) => x.id !== a.id))
                  }
                  className="text-[#FF3B30]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {showAdd && (
            <div className="mb-4 rounded-[16px] bg-white/10 p-4">
              <input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="اسم المنبه"
                className="w-full rounded-[10px] bg-black/30 px-3 py-2 text-sm text-white outline-none"
                dir="rtl"
              />
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                className="mt-2 w-full rounded-[10px] bg-black/30 px-3 py-2 text-sm text-white outline-none"
              />
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setAlarms((prev) => [
                      ...prev,
                      { id: uid(), time: draftTime, label: draftLabel || 'منبه', enabled: true },
                    ]);
                    setDraftLabel('');
                    setShowAdd(false);
                  }}
                  className="flex-1 rounded-[10px] bg-[#FF9F0A] py-2 text-sm font-medium text-white"
                >
                  إضافة
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 rounded-[10px] bg-white/10 py-2 text-sm text-white"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stopwatch */}
      {tab === 'stopwatch' && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p
            className="text-6xl font-light text-white tabular-nums"
            dir="ltr"
          >
            {formatSw(swMs)}
          </p>
          <div className="mt-12 flex gap-6">
            <button
              onClick={() => {
                setSwMs(0);
                setSwRunning(false);
              }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
            <button
              onClick={() => setSwRunning((r) => !r)}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-white ${
                swRunning ? 'bg-[#FF3B30]/30' : 'bg-[#34C759]/30'
              }`}
            >
              {swRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      {/* Timer */}
      {tab === 'timer' && (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p
            className={`text-6xl font-light tabular-nums ${
              timerLeft === 0 ? 'text-[#FF3B30]' : 'text-white'
            }`}
            dir="ltr"
          >
            {formatTimer(timerLeft)}
          </p>

          <div className="mt-8 flex gap-2">
            {[60, 300, 600, 900].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setTimerSecs(s);
                  setTimerLeft(s);
                  setTimerRunning(false);
                }}
                className={`rounded-full px-3 py-1 text-xs ${
                  timerSecs === s ? 'bg-[#FF9F0A] text-white' : 'bg-white/10 text-white'
                }`}
              >
                {s / 60} د
              </button>
            ))}
          </div>

          <div className="mt-10 flex gap-6">
            <button
              onClick={() => {
                setTimerLeft(timerSecs);
                setTimerRunning(false);
              }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-white text-sm"
            >
              تصفير
            </button>
            <button
              onClick={() => setTimerRunning((r) => !r)}
              className={`flex h-20 w-20 items-center justify-center rounded-full text-white ${
                timerRunning ? 'bg-[#FF3B30]/30' : 'bg-[#34C759]/30'
              }`}
            >
              {timerRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" fill="currentColor" />}
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="flex shrink-0 items-center justify-around border-t border-white/10 bg-black/95 py-2">
        {[
          { id: 'world', label: 'العالمية' },
          { id: 'alarms', label: 'المنبهات' },
          { id: 'stopwatch', label: 'ساعة إيقاف' },
          { id: 'timer', label: 'مؤقت' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
              tab === t.id ? 'text-[#FF9F0A]' : 'text-white/50'
            }`}
          >
            <span className="text-base">🕐</span>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
