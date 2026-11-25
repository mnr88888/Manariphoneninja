'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import SocialInbox from '../shared/SocialInbox';
import {
  Home,
  Search as SearchIcon,
  Bell,
  Mail,
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  BarChart3,
  X,
  Plus,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { useSystem, NINJA_HASHTAG } from '../../system/SystemContext';
import { usePersistentState, toArabicDigits } from '../shared/utils';

export { NINJA_HASHTAG };

const BLUE = '#1D9BF0';

/* ============================================================
 * Types & data — Ramadan posts
 * ============================================================ */

interface XPost {
  id: string;
  author: string;
  username: string;
  /** '#RRGGBB' = colored initial circle, otherwise an image path / data URI */
  avatar: string;
  verified?: boolean;
  text: string;
  image?: string;
  likes: number;
  liked: boolean;
  reposts: number;
  reposted: boolean;
  replies: number;
  views: number;
  bookmarked: boolean;
  timestamp: number;
}

const MIN = 60000;
const HOUR = 3600000;

const SEED_POSTS: XPost[] = [
  {
    id: 'x1',
    author: 'Ninja',
    username: 'ninja',
    avatar: '/ninja.webp',
    verified: true,
    text: `سفرة الإفطار جاهزة قبل الأذان 🍽️ حمص ومتبّل وأجبان وزيتون مع خبز عربي طازج.\nخصم ٢٠٪ بكود RAMADAN20\n${NINJA_HASHTAG} #سفرة_رمضان`,
    image: '/ninja-images/bundles/bundle-iftar.jpg',
    likes: 4821,
    liked: false,
    reposts: 932,
    reposted: false,
    replies: 214,
    views: 182000,
    bookmarked: false,
    timestamp: Date.now() - 25 * MIN,
  },
  {
    id: 'x2',
    author: 'أحمد العتيبي',
    username: 'ahmed_otebi',
    avatar: '#FF3B30',
    text: `أول يوم رمضان ومقاضي السفرة وصلتني بعشر دقايق 👌 الله يبارك لهم\n${NINJA_HASHTAG} #مقاضي_رمضان`,
    likes: 634,
    liked: false,
    reposts: 58,
    reposted: false,
    replies: 41,
    views: 12400,
    bookmarked: false,
    timestamp: Date.now() - 50 * MIN,
  },
  {
    id: 'x3',
    author: 'نورة القحطاني',
    username: 'noura_q',
    avatar: '#007AFF',
    text: 'القطايف بالقشطة والمكسرات… ما تكتمل السفرة بدونها 🥞🌙\n#رمضان_كريم #حلويات_رمضان',
    image: '/ninja-images/products/p-q1.jpg',
    likes: 1892,
    liked: false,
    reposts: 320,
    reposted: false,
    replies: 76,
    views: 45300,
    bookmarked: false,
    timestamp: Date.now() - 2 * HOUR,
  },
  {
    id: 'x4',
    author: 'Ninja',
    username: 'ninja',
    avatar: '/ninja.webp',
    verified: true,
    text: `زيّنوا بيوتكم بفوانيس رمضان المضيئة ✨ توصيل خلال دقائق.\n#رمضان_كريم ${NINJA_HASHTAG}`,
    image: '/ninja-images/products/p-h4.jpg',
    likes: 2310,
    liked: false,
    reposts: 405,
    reposted: false,
    replies: 98,
    views: 74100,
    bookmarked: false,
    timestamp: Date.now() - 3 * HOUR,
  },
  {
    id: 'x5',
    author: 'محمد سالم',
    username: 'moh_salem',
    avatar: '#34C759',
    text: 'التمر أول ما نفطر عليه، وجودة تمر القصيم ما لها مثيل 🌴\n#تمر_رمضان #سفرة_رمضان',
    image: '/ninja-images/products/p-c1.jpg',
    likes: 487,
    liked: false,
    reposts: 33,
    reposted: false,
    replies: 12,
    views: 9800,
    bookmarked: false,
    timestamp: Date.now() - 5 * HOUR,
  },
  {
    id: 'x6',
    author: 'سارة الحربي',
    username: 'sara_h',
    avatar: '#FF2D55',
    text: 'سحور خفيف يعينك على الصيام: فول، لبن، وملعقة عسل سدر 🍯\n#سحور_رمضان #اجواء_رمضان',
    image: '/ninja-images/products/p-su6.jpg',
    likes: 905,
    liked: false,
    reposts: 112,
    reposted: false,
    replies: 27,
    views: 21700,
    bookmarked: false,
    timestamp: Date.now() - 8 * HOUR,
  },
  {
    id: 'x7',
    author: 'خالد المطيري',
    username: 'khaled_m',
    avatar: '#5856D6',
    text: 'كنافة بالقشطة بعد التراويح؟ أكيد 😋\n#اجواء_رمضان #حلويات_رمضان',
    image: '/ninja-images/products/p-s3.jpg',
    likes: 321,
    liked: false,
    reposts: 19,
    reposted: false,
    replies: 8,
    views: 6200,
    bookmarked: false,
    timestamp: Date.now() - 11 * HOUR,
  },
];

/** Accounts shown in the "المتابَعون" tab */
const FOLLOWING = ['ninja', 'ahmed_otebi', 'noura_q'];

const TREND = [
  { tag: NINJA_HASHTAG, posts: 24800, category: 'رائج في السعودية' },
  { tag: '#رمضان_كريم', posts: 58200, category: 'رائج في السعودية' },
  { tag: '#سفرة_رمضان', posts: 14600, category: 'طعام · رائج' },
  { tag: '#اجواء_رمضان', posts: 9300, category: 'رائج' },
  { tag: '#مقاضي_رمضان', posts: 7150, category: 'تسوق · رائج' },
  { tag: '#سحور_رمضان', posts: 4200, category: 'رائج' },
];

const COMPOSE_TAGS = [NINJA_HASHTAG, '#رمضان_كريم', '#سفرة_رمضان', '#اجواء_رمضان'];

type Tab = 'home' | 'explore' | 'activity' | 'messages' | 'profile' | 'hashtag' | 'bookmarks';
type FeedTab = 'foryou' | 'following';

/* ============================================================
 * Helpers
 * ============================================================ */

function shortTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / MIN);
  if (m < 1) return 'الآن';
  if (m < 60) return `${toArabicDigits(m)}د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${toArabicDigits(h)}س`;
  return `${toArabicDigits(Math.floor(h / 24))}ي`;
}

