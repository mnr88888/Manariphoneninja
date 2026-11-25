/**
 * Shared WhatsApp data layer.
 *
 * Holds the sample contacts/chats (used by the WhatsApp app AND by the
 * incoming-message engine) and `deliverWhatsAppMessage()`, which writes a
 * real incoming message into the same 'wa-chats' localStorage store the
 * WhatsApp app reads. It works even if WhatsApp was never opened before
 * (the store is seeded from SAMPLE_CHATS), so a red badge / banner always
 * has a real message behind it.
 */

export interface WAContact {
  id: string;
  name: string;
  color: string;
  about?: string;
}

export interface WAMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
  type?: 'text' | 'voice' | 'image';
  duration?: number;
}

export interface WAChat {
  id: string;
  contactId: string;
  messages: WAMessage[];
  unread: number;
}

export const SAMPLE_CONTACTS: WAContact[] = [
  { id: 'c1', name: 'أحمد العتيبي', color: '#FF3B30', about: 'متاح' },
  { id: 'c2', name: 'فاطمة الزهراء', color: '#FF9F0A', about: 'مشغول' },
  { id: 'c3', name: 'محمد سالم', color: '#34C759', about: 'في العمل' },
  { id: 'c4', name: 'نورة القحطاني', color: '#007AFF', about: 'متاحة' },
  { id: 'c5', name: 'خالد المطيري', color: '#5856D6', about: 'مشغول' },
  { id: 'c6', name: 'سارة الحربي', color: '#FF2D55', about: 'متاحة' },
];

export const HOUR = 3600000;

export const SAMPLE_CHATS: WAChat[] = [
  {
    id: 'ch1',
    contactId: 'c1',
    unread: 2,
    messages: [
      { id: 'm1', text: 'السلام عليكم أحمد', sender: 'me', timestamp: Date.now() - 5 * HOUR },
      { id: 'm2', text: 'وعليكم السلام، كيف حالك؟', sender: 'them', timestamp: Date.now() - 5 * HOUR + 60000 },
      { id: 'm3', text: 'بخير والحمد لله. هل انتهيت من التقرير؟', sender: 'me', timestamp: Date.now() - 5 * HOUR + 120000 },
      { id: 'm4', text: 'نعم تقريباً، باقي القسم الأخير', sender: 'them', timestamp: Date.now() - 4 * HOUR },
      { id: 'm5', text: 'ممتاز، أرسله لي عندما تنتهي', sender: 'me', timestamp: Date.now() - 4 * HOUR + 30000 },
      { id: 'm6', text: 'إن شاء الله، مساء اليوم', sender: 'them', timestamp: Date.now() - HOUR },
      { id: 'm7', text: 'وش رأيك نراجعه سوا غداً؟', sender: 'them', timestamp: Date.now() - 30 * 60000 },
    ],
  },
  {
    id: 'ch2',
    contactId: 'c2',
    unread: 1,
    messages: [
      { id: 'm1', text: 'فاطمة، شكراً على المساعدة أمس', sender: 'me', timestamp: Date.now() - 26 * HOUR },
      { id: 'm2', text: 'العفو، في أي وقت', sender: 'them', timestamp: Date.now() - 25 * HOUR },
      { id: 'm3', text: 'هل وصلتك الرسالة الأخيرة؟', sender: 'them', timestamp: Date.now() - 2 * HOUR },
    ],
  },
  {
    id: 'ch3',
    contactId: 'c3',
    unread: 0,
    messages: [
      { id: 'm1', text: 'محمد، اجتماع الغاء بيجمد العشرة صباحاً', sender: 'me', timestamp: Date.now() - 3 * 24 * HOUR },
      { id: 'm2', text: 'تمام، سأحضر في الموعد', sender: 'them', timestamp: Date.now() - 3 * 24 * HOUR + 300000 },
    ],
  },
  {
    id: 'ch4',
    contactId: 'c4',
    unread: 0,
    messages: [
      { id: 'm1', text: 'نورة، مبروك التخرج!', sender: 'me', timestamp: Date.now() - 7 * 24 * HOUR },
      { id: 'm2', text: 'شكراً جزيلاً الله يبارك فيك', sender: 'them', timestamp: Date.now() - 7 * 24 * HOUR + 600000 },
      { id: 'm3', text: type_voice(30), sender: 'them', timestamp: Date.now() - 7 * 24 * HOUR + 660000, type: 'voice', duration: 30 },
    ],
  },
  {
    id: 'ch5',
    contactId: 'c5',
    unread: 0,
    messages: [
      { id: 'm1', text: 'خالد، متى نلتقي؟', sender: 'me', timestamp: Date.now() - 2 * 24 * HOUR },
      { id: 'm2', text: 'الخميس إن أمكن', sender: 'them', timestamp: Date.now() - 2 * 24 * HOUR + 900000 },
    ],
  },
  {
    id: 'ch6',
    contactId: 'c6',
    unread: 0,
    messages: [
      { id: 'm1', text: 'سارة، كيف كان رحلتك؟', sender: 'me', timestamp: Date.now() - 10 * 24 * HOUR },
      { id: 'm2', text: 'رائعة! أرسلت لك الصور على الإيميل', sender: 'them', timestamp: Date.now() - 9 * 24 * HOUR },
    ],
  },
];

