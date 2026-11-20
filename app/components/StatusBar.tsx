'use client';

import { useEffect, useState } from 'react';
import { Wifi, Plane, BatteryFull, Signal } from 'lucide-react';
import { useSystem } from '../system/SystemContext';

/**
 * System status bar. Reflects global settings (wifi, airplane mode).
 * Shows live Arabic time.
 */
export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const { settings } = useSystem();
  const [time, setTime] = useState('');

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

  const airplane = settings.airplaneMode;
  const wifiOn = settings.wifi && !airplane;

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-50 flex h-12 items-center justify-between px-7 pt-1 text-sm font-semibold text-white pointer-events-none select-none`}
    >
      {/* Left: time */}
      <div className="flex items-center gap-1">
        <span className="tracking-tight">{time}</span>
      </div>

      {/* Right: signal, wifi/airplane, battery */}
      <div className="flex items-center gap-1.5">
        {!airplane && (
          <Signal className="h-3.5 w-3.5" fill="currentColor" strokeWidth={0} />
        )}
        {airplane ? (
          <Plane className="h-4 w-4" fill="currentColor" strokeWidth={0} />
        ) : (
          wifiOn && (
            <Wifi className="h-4 w-4" fill="currentColor" strokeWidth={0} />
          )
        )}
        <BatteryFull className="h-5 w-5" fill="currentColor" strokeWidth={0} />
      </div>
    </div>
  );
}
