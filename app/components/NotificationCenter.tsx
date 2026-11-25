'use client';

import { useSystem } from '../system/SystemContext';
import { useOS } from '../OSContext';
import { getApp } from '../apps/registry';
import { X, Trash2, BellOff } from 'lucide-react';

/**
 * iOS Notification Center. Opens by swiping down from the top-left.
 * Tapping a notification opens its app; individual notifications can be
 * dismissed and the list cleared. Respects per-app notification permissions.
 */
export default function NotificationCenter({ onClose }: { onClose: () => void }) {
  const {
    notifications,
    clearNotifications,
    dismissNotification,
    settings,
    openNotification,
  } = useSystem();
  const { openApp } = useOS();

  const visible = notifications;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'م' : 'ص';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div
      className="glass-overlay switcher-fade absolute inset-0 z-[70]"
      onClick={onClose}
    >
      <div
        className="flex h-full flex-col pt-14"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3">
          <h2 className="text-xl font-bold text-black/90">الإشعارات</h2>
          {visible.length > 0 && (
            <button
              onClick={clearNotifications}
              className="liquid-glass flex items-center gap-1 rounded-full px-3 py-1 text-xs text-black/80 active:scale-95"
            >
              <Trash2 className="h-3 w-3" />
              مسح الكل
            </button>
          )}
        </div>

        {/* Notifications list */}
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 pb-6">
          {visible.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-black/40">
              <BellOff className="h-10 w-10" />
              <p className="text-sm">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {visible.map((n) => {
                const app = getApp(n.appId);
                return (
                  <div
                    key={n.id}
                    className="liquid-glass flex w-full items-stretch gap-2 rounded-[24px] p-3 text-right transition active:scale-[0.98]"
                  >
                    <button
                      onClick={() => {
                        openNotification(n);
                        if (app) openApp(app.id);
                        onClose();
                      }}
                      className="flex min-w-0 flex-1 items-start gap-3 text-right"
                    >
                      {/* App icon */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-black/5">
                        {app && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={app.imageIcon} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-semibold text-black/90">
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-black/40">
                            {formatTime(n.timestamp)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-black/65">
                          {n.body}
                        </p>
                      </div>

                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0A84FF]" />
                      )}
                    </button>

                    {/* Dismiss */}
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="flex shrink-0 items-start pt-1 text-black/35 active:text-black/70"
                      aria-label="حذف الإشعار"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Close hint */}
        <button
          onClick={onClose}
          className="flex shrink-0 items-center justify-center gap-1 pb-6 text-sm text-black/50"
        >
          <X className="h-4 w-4" />
          إغلاق مركز الإشعارات
        </button>
      </div>
    </div>
  );
}
