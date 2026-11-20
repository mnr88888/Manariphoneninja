'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  Heart,
  Music,
  ListMusic,
} from 'lucide-react';
import { usePersistentState, uid } from '../shared/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  gradient: string;
}

const SAMPLE_TRACKS: Track[] = [
  { id: 't1', title: 'حدث تلاشي', artist: 'فيروز', album: 'كلاسيكيات', duration: 245, gradient: 'linear-gradient(135deg, #FF9A56 0%, #FFD46B 100%)' },
  { id: 't2', title: 'على حدة', artist: 'أم كلثوم', album: 'التراث', duration: 512, gradient: 'linear-gradient(135deg, #AB47BC 0%, #E1BEE7 100%)' },
  { id: 't3', title: 'نجوم الليل', artist: 'عبدالحليم حافظ', album: 'النجوم', duration: 328, gradient: 'linear-gradient(135deg, #26C6DA 0%, #80DEEA 100%)' },
  { id: 't4', title: 'يا زين', artist: 'محمد عبده', album: 'الطرب', duration: 402, gradient: 'linear-gradient(135deg, #66BB6A 0%, #C5E1A5 100%)' },
  { id: 't5', title: 'أنشودة المطر', artist: 'ماجد المهيدب', album: 'الريبublic', duration: 198, gradient: 'linear-gradient(135deg, #42A5F5 0%, #90CAF9 100%)' },
  { id: 't6', title: 'همس المحبة', artist: 'وليد توفيق', album: 'الشتاء', duration: 276, gradient: 'linear-gradient(135deg, #EF5350 0%, #FFAB91 100%)' },
];

export default function MusicApp() {
  const [tracks, setTracks] = usePersistentState<Track[]>('music-tracks', SAMPLE_TRACKS);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [favorites, setFavorites] = usePersistentState<string[]>('music-favs', ['t1']);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = tracks.find((t) => t.id === currentId) ?? null;

  useEffect(() => {
    if (playing && current) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= current.duration) {
            if (repeat) return 0;
            nextTrack();
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, currentId, repeat]);

  const playTrack = (id: string) => {
    setCurrentId(id);
    setProgress(0);
    setPlaying(true);
  };

  const nextTrack = () => {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const next = shuffle
      ? tracks[Math.floor(Math.random() * tracks.length)]
      : tracks[(idx + 1) % tracks.length];
    if (next) playTrack(next.id);
  };

  const prevTrack = () => {
    const idx = tracks.findIndex((t) => t.id === currentId);
    const prev = tracks[(idx - 1 + tracks.length) % tracks.length];
    if (prev) playTrack(prev.id);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-[#1C1C1E]">
      <div className="h-12 shrink-0" />

      {/* Now playing */}
      {current && (
        <div className="shrink-0 px-6 pb-4">
          <div
            className="mx-auto flex h-44 w-44 items-center justify-center rounded-[18px] shadow-2xl"
            style={{ backgroundImage: current.gradient }}
          >
            <Music className="h-12 w-12 text-white/70" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => toggleFavorite(current.id)}
              className={
                favorites.includes(current.id) ? 'text-[#FF3B30]' : 'text-white/40'
              }
            >
              <Heart
                className="h-5 w-5"
                fill={favorites.includes(current.id) ? 'currentColor' : 'none'}
              />
            </button>
            <div className="text-center">
              <p className="text-[17px] font-semibold text-white">
                {current.title}
              </p>
              <p className="text-[13px] text-white/60">{current.artist}</p>
            </div>
            <div className="w-5" />
          </div>

          {/* Progress */}
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={current.duration}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="flex justify-between text-[11px] text-white/50 tabular-nums">
              <span>{formatTime(current.duration)}</span>
              <span>{formatTime(progress)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-3 flex items-center justify-between px-2">
            <button
              onClick={() => setShuffle((s) => !s)}
              className={shuffle ? 'text-white' : 'text-white/40'}
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button onClick={prevTrack} className="text-white">
              <SkipBack className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black active:scale-95"
            >
              {playing ? (
                <Pause className="h-7 w-7" fill="currentColor" />
              ) : (
                <Play className="h-7 w-7" fill="currentColor" />
              )}
            </button>
            <button onClick={nextTrack} className="text-white">
              <SkipForward className="h-7 w-7" fill="currentColor" />
            </button>
            <button
              onClick={() => setRepeat((r) => !r)}
              className={repeat ? 'text-white' : 'text-white/40'}
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="mt-4 flex items-center gap-2 text-white/60">
            <Volume2 className="h-4 w-4" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-white"
            />
            <Volume2 className="h-5 w-5" />
          </div>
        </div>
      )}

      {/* Library */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            مكتبتي
          </h2>
          <span className="text-xs text-white/50">{tracks.length} أغنية</span>
        </div>
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => playTrack(t.id)}
            className={`flex w-full items-center gap-3 border-b border-white/5 py-2.5 text-right ${
              currentId === t.id ? 'opacity-100' : 'opacity-80'
            }`}
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px]"
              style={{ backgroundImage: t.gradient }}
            >
              <Music className="h-4 w-4 text-white/80" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[15px] ${
                  currentId === t.id ? 'text-[#FF2D55]' : 'text-white'
                }`}
              >
                {t.title}
              </p>
              <p className="truncate text-[12px] text-white/50">
                {t.artist} · {t.album}
              </p>
            </div>
            <span className="text-[11px] text-white/40 tabular-nums" dir="ltr">
              {formatTime(t.duration)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-white/80" />
      </div>
    </div>
  );
}
