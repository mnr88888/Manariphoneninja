'use client';

import { useEffect, useState } from 'react';
import { useSystem } from '../system/SystemContext';

/**
 * iOS 26 status bar. Vector indicators (no emoji/unicode), live Arabic time,
 * real simulated battery level, Wi-Fi / cellular / airplane states, and a
 * battery-percentage option. Light/dark text adapts via the `dark` prop.
 */
export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const { settings } = useSystem();
  const [time, setTime] = useState('');
  const [battery, setBattery] = useState(87);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = now.getMinutes();
      const ampm = h >= 12 ? 'م' : 'ص';
      h = h % 12 || 12;
      setTime(`${h}:${m.toString().padStart(2, '0')} ${ampm}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // Simulated battery drain, shared with the lock screen behavior
  useEffect(() => {
    const stored = loadBattery();
    if (stored != null) setBattery(stored);
    const id = setInterval(() => {
      setBattery((b) => {
        const next = b > 15 ? b - 1 : b;
        saveBattery(next);
        return next;
      });
    }, 90000);
    return () => clearInterval(id);
  }, []);

  const airplane = settings.airplaneMode;
  const wifiOn = settings.wifi && !airplane;
  const pct = settings.showBatteryPercentage;
  // Cellular bars: deterministic decay with battery for realism
  const bars = battery > 60 ? 4 : battery > 35 ? 3 : battery > 15 ? 2 : 1;

  const color = dark ? 'text-white' : 'text-black';

  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 top-0 z-50 flex h-12 select-none items-center justify-between px-7 pt-1 ${color}`}
    >
      {/* Left (RTL: time on the left visually) */}
      <div className="flex w-20 items-center">
        <span className="text-[15px] font-semibold tabular-nums tracking-tight">
          {time}
        </span>
      </div>

      {/* Right: cellular, wifi, battery */}
      <div className="flex items-center gap-[7px]">
        {/* Cellular signal — 4 ascending bars */}
        {airplane ? (
          <AirplaneIcon />
        ) : (
          <CellularBars bars={bars} />
        )}
        {/* Wi-Fi */}
        {!airplane && wifiOn && <WifiIcon />}
        {/* Battery */}
        <div className="flex items-center gap-1">
          {pct && (
            <span className="text-[13px] font-medium tabular-nums">
              {toAr(battery)}٪
            </span>
          )}
          <BatteryIcon level={battery} charging={settings.lowPowerMode !== true} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Vector indicators ---------- */

function CellularBars({ bars }: { bars: number }) {
  const heights = [4, 6, 8.5, 11];
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 4.6}
          y={12 - h}
          width="3.2"
          height={h}
          rx="1"
          fill="currentColor"
          opacity={i < bars ? 1 : 0.32}
        />
      ))}
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
      <path
        d="M8 10.4 L9.9 8.2 a2.9 2.9 0 0 0-3.8 0 Z"
        fill="currentColor"
      />
      <path
        d="M4.4 6.3a5.7 5.7 0 0 1 7.2 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M1.6 3.5a9.6 9.6 0 0 1 12.8 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AirplaneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21.5 15.5 14 11.2V5.2a2 2 0 1 0-4 0v6L2.5 15.5v2l7.5-2.3v4.6l-2.2 1.6v1.4l3.7-1.1 3.7 1.1v-1.4L13 19.8v-4.6l7.5 2.3Z" />
    </svg>
  );
}

function BatteryIcon({ level, charging }: { level: number; charging?: boolean }) {
  const clamped = Math.max(0, Math.min(100, level));
  const fill =
    clamped <= 15 ? '#FF453A' : clamped <= 25 ? '#FF9F0A' : charging ? '#32D74B' : 'currentColor';
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden>
      {/* Body */}
      <rect x="0.5" y="0.5" width="23" height="12" rx="3.8" stroke="currentColor" opacity="0.4" />
      {/* Cap */}
      <path
        d="M25.2 4.4c1 .3 1.3 1.2 1.3 2.1s-.3 1.8-1.3 2.1Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Fill */}
      <rect
        x="2"
        y="2"
        width={Math.max(0, (clamped / 100) * 20)}
        height="9"
        rx="2.2"
        fill={fill}
      />
      {charging && (
        <path
          d="M12.8 2.9 9.6 7h2.2l-.6 3.4L14.4 6h-2.2Z"
          fill={clamped <= 15 ? '#fff' : '#1C1C1E'}
        />
      )}
    </svg>
  );
}

function toAr(n: number): string {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

/* ---------- Simulated battery persistence (shared with LockScreen) ---------- */

const BATT_KEY = 'ios-battery-level';

function loadBattery(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(BATT_KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function saveBattery(v: number) {
  try {
    localStorage.setItem(BATT_KEY, String(v));
  } catch {
    // ignore
  }
}
