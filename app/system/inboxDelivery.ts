import { RAMADAN_NOTIFICATIONS } from '../apps/ninja/data';
import { Email, SAMPLE_EMAILS, SMSContact, SMSConversation, SMS_CONTACTS, SMS_CONVERSATIONS } from './inboxStore';
import { makeMessageId, readStore, writeStore } from './storage';

export type SocialAppId = 'instagram' | 'x';
export interface SocialMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
  read: boolean;
}
export interface SocialThread {
  id: string;
  name: string;
  color: string;
  messages: SocialMessage[];
}
export interface NinjaInboxMessage {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}
export const SOCIAL_KEYS: Record<SocialAppId, string> = {
  instagram: 'instagram-dm-threads-v1', x: 'x-dm-threads-v1',
};
function socialSeed(appId: SocialAppId): SocialThread[] {
  return [
    { id: `${appId}-reem`, name: 'ريم الدوسري', color: '#AF52DE', messages: [
      { id: `${appId}-seed-1`, text: appId === 'instagram' ? 'لقيت مرجع حلو للواجهة، تبين أوريك؟' : 'شفت نقاش تصميم المحاكيات؟ خلينا ناخذ منه أفكار.', sender: 'them', timestamp: Date.now() - 45 * 60000, read: true },
      { id: `${appId}-seed-2`, text: 'أكيد، خلينا نشوفه بعد المحاضرة', sender: 'me', timestamp: Date.now() - 40 * 60000, read: true },
    ] },
    { id: `${appId}-noura`, name: 'نورة القحطاني', color: '#007AFF', messages: [
      { id: `${appId}-seed-3`, text: 'القهوة بعد المحاضرة؟ عندي اقتراح للمشروع.', sender: 'them', timestamp: Date.now() - 30 * 60000, read: true },
    ] },
  ];
}
export const SOCIAL_SEEDS: Record<SocialAppId, SocialThread[]> = { instagram: socialSeed('instagram'), x: socialSeed('x') };
export const NINJA_INBOX_KEY = 'ninja-message-inbox-v2';
export const NINJA_INBOX_SEED: NinjaInboxMessage[] = RAMADAN_NOTIFICATIONS.map((message, index) => ({
  ...message, id: `ninja-ramadan-${index}`, timestamp: Date.now() - (index + 1) * 1800000, read: true,
}));
function seedArray<T>(key: string, fallback: T[]) {
  if (!Array.isArray(readStore<T[] | null>(key, null))) writeStore(key, fallback);
}
/** Apps do not have to be opened for an incoming message to be stored. */
export function ensureInboxStores() {
  if (typeof window === 'undefined') return;
  seedArray('mail-emails', SAMPLE_EMAILS);
  seedArray('messages.contacts', SMS_CONTACTS);
  seedArray('messages.conversations', SMS_CONVERSATIONS);
  seedArray(SOCIAL_KEYS.instagram, SOCIAL_SEEDS.instagram);
  seedArray(SOCIAL_KEYS.x, SOCIAL_SEEDS.x);
  if (!Array.isArray(readStore(NINJA_INBOX_KEY, null))) {
    const legacyRead = readStore<string[]>('ninja-inbox-read', []);
    writeStore(NINJA_INBOX_KEY, NINJA_INBOX_SEED.map((m) => ({ ...m, read: legacyRead.length ? legacyRead.includes(m.id) : true })));
  }
}
export interface DeliveredInboxMessage {
  id: string;
  appId: 'mail' | 'messages' | 'ninja' | SocialAppId;
  title: string;
  body: string;
  targetId: string;
  messageId: string;
  badge: number;
}
const EMAIL_POOL = [
  { from: 'الدكتورة سارة', subject: 'ملاحظات على فكرة المحاكي', body: 'مرحبًا منار،\n\nركّزوا على واقعية التفاعل: كل إشعار يجب أن يفتح محتواه داخل التطبيق. قارنوا بين فكرتين ووضّحوا سبب اختياركم للفكرة النهائية.\n\nبالتوفيق،\nد. سارة' },
  { from: 'ريم الدوسري', subject: 'مسودة واجهات المحاكي', body: 'منار،\n\nجهزت مسودة الشاشات: الرئيسية، شاشة القفل، والمحادثات. نراجع سهولة التنقل وأحجام النصوص في اجتماعنا.\n\nولا تنسين نختبره بالجوال، مو على شاشة اللابتوب بس!\nريم' },
  { from: 'شؤون الطالبات', subject: 'تحديث موعد عرض المشاريع', body: 'عزيزتي منار،\n\nسيكون عرض المشاريع يوم الأحد الساعة العاشرة صباحًا. يرجى تجهيز نسخة قابلة للتجربة وعرض مختصر لفكرة المشروع.\n\nمع التحية' },
  { from: 'نورة القحطاني', subject: 'تقسيم مهام الفريق', body: 'هلا منار،\n\nأنا أراجع تجربة الاستخدام، ريم تجهز الواجهات، جود تجمع الملاحظات، ولينا تختبر الإشعارات. دورك تدمجين الأجزاء ونراجعها سوا.\n\nالقهوة علينا اليوم.\nنورة' },
];
const SMS_POOL = ['أنا عند باب المكتبة، وينك؟', 'المحاضرة صارت في القاعة ٢٠٤، لا تروحين القديمة', 'خلصت المسودة، نراجعها بعد العصر؟', 'إذا وصلتي البيت طمنيني', 'اجتماعنا الساعة ٥، جيبي ملاحظاتك معك', 'وصلني الملف، شكرًا على الترتيب'];
const SOCIAL_POOL: Record<SocialAppId, string[]> = {
  instagram: ['شفت الستوري حقك، شكل القهوة يفوز!', 'لقيت لوحة ألوان هادئة للمحاكي، نجرب البنفسجي ولا الأزرق؟', 'نبي الواجهة واضحة حتى وأنا أستخدم الجوال بيد وحدة.', 'المحاكي صار مرتب! نجرّب الإشعارات وأنا داخل إنستقرام؟', 'صورت لك أفكار للقروب، بس لا تعتمدين الصورة اللي فيها كوب القهوة بالغلط.'],
  x: ['قريت نقاش عن تجربة المستخدم: أهم شيء الرسالة ما تختفي بعد التحديث.', 'وش الأفضل للمشروع: محاكي كامل ولا سيناريو تفاعلي واحد؟ أنا أميل للكامل.', 'ردك على الفكرة عجبني، نضيف اختبار استخدام بسيط؟', 'إذا خلصنا المشروع بنكتب ثريد: كيف نجونا من زر رجوع واحد.', 'فكرة اليوم: الإشعار يفتح نفس المحادثة بدل ما يوديك للصفحة الرئيسية.'],
};
function nextIndex(key: string, length: number): number {
  const cursor = readStore<number>(`sim-cursor-${key}`, 0);
  const valid = typeof cursor === 'number' && Number.isFinite(cursor) ? cursor : 0;
  writeStore(`sim-cursor-${key}`, valid + 1);
  return valid % length;
}
export function deliverInboxMessage(appId: DeliveredInboxMessage['appId']): DeliveredInboxMessage | null {
  if (typeof window === 'undefined') return null;
  ensureInboxStores();
  const id = makeMessageId(appId);
  const timestamp = Date.now();
  if (appId === 'mail') {
    const sample = EMAIL_POOL[nextIndex(appId, EMAIL_POOL.length)];
    const email: Email = { id, ...sample, timestamp, read: false, starred: false, folder: 'inbox' };
    const next = [email, ...readStore<Email[]>('mail-emails', SAMPLE_EMAILS)];
    if (!writeStore('mail-emails', next)) return null;
    return { id, appId, title: sample.from, body: sample.subject, targetId: id, messageId: id, badge: next.filter((e) => e.folder === 'inbox' && !e.read).length };
  }
  if (appId === 'messages') {
    const index = nextIndex(appId, SMS_POOL.length);
    const contact = SMS_CONTACTS[index % SMS_CONTACTS.length];
    const contacts = readStore<SMSContact[]>('messages.contacts', SMS_CONTACTS);
    if (!contacts.some((c) => c.id === contact.id)) writeStore('messages.contacts', [...contacts, contact]);
    const conversations = readStore<SMSConversation[]>('messages.conversations', SMS_CONVERSATIONS);
    const conversation = conversations.find((c) => c.contactId === contact.id) ?? { id: `conv-${contact.id}`, contactId: contact.id, unread: 0, messages: [] };
    const text = SMS_POOL[index];
    const updated = { ...conversation, unread: conversation.unread + 1, messages: [...conversation.messages, { id, text, sender: 'them' as const, timestamp }] };
    const next = [...conversations.filter((c) => c.id !== conversation.id), updated];
    if (!writeStore('messages.conversations', next)) return null;
    return { id, appId, title: contact.name, body: text, targetId: conversation.id, messageId: id, badge: next.reduce((sum, c) => sum + c.unread, 0) };
  }
  if (appId === 'ninja') {
    const sample = RAMADAN_NOTIFICATIONS[nextIndex(appId, RAMADAN_NOTIFICATIONS.length)];
    const message: NinjaInboxMessage = { id, ...sample, timestamp, read: false };
    const next = [message, ...readStore<NinjaInboxMessage[]>(NINJA_INBOX_KEY, NINJA_INBOX_SEED)];
    if (!writeStore(NINJA_INBOX_KEY, next)) return null;
    return { id, appId, title: sample.title, body: sample.body, targetId: id, messageId: id, badge: next.filter((m) => !m.read).length };
  }
  const index = nextIndex(appId, SOCIAL_POOL[appId].length);
  const seeds = SOCIAL_SEEDS[appId];
  const seed = seeds[index % seeds.length];
  const threads = readStore<SocialThread[]>(SOCIAL_KEYS[appId], seeds);
  const thread = threads.find((t) => t.id === seed.id) ?? { ...seed, messages: [] };
  const text = SOCIAL_POOL[appId][index];
  const updated = { ...thread, messages: [...thread.messages, { id, text, sender: 'them' as const, timestamp, read: false }] };
  const next = [updated, ...threads.filter((t) => t.id !== thread.id)];
  if (!writeStore(SOCIAL_KEYS[appId], next)) return null;
  return { id, appId, title: thread.name, body: text, targetId: thread.id, messageId: id, badge: countSocialUnread(next) };
}
export function countSocialUnread(threads: SocialThread[]) {
  return threads.reduce((sum, thread) => sum + thread.messages.filter((m) => m.sender === 'them' && !m.read).length, 0);
}
export function getInboxBadges(): Record<string, number> {
  return {
    messages: readStore<SMSConversation[]>('messages.conversations', SMS_CONVERSATIONS).reduce((sum, c) => sum + c.unread, 0),
    mail: readStore<Email[]>('mail-emails', SAMPLE_EMAILS).filter((e) => e.folder === 'inbox' && !e.read).length,
    ninja: readStore<NinjaInboxMessage[]>(NINJA_INBOX_KEY, NINJA_INBOX_SEED).filter((m) => !m.read).length,
    instagram: countSocialUnread(readStore(SOCIAL_KEYS.instagram, SOCIAL_SEEDS.instagram)),
    x: countSocialUnread(readStore(SOCIAL_KEYS.x, SOCIAL_SEEDS.x)),
    whatsapp: readStore<{unread: number}[]>('wa-chats', []).reduce((sum, c) => sum + c.unread, 0),
  };
}
