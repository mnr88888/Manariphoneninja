'use client';

import { useState, useMemo } from 'react';
import {
  Pencil,
  Trash2,
  Archive,
  Inbox,
  Send,
  FileEdit,
  Star,
  Reply,
  X,
  ChevronRight,
} from 'lucide-react';
import { usePersistentState, uid, formatArabicTime, formatArabicDate } from '../shared/utils';

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: number;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'drafts';
}

const SAMPLE_EMAILS: Email[] = [
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

export default function MailApp() {
  const [emails, setEmails] = usePersistentState<Email[]>('mail-emails', SAMPLE_EMAILS);
  const [folder, setFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [openId, setOpenId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState({ to: '', subject: '', body: '' });

  const folderEmails = useMemo(
    () =>
      emails
        .filter((e) => e.folder === folder)
        .sort((a, b) => b.timestamp - a.timestamp),
    [emails, folder]
  );

  const unreadCount = emails.filter((e) => e.folder === 'inbox' && !e.read).length;

  const openEmail = emails.find((e) => e.id === openId);

  const sendEmail = () => {
    if (!draft.subject.trim() && !draft.body.trim()) return;
    setEmails((prev) => [
      {
        id: uid(),
        from: 'أنا',
        subject: draft.subject || '(بدون عنوان)',
        body: draft.body,
        timestamp: Date.now(),
        read: true,
        starred: false,
        folder: 'sent',
      },
      ...prev,
    ]);
    setDraft({ to: '', subject: '', body: '' });
    setComposing(false);
    setFolder('sent');
  };

  /* ---------- Compose ---------- */
  if (composing) {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => {
              if (draft.subject || draft.body) {
                setEmails((prev) => [
                  {
                    id: uid(),
                    from: 'أنا',
                    subject: draft.subject || '(مسودة)',
                    body: draft.body,
                    timestamp: Date.now(),
                    read: true,
                    starred: false,
                    folder: 'drafts',
                  },
                  ...prev,
                ]);
              }
              setComposing(false);
            }}
            className="text-[#007AFF]"
          >
            <X className="h-5 w-5" />
          </button>
          <span className="font-semibold">رسالة جديدة</span>
          <button onClick={sendEmail} className="font-semibold text-[#007AFF]">
            إرسال
          </button>
        </div>

        <div className="px-4">
          <input
            value={draft.to}
            onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            placeholder="إلى:"
            className="w-full border-b border-black/10 py-2 text-[15px] outline-none"
            dir="rtl"
          />
          <input
            value={draft.subject}
            onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
            placeholder="الموضوع:"
            className="w-full border-b border-black/10 py-2 text-[15px] outline-none"
            dir="rtl"
          />
          <textarea
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            placeholder="اكتب رسالتك هنا..."
            className="mt-3 h-72 w-full resize-none text-[15px] leading-relaxed outline-none"
            dir="rtl"
          />
        </div>
      </div>
    );
  }

  /* ---------- Read email ---------- */
  if (openEmail) {
    return (
      <div className="absolute inset-0 flex flex-col bg-white">
        <div className="h-12 shrink-0" />
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => setOpenId(null)}
            className="flex items-center text-[#007AFF]"
          >
            <ChevronRight className="h-5 w-5" />
            {folder === 'inbox' ? 'البريد الوارد' : folder === 'sent' ? 'المرسل' : 'المسودات'}
          </button>
          <div className="flex gap-4 text-[#007AFF]">
            <button
              onClick={() =>
                setEmails((prev) =>
                  prev.map((e) =>
                    e.id === openEmail.id
                      ? { ...e, starred: !e.starred }
                      : e
                  )
                )
              }
            >
              <Star
                className={`h-5 w-5 ${
                  openEmail.starred ? 'fill-[#FF9F0A] text-[#FF9F0A]' : ''
                }`}
              />
            </button>
            <button
              onClick={() =>
                setEmails((prev) =>
                  prev.filter((e) => e.id !== openEmail.id)
                )
              }
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setDraft({
                  to: openEmail.from,
                  subject: `رد: ${openEmail.subject}`,
                  body: `\n\n---\nفي ${formatArabicDate(openEmail.timestamp)}، كتب ${openEmail.from}:\n${openEmail.body}`,
                });
                setComposing(true);
                setOpenId(null);
              }}
            >
              <Reply className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-3">
          <h1 className="text-xl font-bold text-black">{openEmail.subject}</h1>
          <div className="mt-3 flex items-center gap-2 border-b border-black/10 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#007AFF] text-sm font-bold text-white">
              {openEmail.from[0]}
            </div>
            <div>
              <p className="text-[15px] font-medium text-black">
                {openEmail.from}
              </p>
              <p className="text-[12px] text-black/50">
                {formatArabicDate(openEmail.timestamp)} · {formatArabicTime(openEmail.timestamp)}
              </p>
            </div>
          </div>
          <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-black">
            {openEmail.body}
          </p>
        </div>
      </div>
    );
  }

  /* ---------- Folder list ---------- */
  return (
    <div className="absolute inset-0 flex flex-col bg-[#F2F2F7]">
      <div className="h-12 shrink-0" />
      <div className="flex items-center justify-between px-4 pb-2">
        <h1 className="text-3xl font-bold text-black">البريد</h1>
        <button onClick={() => setComposing(true)} className="text-[#007AFF]">
          <Pencil className="h-6 w-6" />
        </button>
      </div>

      {/* Folder tabs */}
      <div className="flex gap-2 px-4 pb-2">
        {(
          [
            ['inbox', 'الوارد', <Inbox key="i" className="h-4 w-4" />],
            ['sent', 'المرسل', <Send key="s" className="h-4 w-4" />],
            ['drafts', 'المسودات', <FileEdit key="d" className="h-4 w-4" />],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setFolder(id as typeof folder)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
              folder === id ? 'bg-[#007AFF] text-white' : 'bg-black/5 text-black'
            }`}
          >
            {icon}
            {label}
            {id === 'inbox' && unreadCount > 0 && (
              <span className="rounded-full bg-[#FF3B30] px-1.5 text-[10px] text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Email list */}
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-4">
        {folderEmails.length === 0 ? (
          <p className="mt-16 text-center text-sm text-black/40">
            {folder === 'inbox' ? 'لا توجد رسائل جديدة' : 'لا توجد رسائل هنا'}
          </p>
        ) : (
          folderEmails.map((e) => (
            <button
              key={e.id}
              onClick={() => {
                setOpenId(e.id);
                setEmails((prev) =>
                  prev.map((x) => (x.id === e.id ? { ...x, read: true } : x))
                );
              }}
              className="mt-2 flex w-full items-start gap-3 rounded-[12px] bg-white px-4 py-3 text-right"
            >
              {!e.read && (
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#007AFF]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[15px] font-semibold text-black">
                    {e.from}
                  </span>
                  <span className="shrink-0 text-[11px] text-black/40">
                    {formatArabicTime(e.timestamp)}
                  </span>
                </div>
                <p className="truncate text-[14px] text-black">{e.subject}</p>
                <p className="truncate text-[13px] text-black/50">
                  {e.body.split('\n')[0]}
                </p>
              </div>
              {e.starred && (
                <Star className="h-4 w-4 shrink-0 fill-[#FF9F0A] text-[#FF9F0A]" />
              )}
            </button>
          ))
        )}
      </div>

      <div className="flex shrink-0 justify-center pb-1.5">
        <div className="h-[5px] w-36 rounded-full bg-black/80" />
      </div>
    </div>
  );
}
