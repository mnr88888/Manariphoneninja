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
} from 'lucide-react';
import { useSystem, NINJA_HASHTAG } from '../../system/SystemContext';
import { useOS } from '../../OSContext';
import { XPost, X_SELF_ID, X_POSTS_KEY, X_SEED_POSTS, isOwnXPost, postIdFromTarget } from '../../system/xStore';
import { XActivity, X_ACTIVITY_KEY, X_ACTIVITY_SEED, ensureInboxStores } from '../../system/inboxDelivery';
import { usePersistentState, toArabicDigits } from '../shared/utils';

export { NINJA_HASHTAG };

const BLUE = '#1D9BF0';

const MIN = 60000;

/** Accounts shown in the "المتابَعون" tab */
const FOLLOWING = ['ninja', 'ahmed_otebi', 'noura_q', 'reem_d', 'sara_h', 'jood_s', 'lina_a', 'moh_salem'];

const TREND = [
  { tag: NINJA_HASHTAG, posts: 24800, category: 'رائج في السعودية' },
  { tag: '#أجواء_الرياض', posts: 58200, category: 'رائج في السعودية' },
  { tag: '#سفرة_رمضان', posts: 14600, category: 'طعام · رائج' },
  { tag: '#اجواء_رمضان', posts: 9300, category: 'رائج' },
  { tag: '#بودكاست', posts: 7150, category: 'ثقافة · رائج' },
  { tag: '#مشي', posts: 4200, category: 'رائج' },
];

const COMPOSE_TAGS = ['#يوميات', '#أجواء_الرياض', '#بودكاست', '#مشي'];

type Tab = 'home' | 'explore' | 'activity' | 'messages' | 'profile' | 'hashtag' | 'bookmarks' | 'post';
type FeedTab = 'foryou' | 'following';
type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

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
  onOpen,
}: {
  p: XPost;
  t: Theme;
  onToggle: (id: string, field: 'liked' | 'reposted' | 'bookmarked') => void;
  onTag: (tag: string) => void;
  onOpen?: (postId: string) => void;
}) {
  return (
    <article
      data-post-id={p.id}
      className={`border-b px-4 py-3 ${t.border} ${onOpen ? 'cursor-pointer' : ''}`}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `فتح منشور ${p.author}` : undefined}
      onClick={(event) => {
        if (onOpen && !(event.target as HTMLElement).closest('button, a, input')) onOpen(p.id);
      }}
      onKeyDown={(event) => {
        if (onOpen && event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onOpen(p.id);
        }
      }}
    >
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
              aria-label={`${p.liked ? 'إلغاء الإعجاب' : 'إعجاب'}، ${toArabicDigits(p.likes)} إعجابات`}
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
 * Ordinary account editing — shared profile, not a campaign dashboard
 * ============================================================ */

function ProfileEditor({ t, onClose }: { t: Theme; onClose: () => void }) {
  const { ninjaProfile, updateNinjaProfile } = useSystem();
  const [name, setName] = useState(ninjaProfile.name);
  const [username, setUsername] = useState(ninjaProfile.username);
  const [bio, setBio] = useState(ninjaProfile.bio);
  const [avatar, setAvatar] = useState(ninjaProfile.avatar);
  const fileRef = useRef<HTMLInputElement>(null);
  const valid = name.trim().length > 0 && /^[A-Za-z0-9_]{1,15}$/.test(username);
  const field = `mt-1 w-full rounded-lg border px-3 py-3 text-[15px] outline-none ${t.border} ${t.text} ${t.soft}`;
  return (
    <section className={`absolute inset-0 z-50 flex flex-col pt-12 ${t.bg}`} dir="rtl">
      <header className={`flex h-12 shrink-0 items-center justify-between border-b px-4 ${t.border}`}>
        <button aria-label="إلغاء تعديل الملف" onClick={onClose} className={t.text}><X size={21} /></button>
        <h2 className={`text-[17px] font-bold ${t.text}`}>تعديل الملف الشخصي</h2>
        <button disabled={!valid} onClick={() => {
          updateNinjaProfile({ name: name.trim(), username, bio: bio.trim(), avatar });
          onClose();
        }} className="rounded-full bg-[#1D9BF0] px-4 py-1.5 text-[14px] font-bold text-white disabled:opacity-40">حفظ</button>
      </header>
      <div className="no-scrollbar flex-1 space-y-4 overflow-y-auto p-4 pb-28">
        <div className="flex items-center gap-4">
          <Avatar src={avatar} name={name || ninjaProfile.name} size={76} />
          <button onClick={() => fileRef.current?.click()} className="text-[14px] font-semibold text-[#1D9BF0]">تغيير صورة الملف الشخصي</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setAvatar(String(reader.result || ninjaProfile.avatar));
            reader.readAsDataURL(file);
          }} />
        </div>
        <label className={`block text-[13px] ${t.sub}`}>الاسم
          <input value={name} maxLength={50} onChange={(event) => setName(event.target.value)} className={field} />
        </label>
        <label className={`block text-[13px] ${t.sub}`}>اسم المستخدم
          <input value={username} maxLength={15} onChange={(event) => setUsername(event.target.value.replace(/^@/, ''))} className={field} dir="ltr" />
          {!/^[A-Za-z0-9_]{1,15}$/.test(username) && <span className="mt-1 block text-red-500">استخدم حروفًا إنجليزية أو أرقامًا أو شرطة سفلية، حتى ١٥ حرفًا.</span>}
        </label>
        <label className={`block text-[13px] ${t.sub}`}>النبذة التعريفية
          <textarea value={bio} maxLength={160} rows={4} onChange={(event) => setBio(event.target.value)} className={`${field} resize-none`} />
        </label>
      </div>
    </section>
  );
}

