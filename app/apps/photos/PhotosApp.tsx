'use client';

import { useState } from 'react';
import {
  Heart,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  Info,
  Play,
} from 'lucide-react';
import { usePhotos, SimPhoto } from '../shared/photos';
import { usePersistentState, formatArabicDate } from '../shared/utils';

type View = 'gallery' | 'albums' | 'favorites' | 'recently-deleted' | 'viewer';

export default function PhotosApp() {
  const { photos, toggleFavorite, softDelete, restore, permanentDelete } =
    usePhotos();
  const [view, setView] = useState<View>('gallery');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const active = photos.filter((p) => !p.deleted);
  const deleted = photos.filter((p) => p.deleted);
  const favorites = active.filter((p) => p.favorite);
  const albums = Array.from(new Set(active.map((p) => p.album)));

  const currentList: SimPhoto[] =
    view === 'favorites'
      ? favorites
      : view === 'recently-deleted'
        ? deleted
        : selectedAlbum
          ? active.filter((p) => p.album === selectedAlbum)
          : active;

  const viewerPhoto =
    viewerIndex != null ? currentList[viewerIndex] : null;

  /* ---------- Viewer ---------- */
  if (viewerPhoto) {
    return (
      <div className="absolute inset-0 flex flex-col bg-black">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => setViewerIndex(null)} className="text-white">
            <X className="h-6 w-6" />
          </button>
          <span className="text-sm text-white/70">
            {formatArabicDate(viewerPhoto.timestamp)}
          </span>
          <button className="text-white">
            <Info className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 items-center justify-between px-1">
          <button
            onClick={() =>
              setViewerIndex((i) =>
                i == null ? null : (i + 1) % currentList.length
              )
            }
            className="p-3 text-white/50"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <div
            className="h-[400px] w-[85%] rounded-[18px]"
            style={{ backgroundImage: viewerPhoto.gradient.startsWith('data:image/') ? `url("${viewerPhoto.gradient}")` : viewerPhoto.gradient }}
          />
          <button
            onClick={() =>
              setViewerIndex((i) =>
                i == null ? null : (i - 1 + currentList.length) % currentList.length
              )
            }
            className="p-3 text-white/50"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-around py-4">
          <button onClick={() => setViewerIndex(null)} className="text-white/70">
            <Share2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => toggleFavorite(viewerPhoto.id)}
            className={
              viewerPhoto.favorite ? 'text-[#FF3B30]' : 'text-white/70'
            }
          >
            <Heart
              className="h-5 w-5"
              fill={viewerPhoto.favorite ? 'currentColor' : 'none'}
            />
          </button>
          {view === 'recently-deleted' ? (
            <button
              onClick={() => {
                restore(viewerPhoto.id);
                setViewerIndex(null);
              }}
              className="text-white/70"
            >
              استعادة
            </button>
          ) : (
            <button
              onClick={() => {
                softDelete(viewerPhoto.id);
                setViewerIndex(null);
              }}
              className="text-white/70"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Album browser ---------- */
  if (view === 'albums') {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="h-12 shrink-0" />
        <AlbumHeader
          title="الألبومات"
          onBack={null}
          onTab={setView}
          current="albums"
        />
        <div className="grid flex-1 grid-cols-2 gap-4 overflow-y-auto p-4">
          {albums.map((album) => {
            const cover = active.find((p) => p.album === album);
            const count = active.filter((p) => p.album === album).length;
            return (
              <button
                key={album}
                onClick={() => {
                  setSelectedAlbum(album);
                  setView('gallery');
                }}
                className="text-right"
              >
                <div
                  className="h-32 w-full rounded-[14px]"
                  style={{ backgroundImage: cover?.gradient?.startsWith('data:image/') ? `url("${cover.gradient}")` : cover?.gradient }}
                />
                <p className="mt-1 text-sm font-medium text-black">{album}</p>
                <p className="text-xs text-black/40">{count} صورة</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------- Gallery / Favorites / Recently deleted ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-12 shrink-0" />
      <AlbumHeader
        title={
          selectedAlbum && view === 'gallery'
            ? selectedAlbum
            : view === 'favorites'
              ? 'المفضلة'
              : view === 'recently-deleted'
                ? 'المحذوفة مؤخراً'
                : 'المكتبة'
        }
        onBack={
          selectedAlbum && view === 'gallery'
            ? () => {
                setSelectedAlbum(null);
              }
            : view !== 'gallery'
              ? () => setView('gallery')
              : null
        }
        onTab={setView}
        current={view}
      />

      <div className="grid flex-1 grid-cols-3 gap-0.5 overflow-y-auto px-0.5 pb-2">
        {currentList.length === 0 ? (
          <p className="col-span-3 mt-16 text-center text-sm text-black/40">
            {view === 'recently-deleted'
              ? 'لا توجد صور محذوفة'
              : view === 'favorites'
                ? 'لا توجد صور مفضلة بعد'
                : 'لا توجد صور'}
          </p>
        ) : (
          currentList.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setViewerIndex(i)}
              className="relative aspect-square"
              style={{ backgroundImage: p.gradient.startsWith('data:image/') ? `url("${p.gradient}")` : p.gradient }}
            >
              {p.favorite && (
                <Heart
                  className="absolute bottom-1 right-1 h-4 w-4 text-white"
                  fill="white"
                />
              )}
            </button>
          ))
        )}
      </div>

      {view === 'recently-deleted' && deleted.length > 0 && (
        <div className="flex justify-around border-t border-black/10 py-3 text-xs text-[#007AFF]">
          {deleted.slice(0, 3).map((p) => (
            <button
              key={p.id}
              onClick={() => permanentDelete(p.id)}
              className="rounded-full bg-black/5 px-3 py-1"
            >
              حذف نهائي: {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AlbumHeader({
  title,
  onBack,
  onTab,
  current,
}: {
  title: string;
  onBack: (() => void) | null;
  onTab: (v: View) => void;
  current: View;
}) {
  return (
    <>
      <div className="flex h-11 items-center justify-between px-4">
        {onBack ? (
          <button onClick={onBack} className="text-[17px] text-[#007AFF]">
            رجوع
          </button>
        ) : (
          <div className="w-12" />
        )}
        <h2 className="text-[17px] font-semibold text-black">{title}</h2>
        <div className="w-12" />
      </div>
      <div className="flex gap-4 border-b border-black/10 px-6 pb-2 text-sm">
        {(
          [
            ['gallery', 'المكتبة'],
            ['albums', 'الألبومات'],
            ['favorites', 'المفضلة'],
            ['recently-deleted', 'المحذوفة'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => onTab(id as View)}
            className={
              current === id || (id === 'gallery' && current === 'viewer')
                ? 'font-semibold text-black'
                : 'text-black/40'
            }
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
