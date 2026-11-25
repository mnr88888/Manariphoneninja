'use client';

import { useEffect, useRef } from 'react';
import { useSystem, NewNotification } from './SystemContext';
import { deliverInboxMessage, ensureInboxStores, getInboxBadges } from './inboxDelivery';
import { deliverWhatsAppMessage, ensureWhatsAppStore } from './whatsappStore';
import { readStore, writeStore, STORE_CHANGE_EVENT } from './storage';

export type SimulatedAppId = 'whatsapp' | 'mail' | 'messages' | 'ninja' | 'instagram' | 'x';
export const DELIVERY_SEQUENCE: SimulatedAppId[] = ['whatsapp', 'mail', 'messages', 'instagram', 'x', 'ninja'];
const DELIVERY_INTERVAL_MS = 30000;
const MAX_AUTO_NOTIFICATIONS_PER_APP = 16;
const DELIVERY_LEDGER_KEY = 'sim-delivery-ledger-v3';

interface DeliveryLedger {
  counts: Partial<Record<SimulatedAppId, number>>;
  bodies: Partial<Record<SimulatedAppId, string[]>>;
  xPostsLinked?: boolean;
}

function readLedger(): DeliveryLedger {
  const ledger = readStore<DeliveryLedger>(DELIVERY_LEDGER_KEY, { counts: {}, bodies: {} });
  if (ledger.xPostsLinked) return ledger;
  // The former X quota represented unlinked fabricated activity. Reset X only; preserve other apps.
  const migrated = { ...ledger, counts: { ...ledger.counts, x: 0 }, bodies: { ...ledger.bodies, x: [] }, xPostsLinked: true };
  writeStore(DELIVERY_LEDGER_KEY, migrated);
  return migrated;
}

function canDeliver(appId: SimulatedAppId): boolean {
  return (readLedger().counts[appId] ?? 0) < MAX_AUTO_NOTIFICATIONS_PER_APP;
}

function rememberDelivery(appId: SimulatedAppId, body: string): void {
  const ledger = readLedger();
  const bodies = ledger.bodies[appId] ?? [];
  if (bodies.includes(body)) return;
  writeStore(DELIVERY_LEDGER_KEY, {
    xPostsLinked: true,
    counts: { ...ledger.counts, [appId]: (ledger.counts[appId] ?? 0) + 1 },
    bodies: { ...ledger.bodies, [appId]: [...bodies, body] },
  });
}

export function sendIncomingForApp(appId: SimulatedAppId, addNotification: (n: NewNotification) => void): boolean {
  if (!canDeliver(appId)) return false;
  if (appId === 'whatsapp') {
    const incoming = deliverWhatsAppMessage();
    if (!incoming) return false;
    if (readLedger().bodies[appId]?.includes(incoming.text)) return false;
    rememberDelivery(appId, incoming.text);
    addNotification({ id: incoming.messageId, appId, title: incoming.title ?? incoming.senderName, body: incoming.text, targetId: incoming.chatId, messageId: incoming.messageId, badge: incoming.totalUnread });
    return true;
  }
  const message = deliverInboxMessage(appId);
  if (!message) return false;
  // Different people can like the same real post. Its text is not an event identity.
  const deliveryKey = appId === 'x' ? message.id : message.body;
  if (readLedger().bodies[appId]?.includes(deliveryKey)) return false;
  rememberDelivery(appId, deliveryKey);
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
      if (key && !['wa-chats', 'mail-emails', 'messages.conversations', 'instagram-dm-threads-v1', 'x-dm-threads-v1', 'x-activity-v1', 'ninja-message-inbox-v2'].includes(key)) return;
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
          sendIncomingForApp(appId, latest.current.addNotification);
          // An app with no eligible own posts or an exhausted quota must not freeze all other apps.
          writeStore('sim-feed-cursor-v2', index + 1);
        }
        schedule(DELIVERY_INTERVAL_MS);
      }, delay);
    };
    schedule(DELIVERY_INTERVAL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
      window.removeEventListener(STORE_CHANGE_EVENT, changed);
      window.removeEventListener('storage', changed);
      window.removeEventListener('simulator-deliver-message', requested);
    };
  }, []);
}
