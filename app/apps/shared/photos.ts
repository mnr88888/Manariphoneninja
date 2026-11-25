'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from './utils';

export interface SimPhoto {
  id: string;
  /** CSS gradient used as the photo's visual when no image file is attached. */
  gradient: string;
  /** Original uploaded/captured image stored as a Blob in IndexedDB. */
  imageKey?: string;
  /** Runtime object URL resolved from the original Blob. */
  imageUrl?: string;
  label: string;
  album: string;
  favorite: boolean;
  timestamp: number;
  deleted?: boolean;
}

const GRADIENTS = [
  'linear-gradient(135deg, #FF9A56 0%, #FFD46B 100%)',
  'linear-gradient(135deg, #42A5F5 0%, #90CAF9 100%)',
  'linear-gradient(135deg, #66BB6A 0%, #C5E1A5 100%)',
  'linear-gradient(135deg, #AB47BC 0%, #E1BEE7 100%)',
  'linear-gradient(135deg, #EF5350 0%, #FFAB91 100%)',
  'linear-gradient(135deg, #26C6DA 0%, #80DEEA 100%)',
  'linear-gradient(135deg, #8D6E63 0%, #D7CCC8 100%)',
  'linear-gradient(135deg, #5C6BC0 0%, #9FA8DA 100%)',
];

const LABELS = [
  'غروب', 'بحر', 'جبال', 'زهور', 'صحراء', 'مدينة', 'قهوة', 'سماء',
  'خليج', 'بحرية', 'نخيل', 'طيور',
];

const PHOTO_DB_NAME = 'iphone-simulator-photos';
const PHOTO_DB_VERSION = 1;
const PHOTO_STORE_NAME = 'original-files';

function photoId() {
  return 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        request.result.createObjectStore(PHOTO_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('تعذر فتح مخزن الصور'));
  });
}

async function saveOriginalImage(key: string, source: Blob | string): Promise<boolean> {
  try {
    const blob = typeof source === 'string'
      ? await fetch(source).then((response) => response.blob())
      : source;
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(PHOTO_STORE_NAME, 'readwrite').objectStore(PHOTO_STORE_NAME).put(blob, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    db.close();
    return true;
  } catch {
    return false;
  }
}

async function readOriginalImage(key: string): Promise<string | null> {
  try {
    const db = await openPhotoDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction(PHOTO_STORE_NAME, 'readonly').objectStore(PHOTO_STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return blob ? URL.createObjectURL(blob) : null;
  } catch {
    return null;
  }
}

async function deleteOriginalImage(key: string): Promise<void> {
  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve) => {
      const request = db.transaction(PHOTO_STORE_NAME, 'readwrite').objectStore(PHOTO_STORE_NAME).delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
    db.close();
  } catch {
    // The metadata can still be removed if browser storage is unavailable.
  }
}

export function usePhotos() {
  const [storedPhotos, setPhotos] = usePersistentState<SimPhoto[]>(
    'photos-gallery',
    LABELS.map((label, i) => ({
      id: 'p' + i,
      gradient: GRADIENTS[i % GRADIENTS.length],
      label,
      album: i % 3 === 0 ? 'الألبوم الرئيسي' : i % 3 === 1 ? 'السفر' : 'العائلة',
      favorite: i % 4 === 0,
      timestamp: Date.now() - (i + 1) * 86400000,
    }))
  );
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const imageUrlsRef = useRef<Record<string, string>>({});
  imageUrlsRef.current = imageUrls;

  // Ask the browser not to evict the album when the simulator is closed.
  // The original files live in IndexedDB and the album metadata in localStorage.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      void navigator.storage.persist();
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const expected = new Set(storedPhotos.filter((photo) => photo.imageKey).map((photo) => photo.id));
    const missing = storedPhotos.filter((photo) => photo.imageKey && !imageUrlsRef.current[photo.id]);
    Promise.all(missing.map(async (photo) => [photo.id, await readOriginalImage(photo.imageKey!)] as const)).then((entries) => {
      if (cancelled) {
        return;
      }
      setImageUrls((previous) => {
        const next = { ...previous };
        entries.forEach(([id, url]) => { if (url) next[id] = url; });
        Object.keys(next).forEach((id) => {
          if (!expected.has(id)) {
            delete next[id];
          }
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [storedPhotos]);

  const photos = useMemo(
    () => storedPhotos.map((photo) => ({ ...photo, imageUrl: photo.imageKey ? imageUrls[photo.id] : undefined })),
    [storedPhotos, imageUrls]
  );

  const addPhoto = async (source: Blob | string, label: string, album = 'الألبوم الرئيسي') => {
    const id = photoId();
    const imageKey = id;
    const saved = await saveOriginalImage(imageKey, source);
    setPhotos((prev) => [
      {
        id,
        gradient: 'linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%)',
        ...(saved ? { imageKey } : { gradient: typeof source === 'string' ? source : GRADIENTS[0] }),
        label,
        album,
        favorite: false,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const toggleFavorite = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p)));
  };

  const softDelete = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, deleted: true } : p)));
  };

  const restore = (id: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, deleted: false } : p)));
  };

  const permanentDelete = (id: string) => {
    const photo = storedPhotos.find((p) => p.id === id);
    if (photo?.imageKey) void deleteOriginalImage(photo.imageKey);
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return { photos, addPhoto, toggleFavorite, softDelete, restore, permanentDelete };
}

export const CAMERA_GRADIENTS = GRADIENTS;
