/** The single source of truth for the app and the incoming-message engine. */
export interface WAGroupMember {
  id: string;
  name: string;
  color: string;
}

export interface WAContact {
  id: string;
  name: string;
  color: string;
  about?: string;
  kind?: 'person' | 'ninja' | 'group';
  avatar?: string;
}

export interface WAMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  senderName?: string;
  senderId?: string;
  timestamp: number;
  type?: 'text' | 'voice' | 'image';
  duration?: number;
}

export interface WAChat {
  id: string;
  contactId: string;
  messages: WAMessage[];
  unread: number;
  isGroup?: boolean;
  name?: string;
  participants?: WAGroupMember[];
  /** Persisted cursor: group messages continue in order after a reload. */
  nextIncomingIndex?: number;
}

export const HOUR = 3600000;
export const WA_CHATS_KEY = 'wa-chats';
export const WA_CONTACTS_KEY = 'wa-contacts';
export const WA_STORE_EVENT = 'simulator-store-change';
export const NINJA_CONTACT_ID = 'c-ninja';
export const NINJA_CHAT_ID = 'ch-ninja';
export const DOCTOR_CONTACT_ID = 'c-doctor-sarah';
export const DOCTOR_CHAT_ID = 'ch-doctor-sarah';
export const PROJECT_CONTACT_ID = 'c-project-sarah';
export const PROJECT_CHAT_ID = 'ch-project-sarah';
export const PROJECT_GROUP_NAME = 'مشروع الدكتوره ساره';
const WA_DEEPLINK_KEY = 'wa-sim-deeplink';

export const PROJECT_MEMBERS: WAGroupMember[] = [
  { id: 'me', name: 'منار', color: '#25D366' },
  { id: 'c-reem', name: 'زهراء علي', color: '#F59E0B' },
  { id: 'c-noura', name: 'زهراء زهير', color: '#60A5FA' },
  { id: 'c-joud', name: 'فرقان', color: '#F472B6' },
  { id: 'c-lina', name: 'فاطمه ماجد', color: '#A78BFA' },
];

export const SAMPLE_CONTACTS: WAContact[] = [
  { id: 'c1', name: 'أحمد العتيبي', color: '#FF3B30', about: 'متاح', kind: 'person' },
  { id: 'c2', name: 'فاطمة الزهراء', color: '#FF9F0A', about: 'مشغولة', kind: 'person' },
  { id: 'c3', name: 'محمد سالم', color: '#34C759', about: 'في العمل', kind: 'person' },
  { id: 'c4', name: 'نورة القحطاني', color: '#007AFF', about: 'متاحة', kind: 'person' },
  { id: 'c5', name: 'خالد المطيري', color: '#5856D6', about: 'مشغول', kind: 'person' },
  { id: 'c6', name: 'سارة الحربي', color: '#FF2D55', about: 'متاحة', kind: 'person' },
  { id: DOCTOR_CONTACT_ID, name: 'الدكتورة سارة', color: '#FF2D55', about: 'مشرفة المشروع', kind: 'person' },
  ...PROJECT_MEMBERS.filter((member) => member.id !== 'me').map((member) => ({
    ...member, kind: 'person' as const, about: 'زميلة المشروع',
  })),
  { id: NINJA_CONTACT_ID, name: 'نينجا', color: '#7C3AED', about: 'عروض نينجا وأكواد الخصم هنا فقط', kind: 'ninja', avatar: '/ninja.webp' },
  { id: PROJECT_CONTACT_ID, name: PROJECT_GROUP_NAME, color: '#128C7E', about: 'نخطط لأفضل محاكي آيفون · مشروعنا الجامعي', kind: 'group' },
];

const seedTime = Date.now();
const nextMondayMorning = (() => {
  const date = new Date(seedTime);
  const daysUntilMonday = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + daysUntilMonday);
  date.setHours(10, 0, 0, 0);
  return date.getTime();
})();
const sampleMessage = (id: string, text: string, sender: 'me' | 'them', ago: number): WAMessage => ({
  id, text, sender, timestamp: seedTime - ago,
});

