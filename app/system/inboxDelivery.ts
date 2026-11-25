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
export interface XActivity {
  id: string;
  actor: string;
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
export const X_ACTIVITY_SEED: XActivity[] = [
  { id: 'x-activity-seed-1', actor: 'الدكتورة سارة', type: 'like', body: 'أعجبت بمنشورك عن فكرة المحاكي', timestamp: Date.now() - 35 * 60000, read: true },
  { id: 'x-activity-seed-2', actor: 'ريم الدوسري', type: 'repost', body: 'أعادت نشر منشورك عن تجربة المستخدم', timestamp: Date.now() - 2 * 3600000, read: true },
];
function socialSeed(appId: SocialAppId): SocialThread[] {
  return [
    { id: `${appId}-sarah`, name: 'الدكتورة سارة', color: '#AF52DE', messages: [
      { id: `${appId}-seed-1`, text: appId === 'instagram' ? 'لقيت مرجع حلو للواجهة، تبين أوريك؟' : 'شفت نقاش تصميم المحاكيات؟ خلينا ناخذ منه أفكار.', sender: 'them', timestamp: Date.now() - 45 * 60000, read: true },
      { id: `${appId}-seed-2`, text: 'أكيد، خلينا نشوفه بعد المحاضرة', sender: 'me', timestamp: Date.now() - 40 * 60000, read: true },
    ] },
    { id: `${appId}-reem`, name: 'ريم الدوسري', color: '#007AFF', messages: [
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
function normalizeSocialNames(appId: SocialAppId): void {
  const key = SOCIAL_KEYS[appId];
  const threads = readStore<SocialThread[] | null>(key, null);
  if (!Array.isArray(threads)) return;
  const names = ['الدكتورة سارة', 'ريم الدوسري'];
  const normalized = threads.map((thread, index) => ({ ...thread, name: names[index % names.length] }));
  if (JSON.stringify(normalized) !== JSON.stringify(threads)) writeStore(key, normalized);
}
/** Apps do not have to be opened for an incoming message to be stored. */
export function ensureInboxStores() {
  if (typeof window === 'undefined') return;
  seedArray('mail-emails', SAMPLE_EMAILS);
  seedArray('messages.contacts', SMS_CONTACTS);
  seedArray('messages.conversations', SMS_CONVERSATIONS);
  seedArray(SOCIAL_KEYS.instagram, SOCIAL_SEEDS.instagram);
  seedArray(SOCIAL_KEYS.x, SOCIAL_SEEDS.x);
  normalizeSocialNames('instagram');
  normalizeSocialNames('x');
  seedArray(X_ACTIVITY_KEY, X_ACTIVITY_SEED);
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
  { from: 'الدكتورة سارة', subject: 'تأكيد عنوان العرض', body: 'تم اعتماد عنوان تجربة محاكي الآيفون التفاعلي للعرض النهائي.' },
  { from: 'ريم الدوسري', subject: 'ملف الألوان جاهز', body: 'رفعت ملف الألوان الجديد، شوفي التدرجات واختاري الأنسب للشاشة الرئيسية.' },
  { from: 'شؤون الطالبات', subject: 'تذكير بالحضور', body: 'نذكركم بالحضور قبل بداية العرض بربع ساعة.' },
  { from: 'نورة القحطاني', subject: 'ملاحظات الاختبار', body: 'سجلت ملاحظات اختبار التنقل، معظم الأزرار تعمل بشكل ممتاز.' },
  { from: 'جود الحربي', subject: 'تحديث الإشعارات', body: 'اختبرت فتح الإشعار، صار يفتح الرسالة نفسها داخل التطبيق الصحيح.' },
  { from: 'لينا محمد', subject: 'مراجعة الخط العربي', body: 'عدلت حجم الخط واتجاه النصوص، أحتاج رأيك قبل الدمج.' },
  { from: 'الدكتورة سارة', subject: 'سؤال عن حدود المحاكي', body: 'اكتبوا بوضوح أن الكاميرا وخدمات الهاتف تعمل داخل المتصفح بإذن المستخدم.' },
  { from: 'ريم الدوسري', subject: 'دعوة اجتماع الفريق', body: 'نجتمع الليلة لمراجعة آخر نسخة قبل التسليم.' },
  { from: 'شؤون الطالبات', subject: 'رابط القاعة الافتراضية', body: 'هذا رابط القاعة الافتراضية الخاصة بالبروفة النهائية.' },
  { from: 'نورة القحطاني', subject: 'قائمة المهام الأخيرة', body: 'باقي توثيق التخزين، مراجعة الأسماء، وتجربة الكاميرا.' },
  { from: 'جود الحربي', subject: 'نتيجة تجربة التخزين', body: 'الرسائل بقيت محفوظة بعد إغلاق المحاكي وإعادة فتحه.' },
  { from: 'لينا محمد', subject: 'اقتراح للعرض', body: 'نبدأ العرض بإشعار ثم نفتح المحادثة، بيكون السيناريو واضح وسريع.' },
  { from: 'الدكتورة سارة', subject: 'بالتوفيق في العرض', body: 'شغلكم مرتب، ركزوا على شرح الفكرة وتجربة المستخدم.' },
  { from: 'ريم الدوسري', subject: 'النسخة النهائية', body: 'أرسلت النسخة النهائية للمراجعة، لا تنسين تحفظين نسخة احتياطية.' },
  { from: 'شؤون الطالبات', subject: 'تم استلام المشروع', body: 'تم استلام ملف المشروع بنجاح، بالتوفيق للفريق.' },
];
const SMS_POOL = ['أنا عند باب المكتبة، وينك؟', 'المحاضرة صارت في القاعة ٢٠٤، لا تروحين القديمة', 'خلصت المسودة، نراجعها بعد العصر؟', 'إذا وصلتي البيت طمنيني', 'اجتماعنا الساعة ٥، جيبي ملاحظاتك معك', 'وصلني الملف، شكرًا على الترتيب', 'لا تنسين شاحن الآيفون اليوم', 'خلصت من القهوة، أجيب لك معاي؟', 'غيروا موعد الاجتماع للساعة ٦', 'أنا بالطريق وبوصل بعد عشر دقائق', 'شفت الملاحظة الجديدة في الملف؟', 'بكرة نراجع العرض مع بعض', 'الجو حلو، نتمشى بعد المحاضرة؟', 'أرسلت لك صورة المكان على الواتساب', 'تمام، خلينا نبدأ من الشاشة الرئيسية', 'وصلت البيت، يعطيك العافية'];
const SOCIAL_POOL: Record<SocialAppId, string[]> = {
  instagram: ['شفت الستوري حقك، شكل القهوة يفوز!', 'لقيت لوحة ألوان هادئة للمحاكي، نجرب البنفسجي ولا الأزرق؟', 'نبي الواجهة واضحة حتى وأنا أستخدم الجوال بيد وحدة.', 'المحاكي صار مرتب! نجرّب الإشعارات وأنا داخل إنستقرام؟', 'صورت لك أفكار للقروب، بس لا تعتمدين الصورة اللي فيها كوب القهوة بالغلط.', 'الخط الجديد واضح مرة في شاشة القفل.', 'نشرت لقطة من الواجهة، الفريق تحمس لها.', 'وش رأيك نضيف حركة بسيطة عند فتح التطبيق؟', 'أرسلت لك مرجع لأيقونات iOS.', 'التدرج البنفسجي طلع فخم مع الوضع الداكن.', 'جربت البحث داخل المحادثات واشتغل بسرعة.', 'خلينا نصور تجربة الإشعار للعرض.', 'تعليق الدكتورة على الفكرة كان مشجع.', 'باقي نراجع المسافات بين الأيقونات.', 'أحس المحاكي صار قريب من تجربة الجوال الحقيقية.', 'إذا خلصنا نحتفل بقهوة بدون تعديل ألوان 😂'],
  x: ['قريت نقاش عن تجربة المستخدم: أهم شيء الرسالة ما تختفي بعد التحديث.', 'وش الأفضل للمشروع: محاكي كامل ولا سيناريو تفاعلي واحد؟ أنا أميل للكامل.', 'ردك على الفكرة عجبني، نضيف اختبار استخدام بسيط؟', 'إذا خلصنا المشروع بنكتب ثريد: كيف نجونا من زر رجوع واحد.', 'فكرة اليوم: الإشعار يفتح نفس المحادثة بدل ما يوديك للصفحة الرئيسية.', 'اختبار صغير: هل المستخدم يعرف يرجع للشاشة الرئيسية؟', 'التصميم الهادئ يخلّي التفاعل أوضح بكثير.', 'كتبت مسودة الثريد عن رحلة بناء المحاكي.', 'زر الكاميرا الحقيقي يحتاج إذن المستخدم وهذا ممتاز للخصوصية.', 'حفظ البيانات محلياً خلّى التجربة ثابتة بعد التحديث.', 'أعجبني تنوع الإشعارات بين التطبيقات.', 'لا تنسون توثقون سبب اختيار Next.js.', 'المشروع يثبت أن التفاصيل الصغيرة تصنع الفرق.', 'باقي لمسة أخيرة على شاشة القفل.', 'جهزت صورة مقارنة بين قبل وبعد.', 'الفريق جاهز للبروفة النهائية.'],
};
const X_ACTIVITY_POOL: Array<Pick<XActivity, 'actor' | 'type' | 'body'>> = [
  { actor: 'الدكتورة سارة', type: 'like', body: 'أعجبت بمنشورك عن المحاكي' }, { actor: 'ريم الدوسري', type: 'repost', body: 'أعادت نشر منشورك عن تجربة المستخدم' },
  { actor: 'زهراء علي', type: 'follow', body: 'بدأت بمتابعتك' }, { actor: 'فرقان', type: 'mention', body: 'ذكرتك في منشور عن العرض' },
  { actor: 'زهراء زهير', type: 'like', body: 'أعجبت بصورتك من الكاميرا' }, { actor: 'فاطمه ماجد', type: 'repost', body: 'أعادت نشر تحديث المشروع' },
  { actor: 'الدكتورة سارة', type: 'like', body: 'أعجبت بمنشورك الأخير' }, { actor: 'ريم الدوسري', type: 'follow', body: 'بدأت بمتابعتك' },
  { actor: 'زهراء علي', type: 'repost', body: 'أعادت نشر فكرة الإشعارات' }, { actor: 'فرقان', type: 'like', body: 'أعجب بمنشورك عن تجربة المستخدم' },
  { actor: 'زهراء زهير', type: 'mention', body: 'ذكرتك في منشور الفريق' }, { actor: 'فاطمه ماجد', type: 'like', body: 'أعجبت بمنشورك عن التصميم' },
  { actor: 'الدكتورة سارة', type: 'repost', body: 'أعادت نشر منشور العرض النهائي' }, { actor: 'ريم الدوسري', type: 'like', body: 'أعجبت بمنشورك عن الكاميرا الحقيقية' },
  { actor: 'فرقان', type: 'follow', body: 'بدأ بمتابعتك' }, { actor: 'زهراء زهير', type: 'repost', body: 'أعادت نشر ملخص المشروع' },
];
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
    const sample = X_ACTIVITY_POOL[nextIndex('x-activity', X_ACTIVITY_POOL.length)];
    const activity: XActivity = { id, ...sample, timestamp, read: false };
    const next = [activity, ...readStore<XActivity[]>(X_ACTIVITY_KEY, X_ACTIVITY_SEED)];
    if (!writeStore(X_ACTIVITY_KEY, next)) return null;
    return { id, appId, title: sample.actor, body: sample.body, targetId: 'x-activity', messageId: id, badge: next.filter((item) => !item.read).length };
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
