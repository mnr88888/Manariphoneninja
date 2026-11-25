import { RAMADAN_NOTIFICATIONS } from '../apps/ninja/data';
import { Email, SAMPLE_EMAILS, SMSContact, SMSConversation, SMS_CONTACTS, SMS_CONVERSATIONS } from './inboxStore';
import { makeMessageId, readStore, writeStore } from './storage';
import { ensureXStore, getOwnXPosts, incrementXPostActivity, isOwnXPost, readXPost, readXPosts, X_POSTS_KEY, xPostTarget } from './xStore';

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
export interface XActivity {
  id: string;
  actor: string;
  /** Real stored post belonging to the signed-in account; never a body-text inference. */
  postId: string;
  type: 'like' | 'repost' | 'follow' | 'mention';
  body: string;
  timestamp: number;
  read: boolean;
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
export const X_ACTIVITY_KEY = 'x-activity-v1';
// Old body-only seeds described nonexistent posts. Do not manufacture a history of likes.
export const X_ACTIVITY_SEED: XActivity[] = [];
function socialSeed(appId: SocialAppId): SocialThread[] {
  return [
    { id: `${appId}-zahra-ali`, name: 'زهراء علي', color: '#AF52DE', messages: [
      { id: `${appId}-seed-1`, text: 'شفت عرض نينجا الجديد؟ شكله مناسب لسفرة رمضان.', sender: 'them', timestamp: Date.now() - 45 * 60000, read: true },
      { id: `${appId}-seed-2`, text: 'أكيد، خلينا نشوفه بعد المحاضرة', sender: 'me', timestamp: Date.now() - 40 * 60000, read: true },
    ] },
    { id: `${appId}-zahra-zu`, name: 'زهراء زهير', color: '#007AFF', messages: [
      { id: `${appId}-seed-3`, text: 'شفتي منشور Ninja عن التوصيل المجاني؟', sender: 'them', timestamp: Date.now() - 30 * 60000, read: true },
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
function normalizeSocialNames(appId: SocialAppId): void {
  const key = SOCIAL_KEYS[appId];
  const threads = readStore<SocialThread[] | null>(key, null);
  if (!Array.isArray(threads)) return;
  const names = ['زهراء علي', 'زهراء زهير'];
  const simulatorContent = /محاكي|المحاكي|المشروع|الإشعار|الكاميرا|الدكتورة|دكتوره/i;
  const normalized = threads.map((thread, index) => ({
    ...thread,
    name: names[index % names.length],
    messages: thread.messages.filter((message) => !simulatorContent.test(message.text)),
  }));
  if (JSON.stringify(normalized) !== JSON.stringify(threads)) writeStore(key, normalized);
}
function normalizeXActivities(): void {
  const current = readStore<XActivity[] | null>(X_ACTIVITY_KEY, null);
  if (!Array.isArray(current)) return;
  const normalized = current.filter((item) => {
    const post = item.postId ? readXPost(item.postId) : undefined;
    return post && isOwnXPost(post);
  });
  if (normalized.length !== current.length) writeStore(X_ACTIVITY_KEY, normalized);
}
function normalizeMailStore(): void {
  const current = readStore<Email[] | null>('mail-emails', null);
  if (!Array.isArray(current)) return;
  const normalized = current.map((email) => {
    if (!/سارة/.test(email.from + email.body)) return email;
    return { ...email, from: 'زهراء علي', body: email.body.replace(/سارة/g, 'زهراء علي') };
  });
  if (JSON.stringify(normalized) !== JSON.stringify(current)) writeStore('mail-emails', normalized);
}
/** Apps do not have to be opened for an incoming message to be stored. */
export function ensureInboxStores() {
  if (typeof window === 'undefined') return;
  ensureXStore();
  seedArray('mail-emails', SAMPLE_EMAILS);
  normalizeMailStore();
  seedArray('messages.contacts', SMS_CONTACTS);
  seedArray('messages.conversations', SMS_CONVERSATIONS);
  seedArray(SOCIAL_KEYS.instagram, SOCIAL_SEEDS.instagram);
  seedArray(SOCIAL_KEYS.x, SOCIAL_SEEDS.x);
  normalizeSocialNames('instagram');
  normalizeSocialNames('x');
  seedArray(X_ACTIVITY_KEY, X_ACTIVITY_SEED);
  normalizeXActivities();
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
  postId?: string;
  badge: number;
}
const EMAIL_POOL = [
  { from: 'زهراء علي', subject: 'ملاحظات على فكرة المحاكي', body: 'مرحبًا منار،\n\nركّزوا على واقعية التفاعل: كل إشعار يجب أن يفتح محتواه داخل التطبيق. قارنوا بين فكرتين ووضّحوا سبب اختياركم للفكرة النهائية.\n\nبالتوفيق،\nزهراء' },
  { from: 'زهراء زهير', subject: 'مسودة واجهات المحاكي', body: 'منار،\n\nجهزت مسودة الشاشات: الرئيسية، شاشة القفل، والمحادثات. نراجع سهولة التنقل وأحجام النصوص في اجتماعنا.\n\nولا تنسين نختبره بالجوال، مو على شاشة اللابتوب بس!\nزهراء' },
  { from: 'فرقان', subject: 'تحديث موعد عرض المشاريع', body: 'عزيزتي منار،\n\nسيكون عرض المشاريع يوم الأحد الساعة العاشرة صباحًا. يرجى تجهيز نسخة قابلة للتجربة وعرض مختصر لفكرة المشروع.\n\nمع التحية' },
  { from: 'فاطمه ماجد', subject: 'تقسيم مهام الفريق', body: 'هلا منار،\n\nأنا أراجع تجربة الاستخدام، زهراء تجهز الواجهات، ونقسم الملاحظات والاختبارات بيننا.\n\nالقهوة علينا اليوم.\nفاطمه' },
  { from: 'زهراء زهير', subject: 'تأكيد عنوان العرض', body: 'تم اعتماد عنوان تجربة محاكي الآيفون التفاعلي للعرض النهائي.' },
  { from: 'زهراء علي', subject: 'ملف الألوان جاهز', body: 'رفعت ملف الألوان الجديد، شوفي التدرجات واختاري الأنسب للشاشة الرئيسية.' },
  { from: 'زهراء زهير', subject: 'تذكير بالحضور', body: 'نذكركم بالحضور قبل بداية العرض بربع ساعة.' },
  { from: 'فرقان', subject: 'ملاحظات الاختبار', body: 'سجلت ملاحظات اختبار التنقل، معظم الأزرار تعمل بشكل ممتاز.' },
  { from: 'فاطمه ماجد', subject: 'تحديث الإشعارات', body: 'اختبرت فتح الإشعار، صار يفتح الرسالة نفسها داخل التطبيق الصحيح.' },
  { from: 'زهراء علي', subject: 'مراجعة الخط العربي', body: 'عدلت حجم الخط واتجاه النصوص، أحتاج رأيك قبل الدمج.' },
  { from: 'فرقان', subject: 'سؤال عن حدود المحاكي', body: 'اكتبوا بوضوح أن الكاميرا وخدمات الهاتف تعمل داخل المتصفح بإذن المستخدم.' },
  { from: 'زهراء زهير', subject: 'دعوة اجتماع الفريق', body: 'نجتمع الليلة لمراجعة آخر نسخة قبل التسليم.' },
  { from: 'فرقان', subject: 'رابط القاعة الافتراضية', body: 'هذا رابط القاعة الافتراضية الخاصة بالبروفة النهائية.' },
  { from: 'فاطمه ماجد', subject: 'قائمة المهام الأخيرة', body: 'باقي توثيق التخزين، مراجعة الأسماء، وتجربة الكاميرا.' },
  { from: 'زهراء علي', subject: 'نتيجة تجربة التخزين', body: 'الرسائل بقيت محفوظة بعد إغلاق المحاكي وإعادة فتحه.' },
  { from: 'زهراء زهير', subject: 'اقتراح للعرض', body: 'نبدأ العرض بإشعار ثم نفتح المحادثة، بيكون السيناريو واضح وسريع.' },
  { from: 'فاطمه ماجد', subject: 'بالتوفيق في العرض', body: 'شغلكم مرتب، ركزوا على شرح الفكرة وتجربة المستخدم.' },
  { from: 'فرقان', subject: 'النسخة النهائية', body: 'أرسلت النسخة النهائية للمراجعة، لا تنسين تحفظين نسخة احتياطية.' },
  { from: 'فاطمه ماجد', subject: 'تم استلام المشروع', body: 'تم استلام ملف المشروع بنجاح، بالتوفيق للفريق.' },
];
const SMS_POOL = ['أنا عند باب المكتبة، وينك؟', 'المحاضرة صارت في القاعة ٢٠٤، لا تروحين القديمة', 'خلصت المسودة، نراجعها بعد العصر؟', 'إذا وصلتي البيت طمنيني', 'اجتماعنا الساعة ٥، جيبي ملاحظاتك معك', 'وصلني الملف، شكرًا على الترتيب', 'لا تنسين شاحن الآيفون اليوم', 'خلصت من القهوة، أجيب لك معاي؟', 'غيروا موعد الاجتماع للساعة ٦', 'أنا بالطريق وبوصل بعد عشر دقائق', 'شفت الملاحظة الجديدة في الملف؟', 'بكرة نراجع العرض مع بعض', 'الجو حلو، نتمشى بعد المحاضرة؟', 'أرسلت لك صورة المكان على الواتساب', 'تمام، خلينا نبدأ من الشاشة الرئيسية', 'وصلت البيت، يعطيك العافية'];
const SOCIAL_POOL: Record<SocialAppId, string[]> = {
  instagram: ['شفت الستوري حقك، شكل القهوة يفوز!', 'عرض نينجا الجديد على التمور شكله لذيذ.', 'شفتي وصفة السمبوسة اللي نزلها حساب Ninja؟', 'توصيل نينجا اليوم كان سريع مرة.', 'صورت لك سفرة رمضان، بس لا تعتمدين صورة كوب القهوة بالغلط.', 'التمر والقهوة ثنائي ما يختلف عليه اثنين.', 'منشور الفوانيس عند Ninja جميل.', 'وش رأيك بعرض التوصيل المجاني؟', 'أرسلت لك رابط حملة رمضان.', 'القطايف شكلها يفتح النفس.', 'جربت أطلب مستلزمات السحور ووصلت بدري.', 'حساب Ninja نزل وصفة جديدة اليوم.', 'العروض الرمضانية هذا العام متنوعة.', 'باقي أجرب صندوق الضيافة.', 'أحس أجواء رمضان بدأت من منشورات Ninja.', 'إذا خلصنا نحتفل بقهوة وطلب حلو 😂'],
  x: ['منشور Ninja عن سفرة الإفطار أخذ تفاعلاً كبيراً.', 'عرض التوصيل المجاني من Ninja مناسب للعزائم.', 'شفت ثريد Ninja عن تجهيزات رمضان؟', 'منشور التمور اليوم مرتب جداً.', 'إعادة نشر وصفة القطايف كانت فكرة موفقة.', 'حساب Ninja أعلن عن صندوق السحور.', 'الفوانيس في آخر منشور جميلة.', 'كود RAMADAN20 ظاهر في المنشور المثبت.', 'التوصيل السريع هو أكثر شيء يعجبني في Ninja.', 'منشور القهوة العربية انتشر بسرعة.', 'عرض الضيافة الرمضانية يستحق التجربة.', 'المنتجات الجديدة نزلت في بروفايل Ninja.', 'منشور المشروبات مناسب للأجواء الحارة.', 'عروض Ninja هذا الأسبوع واضحة ومباشرة.', 'منشور التمر حقق تفاعلاً ممتازاً.', 'البروفايل مرتب بعد تحديث منشورات رمضان.'],
};
const X_LIKE_ACTORS = ['زهراء علي', 'زهراء زهير', 'ريم الدوسري', 'فاطمة ماجد', 'نورة القحطاني', 'أحمد العتيبي', 'سارة الحربي', 'محمد سالم', 'جود صالح', 'لينا أحمد', 'هند يوسف', 'دانة فهد', 'عبدالله الشمري', 'خالد المطيري', 'ماجد ناصر', 'بدر العبدالله'];
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
  if (appId === 'x') {
    const ownPosts = getOwnXPosts().sort((a, b) => b.timestamp - a.timestamp);
    if (!ownPosts.length) return null;
    const current = readStore<XActivity[]>(X_ACTIVITY_KEY, X_ACTIVITY_SEED);
    const start = nextIndex('x-activity', X_LIKE_ACTORS.length);
    // A simulated person can like each real own post once, never another person's post.
    for (let offset = 0; offset < X_LIKE_ACTORS.length; offset += 1) {
      const actor = X_LIKE_ACTORS[(start + offset) % X_LIKE_ACTORS.length];
      const post = ownPosts.find((p) => !current.some((a) => a.actor === actor && a.postId === p.id && a.type === 'like'));
      if (!post) continue;
      const excerpt = post.text.replace(/\s+/g, ' ').slice(0, 74);
      const body = `أعجب بمنشورك: «${excerpt}${post.text.replace(/\s+/g, ' ').length > 74 ? '…' : ''}»`;
      const activity: XActivity = { id, actor, type: 'like', postId: post.id, body, timestamp, read: false };
      const previousPosts = readXPosts();
      if (!incrementXPostActivity(post.id, 'like')) return null;
      const next = [activity, ...current];
      if (!writeStore(X_ACTIVITY_KEY, next)) {
        writeStore(X_POSTS_KEY, previousPosts);
        return null;
      }
      return { id, appId, title: actor, body, postId: post.id, targetId: xPostTarget(post.id), messageId: id, badge: next.filter((item) => !item.read).length };
    }
    return null;
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
    x: readStore<XActivity[]>(X_ACTIVITY_KEY, X_ACTIVITY_SEED).filter((item) => !item.read).length,
    whatsapp: readStore<{unread: number}[]>('wa-chats', []).reduce((sum, c) => sum + c.unread, 0),
  };
}
