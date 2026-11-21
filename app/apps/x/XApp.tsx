'use client';

import { useState, useRef } from 'react';
import {
  Home,
  Search as SearchIcon,
  Bell,
  Mail,
  Bookmark,
  User,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  BarChart3,
  X,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useSystem } from '../../system/SystemContext';
import { usePersistentState, formatRelativeTime, toArabicDigits } from '../shared/utils';

export const NINJA_HASHTAG = '#العيد_يجمعنا_ونينجا_يجمعنا';

interface XPost {
  id: string;
  author: string;
  username: string;
  avatar: string;
  text: string;
  image?: string;
  likes: number;
  liked: boolean;
  reposts: number;
  reposted: boolean;
  replies: number;
  bookmarked: boolean;
  timestamp: number;
  hashtags?: string[];
}

const TREND = [
  { tag: NINJA_HASHTAG, posts: 12400, category: 'رائج في السعودية' },
  { tag: '#العيد_الكبير', posts: 8920, category: 'رائج' },
  { tag: '#الرياض_الآن', posts: 5410, category: 'أخبار' },
  { tag: '#توصيل_سريع', posts: 3120, category: 'الأعمال' },
];

const SEED_POSTS: XPost[] = [
  {
    id: 'x1',
    author: 'أحمد العتيبي',
    username: 'ahmed_otebi',
    avatar: '#FF3B30',
    text: 'أفضل تجربة توصيل جربتها هذا الشهر، وصل الطلب قبل الوقت المحدد 👌',
    likes: 234,
    liked: false,
    reposts: 41,
    reposted: false,
    replies: 18,
    bookmarked: false,
    timestamp: Date.now() - 1800000,
  },
  {
    id: 'x2',
    author: 'نورة القحطاني',
    username: 'noura_q',
    avatar: '#007AFF',
    text: 'أجواء العيد تجمعنا دائماً 🌙 من أجمل المناسبات',
    image: '/wallpapers/ios26-sunrise.webp',
    likes: 1892,
    liked: false,
    reposts: 320,
    reposted: false,
    replies: 76,
    bookmarked: false,
    timestamp: Date.now() - 3 * 3600000,
  },
  {
    id: 'x3',
    author: 'محمد سالم',
    username: 'moh_salem',
    avatar: '#34C759',
    text: 'نصيحة: جربوا طلب الفطور من التطبيق الصباح، الوقت مثالي ☕',
    likes: 87,
    liked: false,
    reposts: 9,
    reposted: false,
    replies: 4,
    bookmarked: false,
    timestamp: Date.now() - 7 * 3600000,
  },
];

type Tab = 'home' | 'explore' | 'activity' | 'messages' | 'bookmarks' | 'profile' | 'hashtag';