/** A complete conversation, not a five-message placeholder. */
const PROJECT_CONVERSATION: Array<[string, string]> = [
  ['me', 'يا بنات الدكتوره ساره قالت نبغى فكرة مشروع تفرق، وش رأيكم نسوي محاكي آيفون داخل المتصفح؟'],
  ['c-reem', 'أيوه! كأنه آيفون صدق بس بدون ما نبيع الكلية عشان نشتريه 😂'],
  ['c-noura', 'ههههه أهم شي ما يطلب مني تحديث وأنا أشرح قدام الدكتوره'],
  ['c-joud', 'خلونا نضبط الفكرة: تجربة آيفون تفاعلية، مو مجرد صورة جوال وخلاص'],
  ['c-lina', 'يعني شاشة قفل وواجهة رئيسية وتطبيقات تفتح؟ كذا أحس بيطلع مشروع قوي'],
  ['me', 'بالضبط، والسحب والتنقل يكون سلس، وتحسين كأنك ماسكة الجوال'],
  ['c-reem', 'أول شي شاشة القفل: ساعة واضحة وخلفية حلوة وإشعارات تنفتح بالضغط'],
  ['c-noura', 'ونضيف مركز تحكم، الواي فاي والبلوتوث والسطوع والصوت كلها أزرار تشتغل'],
  ['c-joud', 'بس لا نحط أزرار شكل وبس، الدكتوره بتضغط كل شي وأنا أعرفها 😂'],
  ['c-lina', 'أنا أمسك التصميم والأيقونات، أبي الزوايا والمسافات تكون نظيفة'],
  ['me', 'وأنا أمسك التنقل وحفظ البيانات، لو سكرنا الصفحة ورجعنا ما تضيع رسايلنا'],
  ['c-reem', 'طيب واتساب؟ نخليه فيه محادثات طبيعية ومجموعتنا هذي بعد'],
  ['c-noura', 'ضروري يطلع اسم اللي تتكلم في المجموعة، مو كلنا اسمنا واتساب ههههه'],
  ['c-joud', 'صح، والمجموعة خمسة: منار وريم ونورة وأنا ولينا، لا تضيفون الدكتوره بالغلط 😭'],
  ['c-lina', 'لو دخلت الدكتوره بتشوف كمية ههههه وتحذف لنا درجات المشاركة'],
  ['me', 'تم خمسة بس، وبنحط قائمة العضوات في معلومات المجموعة'],
  ['c-reem', 'وأنا أكتب محتوى المحادثات، عربي سعودي خفيف مو رسائل روبوت: تم تنفيذ طلبكم بنجاح'],
  ['c-noura', 'ههههه تخيلي أقول وينكم ويرد عليّ يرجى مراجعة الشروط والأحكام'],
  ['c-joud', 'أبي الملاحظات بعد، نكتب فيها خطة المشروع وقائمة المهام ونقدر نعدلها'],
  ['c-lina', 'والصور يكون فيها ألبوم مرتب، صور نختارها بدل شاشة فاضية'],
  ['me', 'ونضيف إعدادات تغير الخلفية والوضع الداكن، والتغيير ينحفظ'],
  ['c-reem', 'الحاسبة مهمة وسهلة، نحسب فيها كم كوب قهوة بنحتاج لين نخلص 😂'],
  ['c-noura', 'الناتج: أكثر من ميزانية المشروع كلها'],
  ['c-joud', 'خلونا ما نتشتت، الأولوية قفل وتنقل وواتساب وملاحظات وإعدادات'],
  ['c-lina', 'صح، الجودة قبل عدد التطبيقات. خمس تطبيقات شغالة أحسن من عشرين ديكور'],
  ['me', 'وش عن الإشعارات؟ إذا ضغطت على رسالة تفتح نفس المحادثة، مو ترجعني للبداية'],
  ['c-reem', 'إيه والعدد الأحمر يطابق الرسائل غير المقروءة، نقرأها ويروح'],
  ['c-noura', 'وبنجرب إذا وصلت رسالة والتطبيق مفتوح، لازم تظهر لحالها بدون تحديث'],
  ['c-joud', 'أنا أمسك الاختبار: إرسال، رجوع، إعادة تحميل، بحث، وكل سيناريو يخطر ببالي'],
  ['c-lina', 'وأنا أراجع الخط العربي واتجاه الكلام، ما أبي السهم يودينا القمر بدل يرجع 😂'],
  ['me', 'للعرض نبدأ بشاشة القفل، نفتح إشعار، نرسل رسالة، ثم نعدل ملاحظة ونغير الخلفية'],
  ['c-reem', 'كذا عندنا قصة للعرض مو كل وحدة تقول هذا زر وهذا زر وخلاص'],
  ['c-noura', 'أنا أجهز الشرائح وشرح الفكرة: تجربة تفاعلية واقعية وآمنة، مو نظام آيفون حقيقي'],
  ['c-joud', 'ونكتب حدود المحاكي بوضوح، المكالمات والكاميرا محاكاة مو خدمات فعلية'],
  ['c-lina', 'اتفقنا! برسلكم شكل الشاشة الليلة، بس إذا اختفيت اعرفوا إني أعدل لون واحد من ساعتين'],
  ['me', 'ههههه تمام يا فريق، بكرة نراجع النسخة سوا ونختار اللمسات الأخيرة'],
];

