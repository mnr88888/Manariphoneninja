'use client';

import { useState } from 'react';
import { useSystem } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { Music, Phone, Timer } from 'lucide-react';

/**
 * Dynamic Island. Tap to expand showing now-playing / current activity.
 * Collapses back on second tap or when tapping outside.
 */
export default function DynamicIsland() {
  const { settings } = useSystem();
  const { activeApp } = useOS();
  const [expanded, setExpanded] = useState(false);
  const [activity, setActivity] = useState<'music' | 'call' | null>('music');

  if (expanded) {
    return (
      <div
        className="absolute left-1/2 top-2 z-[60] flex w-[300px] -translate-x-1/2 items-center gap-3 rounded-[24px] bg-black px-4 py-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#FF2D55] to-[#FF375F]">
          <Music className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">حدث تلاشي</p>
          <p className="text-[11px] text-white/60">فيروز — لا شيء</p>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="rounded-full bg-white/15 px-3 py-1 text-[11px] text-white"
        >
          إغلاق
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="absolute left-1/2 top-2 z-[60] flex h-8 w-[120px] -translate-x-1/2 items-center justify-center rounded-full bg-black"
      aria-label="الجزيرة الديناميكية"
    >
      {/* Camera dot */}
      <div className="absolute right-3 h-3 w-3 rounded-full bg-neutral-700" />
      {/* Mic dot */}
      <div className="absolute left-3 h-2 w-2 rounded-full bg-neutral-800" />
    </button>
  );
}