function fmtCount(n: number): string {
  if (n >= 1000000) return `${toArabicDigits((n / 1000000).toFixed(1)).replace('.', '٫')} م`;
  if (n >= 10000) return `${toArabicDigits(Math.round(n / 1000))} ألف`;
  if (n >= 1000) return `${toArabicDigits((n / 1000).toFixed(1)).replace('.', '٫')} ألف`;
  return toArabicDigits(n);
}

interface Theme {
  isDark: boolean;
  bg: string;
  text: string;
  sub: string;
  border: string;
  soft: string;
}

/* ============================================================
 * Small building blocks
 * ============================================================ */

function XLogo({ className = 'h-6 w-6', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color} aria-label="X">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function Verified() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0" aria-label="حساب موثّق">
      <circle cx="12" cy="12" r="11" fill={BLUE} />
      <path d="M7 12.5l3.2 3.2L17 8.9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Avatar({ src, name, size = 40 }: { src: string; name: string; size?: number }) {
  if (src.startsWith('#')) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
        style={{ width: size, height: size, backgroundColor: src, fontSize: size * 0.42 }}
      >
        {name[0]}
      </div>
    );
  }
  return (
    <div className="shrink-0 overflow-hidden rounded-full bg-black/5" style={{ width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
}

/** Text with blue #hashtags (tappable) and @mentions */
function RichText({ text, onTag, className }: { text: string; onTag: (tag: string) => void; className: string }) {
  return (
    <p className={className}>
      {text.split(/([#@][^\s#@]+)/).map((part, i) => {
        if (part.startsWith('#')) {
          return (
            <button key={i} onClick={() => onTag(part)} className="text-[#1D9BF0] active:opacity-60">
              {part}
            </button>
          );
        }
        if (part.startsWith('@')) {
          return (
            <span key={i} className="text-[#1D9BF0]">
              {part}
            </span>
          );
        }
        return part;
      })}
    </p>
  );
}

function PostCard({
  p,
  t,
  onToggle,
  onTag,
}: {
  p: XPost;
  t: Theme;
  onToggle: (id: string, field: 'liked' | 'reposted' | 'bookmarked') => void;
  onTag: (tag: string) => void;
}) {
  return (
    <article className={`border-b px-4 py-3 ${t.border}`}>
      <div className="flex gap-3">
        <Avatar src={p.avatar} name={p.author} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className={`truncate text-[15px] font-bold ${t.text}`}>{p.author}</span>
            {p.verified && <Verified />}
            <span className={`shrink-0 text-[13px] ${t.sub}`} dir="ltr">
              @{p.username}
            </span>
            <span className={`shrink-0 text-[13px] ${t.sub}`}>· {shortTime(p.timestamp)}</span>
          </div>

          <RichText
            text={p.text}
            onTag={onTag}
            className={`mt-0.5 whitespace-pre-line text-[15px] leading-[1.55] ${t.text}`}
          />

          {p.image && (
            <div className={`mt-2.5 overflow-hidden rounded-2xl border ${t.border}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="w-full object-cover" style={{ maxHeight: 300 }} />
            </div>
          )}

          <div className={`mt-2.5 flex items-center justify-between ${t.sub}`}>
            <button className="flex items-center gap-1.5">
              <MessageCircle className="h-[17px] w-[17px]" />
              <span className="text-[12px]">{fmtCount(p.replies)}</span>
            </button>
            <button
              onClick={() => onToggle(p.id, 'reposted')}
              className={`flex items-center gap-1.5 active:scale-90 ${p.reposted ? 'text-[#00BA7C]' : ''}`}
            >
              <Repeat2 className="h-[18px] w-[18px]" />
              <span className="text-[12px]">{fmtCount(p.reposts)}</span>
            </button>
            <button
              onClick={() => onToggle(p.id, 'liked')}
              className={`flex items-center gap-1.5 active:scale-90 ${p.liked ? 'text-[#F91880]' : ''}`}
            >
              <Heart className={`h-[17px] w-[17px] ${p.liked ? 'fill-[#F91880]' : ''}`} />
              <span className="text-[12px]">{fmtCount(p.likes)}</span>
            </button>
            <button className="flex items-center gap-1.5">
              <BarChart3 className="h-[17px] w-[17px]" />
              <span className="text-[12px]">{fmtCount(p.views)}</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle(p.id, 'bookmarked')}
                className={`active:scale-90 ${p.bookmarked ? 'text-[#1D9BF0]' : ''}`}
              >
                <Bookmark className={`h-[17px] w-[17px] ${p.bookmarked ? 'fill-current' : ''}`} />
              </button>
              <button>
                <Share className="h-[17px] w-[17px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================
 * Compose sheet
 * ============================================================ */

function ComposeSheet({
  t,
  name,
  avatar,
  onClose,
  onPost,
}: {
  t: Theme;
  name: string;
  avatar: string;
  onClose: () => void;
  onPost: (text: string) => void;
}) {
  const [value, setValue] = useState('');
  const left = 280 - value.length;
  const can = value.trim().length > 0 && left >= 0;

  return (
    <div className="absolute inset-0 z-50 flex flex-col pt-12" style={{ backgroundColor: t.isDark ? '#000' : '#fff' }}>
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button onClick={onClose} className={`text-[15px] ${t.text}`}>
          إلغاء
        </button>
        <button
          disabled={!can}
          onClick={() => onPost(value.trim())}
          className="rounded-full px-5 py-1.5 text-[14px] font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: BLUE }}
        >
          نشر
        </button>
      </div>
      <div className="flex flex-1 gap-3 overflow-y-auto px-4 pt-2">
        <Avatar src={avatar} name={name} />
        <textarea
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="ماذا يحدث؟"
          dir="rtl"
          className={`h-40 w-full resize-none bg-transparent text-[18px] outline-none ${t.text}`}
        />
      </div>
      <div className={`shrink-0 border-t px-4 pb-8 pt-2 ${t.border}`}>
        <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
          {COMPOSE_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setValue((v) => (v.includes(tag) ? v : `${v}${v && !v.endsWith(' ') ? ' ' : ''}${tag} `))}
              className="shrink-0 rounded-full border px-3 py-1 text-[12px] font-semibold text-[#1D9BF0]"
              style={{ borderColor: 'rgba(29,155,240,0.35)' }}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className={`text-left text-[12px] ${left < 20 ? 'text-red-500' : t.sub}`} dir="ltr">
          {left}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
 * Campaign editor (shared with Instagram via context)
 * ============================================================ */

function CampaignEditor({ t, onClose }: { t: Theme; onClose: () => void }) {
  const { ninjaCampaign, updateNinjaCampaign, ninjaProfile } = useSystem();
  const [image, setImage] = useState(ninjaCampaign.image);
  const [title, setTitle] = useState(ninjaCampaign.title);
  const [desc, setDesc] = useState(ninjaCampaign.description);
  const fileRef = useRef<HTMLInputElement>(null);
  const published = ninjaCampaign.status === 'published';

  const pick = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const field = `mt-1 w-full rounded-xl border px-3 py-2.5 text-[14px] ${t.border} ${t.text} ${t.soft}`;

  return (
    <div className="absolute inset-0 z-50 flex flex-col pt-12" style={{ backgroundColor: t.isDark ? '#000' : '#fff' }}>
      <div className={`flex h-12 shrink-0 items-center justify-between border-b px-4 ${t.border}`}>
        <button onClick={onClose} className={t.text}>
          <X className="h-5 w-5" />
        </button>
        <span className={`text-base font-bold ${t.text}`}>إدارة منشور الحملة</span>
        <button
          onClick={() => {
            updateNinjaCampaign({ image, title, description: desc });
            onClose();
          }}
          className="text-[15px] font-semibold text-[#1D9BF0]"
        >
          حفظ
        </button>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto p-4">
        <div className={`mb-4 overflow-hidden rounded-2xl border ${t.border}`}>
          {image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={image} alt="معاينة" className="h-44 w-full object-cover" />
          ) : (
            <div className={`flex h-44 items-center justify-center ${t.soft} ${t.sub}`}>لا صورة بعد</div>
          )}
          <div className="p-3">
            <p className={`text-[13px] font-bold ${t.text}`}>{title || 'العنوان'}</p>
            <p className={`mt-1 text-[12px] ${t.sub}`}>{desc || 'الوصف'}</p>
            <p className="mt-1 text-[12px] font-semibold text-[#1D9BF0]">{ninjaCampaign.hashtag}</p>
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 rounded-xl py-2.5 text-[14px] font-semibold text-white"
            style={{ backgroundColor: BLUE }}
          >
            {image ? 'استبدال الصورة' : 'رفع صورة الحملة'}
          </button>
          {image && (
            <button onClick={() => setImage('')} className={`rounded-xl px-4 py-2.5 text-[14px] font-semibold text-red-500 ${t.soft}`}>
              حذف
            </button>
          )}
        </div>

        <label className={`mt-4 block text-[13px] font-semibold ${t.text}`}>عنوان المنشور</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} dir="rtl" />

        <label className={`mt-3 block text-[13px] font-semibold ${t.text}`}>الوصف</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className={`${field} resize-none`} dir="rtl" />

        <p className={`mt-2 text-[12px] ${t.sub}`}>الحساب: Ninja ({ninjaProfile.username}) · الهاشتاق مقفل</p>

        <button
          onClick={() => {
            updateNinjaCampaign({ image, title, description: desc, status: 'published', updatedAt: Date.now() });
            onClose();
          }}
          className="mt-5 w-full rounded-xl py-3 text-[15px] font-bold text-white"
          style={{ backgroundColor: BLUE }}
        >
          نشر الحملة
        </button>
        {published && (
          <button
            onClick={() => {
              updateNinjaCampaign({ status: 'draft' });
              onClose();
            }}
            className={`mt-2 w-full rounded-xl py-3 text-[15px] font-bold text-red-500 ${t.soft}`}
          >
            إلغاء النشر
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * Main app
 * ============================================================ */

export default function XApp() {
  const { isDark, ninjaCampaign, ninjaProfile, pendingDeepLink } = useSystem();
  const [tab, setTab] = useState<Tab>('home');
  useEffect(() => {
    if (pendingDeepLink?.appId === 'x') {
      setComposeOpen(false);
      setCampaignOpen(false);
      setTab(pendingDeepLink.targetId === 'x-activity' ? 'activity' : 'messages');
    }
  }, [pendingDeepLink]);
  const [feedTab, setFeedTab] = useState<FeedTab>('foryou');
  const [activeTag, setActiveTag] = useState<string>(NINJA_HASHTAG);
  const [query, setQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  // v2 key: the old stored posts were Eid-themed
  const [posts, setPosts] = usePersistentState<XPost[]>('x-posts-v2', SEED_POSTS);

  const t: Theme = {
    isDark,
    bg: isDark ? 'bg-black' : 'bg-white',
    text: isDark ? 'text-white' : 'text-black',
    sub: isDark ? 'text-white/50' : 'text-black/50',
    border: isDark ? 'border-white/10' : 'border-black/10',
    soft: isDark ? 'bg-white/10' : 'bg-black/5',
  };

  const toggle = (id: string, field: 'liked' | 'reposted' | 'bookmarked') =>
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const on = !p[field];
        return {
          ...p,
          [field]: on,
          likes: field === 'liked' ? p.likes + (on ? 1 : -1) : p.likes,
          reposts: field === 'reposted' ? p.reposts + (on ? 1 : -1) : p.reposts,
        };
      })
    );

  const openTag = (tag: string) => {
    setActiveTag(tag);
    setTab('hashtag');
  };

  const publish = (text: string) => {
    const post: XPost = {
      id: 'u' + Date.now().toString(36),
      author: ninjaProfile.name,
      username: ninjaProfile.username,
      avatar: ninjaProfile.avatar,
      verified: true,
      text,
      likes: 0,
      liked: false,
      reposts: 0,
      reposted: false,
      replies: 0,
      views: 1,
      bookmarked: false,
      timestamp: Date.now(),
    };
    setPosts((prev) => [post, ...prev]);
    setComposeOpen(false);
    setTab('home');
    setFeedTab('foryou');
  };

  // Campaign post (managed from the profile). Carries the locked Ninja hashtag.
  const campaignPublished = ninjaCampaign.status === 'published';
  const campaignPost: XPost = useMemo(
    () => ({
      id: 'campaign',
      author: ninjaProfile.name,
      username: ninjaProfile.username,
      avatar: ninjaProfile.avatar,
      verified: true,
      text: `${ninjaCampaign.title || ''}\n${ninjaCampaign.description || ''}\n${ninjaCampaign.hashtag}`.trim(),
      image: ninjaCampaign.image || undefined,
      likes: 0,
      liked: false,
      reposts: 0,
      reposted: false,
      replies: 0,
      views: 0,
      bookmarked: false,
      timestamp: ninjaCampaign.updatedAt || Date.now(),
    }),
    [ninjaCampaign, ninjaProfile]
  );

  const card = (p: XPost) => <PostCard key={p.id} p={p} t={t} onToggle={toggle} onTag={openTag} />;

  /* ---------- Home ---------- */
  const renderHome = () => {
    const list = feedTab === 'foryou' ? posts : posts.filter((p) => FOLLOWING.includes(p.username));
    return (
      <>
        <div className={`relative flex h-11 shrink-0 items-center justify-center`}>
          <button onClick={() => setTab('profile')} className="absolute right-4 top-1.5 active:opacity-70">
            <Avatar src={ninjaProfile.avatar} name={ninjaProfile.name} size={32} />
          </button>
          <XLogo className={`h-[22px] w-[22px] ${t.text}`} />
        </div>
        <div className={`flex shrink-0 border-b ${t.border}`}>
          {(
            [
              { id: 'foryou', label: 'لك' },
              { id: 'following', label: 'المتابَعون' },
            ] as const
          ).map((f) => (
            <button key={f.id} onClick={() => setFeedTab(f.id)} className="relative flex-1 py-3 active:bg-black/5">
              <span className={`text-[15px] ${feedTab === f.id ? `font-bold ${t.text}` : `font-medium ${t.sub}`}`}>{f.label}</span>
              {feedTab === f.id && (
                <span className="absolute bottom-0 left-1/2 h-1 w-14 -translate-x-1/2 rounded-full" style={{ backgroundColor: BLUE }} />
              )}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
          {campaignPublished && card(campaignPost)}
          {list.map(card)}
        </div>
      </>
    );
  };

  /* ---------- Explore ---------- */
  const renderExplore = () => {
    const q = query.trim();
    const results = q ? posts.filter((p) => p.text.includes(q) || p.author.includes(q)) : [];
    const tags = q ? TREND.filter((x) => x.tag.includes(q)) : TREND;
    return (
      <>
        <div className="shrink-0 px-4 pb-2 pt-1">
          <div className={`flex items-center gap-2 rounded-full px-4 py-2.5 ${t.soft}`}>
            <SearchIcon className={`h-4 w-4 ${t.sub}`} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="بحث"
              className={`w-full bg-transparent text-[15px] outline-none ${t.text}`}
              dir="rtl"
            />
            {q && (
              <button onClick={() => setQuery('')} className={t.sub}>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
          <h2 className={`px-4 pb-1 pt-3 text-[20px] font-extrabold ${t.text}`}>{q ? 'الهاشتاقات' : 'المواضيع الرائجة'}</h2>
          {tags.length === 0 && <p className={`px-4 py-3 text-[13px] ${t.sub}`}>لا توجد هاشتاقات مطابقة</p>}
          {tags.map((x) => (
            <button
              key={x.tag}
              onClick={() => openTag(x.tag)}
              className={`flex w-full items-center justify-between px-4 py-3 text-right active:bg-black/5`}
            >
              <div>
                <p className={`text-[12px] ${t.sub}`}>{x.category}</p>
                <p className={`text-[16px] font-bold ${t.text}`}>{x.tag}</p>
                <p className={`text-[12px] ${t.sub}`}>{fmtCount(x.posts)} منشور</p>
              </div>
              {x.tag === NINJA_HASHTAG && (
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-[#1D9BF0]" style={{ backgroundColor: 'rgba(29,155,240,0.12)' }}>
                  حملة نينجا
                </span>
              )}
            </button>
          ))}
          {q && (
            <>
              <h2 className={`border-t px-4 pb-1 pt-4 text-[20px] font-extrabold ${t.text} ${t.border}`}>المنشورات</h2>
              {results.length === 0 ? <p className={`px-4 py-3 text-[13px] ${t.sub}`}>لا توجد نتائج</p> : results.map(card)}
            </>
          )}
        </div>
      </>
    );
  };

  /* ---------- Hashtag page ---------- */
  const renderHashtag = () => {
    const tagged = posts.filter((p) => p.text.includes(activeTag));
    const showCampaign = campaignPublished && activeTag === NINJA_HASHTAG;
    const total = TREND.find((x) => x.tag === activeTag)?.posts ?? tagged.length;
    return (
      <>
        <div className={`flex shrink-0 items-center gap-3 border-b px-3 py-2.5 ${t.border}`}>
          <button onClick={() => setTab('explore')} className={t.text}>
            <ArrowRight className="h-5 w-5" />
          </button>
          <div>
            <p className={`text-[16px] font-bold ${t.text}`}>{activeTag}</p>
            <p className={`text-[12px] ${t.sub}`}>{fmtCount(total)} منشور</p>
          </div>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
          {showCampaign && card(campaignPost)}
          {tagged.map(card)}
          {tagged.length === 0 && !showCampaign && (
            <div className="p-8 text-center">
              <p className={`text-[15px] font-bold ${t.text}`}>لا منشورات بعد</p>
              <p className={`mt-1 text-[13px] ${t.sub}`}>كن أول من ينشر بهذا الهاشتاق</p>
            </div>
          )}
        </div>
      </>
    );
  };

  /* ---------- Notifications ---------- */
  const renderActivity = () => <SocialInbox appId="x" activity onClose={() => setTab('home')} />;
  const renderMessages = () => <SocialInbox appId="x" onClose={() => setTab('home')} />;

  /* ---------- Bookmarks ---------- */
  const renderBookmarks = () => {
    const saved = posts.filter((p) => p.bookmarked);
    return (
      <>
        <div className={`flex shrink-0 items-center gap-3 border-b px-3 py-2.5 ${t.border}`}>
          <button onClick={() => setTab('profile')} className={t.text}>
            <ArrowRight className="h-5 w-5" />
          </button>
          <h1 className={`text-[18px] font-extrabold ${t.text}`}>المحفوظات</h1>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
          {saved.map(card)}
          {saved.length === 0 && <p className={`py-12 text-center text-[13px] ${t.sub}`}>لا توجد منشورات محفوظة</p>}
        </div>
      </>
    );
  };

  /* ---------- Profile ---------- */
  const renderProfile = () => {
    const mine = posts.filter((p) => p.username === ninjaProfile.username);
    return (
      <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
        <div className="h-28" style={{ background: 'linear-gradient(135deg, #087F83, #F4D66D)' }} />
        <div className="px-4">
          <div className="-mt-10 flex items-end justify-between">
            <div className="rounded-full border-4" style={{ borderColor: isDark ? '#000' : '#fff' }}>
              <Avatar src={ninjaProfile.avatar} name={ninjaProfile.name} size={72} />
            </div>
            <div className="flex gap-2 pb-1">
              <button onClick={() => setTab('bookmarks')} className={`rounded-full border px-4 py-1.5 text-[13px] font-bold ${t.border} ${t.text}`}>
                المحفوظات
              </button>
              <button onClick={() => setCampaignOpen(true)} className={`rounded-full border px-4 py-1.5 text-[13px] font-bold ${t.border} ${t.text}`}>
                إدارة الحملة
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <p className={`text-[19px] font-extrabold ${t.text}`}>{ninjaProfile.name}</p>
            <Verified />
          </div>
          <p className={`text-[14px] ${t.sub}`} dir="ltr">
            @{ninjaProfile.username}
          </p>
          <p className={`mt-2 text-[14px] leading-relaxed ${t.text}`}>{ninjaProfile.bio}</p>
          <div className={`mt-2 flex gap-4 text-[13px] ${t.sub}`}>
            <span>
              <b className={t.text}>{fmtCount(ninjaProfile.following)}</b> يتابع
            </span>
            <span>
              <b className={t.text}>{fmtCount(ninjaProfile.followers)}</b> متابع
            </span>
          </div>
        </div>
        <div className={`mt-3 border-b px-4 pb-2 text-[15px] font-bold ${t.text} ${t.border}`}>المنشورات</div>
        {campaignPublished && card(campaignPost)}
        {mine.map(card)}
      </div>
    );
  };

  /* ---------- Root ---------- */
  const navItems = [
    { id: 'home' as const, icon: Home, dot: false },
    { id: 'explore' as const, icon: SearchIcon, dot: false },
    { id: 'activity' as const, icon: Bell, dot: true },
    { id: 'messages' as const, icon: Mail, dot: false },
  ];
  const showFab = tab === 'home' || tab === 'explore' || tab === 'hashtag';

  return (
    <div className={`absolute inset-0 overflow-hidden ${t.bg}`}>
      <div className={`absolute inset-x-0 top-12 flex flex-col ${tab === 'messages' || tab === 'activity' ? 'bottom-[98px]' : 'bottom-0'}`}>
        {tab === 'home' && renderHome()}
        {tab === 'explore' && renderExplore()}
        {tab === 'hashtag' && renderHashtag()}
        {tab === 'activity' && renderActivity()}
        {tab === 'messages' && renderMessages()}
        {tab === 'bookmarks' && renderBookmarks()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* Compose button */}
      {showFab && (
        <button
          onClick={() => setComposeOpen(true)}
          aria-label="منشور جديد"
          className="absolute bottom-[104px] right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(29,155,240,0.45)] active:scale-90"
          style={{ backgroundColor: BLUE }}
        >
          <Plus className="h-7 w-7" strokeWidth={2.6} />
        </button>
      )}

      {/* Floating glass tab bar (iOS 26) */}
      <div className="absolute inset-x-5 bottom-6 z-20">
        <div
          className={`flex items-center justify-around rounded-full border px-2 py-2.5 ${isDark ? 'border-white/15' : 'border-white/70'}`}
          style={{
            background: isDark ? 'rgba(30,30,32,0.72)' : 'rgba(255,255,255,0.78)',
            backdropFilter: 'blur(28px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
        >
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id || (n.id === 'explore' && tab === 'hashtag');
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`relative flex h-11 w-16 items-center justify-center rounded-full transition active:scale-90 ${
                  active ? (isDark ? 'bg-white/15' : 'bg-black/[0.07]') : ''
                }`}
              >
                <Icon className={`h-[24px] w-[24px] ${t.text} ${active ? '' : 'opacity-55'}`} strokeWidth={active ? 2.6 : 2} />
                {n.dot && tab !== 'activity' && (
                  <span className="absolute right-4 top-2 h-2.5 w-2.5 rounded-full border-2 border-white" style={{ backgroundColor: BLUE }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {composeOpen && (
        <ComposeSheet t={t} name={ninjaProfile.name} avatar={ninjaProfile.avatar} onClose={() => setComposeOpen(false)} onPost={publish} />
      )}
      {campaignOpen && <CampaignEditor t={t} onClose={() => setCampaignOpen(false)} />}
    </div>
  );
}
