'use client';

import { useSystem } from '../system/SystemContext';
import { useOS } from '../OSContext';
import {
  Wifi,
  Bluetooth,
  Plane,
  Antenna,
  Battery,
  Moon,
  Sun,
  Volume2,
  Flashlight,
  Calculator,
  Camera,
  ChevronUp,
  RotateCcw,
  Timer,
  Play,
  Pause,
  Focus,
} from 'lucide-react';

/**
 * iOS Control Center — swipe down from the top-right to open.
 * All toggles are bound to system state and affect the simulator.
 */
export default function ControlCenter({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useSystem();
  const { openApp } = useOS();

  const toggle = (key: 'wifi' | 'bluetooth' | 'airplaneMode' | 'mobileData' | 'focusMode' | 'rotationLock' | 'darkMode') =>
    updateSettings({ [key]: !settings[key] });

  return (
    <div
      className="switcher-fade absolute inset-0 z-[70] bg-black/60 backdrop-blur-2xl"
      onClick={onClose}
    >
      <div className="flex h-full flex-col px-4 pt-14" onClick={(e) => e.stopPropagation()}>
        {/* Top row: connectivity block + side column */}
        <div className="grid grid-cols-2 gap-3">
          {/* Connectivity module */}
          <div className="flex flex-col items-center justify-center gap-4 rounded-[28px] bg-white/10 py-5">
            <button
              onClick={() => toggle('airplaneMode')}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                settings.airplaneMode ? 'bg-[#FF9F0A] text-white' : 'bg-white/20 text-white'
              }`}
              aria-label="وضع الطيران"
            >
              <Plane className="h-5 w-5" />
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => toggle('wifi')}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  settings.wifi && !settings.airplaneMode
                    ? 'bg-[#0A84FF] text-white'
                    : 'bg-white/20 text-white/60'
                }`}
                aria-label="واي فاي"
              >
                <Wifi className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggle('bluetooth')}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  settings.bluetooth ? 'bg-[#0A84FF] text-white' : 'bg-white/20 text-white/60'
                }`}
                aria-label="بلوتوث"
              >
                <Bluetooth className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => toggle('mobileData')}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  settings.mobileData && !settings.airplaneMode
                    ? 'bg-[#34C759] text-white'
                    : 'bg-white/20 text-white/60'
                }`}
                aria-label="بيانات الجوال"
              >
                <Antenna className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggle('focusMode')}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                  settings.focusMode ? 'bg-[#5E5CE6] text-white' : 'bg-white/20 text-white/60'
                }`}
                aria-label="التركيز"
              >
                <Focus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Side column: volume + dark mode / rotation lock */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-1 flex-col items-center justify-center rounded-[28px] bg-white/10 px-4 py-3 text-white">
              <Volume2 className="mb-1 h-5 w-5" />
              <span className="text-xs text-white/70">الصوت</span>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
                className="mt-2 w-full accent-white"
                style={{ direction: 'rtl' }}
              />
            </div>

            <div className="flex items-center justify-around rounded-[28px] bg-white/10 py-3 text-white">
              <button
                onClick={() => toggle('darkMode')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 active:scale-95"
                aria-label="الوضع الداكن"
              >
                {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button
                onClick={() => toggle('rotationLock')}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95 ${
                  settings.rotationLock ? 'bg-[#FF3B30] text-white' : 'bg-white/20 text-white'
                }`}
                aria-label="قفل التدوير"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Brightness + flashlight */}
        <div className="mt-3 flex items-center gap-3 rounded-[28px] bg-white/10 px-5 py-4 text-white">
          <Sun className="h-5 w-5 shrink-0" />
          <input
            type="range"
            min={20}
            max={100}
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
            className="w-full accent-white"
          />
        </div>

        {/* Quick shortcuts row */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          <button
            onClick={() => updateSettings({ flashlight: !settings.flashlight })}
            className={`flex flex-col items-center justify-center gap-1 rounded-[20px] py-4 text-white active:scale-95 ${
              settings.flashlight ? 'bg-white text-black' : 'bg-white/10'
            }`}
          >
            <Flashlight className="h-5 w-5" />
            <span className="text-[10px]">المصباح</span>
          </button>
          <button
            onClick={() => {
              openApp('calculator');
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-white/10 py-4 text-white active:scale-95"
          >
            <Calculator className="h-5 w-5" />
            <span className="text-[10px]">الحاسبة</span>
          </button>
          <button
            onClick={() => {
              openApp('camera');
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-white/10 py-4 text-white active:scale-95"
          >
            <Camera className="h-5 w-5" />
            <span className="text-[10px]">الكاميرا</span>
          </button>
          <button
            onClick={() => {
              openApp('clock');
              onClose();
            }}
            className="flex flex-col items-center justify-center gap-1 rounded-[20px] bg-white/10 py-4 text-white active:scale-95"
          >
            <Timer className="h-5 w-5" />
            <span className="text-[10px]">المؤقت</span>
          </button>
        </div>

        {/* Battery pill */}
        <div className="mt-3 flex items-center gap-3 rounded-[28px] bg-white/10 px-5 py-4 text-white">
          <Battery className="h-5 w-5" />
          <span className="text-sm font-semibold">البطارية</span>
          <span className="mr-auto text-sm font-bold">٨٧٪</span>
        </div>

        {/* Close hint */}
        <button
          onClick={onClose}
          className="mt-auto mb-6 flex items-center justify-center gap-1 text-sm text-white/60"
        >
          <ChevronUp className="h-4 w-4" />
          إغلاق مركز التحكم
        </button>
      </div>
    </div>
  );
}
