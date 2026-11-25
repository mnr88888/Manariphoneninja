'use client';

import { useEffect, useRef } from 'react';
import { useSystem, NewNotification } from './SystemContext';
import { deliverInboxMessage, ensureInboxStores, getInboxBadges } from './inboxDelivery';
import { deliverWhatsAppMessage, ensureWhatsAppStore } from './whatsappStore';
import { readStore, writeStore, STORE_CHANGE_EVENT } from './storage';

export type SimulatedAppId = 'whatsapp' | 'mail' | 'messages' | 'ninja' | 'instagram' | 'x';
export const DELIVERY_SEQUENCE: SimulatedAppId[] = ['whatsapp', 'mail', 'messages', 'instagram', 'x', 'ninja'];

export function sendIncomingForApp(appId: SimulatedAppId, addNotification: (n: NewNotification) => void): boolean {
  if (appId === 'whatsapp') {
    const incoming = deliverWhatsAppMessage();
    if (!incoming) return false;
    addNotification({ id: incoming.messageId, appId, title: incoming.title ?? incoming.senderName, body: incoming.text, targetId: incoming.chatId, messageId: incoming.messageId, badge: incoming.totalUnread });
    return true;
  }
  const message = deliverInboxMessage(appId);
  if (!message) return false;
  addNotification(message);
  return true;
}

/** Exactly one feed for the entire phone; lock/unlock never resets it. */
export function useNotificationSimulation() {
  const { settings, addNotification, setBadge } = useSystem();
  const latest = useRef({ settings, addNotification, setBadge });
  latest.current = { settings, addNotification, setBadge };

  useEffect(() => {
    ensureWhatsAppStore();
    ensureInboxStores();
    const syncBadges = () => {
      const counts = getInboxBadges();
      Object.entries(counts).forEach(([app, count]) => latest.current.setBadge(app, count));
    };
    syncBadges();
    const changed = (event: Event) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent<{key: string}>).detail?.key;
      if (key && !['wa-chats', 'mail-emails', 'messages.conversations', 'instagram-dm-threads-v1', 'x-dm-threads-v1', 'ninja-message-inbox-v2'].includes(key)) return;
      syncBadges();
    };
    window.addEventListener(STORE_CHANGE_EVENT, changed);
    window.addEventListener('storage', changed);

    // Explicit simulator action from Settings, also useful for repeatable UI tests.
    const requested = (event: Event) => {
      const app = (event as CustomEvent<{appId: SimulatedAppId}>).detail?.appId;
      if (DELIVERY_SEQUENCE.includes(app)) sendIncomingForApp(app, latest.current.addNotification);
    };
    window.addEventListener('simulator-deliver-message', requested);
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        if (stopped) return;
        if (!document.hidden && latest.current.settings.autoNotifications !== false) {
          const cursor = readStore<number>('sim-feed-cursor-v2', 0);
          const index = Number.isFinite(cursor) ? cursor : 0;
          let appId = DELIVERY_SEQUENCE[index % DELIVERY_SEQUENCE.length];
          if (appId === 'whatsapp' && latest.current.settings.whatsappAutoMessages === false) appId = 'mail';
          if (sendIncomingForApp(appId, latest.current.addNotification)) writeStore('sim-feed-cursor-v2', index + 1);
        }
        schedule(10000);
      }, delay);
    };
    schedule(6000);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener(STORE_CHANGE_EVENT, changed);
      window.removeEventListener('storage', changed);
      window.removeEventListener('simulator-deliver-message', requested);
    };
  }, []);
}
