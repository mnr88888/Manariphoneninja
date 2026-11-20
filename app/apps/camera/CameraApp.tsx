'use client';

import { useState } from 'react';
import {
  Zap,
  ZapOff,
  Timer,
  RefreshCw,
  Circle,
  Images,
  ChevronRight,
} from 'lucide-react';
import { usePhotos, CAMERA_GRADIENTS } from '../shared/photos';

type Mode = 'photo' | 'video' | 'portrait' | 'pano';

export default function CameraApp() {
  const { addPhoto } = usePhotos();
  const [mode, setMode] = useState<Mode>('photo');
  const [flash, setFlash] = useState(false);
  const [frontCamera, setFrontCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);

  const capture = () => {
    setCapturing(true);
    const gradient =
      CAMERA_GRADIENTS[Math.floor(Math.random() * CAMERA_GRADIENTS.length)];
    setTimeout(() => {
      setCapturing(false);
      setLastCapture(gradient);
      addPhoto(gradient, 'لقطة جديدة');
    }, 200);
  };

  const modes: { id: Mode; label: string }[] = [
    { id: 'video', label: 'فيديو' },
    { id: 'photo', label: 'صورة' },
    { id: 'portrait', label: 'بورتريه' },
    { id: 'pano', label: 'بانوراما' },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <div className="h-12 shrink-0" />

      {/* Viewfinder */}
      <div className="relative flex-1 overflow-hidden">
        {/* Simulated camera feed */}
        <div
          className="absolute inset-0 transition-transform duration-300"
          style={{
            backgroundImage:
              frontCamera
                ? 'linear-gradient(135deg, #4A4E69 0%, #9A8C98 100%)'
                : 'linear-gradient(135deg, #22223B 0%, #4A4E69 60%, #9A8C98 100%)',
            transform: `scale(${zoom})`,
          }}
        >
          {/* Grid lines */}
          {showGrid && (
            <>
              <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
            </>
          )}

          {/* Scene hint */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/40">
              {frontCamera ? 'الكاميرا الأمامية' : 'الكاميرا الخلفية'}
            </p>
          </div>
        </div>

        {/* Flash effect */}
        {capturing && flash && (
          <div className="absolute inset-0 bg-white" />
        )}

        {/* Top controls */}
        <div className="absolute left-0 right-0 top-2 flex items-center justify-between px-6">
          <button
            onClick={() => setFlash((f) => !f)}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              flash ? 'bg-[#FFD60A] text-black' : 'bg-black/40 text-white'
            }`}
          >
            {flash ? <Zap className="h-4 w-4" fill="currentColor" /> : <ZapOff className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowGrid((g) => !g)}
            className={`rounded-full px-3 py-1 text-xs ${
              showGrid ? 'bg-[#FFD60A] text-black' : 'bg-black/40 text-white'
            }`}
          >
            الشبكة
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white">
            <Timer className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {[1, 2, 3].map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                zoom === z
                  ? 'bg-black text-[#FFD60A]'
                  : 'bg-black/40 text-white'
              }`}
            >
              {z}×
            </button>
          ))}
        </div>
      </div>

      {/* Mode selector */}
      <div className="flex shrink-0 items-center justify-center gap-5 py-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`text-xs font-medium ${
              mode === m.id ? 'text-[#FFD60A]' : 'text-white/50'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Shutter row */}
      <div className="flex shrink-0 items-center justify-around px-8 pb-8 pt-1">
        {/* Gallery preview */}
        <button className="h-12 w-12 overflow-hidden rounded-[10px] border-2 border-white/30">
          {lastCapture ? (
            <div className="h-full w-full" style={{ backgroundImage: lastCapture }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/10">
              <Images className="h-5 w-5 text-white/50" />
            </div>
          )}
        </button>

        {/* Shutter */}
        <button
          onClick={capture}
          className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white active:scale-95"
        >
          <div
            className={`h-[58px] w-[58px] rounded-full ${
              mode === 'video' ? 'bg-[#FF3B30] rounded-[14px]' : 'bg-white'
            } ${capturing ? 'opacity-60' : ''}`}
          />
        </button>

        {/* Flip camera */}
        <button
          onClick={() => setFrontCamera((f) => !f)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