/* ============================================================
 * Main app
 * ============================================================ */

export default function XApp() {
  const { isDark, ninjaCampaign, ninjaProfile, pendingDeepLink, consumeDeepLink, notifications, markNotificationRead, locked } = useSystem();
  const { activeApp, screenMode } = useOS();
  const [tab, setTab] = useState<Tab>('home');
  const [feedTab, setFeedTab] = useState<FeedTab>('foryou');
  const [profileTab, setProfileTab] = useState<ProfileTab>('posts');
  const [activeTag, setActiveTag] = useState<string>(NINJA_HASHTAG);
  const [query, setQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [postReturnTab, setPostReturnTab] = useState<Tab>('home');
  // Migrate before the shared hooks hydrate. Keep the existing key and all user-authored posts.
  useEffect(() => { ensureInboxStores(); }, []);
  const [posts, setPosts] = usePersistentState<XPost[]>(X_POSTS_KEY, X_SEED_POSTS);
  const [activities, setActivities] = usePersistentState<XActivity[]>(X_ACTIVITY_KEY, X_ACTIVITY_SEED);

  const displayPost = (post: XPost): XPost => isOwnXPost(post) ? {
    ...post, author: ninjaProfile.name, username: ninjaProfile.username, avatar: ninjaProfile.avatar,
  } : post;
  const displayPosts = useMemo(() => posts
    .filter((post) => post.source !== 'campaign' || ninjaCampaign.status === 'published')
    .map((post) => isOwnXPost(post) ? { ...post, author: ninjaProfile.name, username: ninjaProfile.username, avatar: ninjaProfile.avatar } : post)
    .sort((a, b) => b.timestamp - a.timestamp), [posts, ninjaCampaign.status, ninjaProfile]);

  const openPost = (postId: string, from: Tab = tab) => {
    setSelectedPostId(postId);
    setPostReturnTab(from === 'post' ? 'home' : from);
    setComposeOpen(false);
    setProfileOpen(false);
    setTab('post');
  };

  useEffect(() => {
    if (pendingDeepLink?.appId !== 'x') return;
    setComposeOpen(false);
    setProfileOpen(false);
    const activity = activities.find((item) => item.id === pendingDeepLink.messageId);
    const postId = pendingDeepLink.postId ?? postIdFromTarget(pendingDeepLink.targetId) ?? (pendingDeepLink.targetId === 'x-activity' ? activity?.postId : null);
    if (postId) {
      setSelectedPostId(postId);
      setPostReturnTab('activity');
      setTab('post');
      consumeDeepLink();
    } else if (pendingDeepLink.targetId === 'x-activity') {
      setTab('activity');
      consumeDeepLink();
    } else {
      // Direct-message deep links remain consumed by SocialInbox once its thread has loaded.
      setTab('messages');
    }
  }, [pendingDeepLink, activities, consumeDeepLink]);

  useEffect(() => {
    if (activeApp !== 'x' || screenMode !== 'app' || locked || (tab !== 'activity' && tab !== 'post')) return;
    const visible = activities.filter((item) => tab === 'activity' || item.postId === selectedPostId);
    if (visible.some((item) => !item.read)) {
      const ids = new Set(visible.map((item) => item.id));
      setActivities((prev) => prev.map((item) => ids.has(item.id) ? { ...item, read: true } : item));
    }
    const ids = new Set(visible.map((item) => item.id));
    notifications.filter((notification) => notification.appId === 'x' && !notification.read &&
      (ids.has(notification.messageId ?? notification.id) || (tab === 'post' && postIdFromTarget(notification.targetId) === selectedPostId)))
      .forEach(markNotificationRead);
  }, [activeApp, screenMode, locked, tab, selectedPostId, activities, setActivities, notifications, markNotificationRead]);

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
          likes: field === 'liked' ? Math.max(0, p.likes + (on ? 1 : -1)) : p.likes,
          reposts: field === 'reposted' ? Math.max(0, p.reposts + (on ? 1 : -1)) : p.reposts,
        };
      })
    );

  const openTag = (tag: string) => {
    setActiveTag(tag);
    setTab('hashtag');
  };

  const publish = (text: string) => {
    const post: XPost = {
      id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      ownerId: X_SELF_ID,
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

  const card = (p: XPost) => <PostCard key={p.id} p={p} t={t} onToggle={toggle} onTag={openTag} onOpen={(id) => openPost(id)} />;

  /* ---------- Home ---------- */
  const renderHome = () => {
    const list = feedTab === 'foryou' ? displayPosts : displayPosts.filter((p) => FOLLOWING.includes(p.username) || isOwnXPost(p));
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
          {list.map(card)}
        </div>
      </>
    );
  };

  /* ---------- Explore ---------- */
  const renderExplore = () => {
    const q = query.trim();
    const results = q ? displayPosts.filter((p) => p.text.includes(q) || p.author.includes(q)) : [];
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
    const tagged = displayPosts.filter((p) => p.text.includes(activeTag));
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
          {tagged.map(card)}
          {tagged.length === 0 && (
            <div className="p-8 text-center">
              <p className={`text-[15px] font-bold ${t.text}`}>لا منشورات بعد</p>
              <p className={`mt-1 text-[13px] ${t.sub}`}>كن أول من ينشر بهذا الهاشتاق</p>
            </div>
          )}
        </div>
      </>
    );
  };

  /* ---------- Notifications linked to real own posts ---------- */
  const renderActivity = () => {
    const valid = activities.filter((item) => posts.some((post) => post.id === item.postId && isOwnXPost(post)));
    return (
      <section className={`flex min-h-0 flex-1 flex-col ${t.bg}`} dir="rtl" data-inbox-app="x-activity">
        <header className={`flex shrink-0 items-center gap-3 border-b px-4 py-3 ${t.border}`}>
          <button aria-label="رجوع" onClick={() => setTab('home')} className={t.text}><ArrowRight size={21} /></button>
          <h2 className={`text-[19px] font-bold ${t.text}`}>الإشعارات</h2>
        </header>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-6">
          {valid.map((item) => {
            const post = posts.find((p) => p.id === item.postId)!;
            return (
              <button key={item.id} data-activity-id={item.id} data-post-id={item.postId}
                onClick={() => openPost(item.postId, 'activity')}
                aria-label={`فتح المنشور الذي تفاعل معه ${item.actor}`}
                className={`flex w-full gap-3 border-b px-4 py-4 text-right ${t.border} ${!item.read ? t.soft : ''}`}>
                {item.type === 'like' ? <Heart className="mt-1 h-7 w-7 shrink-0 fill-[#F91880] text-[#F91880]" /> : <Repeat2 className="mt-1 h-7 w-7 shrink-0 text-[#00BA7C]" />}
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] ${t.text}`}><b>{item.actor}</b> {item.type === 'like' ? 'أعجب بمنشورك' : item.type === 'repost' ? 'أعاد نشر منشورك' : 'تفاعل مع منشورك'}</span>
                  <span className={`mt-1 block whitespace-pre-wrap text-[13px] leading-relaxed ${t.sub}`}>{post.text}</span>
                  <span className={`mt-2 flex justify-between gap-2 text-[11px] ${t.sub}`}>
                    <span>{shortTime(item.timestamp)}</span>
                    <span>{toArabicDigits(post.likes)} إعجابات</span>
                  </span>
                </span>
              </button>
            );
          })}
          {valid.length === 0 && <div className="px-7 py-10"><h3 className={`text-[23px] font-extrabold ${t.text}`}>لا توجد إشعارات بعد</h3><p className={`mt-2 text-[14px] leading-relaxed ${t.sub}`}>ستظهر هنا التفاعلات مع منشوراتك.</p></div>}
        </div>
      </section>
    );
  };
  const renderMessages = () => <SocialInbox appId="x" onClose={() => setTab('home')} />;

  const renderPost = () => {
    const stored = posts.find((post) => post.id === selectedPostId);
    const post = stored ? displayPost(stored) : null;
    return (
      <>
        <header className={`flex shrink-0 items-center gap-4 border-b px-4 py-3 ${t.border}`}>
          <button aria-label="رجوع" onClick={() => setTab(postReturnTab)} className={t.text}><ArrowRight size={22} /></button>
          <h1 className={`text-[19px] font-bold ${t.text}`}>المنشور</h1>
        </header>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32" data-open-post-id={selectedPostId ?? undefined}>
          {post ? <>
            <PostCard p={post} t={t} onToggle={toggle} onTag={openTag} />
            <div className={`border-b px-4 py-3 text-[13px] ${t.sub} ${t.border}`}>
              <p>{new Date(post.timestamp).toLocaleString('ar-SA', { dateStyle: 'medium', timeStyle: 'short' })}</p>
              <p className="mt-2"><b className={t.text}>{toArabicDigits(post.likes)}</b> إعجابات · <b className={t.text}>{toArabicDigits(post.reposts)}</b> إعادة نشر</p>
            </div>
          </> : <p className={`px-6 py-12 text-center text-[15px] ${t.sub}`}>هذا المنشور غير متاح.</p>}
        </div>
      </>
    );
  };

  /* ---------- Bookmarks ---------- */
  const renderBookmarks = () => {
    const saved = displayPosts.filter((p) => p.bookmarked);
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

  /* ---------- Native-style own profile ---------- */
  const renderProfile = () => {
    const mine = displayPosts.filter(isOwnXPost);
    const list = profileTab === 'media' ? mine.filter((post) => post.image)
      : profileTab === 'replies' ? mine.filter((post) => post.text.trim().startsWith('@'))
      : profileTab === 'likes' ? displayPosts.filter((post) => post.liked) : mine;
    const profileTabs: Array<{ id: ProfileTab; label: string }> = [
      { id: 'posts', label: 'المنشورات' }, { id: 'replies', label: 'الردود' },
      { id: 'media', label: 'الوسائط' }, { id: 'likes', label: 'الإعجابات' },
    ];
    return (
      <>
        <header className={`flex shrink-0 items-center gap-4 border-b px-4 py-2 ${t.border}`}>
          <button aria-label="رجوع" onClick={() => setTab('home')} className={t.text}><ArrowRight size={22} /></button>
          <div className="min-w-0 flex-1"><h1 className={`truncate text-[18px] font-bold ${t.text}`}>{ninjaProfile.name}</h1><p className={`text-[11px] ${t.sub}`}>{toArabicDigits(mine.length)} منشورات</p></div>
          <button aria-label="المحفوظات" onClick={() => setTab('bookmarks')} className={t.text}><Bookmark size={20} /></button>
        </header>
        <div className="no-scrollbar flex-1 overflow-y-auto pb-32">
          <div className="h-28" style={{ background: 'linear-gradient(135deg, #087F83, #F4D66D)' }} />
          <div className="px-4">
            <div className="-mt-10 flex items-end justify-between gap-2">
              <div className="rounded-full border-4" style={{ borderColor: isDark ? '#000' : '#fff' }}><Avatar src={ninjaProfile.avatar} name={ninjaProfile.name} size={76} /></div>
              <button onClick={() => setProfileOpen(true)} className={`mb-1 rounded-full border px-4 py-2 text-[13px] font-bold ${t.border} ${t.text}`}>تعديل الملف الشخصي</button>
            </div>
            <div className="mt-2 flex items-center gap-1"><h2 className={`text-[20px] font-extrabold ${t.text}`}>{ninjaProfile.name}</h2><Verified /></div>
            <p className={`text-right text-[14px] ${t.sub}`} dir="ltr">@{ninjaProfile.username}</p>
            <p className={`mt-2 whitespace-pre-wrap text-[14px] leading-relaxed ${t.text}`}>{ninjaProfile.bio}</p>
            <div className={`mt-3 flex gap-4 text-[13px] ${t.sub}`}>
              <span><b className={t.text}>{fmtCount(ninjaProfile.following)}</b> يتابع</span>
              <span><b className={t.text}>{fmtCount(ninjaProfile.followers)}</b> متابع</span>
            </div>
          </div>
          <div className={`mt-4 flex border-b ${t.border}`} role="tablist" aria-label="منشورات الملف الشخصي">
            {profileTabs.map((item) => <button key={item.id} role="tab" aria-selected={profileTab === item.id} onClick={() => setProfileTab(item.id)}
              className={`relative min-w-0 flex-1 px-1 py-3 text-[12px] ${profileTab === item.id ? `font-bold ${t.text}` : t.sub}`}>
              {item.label}
              {profileTab === item.id && <span className="absolute inset-x-4 bottom-0 h-1 rounded-full bg-[#1D9BF0]" />}
            </button>)}
          </div>
          {list.map(card)}
          {list.length === 0 && <p className={`px-6 py-10 text-center text-[14px] ${t.sub}`}>{profileTab === 'media' ? 'لا توجد وسائط بعد' : profileTab === 'replies' ? 'لا توجد ردود بعد' : profileTab === 'likes' ? 'المنشورات التي تعجبك ستظهر هنا' : 'لم تنشر شيئًا بعد'}</p>}
        </div>
      </>
    );
  };

  /* ---------- Root ---------- */
  const navItems = [
    { id: 'home' as const, icon: Home, dot: false },
    { id: 'explore' as const, icon: SearchIcon, dot: false },
    { id: 'activity' as const, icon: Bell, dot: activities.some((item) => !item.read) },
    { id: 'messages' as const, icon: Mail, dot: false },
  ];
  const showFab = tab === 'home' || tab === 'explore' || tab === 'hashtag' || tab === 'profile';

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
        {tab === 'post' && renderPost()}
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
      {profileOpen && <ProfileEditor t={t} onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