function type_voice(sec: number) {
  return `[رسالة صوتية ${sec} ثانية]`;
}


/* ============================================================
 * Incoming message delivery
 * ============================================================ */

export const WA_CHATS_KEY = 'wa-chats';
const WA_CONTACTS_KEY = 'wa-contacts';
const WA_DEEPLINK_KEY = 'wa-sim-deeplink';

/** Contacts that can "send" simulated messages */
const SIM_CONTACT_IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];

const SIM_MESSAGES = [
  'وين وصلت؟',
  'لا تنسى موعد الغد الساعة ٥',
  'شوف هذي الصورة 😂',
  'خلينا نتقابل بكرة الصباح',
  'أرسلت لك الملف على الإيميل',
  'تعال نتقابل عند المقهى',
  'الاجتماع تأجل إلى بعد الظهر',
  'مبروك! فزت بالسحب 🎉',
  'هل انتهيت من المهمة؟',
  'الله يعطيك العافية، شكراً',
  'الطقس حلو اليوم، نروح البحر؟',
  'شفت عروض نينجا لرمضان؟ فيه خصم ٢٠٪ 🌙',
  'طلبت مقاضي رمضان من نينجا وجتني بعشر دقايق 👏',
  'السلام عليكم، متى ترجع؟',
];

export interface IncomingWhatsApp {
  chatId: string;
  contactId: string;
  senderName: string;
  text: string;
  /** Total unread messages across all chats after this delivery */
  totalUnread: number;
}

let lastText = '';

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/**
 * Write one incoming WhatsApp message into the shared chat store.
 * - Seeds the store from SAMPLE_CHATS when WhatsApp was never opened.
 * - Bumps the chat's unread counter and notifies a mounted WhatsApp app
 *   (via the 'wa-sim-message' event) so it reloads from storage.
 * Returns null only if storage is unavailable.
 */
export function deliverWhatsAppMessage(): IncomingWhatsApp | null {
  if (typeof window === 'undefined') return null;
  try {
    let chats = readJSON<WAChat[]>(WA_CHATS_KEY);
    if (!Array.isArray(chats) || chats.length === 0) {
      chats = JSON.parse(JSON.stringify(SAMPLE_CHATS)) as WAChat[];
    }
    const contacts = readJSON<WAContact[]>(WA_CONTACTS_KEY) ?? SAMPLE_CONTACTS;

    const contactId = SIM_CONTACT_IDS[Math.floor(Math.random() * SIM_CONTACT_IDS.length)];
    const contact = contacts.find((c) => c.id === contactId) ?? SAMPLE_CONTACTS.find((c) => c.id === contactId);
    const senderName = contact?.name ?? 'واتساب';

    const pool = SIM_MESSAGES.filter((m) => m !== lastText);
    const text = pool[Math.floor(Math.random() * pool.length)];
    lastText = text;

    const msg: WAMessage = {
      id: 'sim-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      sender: 'them',
      timestamp: Date.now(),
      type: 'text',
    };

    let chat = chats.find((c) => c.contactId === contactId);
    if (!chat) {
      chat = { id: 'ch-' + contactId, contactId, unread: 0, messages: [] };
      chats = [...chats, chat];
    }
    const chatId = chat.id;
    const next = chats.map((c) =>
      c.id === chatId ? { ...c, unread: c.unread + 1, messages: [...c.messages, msg] } : c
    );

    localStorage.setItem(WA_CHATS_KEY, JSON.stringify(next));
    localStorage.setItem(WA_DEEPLINK_KEY, JSON.stringify({ chatId, text, senderName, ts: Date.now() }));
    window.dispatchEvent(new CustomEvent('wa-sim-message', { detail: { chatId, text } }));

    return {
      chatId,
      contactId,
      senderName,
      text,
      totalUnread: next.reduce((s, c) => s + c.unread, 0),
    };
  } catch {
    return null; // storage unavailable or malformed
  }
}
