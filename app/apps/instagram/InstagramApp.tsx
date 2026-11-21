'use client';

import { useState, useRef } from 'react';
import {
  Home,
  Search,
  Clapperboard,
  Heart,
  Send,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Plus,
  ChevronRight,
  X,
  User,
} from 'lucide-react';
import { useSystem } from '../../system/SystemContext';
import { usePersistentState, formatRelativeTime, toArabicDigits } from '../shared/utils';

/* ============================================================
 * Types & seed data
 * ============================================================ */

interface IGPost {
  id: string;
  author: string;
  avatar: string;
  image: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: { id: string; author: string; text: string }[];
  timestamp: number;
  isCampaign?: boolean;
}

const SEED_POSTS: IGPost[] = [
  {
    id: 'ig1',
    author: 'نورة القحطاني',
    avatar: '#007AFF',
    image: '/wallpapers/ios26-sunrise.webp',
    caption: 'شروق اليوم كان شي يذكر 🌅',
    likes: 342,
    liked: false,
    saved: false,
    comments: [{ id: 'c1', author: 'سارة', text: 'ما شاء الله! 🔥' }],
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'ig2',
    author: 'خالد المطيري',
    avatar: '#5856D6',
    image: '/wallpapers/ios26-emerald.webp',
    caption: 'جولة مسائية في الجبال 🏔️',
    likes: 891,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 5 * 3600000,
  },
];

const STORIES = [
  { id: 's1', name: 'أنت', color: '#8E8E93' },
  { id: 's2', name: 'نورة', color: '#007AFF' },
  { id: 's3', name: 'أحمد', color: '#FF3B30' },
  { id: 's4', name: 'فاطمة', color: '#FF9F0A' },
  { id: 's5', name: 'سارة', color: '#FF2D55' },
  { id: 's6', name: 'محمد', color: '#34C759' },
];

type Tab = 'home' | 'explore' | 'reels' | 'activity' | 'profile';
type Modal = 'campaign' | 'profile-edit' | 'comments' | null;

/* ============================================================
 * Instagram app
 * ============================================================ */

