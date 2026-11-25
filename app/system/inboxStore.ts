import { RAMADAN_NOTIFICATIONS } from '../apps/ninja/data';
import { makeMessageId, readStore, writeStore } from './storage';

export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts';
}

export const SAMPLE_EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'أحمد العتيبي',
    subject: 'تقرير المشروع الشهري',
    body: 'السلام عليكم،\n\nمرفق تقرير المشروع الشهري لشهر أكتوبر. الرجاء مراجعته وإرسال ملاحظاتكم قبل نهاية الأسبوع.\n\nمع التحية،\nأحمد',
    timestamp: Date.now() - 3600000,
    read: false,
    starred: true,
    folder: 'inbox',
  },
  {
    id: 'e2',
    from: 'سارة الحربي',
    subject: 'دعوة اجتماع الفريق',
    body: 'مرحباً،\n\nنود دعوتكم لاجتماع الفريق يوم الأحد القادم الساعة العاشرة صباحاً في قاعة الاجتماعات.\n\nشكراً لكم',
    timestamp: Date.now() - 7200000,
    read: false,
    starred: false,
    folder: 'inbox',
  },
  {
    id: 'e3',
    from: 'الدعم الفني',
    subject: 'تم تحديث حسابك',
    body: 'عزيزي المستخدم،\n\nتم تحديث بيانات حسابك بنجاح. إذا لم تكن أنت من قام بهذا التغيير، يرجى التواصل معنا فوراً.\n\nالدعم الفني',
    timestamp: Date.now() - 86400000,
    read: true,
    starred: false,
    folder: 'inbox',
  },
  {
    id: 'e4',
    from: 'أنا',
    subject: 'رد: تقرير المشروع',
    body: 'شكراً أحمد، سأراجع التقرير اليوم.',
    timestamp: Date.now() - 26 * 3600000,
    read: true,
    starred: false,
    folder: 'sent',
  },
];

export interface SMSMessage {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: number;
}

export interface SMSContact {
  id: string;
  name: string;
  /** avatar background color (hex) */
  color: string;
}

export interface SMSConversation {
  id: string;
  contactId: string;
  messages: SMSMessage[];
  unread: number;
}

export const SMS_CONTACTS: SMSContact[] = [
  { id: 'c1', name: 'أحمد العتيبي', color: '#FF3B30' },
  { id: 'c2', name: 'فاطمة الزهراء', color: '#FF9F0A' },
  { id: 'c3', name: 'محمد سالم', color: '#34C759' },
  { id: 'c4', name: 'نورة القحطاني', color: '#007AFF' },
  { id: 'c5', name: 'خالد المطيري', color: '#5856D6' },
  { id: 'c6', name: 'سارة الحربي', color: '#FF2D55' },
];

const now = Date.now();

export const SMS_CONVERSATIONS: SMSConversation[] = [
  {
    id: 'conv1',
    contactId: 'c1',
    unread: 2,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'السلام عليكم، كيف حالك؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 5 },
      { id: makeMessageId('sms-seed'), text: 'وعليكم السلام، الحمد لله بخير، وأنت؟', sender: 'me', timestamp: now - 1000 * 60 * 60 * 4 },
      { id: makeMessageId('sms-seed'), text: 'بخير والحمد لله. هل أكملنا العمل على المشروع؟', sender: 'them', timestamp: now - 1000 * 60 * 30 },
      { id: makeMessageId('sms-seed'), text: 'نعم، سأرسل لك التحديثات قريباً', sender: 'them', timestamp: now - 1000 * 60 * 25 },
    ],
  },
  {
    id: 'conv2',
    contactId: 'c2',
    unread: 0,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'صباح الخير 🌞', sender: 'them', timestamp: now - 1000 * 60 * 60 * 24 },
      { id: makeMessageId('sms-seed'), text: 'صباح النور والسرور 😊', sender: 'me', timestamp: now - 1000 * 60 * 60 * 23 },
      { id: makeMessageId('sms-seed'), text: 'هل تحب أن نلتقي اليوم؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 22 },
      { id: makeMessageId('sms-seed'), text: 'بالتأكيد، في أي وقت يناسبك', sender: 'me', timestamp: now - 1000 * 60 * 60 * 21 },
      { id: makeMessageId('sms-seed'), text: 'ممتاز، سأحدد الموعد وأخبرك', sender: 'them', timestamp: now - 1000 * 60 * 60 * 20 },
    ],
  },
  {
    id: 'conv3',
    contactId: 'c3',
    unread: 1,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'هل حضرت الاجتماع أمس؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 48 },
      { id: makeMessageId('sms-seed'), text: 'نعم، كان مفيداً جداً', sender: 'me', timestamp: now - 1000 * 60 * 60 * 47 },
      { id: makeMessageId('sms-seed'), text: 'أرسلت لك الملخص في البريد', sender: 'me', timestamp: now - 1000 * 60 * 60 * 46 },
      { id: makeMessageId('sms-seed'), text: 'وصلني، شكراً جزيلاً لك 👏', sender: 'them', timestamp: now - 1000 * 60 * 60 * 45 },
    ],
  },
  {
    id: 'conv4',
    contactId: 'c4',
    unread: 0,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'مرحبا، هل وصلتك الوثائق؟', sender: 'them', timestamp: now - 1000 * 60 * 60 * 72 },
      { id: makeMessageId('sms-seed'), text: 'نعم، سأراجعها اليوم', sender: 'me', timestamp: now - 1000 * 60 * 60 * 71 },
      { id: makeMessageId('sms-seed'), text: 'تمام، بانتظار ملاحظاتك', sender: 'them', timestamp: now - 1000 * 60 * 60 * 70 },
    ],
  },
  {
    id: 'conv5',
    contactId: 'c5',
    unread: 0,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'كل عام وأنت بخير 🎉', sender: 'them', timestamp: now - 1000 * 60 * 60 * 96 },
      { id: makeMessageId('sms-seed'), text: 'وأنت بخير وصحة وسلامة', sender: 'me', timestamp: now - 1000 * 60 * 60 * 95 },
      { id: makeMessageId('sms-seed'), text: 'الله يحفظك، نتقابل قريباً إن شاء الله', sender: 'them', timestamp: now - 1000 * 60 * 60 * 94 },
    ],
  },
  {
    id: 'conv6',
    contactId: 'c6',
    unread: 3,
    messages: [
      { id: makeMessageId('sms-seed'), text: 'هل يمكن أن تساعدني في أمر؟', sender: 'them', timestamp: now - 1000 * 60 * 15 },
      { id: makeMessageId('sms-seed'), text: 'أكيد، تفضلي', sender: 'me', timestamp: now - 1000 * 60 * 12 },
      { id: makeMessageId('sms-seed'), text: 'أحتاج نصائح حول تصميم التطبيق', sender: 'them', timestamp: now - 1000 * 60 * 8 },
      { id: makeMessageId('sms-seed'), text: 'بسرور، سأرسل لك بعض الأمثلة', sender: 'them', timestamp: now - 1000 * 60 * 3 },
      { id: makeMessageId('sms-seed'), text: 'وأي استفسار أنا جاهزة', sender: 'them', timestamp: now - 1000 * 60 * 1 },
    ],
  },
];