const groupSeedMessages: WAMessage[] = PROJECT_CONVERSATION.map(([senderId, text], index) => ({
  id: `project-seed-${index + 1}`,
  text,
  sender: senderId === 'me' ? 'me' : 'them',
  senderId,
  senderName: PROJECT_MEMBERS.find((member) => member.id === senderId)!.name,
  timestamp: seedTime - (PROJECT_CONVERSATION.length - index) * 120000,
  type: 'text',
}));

export const SAMPLE_CHATS: WAChat[] = [
  { id: 'ch1', contactId: 'c1', unread: 2, messages: [
    sampleMessage('m1', 'السلام عليكم أحمد', 'me', 5 * HOUR),
    sampleMessage('m2', 'وعليكم السلام، كيف حالك؟', 'them', 5 * HOUR - 60000),
    sampleMessage('m3', 'بخير والحمد لله. هل انتهيت من التقرير؟', 'me', 5 * HOUR - 120000),
    sampleMessage('m4', 'نعم تقريباً، باقي القسم الأخير', 'them', 4 * HOUR),
    sampleMessage('m5', 'ممتاز، أرسله لي عندما تنتهي', 'me', 4 * HOUR - 30000),
    sampleMessage('m6', 'إن شاء الله، مساء اليوم', 'them', HOUR),
    sampleMessage('m7', 'وش رأيك نراجعه سوا غداً؟', 'them', 30 * 60000),
  ] },
  { id: 'ch2', contactId: 'c2', unread: 1, messages: [
    sampleMessage('m1', 'فاطمة، شكراً على المساعدة أمس', 'me', 26 * HOUR),
    sampleMessage('m2', 'العفو، في أي وقت', 'them', 25 * HOUR),
    sampleMessage('m3', 'هل وصلتك الرسالة الأخيرة؟', 'them', 2 * HOUR),
  ] },
  { id: 'ch3', contactId: 'c3', unread: 0, messages: [
    sampleMessage('m1', 'محمد، الاجتماع غداً الساعة عشرة صباحاً', 'me', 72 * HOUR),
    sampleMessage('m2', 'تمام، سأحضر في الموعد', 'them', 72 * HOUR - 300000),
  ] },
  { id: 'ch4', contactId: 'c4', unread: 0, messages: [
    sampleMessage('m1', 'نورة، مبروك التخرج!', 'me', 7 * 24 * HOUR),
    sampleMessage('m2', 'شكراً جزيلاً الله يبارك فيك', 'them', 7 * 24 * HOUR - 600000),
    { ...sampleMessage('m3', '[رسالة صوتية 30 ثانية]', 'them', 7 * 24 * HOUR - 660000), type: 'voice', duration: 30 },
  ] },
  { id: 'ch5', contactId: 'c5', unread: 0, messages: [
    sampleMessage('m1', 'خالد، متى نلتقي؟', 'me', 48 * HOUR),
    sampleMessage('m2', 'الخميس إن أمكن', 'them', 48 * HOUR - 900000),
  ] },
  { id: 'ch6', contactId: 'c6', unread: 0, messages: [
    sampleMessage('m1', 'سارة، كيف كانت رحلتك؟', 'me', 10 * 24 * HOUR),
    sampleMessage('m2', 'رائعة! أرسلت لك الصور على الإيميل', 'them', 9 * 24 * HOUR),
  ] },
  { id: NINJA_CHAT_ID, contactId: NINJA_CONTACT_ID, unread: 1, messages: [
    sampleMessage('ninja-seed-1', 'هلا منار! هنا محادثة نينجا المخصصة للعروض وأكواد الخصم.', 'them', 90 * 60000),
    sampleMessage('ninja-seed-2', 'عرض تجريبي داخل المحاكي: خصم ٢٠٪ بكود NINJA20. الكود للعرض فقط وليس عرضاً تجارياً فعلياً.', 'them', 12 * 60000),
  ] },
  { id: DOCTOR_CHAT_ID, contactId: DOCTOR_CONTACT_ID, unread: 0, messages: [
    { id: 'doctor-seed-1', text: 'دكتوره ساره أنا متحمسه أعرض شغلي يوم الاثنين القادم.', sender: 'me', senderId: 'me', senderName: 'منار', timestamp: seedTime - 600000, type: 'text' },
    { id: 'doctor-seed-2', text: 'أوف حمستيني معاك يا منار، متأكدة إن شغلك بيطلع رائع.', sender: 'them', senderId: DOCTOR_CONTACT_ID, senderName: 'الدكتورة سارة', timestamp: seedTime - 540000, type: 'text' },
    { id: 'doctor-seed-3', text: 'هاه دكتوره، أستاهل بونس صح؟', sender: 'me', senderId: 'me', senderName: 'منار', timestamp: nextMondayMorning + 60000, type: 'text' },
    { id: 'doctor-seed-4', text: 'تستاهلين على هالشغل يا منار، أبدعتي والله.', sender: 'them', senderId: DOCTOR_CONTACT_ID, senderName: 'الدكتورة سارة', timestamp: nextMondayMorning + 120000, type: 'text' },
  ] },
  { id: PROJECT_CHAT_ID, contactId: PROJECT_CONTACT_ID, isGroup: true, name: PROJECT_GROUP_NAME,
    participants: PROJECT_MEMBERS, unread: 0, nextIncomingIndex: 0, messages: groupSeedMessages },
];

