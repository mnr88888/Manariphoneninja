'use client';

/**
 * Global WhatsApp message simulation engine. Runs once for the whole app
 * (mounted in PhoneFrame), generating occasional incoming messages even when
 * WhatsApp isn't open. Writes into the same 'wa-chats' store the WhatsApp
 * app reads via usePersistentState, raises system notifications/badges, and
 * records a pending deep link for tapping through.
 */
import { useEffect, useRef } from 'react';
import { useSystem } from './SystemContext';

const SIM_CONTACTS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

const SIM_MESSAGES = [
  'وين وصلت؟',
  'لا تنسى موعد الغد الساعة ٥',
  'شوف هذي الصورة 😂',
  'خلينا نتقابل بكرة الصباح',
  'أرسلت لك الملف على الإيميل',
  'تعال نتقابل عند المقهى',
  'الاجتماع تأجل إلى بعد الظهر',
  'مبرك! لقد فزت بالسحب 🎉',
  'هل انتهيت من المهمة؟',
  'لا تقول لأحد سمعت هذا الخبر',
  'الله يعطيك العافية، شكراً',
  'الطقس حلو اليوم، نروح البحر؟',
];

const MSG_KEY = 'wa-chats';
const DEEPLINK_KEY = 'wa-sim-deeplink';
// Minimum spacing between simulated messages (2–6 min randomized)
const MIN_GAP = 2 * 60000;
const MAX_GAP = 6 * 60000;

interface SimChat {
  id: string;
  contactId: string;
  unread: number;
  messages: { id: string; text: string; sender: string; timestamp: number }[];
}

export function useWhatsAppSimulation() {
  const { settings, addNotification } = useSystem();
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  const addNotifRef = useRef(addNotification);
  useEffect(() => {
    addNotifRef.current = addNotification;
  }, [addNotification]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const fire = () => {
      if (settingsRef.current.whatsappAutoMessages === false) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      let contactId = '';
      let chatId = '';
      let text = '';
      let senderName = '';
      try {
        const raw = localStorage.getItem(MSG_KEY);
        if (!raw) return;
        const chats: SimChat[] = JSON.parse(raw);
        if (!Array.isArray(chats) || chats.length === 0) return;
        contactId = SIM_CONTACTS[Math.floor(Math.random() * SIM_CONTACTS.length)];
        text = SIM_MESSAGES[Math.floor(Math.random() * SIM_MESSAGES.length)];
        const target = chats.find((c) => c.contactId === contactId);
        if (!target) return;
        chatId = target.id;
        const msg = {
          id: 'sim-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          text,
          sender: 'them',
          timestamp: Date.now(),
        };
        const next = chats.map((c) =>
          c.id === chatId ? { ...c, unread: c.unread + 1, messages: [...c.messages, msg] } : c
        );
        localStorage.setItem(MSG_KEY, JSON.stringify(next));
        // Notify the WhatsApp app (if open) to refresh from storage
        window.dispatchEvent(new CustomEvent('wa-sim-message', { detail: { chatId, text } }));
        // Record deep link for notification tap-through
        senderName =
          contactId === 'c1'
            ? 'أحمد العتيبي'
            : contactId === 'c2'
              ? 'فاطمة الزهراء'
              : contactId === 'c3'
                ? 'محمد سالم'
                : contactId === 'c4'
                  ? 'نورة القحطاني'
                  : contactId === 'c5'
                    ? 'خالد المطيري'
                    : 'سارة الحربي';
        localStorage.setItem(
          DEEPLINK_KEY,
          JSON.stringify({ chatId, text, senderName, ts: Date.now() })
        );
      } catch {
        return; // storage unavailable or malformed
      }
      addNotifRef.current({
        appId: 'whatsapp',
        title: 'واتساب',
        body: `${senderName}: ${text}`,
        targetId: chatId,
      });
    };

    const scheduleNext = () => {
      const gap = MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
      timer = setTimeout(() => {
        if (cancelled) return;
        fire();
        scheduleNext();
      }, gap);
    };
    scheduleNext();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
}
