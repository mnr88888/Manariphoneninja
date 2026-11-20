'use client';

import { useState } from 'react';
import {
  MapPin,
  Search,
  Plus,
  Minus,
  Navigation,
  X,
  Layers,
} from 'lucide-react';
import { toArabicDigits } from '../shared/utils';

interface Place {
  id: string;
  name: string;
  category: string;
  /** position on the fake map, in % of container */
  x: number;
  y: number;
}

const SAMPLE_PLACES: Place[] = [
  { id: 'p1', name: 'المسجد الحرام', category: 'معلم', x: 50, y: 30 },
  { id: 'p2', name: 'برج المملكة', category: 'مبنى', x: 30, y: 55 },
  { id: 'p3', name: 'واحة المطار', category: 'مطار', x: 70, y: 65 },
  { id: 'p4', name: 'المتحف الوطني', category: 'متحف', x: 40, y: 40 },
  { id: 'p5', name: 'السوق المركزي', category: 'تسوق', x: 60, y: 75 },
];

export default function MapsApp() {
  const [zoom, setZoom] = useState(1);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Place | null>(null);
  const [mapStyle, setMapStyle] = useState<'standard' | 'satellite'>('standard');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = SAMPLE_PLACES.filter((p) => p.name.includes(search.trim()));

  const bg =
    mapStyle === 'satellite'
      ? 'linear-gradient(135deg, #2d5016 0%, #3d6b1e 40%, #4a7c2e 100%)'
      : 'linear-gradient(135deg, #E8F5E0 0%, #D4EDC9 50%, #C4E3B8 100%)';

  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden" style={{ backgroundImage: bg }}>
        {/* Fake roads */}
        <div className="absolute inset-0">
          <div className="absolute left-0 right-0 top-1/4 h-2 bg-white/70" />
          <div className="absolute left-0 right-0 top-2/3 h-2 bg-white/70" />
          <div className="absolute bottom-0 right-1/4 top-0 w-2 bg-white/70" />
          <div className="absolute bottom-0 right-2/3 top-0 w-2 bg-white/70" />
          {mapStyle === 'satellite' && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 30%, #6b8e23 0%, transparent 20%), radial-gradient(circle at 80% 70%, #556b2f 0%, transparent 25%)',
              }}
            />
          )}
        </div>

        {/* Pins */}
        {SAMPLE_PLACES.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="absolute -translate-x-1/2 -translate-y-full transition-transform hover:scale-110"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `translate(-50%, -100%) scale(${zoom})`,
            }}
          >
            <MapPin className="h-8 w-8 fill-[#FF3B30] text-white drop-shadow" />
          </button>
        ))}

        {/* Zoom controls */}
        <div className="absolute bottom-6 right-4 flex flex-col gap-2">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.3, 2.2))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.3, 0.7))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-95"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMapStyle((s) => (s === 'standard' ? 'satellite' : 'standard'))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg active:scale-95"
          >
            <Layers className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-lg active:scale-95">
            <Navigation className="h-5 w-5" />
          </button>
        </div>

        {/* Search bar overlay */}
        <button
          onClick={() => setShowSearch(true)}
          className="absolute left-4 right-4 top-3 flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-lg"
        >
          <Search className="h-4 w-4 text-black/50" />
          <span className="text-[15px] text-black/50">البحث في الخرائط</span>
        </button>
      </div>

      {/* Bottom info */}
      <div className="shrink-0 border-t border-black/10 bg-white px-4 py-3">
        {selected ? (
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-[16px] font-semibold text-black">
                {selected.name}
              </p>
              <p className="text-[12px] text-black/50">{selected.category}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-full bg-black/5 px-4 py-1.5 text-sm text-black"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <p className="text-center text-[13px] text-black/40">
            انقر على أحد المواقع لعرض تفاصيله · التكبير {toArabicDigits(zoom.toFixed(1))}×
          </p>
        )}
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="absolute inset-0 z-40 flex flex-col bg-white pt-12">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex flex-1 items-center gap-2 rounded-[10px] bg-black/5 px-3 py-2">
              <Search className="h-4 w-4 text-black/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن موقع"
                autoFocus
                className="w-full bg-transparent text-[15px] outline-none"
                dir="rtl"
              />
            </div>
            <button onClick={() => setShowSearch(false)}>
              <X className="h-5 w-5 text-black" />
            </button>
          </div>
          <div className="no-scrollbar flex-1 overflow-y-auto px-4">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelected(p);
                  setShowSearch(false);
                }}
                className="flex w-full items-center gap-3 border-b border-black/5 py-3 text-right"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#34C759]/10 text-[#34C759]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[15px] text-black">{p.name}</p>
                  <p className="text-[12px] text-black/40">{p.category}</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="mt-12 text-center text-sm text-black/40">
                لا توجد نتائج
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