const NINJA_MESSAGES = [
  'عرض نينجا التجريبي اليوم: خصم ٢٠٪ بكود NINJA20 على الطلب داخل المحاكي. الكود توضيحي فقط.',
  'هلا منار! كود التوصيل التجريبي NINJAFREE موجود هنا في محادثة نينجا فقط، مو كود فعلي.',
  'خصم تجريبي على المقاضي بكود MANAR15 في نينجا. هذا محتوى محاكاة وليس عرضاً حقيقياً.',
  'تذكير من نينجا: عروضنا وأكوادنا التجريبية تجمعينها في هالمحادثة. جربي كود NINJA10 داخل العرض التوضيحي.',
];

const NORMAL_MESSAGES: Record<string, string[]> = {
  c1: ['خلصت التقرير، أرسله لك بعد شوي', 'بكرة نراجعه الساعة خمس؟', 'الله يعطيك العافية، ملاحظاتك ساعدتني'],
  c2: ['منار كيف يومك؟', 'أرسلت لك الملف اللي طلبتيه', 'نمر المقهى بعد المحاضرة؟'],
  c3: ['الاجتماع تأجل لنص ساعة، خذي راحتك', 'وصلتني الملاحظات، شكراً', 'أرسلت النسخة الجديدة على الإيميل'],
  c4: ['منار عندك وقت نسولف اليوم؟', 'شفت الصور اللي أرسلتها لك؟', 'بكرة نتقابل بعد العصر؟'],
  c5: ['أنا وصلت المقهى، وينك؟', 'الخميس مناسب للقاء؟', 'تمام، حجزت لنا طاولة'],
  c6: ['برسل لك باقي صور الرحلة الليلة', 'الجو اليوم يجنن، نطلع نتمشى؟', 'اشتقت لسوالفك، كيف الجامعة؟'],
  'c-reem': ['منار كتبت محتوى الملاحظات، راجعيه إذا فضيتي', 'ضحكت على سوالفنا بالمجموعة ههههه', 'تبين أساعدك في ترتيب الملفات؟'],
  'c-noura': ['خلصت مقدمة العرض، أرسلها لك؟', 'كيفك مع المشروع اليوم؟', 'نراجع الشرح سوا بعد المحاضرة؟'],
  'c-joud': ['لقيت ملاحظة بسيطة في التنقل، أشرحها لك بعد شوي', 'جربت حفظ الملاحظات واشتغل', 'منار لا تنسين تاخذين بريك'],
  'c-lina': ['أرسلت لك اقتراح الخلفية', 'الخط العربي صار أوضح، شوفيه', 'وش رأيك بالألوان الجديدة؟'],
};

