'use client';

/**
 * Incoming WhatsApp message engine.
 *
 * `sendIncomingWhatsApp()` delivers ONE real message into the shared 'wa-chats'
 * store (see whatsappStore.ts) and raises the matching system notification:
 * sound + red badge + banner/lock-screen card, all carrying the same message
 * text. The chat is updated first, so whatever the person sees on the icon or
 * in a notification is always really inside WhatsApp.
 *
 * `useWhatsAppSimulation()` runs once for the whole phone (mounted in
 * PhoneFrame) and sends a message every few minutes while the phone is
 * unlocked. While the lock screen is showing, LockScreen drives its own,
 * faster feed instead, so the two never double up.
 */
import { useEffect, useRef } from 'react';
import { useSystem, type NewNotification } from './SystemContext';
import { deliverWhatsAppMessage } from './whatsappStore';

/** First message arrives this long after the phone starts */
const FIRST_DELAY = 60 * 1000;
// Spacing between later messages (2–6 min randomized)
const MIN_GAP = 2 * 60000;
const MAX_GAP = 6 * 60000;

type AddNotification = (n: NewNotification) => void;

/** Deliver one incoming message + its notification. Returns false if storage failed. */
export function sendIncomingWhatsApp(addNotification: AddNotification): boolean {
  const msg = deliverWhatsAppMessage();
  if (!msg) return false;
  addNotification({
    appId: 'whatsapp',
    // iPhone style: sender as the title, the message itself as the body
    title: msg.senderName,
    body: msg.text,
    targetId: msg.chatId,
    // Badge mirrors the real unread count inside WhatsApp
    badge: msg.totalUnread,
  });
  return true;
}

export function useWhatsAppSimulation() {
  const { settings, addNotification, locked } = useSystem();

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const lockedRef = useRef(locked);
  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);
  const addNotifRef = useRef(addNotification);
  useEffect(() => {
    addNotifRef.current = addNotification;
  }, [addNotification]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fire = () => {
      if (settingsRef.current.whatsappAutoMessages === false) return;
      if (lockedRef.current) return; // the lock screen has its own feed
      if (typeof document !== 'undefined' && document.hidden) return;
      sendIncomingWhatsApp(addNotifRef.current);
    };

    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        if (cancelled) return;
        fire();
        schedule(MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP));
      }, delay);
    };
    schedule(FIRST_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}