export default function XApp() {
  const { isDark, ninjaCampaign, updateNinjaCampaign, ninjaProfile, updateNinjaProfile } = useSystem();
  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = usePersistentState<XPost[]>('x-posts', SEED_POSTS);
  const [campaignOpen, setCampaignOpen] = useState(false);

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';
  const subText = isDark ? 'text-white/50' : 'text-black/50';
  const border = isDark ? 'border-white/10' : 'border-black/10';

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

  // Campaign posts carry the exact featured hashtag
  const campaignText = `${ninjaCampaign.title || ''}\n${ninjaCampaign.description || ''}\n${ninjaCampaign.hashtag}`.trim();
  const campaignPost: XPost = {
    id: 'campaign',
    author: ninjaProfile.name,
    username: ninjaProfile.username,
    avatar: ninjaProfile.avatar,
    text: campaignText || ninjaCampaign.hashtag,
    image: ninjaCampaign.image || undefined,
    likes: 0,
    liked: false,
    reposts: 0,
    reposted: false,
    replies: 0,
    bookmarked: false,
    timestamp: ninjaCampaign.updatedAt || Date.now(),
    hashtags: [ninjaCampaign.hashtag],
  };
  const campaignPublished = ninjaCampaign.status === 'published';

  const PostCard = ({ p }: { p: XPost }) => (
    <article className={`border-b px-4 py-3 ${border}`}>
      <div className="flex gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`truncate text-[14px] font-bold ${text}`}>{p.author}</span>
            <span className={`truncate text-[12px] ${subText}`} dir="ltr">
              @{p.username} · {formatRelativeTime(p.timestamp)}
            </span>
          </div>
          <p className={`mt-1 whitespace-pre-line text-[14px] leading-relaxed ${text}`}>
            {p.text.split(/(#[^\s#]+)/).map((part, i) =>
              part.startsWith('#') ? (
                <span key={i} className="text-[#1D9BF0]">{part}</span>
              ) : (
                part
              )
            )}
          </p>
          {p.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={p.image} alt="" className="mt-2 w-full rounded-2xl object-cover" style={{ maxHeight: 300 }} />
          )}
          <div className={`mt-2.5 flex items-center justify-between ${subText}`}>
            <button onClick={() => toggle(p.id, 'liked')} className="flex items-center gap-1 active:scale-90">
              <Heart className={`h-4 w-4 ${p.liked ? 'fill-[#F91880] text-[#F91880]' : ''}`} />
              <span className="text-[12px]">{toArabicDigits(p.likes)}</span>
            </button>
            <button className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[12px]">{toArabicDigits(p.replies)}</span>
            </button>
            <button onClick={() => toggle(p.id, 'reposted')} className="flex items-center gap-1 active:scale-90">
              <Repeat2 className={`h-4 w-4 ${p.reposted ? 'text-[#00BA7C]' : ''}`} />
              <span className="text-[12px]">{toArabicDigits(p.reposts)}</span>
            </button>
            <button onClick={() => toggle(p.id, 'bookmarked')} className="active:scale-90">
              <Bookmark className={`h-4 w-4 ${p.bookmarked ? 'fill-current text-[#1D9BF0]' : ''}`} />
            </button>
            <button>
              <Share className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );

  /* ---------- Campaign editor (shared with Instagram via context) ---------- */
  const CampaignEditor = () => {
    const [image, setImage] = useState(ninjaCampaign.image);
    const [title, setTitle] = useState(ninjaCampaign.title);
    const [desc, setDesc] = useState(ninjaCampaign.description);
    const fileRef = useRef<HTMLInputElement>(null);

    const pick = (f?: File) => {
      if (!f) return;
      const r = new FileReader();
      r.onload = () => setImage(r.result as string);
      r.readAsDataURL(f);
    };

    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
        <div className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setCampaignOpen(false)} className={text}>
            <X className="h-5 w-5" />
          </button>
          <span className={`text-base font-bold ${text}`}>إدارة منشور الحملة</span>
          <button
            onClick={() => {
              updateNinjaCampaign({ image, title, description: desc });
              setCampaignOpen(false);
            }}
            className="text-[15px] font-semibold text-[#1D9BF0]"
          >
            حفظ
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto p-4">
          {/* Preview */}
          <div className={`mb-4 overflow-hidden rounded-2xl border ${border}`}>
            {image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={image} alt="معاينة" className="h-44 w-full object-cover" />
            ) : (
              <div className={`flex h-44 items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'} ${subText}`}>
                لا صورة بعد
              </div>
            )}
            <div className="p-3">
              <p className={`text-[13px] font-bold ${text}`}>{title || 'العنوان'}</p>
              <p className={`mt-1 text-[12px] ${subText}`}>{desc || 'الوصف'}</p>
              <p className="mt-1 text-[12px] font-semibold text-[#1D9BF0]">{ninjaCampaign.hashtag}</p>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <div className="flex gap-2">
            <button onClick={() => fileRef.current?.click()} className="flex-1 rounded-xl bg-[#1D9BF0] py-2.5 text-[14px] font-semibold text-white">
              {image ? 'استبدال الصورة' : 'رفع صورة الحملة'}
            </button>
            {image && (
              <button onClick={() => setImage('')} className={`rounded-xl px-4 py-2.5 text-[14px] font-semibold text-red-500 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
                حذف
              </button>
            )}
          </div>

          <label className={`mt-4 block text-[13px] font-semibold ${text}`}>عنوان المنشور</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-[14px] ${border} ${text} ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            dir="rtl"
          />

          <label className={`mt-3 block text-[13px] font-semibold ${text}`}>الوصف</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            className={`mt-1 w-full resize-none rounded-xl border px-3 py-2.5 text-[14px] ${border} ${text} ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            dir="rtl"
          />

          <p className={`mt-2 text-[12px] ${subText}`}>الحساب: Ninja ({ninjaProfile.username}) · الهاشتاج مقفل</p>

          <button
            onClick={() => {
              updateNinjaCampaign({ image, title, description: desc, status: 'published', updatedAt: Date.now() });
              setCampaignOpen(false);
            }}
            className="mt-5 w-full rounded-xl bg-[#1D9BF0] py-3 text-[15px] font-bold text-white"
          >
            نشر الحملة
          </button>
          {campaignPublished && (
            <button
              onClick={() => {
                updateNinjaCampaign({ status: 'draft' });
                setCampaignOpen(false);
              }}
              className="mt-2 w-full rounded-xl py-3 text-[15px] font-bold text-red-500"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
              إلغاء النشر
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ---------- Home timeline ---------- */
  const renderHome = () => (
    <>
      <div className={`flex shrink-0 items-center justify-between border-b px-4 pb-2 ${border}`}>
        <h1 className={`text-lg font-bold ${text}`}>الرئيسية</h1>
        <button onClick={() => setCampaignOpen(true)} className="flex items-center gap-1 rounded-full bg-[#1D9BF0] px-3 py-1.5 text-[12px] font-semibold text-white">
          <Plus className="h-3.5 w-3.5" />
          حملة Ninja
        </button>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {campaignPublished && <PostCard p={campaignPost} />}
        {posts.map((p) => (
          <PostCard key={p.id} p={p} />
        ))}
      </div>
    </>
  );

  /* ---------- Explore + trending ---------- */
  const renderExplore = () => (
    <>
      <div className={`shrink-0 border-b px-3 py-2 ${border}`}>
        <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
          <SearchIcon className={`h-4 w-4 ${subText}`} />
          <input placeholder="بحث" className={`w-full bg-transparent text-[14px] outline-none ${text}`} dir="rtl" />
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <h2 className={`px-4 pt-3 pb-1 text-[15px] font-bold ${text}`}>الرائج الآن</h2>
        {TREND.map((t) => (
          <button
            key={t.tag}
            onClick={() => t.tag === NINJA_HASHTAG && setTab('hashtag')}
            className={`flex w-full items-center justify-between border-b px-4 py-3 text-right ${border} active:bg-black/5`}
          >
            <div>
              <p className={`text-[11px] ${subText}`}>{t.category}</p>
              <p className="text-[15px] font-bold text-[#1D9BF0]">{t.tag}</p>
              <p className={`text-[11px] ${subText}`}>{toArabicDigits(t.posts)} منشوراً</p>
            </div>
            {t.tag === NINJA_HASHTAG && (
              <span className="rounded-full bg-[#1D9BF0]/10 px-2 py-1 text-[10px] font-bold text-[#1D9BF0]">
                حملة مميزة
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  );

  /* ---------- Hashtag results ---------- */
  const renderHashtag = () => (
    <>
      <div className={`flex shrink-0 items-center gap-3 border-b px-3 py-2.5 ${border}`}>
        <button onClick={() => setTab('explore')} className={text}>
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[15px] font-bold text-[#1D9BF0]">{NINJA_HASHTAG}</p>
          <p className={`text-[11px] ${subText}`}>{toArabicDigits(12400)} منشوراً</p>
        </div>
      </div>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {campaignPublished ? (
          <PostCard p={campaignPost} />
        ) : (
          <div className="p-6 text-center">
            <p className={`text-[14px] font-semibold ${text}`}>لا منشورات بعد</p>
            <p className={`mt-1 text-[12px] ${subText}`}>انشر حملة Ninja لتظهر هنا</p>
            <button onClick={() => setCampaignOpen(true)} className="mt-3 rounded-full bg-[#1D9BF0] px-5 py-2 text-[13px] font-bold text-white">
              إنشاء منشور الحملة
            </button>
          </div>
        )}
        {posts
          .filter((p) => p.text.includes('العيد') || p.text.includes('نينجا') || p.text.includes('Ninja'))
          .map((p) => (
            <PostCard key={p.id} p={p} />
          ))}
      </div>
    </>
  );

  /* ---------- Activity ---------- */
  const renderActivity = () => (
    <>
      <h1 className={`shrink-0 px-4 pb-2 text-lg font-bold ${text}`}>الإشعارات</h1>
      <div className="flex-1 overflow-y-auto">
        {posts.slice(0, 4).map((p) => (
          <div key={p.id} className={`flex items-start gap-3 border-b px-4 py-3 ${border}`}>
            <Heart className="mt-1 h-5 w-5 fill-[#F91880] text-[#F91880]" />
            <div className="flex-1">
              <p className={`text-[13px] ${text}`}>
                أعجب <b>{p.author}</b> بمنشورك
              </p>
              <p className={`mt-0.5 text-[12px] ${subText}`}>{p.text.slice(0, 60)}...</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /* ---------- Messages ---------- */
  const renderMessages = () => (
    <>
      <h1 className={`shrink-0 px-4 pb-2 text-lg font-bold ${text}`}>الرسائل</h1>
      <div className="flex-1 overflow-y-auto">
        {[
          { name: 'أحمد العتيبي', last: 'تمام، أشوفك بكرة', color: '#FF3B30' },
          { name: 'نورة القحطاني', last: 'شكراً لك!', color: '#007AFF' },
          { name: 'Ninja', last: 'كود خصم جديد لك 🎁', color: '#6D28D9' },
        ].map((m) => (
          <div key={m.name} className={`flex items-center gap-3 border-b px-4 py-3 ${border}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: m.color }}>
              {m.name[0]}
            </div>
            <div className="flex-1">
              <p className={`text-[14px] font-bold ${text}`}>{m.name}</p>
              <p className={`text-[12px] ${subText}`}>{m.last}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /* ---------- Bookmarks ---------- */
  const renderBookmarks = () => (
    <>
      <h1 className={`shrink-0 px-4 pb-2 text-lg font-bold ${text}`}>المحفوظات</h1>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {posts.filter((p) => p.bookmarked).map((p) => (
          <PostCard key={p.id} p={p} />
        ))}
        {posts.every((p) => !p.bookmarked) && (
          <p className={`py-10 text-center text-[13px] ${subText}`}>لا توجد منشورات محفوظة</p>
        )}
      </div>
    </>
  );

  /* ---------- Profile ---------- */
  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="h-24" style={{ background: 'linear-gradient(135deg, #6D28D9, #FFC107)' }} />
      <div className="px-4">
        <div className="-mt-8 h-20 w-20 overflow-hidden rounded-full border-4" style={{ borderColor: isDark ? '#000' : '#fff' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ninjaProfile.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <p className={`mt-2 text-[17px] font-bold ${text}`}>{ninjaProfile.name}</p>
        <p className={`text-[13px] ${subText}`} dir="ltr">
          @{ninjaProfile.username}
        </p>
        <p className={`mt-2 text-[13px] ${text}`}>{ninjaProfile.bio}</p>
        <div className={`mt-2 flex gap-4 text-[12px] ${subText}`}>
          <span>
            <b className={text}>{toArabicDigits(ninjaProfile.following)}</b> يتابع
          </span>
          <span>
            <b className={text}>{toArabicDigits(ninjaProfile.followers)}</b> متابع
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-0.5">
        {(campaignPublished ? [campaignPost, ...posts] : posts).slice(0, 9).map((p, i) =>
          p.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={p.id + 'g' + i} src={p.image} alt="" className="aspect-square w-full object-cover" />
          ) : (
            <div key={p.id + 'g' + i} className={`flex aspect-square items-center justify-center p-2 text-center text-[10px] ${isDark ? 'bg-white/5 text-white/40' : 'bg-black/5 text-black/40'}`}>
              {p.text.slice(0, 40)}
            </div>
          )
        )}
      </div>
    </div>
  );

  /* ---------- Root ---------- */
  return (
    <div className={`absolute inset-0 flex flex-col ${bg}`}>
      <div className="h-12 shrink-0" />

      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === 'home' && renderHome()}
        {tab === 'explore' && renderExplore()}
        {tab === 'hashtag' && renderHashtag()}
        {tab === 'activity' && renderActivity()}
        {tab === 'messages' && renderMessages()}
        {tab === 'bookmarks' && renderBookmarks()}
        {tab === 'profile' && renderProfile()}
      </div>

      <div className={`flex shrink-0 items-center justify-around border-t py-2 ${border} ${bg}`}>
        {[
          { id: 'home' as const, icon: <Home className="h-5 w-5" /> },
          { id: 'explore' as const, icon: <SearchIcon className="h-5 w-5" /> },
          { id: 'activity' as const, icon: <Bell className="h-5 w-5" /> },
          { id: 'messages' as const, icon: <Mail className="h-5 w-5" /> },
          { id: 'bookmarks' as const, icon: <Bookmark className="h-5 w-5" /> },
          { id: 'profile' as const, icon: <User className="h-5 w-5" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`${text} ${tab === t.id ? 'opacity-100' : 'opacity-40'} active:scale-90`}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {campaignOpen && <CampaignEditor />}
    </div>
  );
}