const GROUP_INCOMING: Array<[string, string]> = [
  ['c-reem', 'صباح الخير يا بنات، جهزت محتوى الملاحظات وقائمة مهام للمحاكي'],
  ['c-noura', 'حلو! أنا خلصت مقدمة العرض، نبدأ من شاشة القفل زي ما اتفقنا'],
  ['c-joud', 'جربت إشعار واتساب، يفتح المحادثة الصح. باقي أتأكد من عداد غير المقروء'],
  ['c-lina', 'ضبطت الألوان وحجم الأيقونات، صار مرتب حتى على شاشة صغيرة'],
  ['c-reem', 'طيب نخلي البحث يلقى اسم المحادثة وكلمة من الرسائل؟ بيكون مفيد بالعرض'],
  ['c-joud', 'إيه، وبنجرب نرسل رسالة ونحدث الصفحة، لازم تبقى موجودة'],
  ['c-noura', 'بحط هذي نقطة في الشرح: البيانات محفوظة محلياً مو حساب واتساب حقيقي'],
  ['c-lina', 'تمام، وكتبت تحت المكالمات إنها محاكاة، عشان ما نوعد بشي مو موجود'],
  ['c-reem', 'يا منار إذا شفتي هذي اكتبي لنا وش باقي عليك ونساعدك'],
  ['c-joud', 'وأنا عليّ اختبار الرجوع من التطبيقات. ما أبي زر الرجوع يرجعنا لسنة التحضيري 😂'],
  ['c-noura', 'ههههه التحضيري لا تكفين، بالكاد نجونا'],
  ['c-lina', 'أبي رأيكم: خلفية هادية للعرض ولا ألوان؟ أحس الهادية تبين الواجهة أكثر'],
  ['c-reem', 'الهادية أحلى، ونوريهم تغيير الخلفية من الإعدادات بالنهاية'],
  ['c-joud', 'اتفقنا. سجلت سيناريو: إشعار، محادثة، إرسال، ملاحظة، إعدادات'],
  ['c-noura', 'بنسوي بروفة خمس دقايق لكل وحدة، بس لا أحد يقول مشروعنا بسيط 😂'],
  ['c-lina', 'مو بسيط! هذا تعبنا كله داخل آيفون صغير ههههه'],
  ['c-reem', 'باقي نراجع المحتوى والإملاء، خلونا نسوي جولة ثانية بعد البروفة'],
  ['c-joud', 'أنا جاهزة للجولة، بطلع كل زر يزعلنا قبل ما تضغطه الدكتوره'],
  ['c-noura', 'ممتاز، بعدها أحدث الشرائح بالنسخة النهائية وأرسلها لكم'],
  ['c-lina', 'يلا يا فريق، نكمل المراجعة وبعدين قهوة تستاهل التعب'],
];

export interface IncomingWhatsApp {
  chatId: string;
  contactId: string;
  senderName: string;
  text: string;
  totalUnread: number;
  messageId: string;
  /** Notification title; for groups this differs from the actual sender. */
  title: string;
}

