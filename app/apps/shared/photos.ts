'use client';

import { usePersistentState } from './utils';

export interface SimPhoto {
  id: string;
  /** CSS gradient used as the photo's visual */
  gradient: string;
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

export function usePhotos() {
  const [photos, setPhotos] = usePersistentState<SimPhoto[]>(
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

  const addPhoto = (gradient: string, label: string, album = 'الألبوم الرئيسي') => {
    setPhotos((prev) => [
      {
        id: 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        gradient,
        label,
        album,
        favorite: false,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const toggleFavorite = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  };

  const softDelete = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, deleted: true } : p))
    );
  };

  const restore = (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, deleted: false } : p))
    );
  };

  const permanentDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    photos,
    addPhoto,
    toggleFavorite,
    softDelete,
    restore,
    permanentDelete,
  };
}

export const CAMERA_GRADIENTS = GRADIENTS;
