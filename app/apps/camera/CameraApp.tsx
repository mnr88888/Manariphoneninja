'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Zap,
  ZapOff,
  Timer,
  RefreshCw,
  Images,
  Camera as CameraIcon,
  ShieldCheck,
} from 'lucide-react';
import { usePhotos } from '../shared/photos';
import { useOS } from '../../OSContext';

type Mode = 'photo' | 'video' | 'portrait' | 'pano';

export default function CameraApp() {
  const { addPhoto } = usePhotos();
  const { activeApp, screenMode } = useOS();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [mode, setMode] = useState<Mode>('photo');
  const [flash, setFlash] = useState(false);
  const [frontCamera, setFrontCamera] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'ready' | 'denied'>('idle');
  const [cameraError, setCameraError] = useState('');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('denied');
      setCameraError('الكاميرا الحقيقية غير متاحة في هذا المتصفح. افتحي المحاكي عبر HTTPS أو localhost.');
      return;
    }
    stopCamera();
    setCameraState('starting');
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: frontCamera ? 'user' : { ideal: 'environment' } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraState('ready');
    } catch (error) {
      stopCamera();
      setCameraState('denied');
      const name = error instanceof DOMException ? error.name : '';
      setCameraError(name === 'NotAllowedError'
        ? 'تم رفض إذن الكاميرا. اسمحي للمتصفح بالوصول ثم اضغطي تفعيل الكاميرا.'
        : 'تعذر تشغيل الكاميرا. تأكدي أنها غير مستخدمة في تطبيق آخر.');
    }
  }, [frontCamera, stopCamera]);

  // The stream starts only when the Camera app is actually visible, and stops when leaving it.
  useEffect(() => {
    const visible = activeApp === 'camera' && screenMode === 'app';
    if (visible) void startCamera();
    else stopCamera();
    return stopCamera;
  }, [activeApp, screenMode, startCamera, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || cameraState !== 'ready' || video.videoWidth === 0) return;
    setCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    if (frontCamera) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/jpeg', 0.88);
    setTimeout(() => {
      setCapturing(false);
      setLastCapture(image);
      addPhoto(image, 'لقطة حقيقية بالكاميرا');
    }, 120);
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

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          aria-label="بث الكاميرا الحقيقي"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-300 ${cameraState === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: `${frontCamera ? 'scaleX(-1)' : ''} scale(${zoom})` }}
        />
        {cameraState !== 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#22223B] to-[#4A4E69] px-7 text-center">
            <CameraIcon className="h-10 w-10 text-white/70" />
            <p className="text-sm text-white/80">{cameraState === 'starting' ? 'جارٍ طلب إذن الكاميرا…' : 'الكاميرا غير مفعلة'}</p>
            {cameraError && <p className="text-xs leading-5 text-red-200">{cameraError}</p>}
            {cameraState !== 'starting' && (
              <button onClick={() => void startCamera()} className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-black">
                تفعيل الكاميرا الحقيقية
              </button>
            )}
          </div>
        )}
        {showGrid && (
          <>
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/20" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/20" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/20" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/20" />
          </>
        )}
        {cameraState === 'ready' && (
          <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[10px] text-white">
            <ShieldCheck className="h-3 w-3 text-green-300" /> بث حقيقي
          </div>
        )}
        {capturing && flash && <div className="absolute inset-0 bg-white" />}

        <div className="absolute left-0 right-0 top-2 flex items-center justify-between px-6">
          <button onClick={() => setFlash((f) => !f)} className={`flex h-9 w-9 items-center justify-center rounded-full ${flash ? 'bg-[#FFD60A] text-black' : 'bg-black/40 text-white'}`}>
            {flash ? <Zap className="h-4 w-4" fill="currentColor" /> : <ZapOff className="h-4 w-4" />}
          </button>
          <button onClick={() => setShowGrid((g) => !g)} className={`rounded-full px-3 py-1 text-xs ${showGrid ? 'bg-[#FFD60A] text-black' : 'bg-black/40 text-white'}`}>الشبكة</button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white"><Timer className="h-4 w-4" /></button>
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {[1, 2, 3].map((z) => (
            <button key={z} onClick={() => setZoom(z)} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${zoom === z ? 'bg-black text-[#FFD60A]' : 'bg-black/40 text-white'}`}>{z}×</button>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-5 py-2">
        {modes.map((m) => <button key={m.id} onClick={() => setMode(m.id)} className={`text-xs font-medium ${mode === m.id ? 'text-[#FFD60A]' : 'text-white/50'}`}>{m.label}</button>)}
      </div>

      <div className="flex shrink-0 items-center justify-around px-8 pb-8 pt-1">
        <button className="h-12 w-12 overflow-hidden rounded-[10px] border-2 border-white/30">
          {lastCapture ? <img src={lastCapture} alt="آخر لقطة" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-white/10"><Images className="h-5 w-5 text-white/50" /></div>}
        </button>
        <button onClick={capture} disabled={cameraState !== 'ready' || capturing} className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-white active:scale-95 disabled:opacity-50">
          <div className={`h-[58px] w-[58px] rounded-full ${mode === 'video' ? 'rounded-[14px] bg-[#FF3B30]' : 'bg-white'} ${capturing ? 'opacity-60' : ''}`} />
        </button>
        <button onClick={() => setFrontCamera((f) => !f)} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white"><RefreshCw className="h-5 w-5" /></button>
      </div>

      <div className="flex shrink-0 justify-center pb-1.5"><div className="h-[5px] w-36 rounded-full bg-white/80" /></div>
    </div>
  );
}