function readJSON(key: string): unknown {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function persistJSON(key: string, value: unknown): void {
  const encoded = JSON.stringify(value);
  if (window.localStorage.getItem(key) === encoded) return;
  // Write first. Every listener sees committed data, never a stale React snapshot.
  window.localStorage.setItem(key, encoded);
  window.dispatchEvent(new CustomEvent(WA_STORE_EVENT, { detail: { key } }));
}

function cloneSamples<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Old engine promotions were incorrectly mixed into personal conversations. */
function isOldPromotion(message: WAMessage): boolean {
  if (message.sender === 'me') return false; // Never remove the user's own messages.
  return /نينجا|ninja|كود\s*(?:الخصم|خصم)|أكواد\s*(?:الخصم|خصم)|خصم\s*[0-9٠-٩]|مبروك!\s*فزت بالسحب/i.test(message.text);
}

let ensuring = false;
let activeConversation: string | null = null;

export function setActiveWhatsAppConversation(chatId: string | null): void {
  activeConversation = chatId;
  if (chatId) markWhatsAppChatRead(chatId);
}

/** Idempotent migration shared by app mount and engine, preserving sent messages. */
export function ensureWhatsAppStore(): { chats: WAChat[]; contacts: WAContact[] } {
  const fallback = () => ({ chats: cloneSamples(SAMPLE_CHATS), contacts: cloneSamples(SAMPLE_CONTACTS) });
  if (typeof window === 'undefined') return fallback();
  if (ensuring) {
    const chats = readJSON(WA_CHATS_KEY);
    const contacts = readJSON(WA_CONTACTS_KEY);
    return Array.isArray(chats) && Array.isArray(contacts)
      ? { chats: chats as WAChat[], contacts: contacts as WAContact[] } : fallback();
  }
  ensuring = true;
  try {
    const rawContacts = readJSON(WA_CONTACTS_KEY);
    const rawChats = readJSON(WA_CHATS_KEY);
    let contacts: WAContact[] = Array.isArray(rawContacts) ? rawContacts.filter(isRecord).map((contact) => ({
      ...contact,
      id: typeof contact.id === 'string' ? contact.id : `contact-${makeId()}`,
      name: typeof contact.name === 'string' && contact.name.trim() ? contact.name : 'جهة اتصال',
      color: typeof contact.color === 'string' ? contact.color : '#607D8B',
    } as WAContact)) : [];

    // Canonicalize older named threads rather than creating a second Ninja/group.
    const aliases = new Map<string, string>();
    contacts = contacts.filter((contact) => {
      const canonicalId = /^(?:نينجا|ninja)$/i.test(contact.name.trim()) || contact.kind === 'ninja'
        ? NINJA_CONTACT_ID
        : /مشروع.*(?:دكتور|دكتور[هة]).*سار[ةه]/.test(contact.name) || contact.id === PROJECT_CONTACT_ID
          ? PROJECT_CONTACT_ID : null;
      if (canonicalId) { aliases.set(contact.id, canonicalId); return false; }
      return true;
    });
    for (const sample of SAMPLE_CONTACTS) {
      const existing = contacts.find((contact) => contact.id === sample.id);
      if (existing) {
        if (existing.name === 'جهة اتصال') existing.name = sample.name;
        existing.kind = sample.kind;
        if (sample.avatar) existing.avatar = sample.avatar;
        if (sample.kind === 'group' || sample.kind === 'ninja') Object.assign(existing, sample);
      } else contacts.push({ ...sample });
    }

    let chats: WAChat[] = Array.isArray(rawChats) ? rawChats.filter(isRecord).map((rawChat, chatIndex) => {
      const originalContactId = typeof rawChat.contactId === 'string' ? rawChat.contactId : `legacy-contact-${chatIndex}`;
      const contactId = aliases.get(originalContactId) ?? originalContactId;
      const isProject = contactId === PROJECT_CONTACT_ID || rawChat.name === PROJECT_GROUP_NAME;
      const messages: WAMessage[] = Array.isArray(rawChat.messages) ? rawChat.messages.filter(isRecord).map((message, index) => ({
        ...message,
        id: typeof message.id === 'string' ? message.id : `legacy-${chatIndex}-${index}`,
        text: typeof message.text === 'string' ? message.text : '',
        sender: message.sender === 'me' ? 'me' : 'them',
        timestamp: typeof message.timestamp === 'number' && Number.isFinite(message.timestamp) ? message.timestamp : seedTime,
      } as WAMessage)) : [];
      const filtered = contactId === NINJA_CONTACT_ID ? messages : messages.filter((message) => !isOldPromotion(message));
      const unread = typeof rawChat.unread === 'number' && Number.isFinite(rawChat.unread) ? Math.max(0, Math.floor(rawChat.unread)) : 0;
      return {
        ...rawChat,
        id: typeof rawChat.id === 'string' ? rawChat.id : `legacy-chat-${chatIndex}`,
        contactId: isProject ? PROJECT_CONTACT_ID : contactId,
        messages: filtered,
        unread: Math.min(Math.max(0, unread - (messages.length - filtered.length)), filtered.filter((message) => message.sender === 'them').length),
      } as WAChat;
    }) : [];

    // Coalesce canonical duplicates without discarding messages (including sent ones).
    const mergeDedicated = (contactId: string) => {
      const matches = chats.filter((chat) => chat.contactId === contactId);
      if (matches.length < 2) return;
      const first = matches[0];
      const seen = new Set<string>();
      const messages = matches.flatMap((chat) => chat.messages).filter((message) => {
        const key = `${message.id}:${message.timestamp}:${message.text}`;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      }).sort((a, b) => a.timestamp - b.timestamp);
      chats = chats.filter((chat) => chat.contactId !== contactId || chat.id === first.id);
      first.messages = messages;
      first.unread = matches.reduce((total, chat) => total + chat.unread, 0);
    };
    mergeDedicated(NINJA_CONTACT_ID);
    mergeDedicated(PROJECT_CONTACT_ID);
    for (const sample of SAMPLE_CHATS) {
      if (!chats.some((chat) => chat.contactId === sample.contactId)) chats.push(cloneSamples(sample));
    }
    const project = chats.find((chat) => chat.contactId === PROJECT_CONTACT_ID)!;
    project.isGroup = true;
    project.name = PROJECT_GROUP_NAME;
    project.participants = cloneSamples(PROJECT_MEMBERS); // Exactly Manar + four classmates.
    project.nextIncomingIndex = typeof project.nextIncomingIndex === 'number' && Number.isFinite(project.nextIncomingIndex)
      ? Math.max(0, Math.floor(project.nextIncomingIndex)) : 0;
    // Upgrade a former short/placeholder group once; retain all of its old messages.
    if (!project.messages.some((message) => message.id.startsWith('project-seed-'))) {
      project.messages = [...cloneSamples(groupSeedMessages), ...project.messages].sort((a, b) => a.timestamp - b.timestamp);
    }
    project.messages = project.messages.map((message, index) => {
      const member = message.sender === 'me' ? PROJECT_MEMBERS[0]
        : PROJECT_MEMBERS.find((person) => person.id === message.senderId || person.name === message.senderName)
          ?? PROJECT_MEMBERS[1 + index % 4];
      return { ...message, senderId: member.id, senderName: member.name };
    });
    for (const chat of chats) {
      if (!contacts.some((contact) => contact.id === chat.contactId)) {
        contacts.push({ id: chat.contactId, name: chat.name?.trim() || 'جهة اتصال محفوظة', color: '#607D8B', kind: chat.isGroup ? 'group' : 'person' });
      }
    }
    // Commit both keys before notifying so subscribers never read a half-migration.
    const nextContacts = JSON.stringify(contacts);
    const nextChats = JSON.stringify(chats);
    const contactsChanged = window.localStorage.getItem(WA_CONTACTS_KEY) !== nextContacts;
    const chatsChanged = window.localStorage.getItem(WA_CHATS_KEY) !== nextChats;
    if (contactsChanged) window.localStorage.setItem(WA_CONTACTS_KEY, nextContacts);
    if (chatsChanged) window.localStorage.setItem(WA_CHATS_KEY, nextChats);
    if (contactsChanged) window.dispatchEvent(new CustomEvent(WA_STORE_EVENT, { detail: { key: WA_CONTACTS_KEY } }));
    if (chatsChanged) window.dispatchEvent(new CustomEvent(WA_STORE_EVENT, { detail: { key: WA_CHATS_KEY } }));
    return { chats, contacts };
  } catch { return fallback(); }
  finally { ensuring = false; }
}

export function readWhatsAppChats(): WAChat[] { return ensureWhatsAppStore().chats; }
export function readWhatsAppContacts(): WAContact[] { return ensureWhatsAppStore().contacts; }

/** Functional updates always start with current storage, not captured component state. */
export function updateWhatsAppChats(update: WAChat[] | ((chats: WAChat[]) => WAChat[])): WAChat[] {
  const current = readWhatsAppChats();
  const next = typeof update === 'function' ? update(current) : update;
  if (typeof window !== 'undefined') {
    try { persistJSON(WA_CHATS_KEY, next); } catch { /* storage unavailable */ }
  }
  return next;
}

export function markWhatsAppChatRead(chatId: string): void {
  const chats = readWhatsAppChats();
  if (!chats.some((chat) => chat.id === chatId && chat.unread > 0)) return;
  updateWhatsAppChats((current) => current.map((chat) => chat.id === chatId ? { ...chat, unread: 0 } : chat));
}

function makeId(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

function chooseMessage(pool: string[], lastText?: string): string {
  const choices = pool.filter((text) => text !== lastText);
  return (choices.length ? choices : pool)[Math.floor(Math.random() * (choices.length || pool.length))];
}

export function sendWhatsAppMessage(chatId: string, text: string, type: 'text' | 'voice' = 'text', duration?: number): void {
  updateWhatsAppChats((chats) => chats.map((chat) => chat.id === chatId ? {
    ...chat,
    messages: [...chat.messages, { id: makeId(), text, sender: 'me', senderId: 'me', senderName: 'منار', timestamp: Date.now(), type, duration }],
  } : chat));
}

function deliverIntoChat(targetChatId?: string, replyTo?: string): IncomingWhatsApp | null {
  if (typeof window === 'undefined') return null;
  try {
    const { chats, contacts } = ensureWhatsAppStore();
    const eligible = chats.filter((chat) => chat.contactId === NINJA_CONTACT_ID || chat.contactId === PROJECT_CONTACT_ID || Boolean(NORMAL_MESSAGES[chat.contactId]));
    const routeCursor = Number(window.localStorage.getItem('sim-wa-route-cursor-v2') ?? '0');
    const validRouteCursor = Number.isFinite(routeCursor) && routeCursor >= 0 ? routeCursor : 0;
    const chat = targetChatId ? chats.find((item) => item.id === targetChatId)
      : eligible[validRouteCursor % eligible.length];
    if (!targetChatId) window.localStorage.setItem('sim-wa-route-cursor-v2', String(validRouteCursor + 1));
    if (!chat) return null;
    const contact = contacts.find((item) => item.id === chat.contactId);
    let senderName = contact?.name || 'جهة اتصال';
    let senderId = chat.contactId;
    let text: string;
    let nextIncomingIndex = chat.nextIncomingIndex;
    if (chat.contactId === PROJECT_CONTACT_ID) {
      const cursor = chat.nextIncomingIndex ?? 0;
      const [memberId, message] = GROUP_INCOMING[cursor % GROUP_INCOMING.length];
      const member = PROJECT_MEMBERS.find((person) => person.id === memberId)!;
      senderId = member.id;
      senderName = member.name;
      text = message;
      nextIncomingIndex = cursor + 1;
    } else if (chat.contactId === NINJA_CONTACT_ID) {
      text = replyTo ? 'وصلتنا رسالتك يا منار! هذي محادثة نينجا التجريبية. كود العرض NINJA20 للتوضيح داخل المحاكي فقط.'
        : chooseMessage(NINJA_MESSAGES, chat.messages[chat.messages.length - 1]?.text);
    } else {
      const pool = NORMAL_MESSAGES[chat.contactId] ?? ['وصلتني رسالتك، الله يعطيك العافية', 'تمام، نتكلم بعد شوي', 'كيف يومك؟'];
      if (replyTo?.includes('شكرا') || replyTo?.includes('شكراً')) text = 'العفو يا منار، ما سوينا إلا الواجب';
      else if (replyTo?.includes('السلام')) text = 'وعليكم السلام يا منار، كيفك؟';
      else text = chooseMessage(pool, chat.messages[chat.messages.length - 1]?.text);
    }
    const message: WAMessage = { id: `sim-${makeId()}`, text, sender: 'them', senderId, senderName, timestamp: Date.now(), type: 'text' };
    const next = chats.map((item) => item.id === chat.id ? {
      ...item, messages: [...item.messages, message],
      unread: activeConversation === chat.id ? 0 : item.unread + 1,
      ...(nextIncomingIndex !== undefined ? { nextIncomingIndex } : {}),
    } : item);
    // Commit the actual message and navigation data before broadcasting anything.
    window.localStorage.setItem(WA_CHATS_KEY, JSON.stringify(next));
    const result: IncomingWhatsApp = {
      chatId: chat.id, contactId: chat.contactId, senderName, text, messageId: message.id,
      title: chat.isGroup ? (chat.name || PROJECT_GROUP_NAME) : (contact?.name || senderName),
      totalUnread: next.reduce((total, item) => total + item.unread, 0),
    };
    try {
      window.localStorage.setItem(WA_DEEPLINK_KEY, JSON.stringify({ ...result, ts: message.timestamp }));
    } catch { /* The real message is already committed; navigation data is optional. */ }
    window.dispatchEvent(new CustomEvent(WA_STORE_EVENT, { detail: { key: WA_CHATS_KEY } }));
    window.dispatchEvent(new CustomEvent('wa-sim-message', { detail: result }));
    // A mounted/open conversation may have marked the committed message read.
    result.totalUnread = readWhatsAppChats().reduce((total, item) => total + item.unread, 0);
    return result;
  } catch { return null; }
}

/** Compatible with sendIncomingWhatsApp; optional target is useful for exact replies. */
export function deliverWhatsAppMessage(targetChatId?: string): IncomingWhatsApp | null {
  return deliverIntoChat(targetChatId);
}

export function deliverWhatsAppReply(chatId: string, text: string): IncomingWhatsApp | null {
  return deliverIntoChat(chatId, text);
}