export default function InstagramApp() {
  const { isDark, ninjaCampaign, updateNinjaCampaign, ninjaProfile, updateNinjaProfile } = useSystem();
  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = usePersistentState<IGPost[]>('ig-posts', SEED_POSTS);
  const [modal, setModal] = useState<Modal>(null);
  const [activePost, setActivePost] = useState<IGPost | null>(null);

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';
  const subText = isDark ? 'text-white/50' : 'text-black/50';
  const border = isDark ? 'border-white/10' : 'border-black/10';

  // Ensure the campaign post reflects the latest stored state in the feed
  const feedPosts: IGPost[] = posts.map((p) =>
    p.isCampaign
      ? {
          ...p,
          author: ninjaProfile.name,
          avatar: ninjaProfile.avatar,
          image: ninjaCampaign.image || p.image,
          caption: ninjaCampaign.description || p.caption,
        }
      : p
  );

  const toggleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p
      )
    );

  const toggleSave = (id: string) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)));

  /* ---------- Campaign editor ---------- */
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
      <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: bg }}>
        <div className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)} className={text}>
            <X className="h-5 w-5" />
          </button>
          <span className={`text-base font-bold ${text}`}>إدارة منشور الحملة</span>
          <button
            onClick={() => {
              updateNinjaCampaign({ image, title, description: desc });
              setModal(null);
            }}
            className="text-[15px] font-semibold text-[#0095F6]"
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
              <p className={`text-[14px] font-bold ${text}`}>{title || 'العنوان'}</p>
              <p className={`mt-1 text-[12px] ${subText}`}>{desc || 'الوصف'}</p>
            </div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          <div className="flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl bg-[#0095F6] py-2.5 text-[14px] font-semibold text-white"
            >
              {image ? 'استبدال الصورة' : 'رفع صورة المنشور'}
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

          <p className={`mt-2 text-[12px] ${subText}`}>الحساب: Ninja · مقفل</p>

          <button
            onClick={() => {
              updateNinjaCampaign({ image, title, description: desc, status: 'published', updatedAt: Date.now() });
              if (!posts.some((p) => p.isCampaign)) {
                setPosts((prev) => [
                  {
                    id: 'campaign',
                    author: ninjaProfile.name,
                    avatar: ninjaProfile.avatar,
                    image: image || '/ninja.webp',
                    caption: desc || ninjaCampaign.hashtag,
                    likes: 0,
                    liked: false,
                    saved: false,
                    comments: [],
                    timestamp: Date.now(),
                    isCampaign: true,
                  },
                  ...prev,
                ]);
              }
              setModal(null);
            }}
            className="mt-5 w-full rounded-xl bg-[#0095F6] py-3 text-[15px] font-bold text-white"
          >
            {ninjaCampaign.status === 'published' ? 'تحديث المنشور' : 'نشر المنشور'}
          </button>
          {ninjaCampaign.status === 'published' && (
            <button
              onClick={() => {
                setPosts((prev) => prev.filter((p) => !p.isCampaign));
                updateNinjaCampaign({ status: 'draft' });
              }}
              className="mt-2 w-full rounded-xl py-3 text-[15px] font-bold text-red-500"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
            >
              حذف المنشور المنشور
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ---------- Profile edit ---------- */
  const ProfileEditor = () => {
    const [name, setName] = useState(ninjaProfile.name);
    const [bio, setBio] = useState(ninjaProfile.bio);
    const [avatar, setAvatar] = useState(ninjaProfile.avatar);
    const fileRef = useRef<HTMLInputElement>(null);

    return (
      <div className="absolute inset-0 z-50 flex flex-col" style={{ backgroundColor: bg }}>
        <div className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)} className={text}>
            <X className="h-5 w-5" />
          </button>
          <span className={`text-base font-bold ${text}`}>تعديل الملف الشخصي</span>
          <button
            onClick={() => {
              updateNinjaProfile({ name, bio, avatar });
              setModal(null);
            }}
            className="text-[15px] font-semibold text-[#0095F6]"
          >
            حفظ
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 p-6">
          <div className="h-20 w-20 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => setAvatar(r.result as string);
            r.readAsDataURL(f);
          }} />
          <button onClick={() => fileRef.current?.click()} className="text-[14px] font-semibold text-[#0095F6]">
            تغيير صورة الملف
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="الاسم"
            className={`w-full rounded-xl border px-3 py-2.5 text-[14px] ${border} ${text} ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            dir="rtl"
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="النبذة"
            rows={3}
            className={`w-full resize-none rounded-xl border px-3 py-2.5 text-[14px] ${border} ${text} ${isDark ? 'bg-white/5' : 'bg-black/5'}`}
            dir="rtl"
          />
        </div>
      </div>
    );
  };

  /* ---------- Home feed ---------- */
  const renderHome = () => (
    <>
      <div className={`flex shrink-0 items-center justify-between border-b px-4 pb-2 ${border}`}>
        <h1 className={`text-xl font-bold ${text}`}>إنستغرام</h1>
        <button onClick={() => setModal('campaign')} className="flex items-center gap-1 rounded-full bg-[#0095F6] px-3 py-1.5 text-[12px] font-semibold text-white">
          <Plus className="h-3.5 w-3.5" />
          حملة Ninja
        </button>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto">
        {/* Stories */}
        <div className={`no-scrollbar flex gap-3 overflow-x-auto border-b px-3 py-3 ${border}`}>
          {STORIES.map((s) => (
            <div key={s.id} className="flex shrink-0 flex-col items-center gap-1">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${s.name === 'أنت' ? 'border-black/20' : 'border-[#E1306C]'} ${isDark ? 'border-[#E1306C]' : ''}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white" style={{ backgroundColor: s.color }}>
                  {s.name[0]}
                </div>
              </div>
              <span className={`text-[10px] ${text}`}>{s.name}</span>
            </div>
          ))}
        </div>

        {/* Posts */}
        {feedPosts.map((p) => (
          <article key={p.id} className={`border-b pb-3 ${border}`}>
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="h-9 w-9 overflow-hidden rounded-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.avatar} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <p className={`text-[13px] font-bold ${text}`}>{p.author}</p>
                <p className={`text-[10px] ${subText}`}>{formatRelativeTime(p.timestamp)}</p>
              </div>
              <MoreHorizontal className={`h-5 w-5 ${subText}`} />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="w-full object-cover" style={{ maxHeight: 340 }} />
            <div className="flex items-center gap-4 px-3 pt-2.5">
              <button onClick={() => toggleLike(p.id)} className="active:scale-90">
                <Heart className={`h-6 w-6 ${p.liked ? 'fill-[#FF3040] text-[#FF3040]' : text}`} />
              </button>
              <button onClick={() => { setActivePost(p); setModal('comments'); }} className={`active:scale-90 ${text}`}>
                <MessageCircle className="h-6 w-6" />
              </button>
              <button className={`active:scale-90 ${text}`}>
                <Send className="h-6 w-6" />
              </button>
              <button onClick={() => toggleSave(p.id)} className={`mr-auto active:scale-90 ${text}`}>
                <Bookmark className={`h-6 w-6 ${p.saved ? 'fill-current' : ''}`} />
              </button>
            </div>
            <div className="px-3 pt-1.5">
              <p className={`text-[13px] font-bold ${text}`}>{toArabicDigits(p.likes)} إعجاب</p>
              {p.caption && <p className={`mt-0.5 text-[13px] ${text}`}>{p.caption}</p>}
              {p.comments.length > 0 && (
                <button onClick={() => { setActivePost(p); setModal('comments'); }} className={`mt-1 text-[12px] ${subText}`}>
                  عرض كل التعليقات ({toArabicDigits(p.comments.length)})
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );

  /* ---------- Explore ---------- */
  const renderExplore = () => (
    <>
      <div className={`shrink-0 px-3 py-2 border-b ${border}`}>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${isDark ? 'bg-white/10' : 'bg-black/5'}`}>
          <Search className={`h-4 w-4 ${subText}`} />
          <input placeholder="بحث" className={`w-full bg-transparent text-[14px] outline-none ${text}`} dir="rtl" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-0.5 overflow-y-auto pt-0.5">
        {feedPosts.concat(SEED_POSTS).map((p, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={p.id + i} src={p.image} alt="" className="aspect-square w-full object-cover" />
        ))}
      </div>
    </>
  );

  /* ---------- Reels ---------- */
  const renderReels = () => (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-black">
      <Clapperboard className="h-12 w-12 text-white/40" />
      <p className="text-[15px] font-semibold text-white">الريلز</p>
      <p className="max-w-[240px] text-center text-[12px] text-white/50">
        مقاطع فيديو قصيرة من الحسابات التي تتابعها
      </p>
    </div>
  );

  /* ---------- Activity ---------- */
  const renderActivity = () => (
    <>
      <h1 className={`shrink-0 px-4 pb-2 text-xl font-bold ${text}`}>النشاط</h1>
      <div className="flex-1 overflow-y-auto">
        {feedPosts.map((p) => (
          <div key={p.id} className={`flex items-center gap-3 px-4 py-3 border-b ${border}`}>
            <Heart className="h-6 w-6 fill-[#FF3040] text-[#FF3040]" />
            <p className={`flex-1 text-[13px] ${text}`}>
              أعجب <b>{p.author}</b> بمنشورك
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image} alt="" className="h-11 w-11 rounded object-cover" />
          </div>
        ))}
      </div>
    </>
  );

  /* ---------- Profile ---------- */
  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto">
      <div className="flex items-center gap-5 px-4 pt-4">
        <div className="h-20 w-20 overflow-hidden rounded-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ninjaProfile.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 justify-around text-center">
          {[
            { v: toArabicDigits(12), l: 'منشورات' },
            { v: toArabicDigits(ninjaProfile.followers), l: 'متابعون' },
            { v: toArabicDigits(ninjaProfile.following), l: 'يتابع' },
          ].map((s) => (
            <div key={s.l}>
              <p className={`text-[17px] font-bold ${text}`}>{s.v}</p>
              <p className={`text-[11px] ${subText}`}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 pt-3">
        <p className={`text-[14px] font-bold ${text}`}>{ninjaProfile.name}</p>
        <p className={`text-[12px] ${subText}`}>{ninjaProfile.bio}</p>
      </div>
      <button
        onClick={() => setModal('profile-edit')}
        className={`mx-4 mt-3 w-[calc(100%-32px)] rounded-lg py-1.5 text-[13px] font-semibold ${isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-black'}`}
      >
        تعديل الملف الشخصي
      </button>
      <div className="mt-3 grid grid-cols-3 gap-0.5">
        {feedPosts.map((p, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img key={p.id + 'g' + i} src={p.image} alt="" className="aspect-square w-full object-cover" />
        ))}
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
        {tab === 'reels' && renderReels()}
        {tab === 'activity' && renderActivity()}
        {tab === 'profile' && renderProfile()}
      </div>

      {/* Bottom nav */}
      <div className={`flex shrink-0 items-center justify-around border-t py-2 ${border} ${bg}`}>
        {[
          { id: 'home' as const, icon: <Home className="h-6 w-6" /> },
          { id: 'explore' as const, icon: <Search className="h-6 w-6" /> },
          { id: 'reels' as const, icon: <Clapperboard className="h-6 w-6" /> },
          { id: 'activity' as const, icon: <Heart className="h-6 w-6" /> },
          { id: 'profile' as const, icon: <User className="h-6 w-6" /> },
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

      {modal === 'campaign' && <CampaignEditor />}
      {modal === 'profile-edit' && <ProfileEditor />}
      {modal === 'comments' && activePost && (
        <CommentsSheet
          post={activePost}
          isDark={isDark}
          bg={bg}
          text={text}
          subText={subText}
          border={border}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function CommentsSheet({
  post,
  isDark,
  bg,
  text,
  subText,
  border,
  onClose,
}: {
  post: IGPost;
  isDark: boolean;
  bg: string;
  text: string;
  subText: string;
  border: string;
  onClose: () => void;
}) {
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState('');

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className={`max-h-[70%] overflow-y-auto rounded-t-3xl p-4 ${bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/15'}`} />
        <div className={`flex items-center justify-between border-b pb-2 ${border}`}>
          <span className={`text-[15px] font-bold ${text}`}>التعليقات</span>
          <button onClick={onClose} className={text}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2 py-3">
            <div className="h-7 w-7 rounded-full" style={{ backgroundColor: '#8E8E93' }} />
            <p className={`flex-1 text-[13px] ${text}`}>
              <b>{c.author}</b> {c.text}
            </p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className={`py-6 text-center text-[13px] ${subText}`}>لا توجد تعليقات بعد</p>
        )}
        <div className={`mt-2 flex items-center gap-2 rounded-full border px-3 py-2 ${border}`}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="أضف تعليقًا..."
            className={`flex-1 bg-transparent text-[13px] outline-none ${text}`}
            dir="rtl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                setComments((prev) => [...prev, { id: Date.now().toString(), author: 'أنت', text: draft.trim() }]);
                setDraft('');
              }
            }}
          />
          <button
            onClick={() => {
              if (!draft.trim()) return;
              setComments((prev) => [...prev, { id: Date.now().toString(), author: 'أنت', text: draft.trim() }]);
              setDraft('');
            }}
            className="text-[13px] font-semibold text-[#0095F6]"
          >
            نشر
          </button>
        </div>
      </div>
    </div>
  );
}
