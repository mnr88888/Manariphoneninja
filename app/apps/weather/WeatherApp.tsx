'use client';

import { useState } from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
  Search,
  Droplets,
  Wind,
  Eye,
  X,
} from 'lucide-react';
import { toArabicDigits } from '../shared/utils';

const CITIES = [
  {
    name: 'الرياض',
    temp: 34,
    condition: 'مشمس',
    icon: Sun,
    high: 37,
    low: 22,
    humidity: 15,
    wind: 12,
    visibility: 10,
    hourly: [31, 32, 34, 35, 36, 37, 36, 35, 33, 31, 29, 27],
  },
  {
    name: 'جدة',
    temp: 31,
    condition: 'غائم جزئياً',
    icon: CloudSun,
    high: 33,
    low: 26,
    humidity: 60,
    wind: 18,
    visibility: 8,
    hourly: [28, 29, 30, 31, 32, 33, 32, 32, 31, 30, 29, 28],
  },
  {
    name: 'دبي',
    temp: 36,
    condition: 'حار',
    icon: Sun,
    high: 39,
    low: 28,
    humidity: 45,
    wind: 10,
    visibility: 9,
    hourly: [33, 34, 35, 36, 37, 38, 38, 37, 36, 35, 34, 33],
  },
  {
    name: 'أبها',
    temp: 24,
    condition: 'ممطر خفيف',
    icon: CloudRain,
    high: 26,
    low: 16,
    humidity: 75,
    wind: 20,
    visibility: 6,
    hourly: [19, 20, 21, 22, 24, 25, 26, 25, 24, 23, 21, 20],
  },
  {
    name: 'الدمام',
    temp: 29,
    condition: 'عاصف',
    icon: Wind,
    high: 31,
    low: 24,
    humidity: 55,
    wind: 32,
    visibility: 5,
    hourly: [26, 27, 28, 29, 30, 31, 31, 30, 29, 28, 27, 26],
  },
];

const WEEK_DAYS = ['اليوم', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
const WEEK_ICONS = [Sun, CloudSun, Cloud, CloudRain, CloudSun, Sun, CloudSun];

export default function WeatherApp() {
  const [cityIndex, setCityIndex] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  const city = CITIES[cityIndex];
  const Icon = city.icon;

  const filtered = CITIES.map((c, i) => ({ ...c, index: i })).filter((c) =>
    c.name.includes(search.trim())
  );

  /* ---------- Search view ---------- */
  if (showSearch) {
    return (
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(160deg, #0A84FF 0%, #40C8FF 100%)',
        }}
      >
        <div className="h-12 shrink-0" />
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-[12px] bg-white/20 px-3 py-2 backdrop-blur">
            <Search className="h-4 w-4 text-white/70" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مدينة"
              autoFocus
              className="w-full bg-transparent text-[15px] text-white placeholder-white/60 outline-none"
              dir="rtl"
            />
          </div>
          <button onClick={() => setShowSearch(false)} className="text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-4">
          {filtered.map((c) => (
            <button
              key={c.name}
              onClick={() => {
                setCityIndex(c.index);
                setShowSearch(false);
                setSearch('');
              }}
              className="mt-2 flex w-full items-center justify-between rounded-[14px] bg-white/10 px-4 py-3 text-right backdrop-blur"
            >
              <div>
                <p className="text-[17px] font-semibold text-white">{c.name}</p>
                <p className="text-[12px] text-white/70">{c.condition}</p>
              </div>
              <p className="text-2xl font-light text-white">
                {toArabicDigits(c.temp)}°
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Weather view ---------- */
  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(160deg, #0A84FF 0%, #40C8FF 100%)',
      }}
    >
      <div className="h-12 shrink-0" />

      {/* Search button */}
      <div className="flex justify-between px-6">
        <button onClick={() => setShowSearch(true)} className="text-white">
          <Search className="h-5 w-5" />
        </button>
        <span className="text-xs text-white/60">
          {toArabicDigits(cityIndex + 1)} / {toArabicDigits(CITIES.length)}
        </span>
        <button
          onClick={() =>
            setCityIndex((i) => (i + 1) % CITIES.length)
          }
          className="text-white"
        >
          <MapPin className="h-5 w-5" />
        </button>
      </div>

      {/* Current weather */}
      <div className="flex flex-col items-center py-6 text-white">
        <h1 className="text-3xl font-medium">{city.name}</h1>
        <p className="mt-2 text-[88px] font-thin leading-none">
          {toArabicDigits(city.temp)}°
        </p>
        <div className="mt-2 flex items-center gap-2">
          <Icon className="h-6 w-6" />
          <span className="text-lg">{city.condition}</span>
        </div>
        <p className="mt-1 text-sm text-white/80">
          الأعلى {toArabicDigits(city.high)}° · الأدنى {toArabicDigits(city.low)}°
        </p>
      </div>

      {/* Hourly forecast */}
      <div className="mx-4 rounded-[16px] bg-white/10 p-3 backdrop-blur">
        <p className="mb-2 text-[11px] text-white/60">التوقعات الساعية</p>
        <div className="no-scrollbar flex justify-between overflow-x-auto">
          {city.hourly.map((t, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col items-center gap-1 px-2 text-white"
            >
              <span className="text-[11px] text-white/70">
                {i === 0 ? 'الآن' : toArabicDigits(i)}
              </span>
              <Icon className="h-5 w-5" />
              <span className="text-[14px] font-medium">
                {toArabicDigits(t)}°
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly forecast */}
      <div className="mx-4 mt-3 rounded-[16px] bg-white/10 p-3 backdrop-blur">
        <p className="mb-2 text-[11px] text-white/60">التوقعات الأسبوعية</p>
        {WEEK_DAYS.map((day, i) => {
          const DayIcon = WEEK_ICONS[i];
          const hi = city.high - (i % 3);
          const lo = city.low - (i % 2);
          return (
            <div
              key={day}
              className="flex items-center justify-between border-b border-white/10 py-1.5 last:border-0 text-white"
            >
              <span className="w-14 text-[13px]">{day}</span>
              <DayIcon className="h-4 w-4 text-white/80" />
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-white/60">
                  {toArabicDigits(lo)}°
                </span>
                <div className="h-1 w-16 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-[#FFD60A]"
                    style={{ width: `${((hi - lo) / 20) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-left text-[13px]">
                  {toArabicDigits(hi)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details row */}
      <div className="mt-3 grid grid-cols-3 gap-2 px-4 pb-4">
        {[
          { icon: Droplets, label: 'الرطوبة', value: `${toArabicDigits(city.humidity)}٪` },
          { icon: Wind, label: 'الرياح', value: `${toArabicDigits(city.wind)} كم/س` },
          { icon: Eye, label: 'الرؤية', value: `${toArabicDigits(city.visibility)} كم` },
        ].map((d) => (
          <div
            key={d.label}
            className="flex flex-col items-center gap-1 rounded-[14px] bg-white/10 py-3 text-white backdrop-blur"
          >
            <d.icon className="h-4 w-4 text-white/70" />
            <span className="text-[10px] text-white/60">{d.label}</span>
            <span className="text-[13px] font-medium">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
