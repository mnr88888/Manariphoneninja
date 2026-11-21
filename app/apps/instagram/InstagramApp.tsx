'use client';

import { useRef, useState } from 'react';
import {
  Home, Search, Clapperboard, Heart, Send, MessageCircle,
  Bookmark, MoreHorizontal, Plus, X, User, Menu,
  Grid3X3, Play, ChevronRight, ExternalLink, Link as LinkIcon,
  Settings, Trash2, Edit3, ChevronLeft
} from 'lucide-react';

import { useSystem } from '../../system/SystemContext';
import { usePersistentState, formatRelativeTime, toArabicDigits } from '../shared/utils';

const NINJA_URL = 'https://ninja.com.sa';
const NINJA_AVATAR = '/ninja.webp';

interface IGComment {
  id: string;
  author: string;
  text: string;
}

interface IGPost {
  id: string;
  author: string;
  avatar: string;
  image: string;
  title: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: IGComment[];
  timestamp: number;
  isCampaign?: boolean;
}

const INITIAL_POSTS: IGPost[] = [
  {
    id: 'ninja1',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080',
    title: 'كل اللي تشتهيه.. يوصلك',
    caption: 'اختياراتك المفضلة صارت أقرب لك 🍕 اطلبها من نينجا!',
    likes: 1280,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'ninja2',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1080',
    title: 'مزاجك له طلبه',
    caption: 'من أول اليوم لآخره، نينجا معك في كل وقت 💚',
    likes: 946,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 28800000,
  },
  {
    id: 'ninja3',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080',
    title: 'جمعتكم أحلى مع نينجا',
    caption: 'وش طلبكم المفضل لجمعة اليوم؟ 👀',
    likes: 2104,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 86400000,
  },
];

const STORIES = [
  {
    id: 's1',
    name: 'قصتك',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080',
  },
  {
    id: 's2',
    name: 'نورة',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080',
  },
  {
    id: 's3',
    name: 'سارة',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1080',
  },
  {
    id: 's4',
    name: 'فاطمة',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1080',
  },
  {
    id: 's5',
    name: 'أحمد',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1080',
  },
  {
    id: 's6',
    name: 'محمد',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1080',
  },
];

type Tab = 'home' | 'explore' | 'reels' | 'activity' | 'profile' | 'messages';
type ProfileTab = 'posts' | 'reels' | 'tagged';
type Modal = 'campaign' | 'profile' | 'comments' | 'story' | 'post' | 'edit-post' | null;

export default function InstagramApp() {
  const {
    isDark,
    ninjaCampaign,
    updateNinjaCampaign,
    ninjaProfile,
    updateNinjaProfile,
  } = useSystem();

  const [tab, setTab] = useState<Tab>('home');
  const [profileTab, setProfileTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = usePersistentState<IGPost[]>('ig-ninja-posts-v3', INITIAL_POSTS);

  const [modal, setModal] = useState<Modal>(null);
  const [activePost, setActivePost] = useState<IGPost | null>(null);
  const [editingPost, setEditingPost] = useState<IGPost | null>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [menuPost, setMenuPost] = useState<IGPost | null>(null);

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-[#262626]';
  const muted = isDark ? 'text-white/50' : 'text-[#8e8e8e]';
  const border = isDark ? 'border-white/10' : 'border-[#efefef]';
  const soft = isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f5]';

  const feedPosts = posts.map(p => p.isCampaign ? {
    ...p,
    author: ninjaProfile.name || 'Ninja',
    avatar: ninjaProfile.avatar || NINJA_AVATAR,
    image: ninjaCampaign.image || p.image,
    title: ninjaCampaign.title || p.title,
    caption: ninjaCampaign.description || p.caption,
  } : p);

  const updatePost = (id: string, changes: Partial<IGPost>) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p));
  };

  const toggleLike = (p: IGPost) => {
    updatePost(p.id, {
      liked: !p.liked,
      likes: Math.max(0, p.likes + (p.liked ? -1 : 1)),
    });
  };

  const toggleSave = (p: IGPost) => {
    updatePost(p.id, { saved: !p.saved });
  };

  const openPost = (p: IGPost) => {
    setActivePost(p);
    setModal('post');
  };

  // Campaign editor
  const CampaignEditor = () => {
    const [image, setImage] = useState(ninjaCampaign.image || '');
    const [title, setTitle] = useState(ninjaCampaign.title || '');
    const [description, setDescription] = useState(ninjaCampaign.description || '');
    const fileRef = useRef<HTMLInputElement>(null);

    const save = (publish: boolean) => {
      updateNinjaCampaign({
        image,
        title,
        description,
        status: publish ? 'published' : 'draft',
        updatedAt: Date.now(),
      });

      if (publish) {
        setPosts(prev => {
          const remaining = prev.filter(p => !p.isCampaign);
          return [{
            id: 'ninja-campaign',
            author: ninjaProfile.name || 'Ninja',
            avatar: ninjaProfile.avatar || NINJA_AVATAR,
            image,
            title,
            caption: description,
            likes: 0,
            liked: false,
            saved: false,
            comments: [],
            timestamp: Date.now(),
            isCampaign: true,
          }, ...remaining];
        });
      }

      setModal(null);
    };

    return (
      <div className={`absolute inset-0 z-[80] flex flex-col ${bg}`} dir="rtl">
        <header className={`flex h-14 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)}><X className={text} /></button>
          <b className={text}>إدارة منشور نينجا</b>
          <button onClick={() => save(true)} className="font-bold text-[#0095f6]">نشر</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className={`mb-4 overflow-hidden rounded-xl border ${border}`}>
            {image ? (
              <img src={image} alt="معاينة" className="h-56 w-full object-cover" />
            ) : (
              <div className={`flex h-56 items-center justify-center ${soft} ${muted}`}>
                اختاري صورة المنشور
              </div>
            )}
            <div className="p-3">
              <b className={text}>{title || 'عنوان المنشور'}</b>
              <p className={`mt-1 text-sm ${muted}`}>{description || 'وصف المنشور'}</p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setImage(String(reader.result || ''));
              reader.readAsDataURL(file);
            }}
          />

          <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl bg-[#0095f6] py-3 font-semibold text-white">
            {image ? 'تغيير الصورة' : 'اختيار صورة'}
          </button>

          <label className={`mt-4 block text-sm font-semibold ${text}`}>عنوان المنشور</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className={`mt-1 w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />

          <label className={`mt-4 block text-sm font-semibold ${text}`}>الوصف</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`mt-1 w-full resize-none rounded-xl border p-3 ${border} ${soft} ${text}`} />

          <button onClick={() => save(false)} className={`mt-3 w-full rounded-xl py-3 font-semibold ${soft} ${text}`}>
            حفظ كمسودة
          </button>
        </div>
      </div>
    );
  };

  // Profile editor
  const ProfileEditor = () => {
    const [name, setName] = useState(ninjaProfile.name || 'Ninja');
    const [bio, setBio] = useState(ninjaProfile.bio || 'كل احتياجاتك توصلك مع نينجا 💚');
    const [avatar, setAvatar] = useState(ninjaProfile.avatar || NINJA_AVATAR);
    const fileRef = useRef<HTMLInputElement>(null);

    return (
      <div className={`absolute inset-0 z-[80] flex flex-col ${bg}`} dir="rtl">
        <header className={`flex h-14 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)}><X className={text} /></button>
          <b className={text}>تعديل الملف الشخصي</b>
          <button onClick={() => {
            updateNinjaProfile({ name, bio, avatar });
            setModal(null);
          }} className="font-bold text-[#0095f6]">حفظ</button>
        </header>

        <div className="flex flex-col items-center gap-4 p-6">
          <img src={avatar} alt="صورة نينجا" className="h-24 w-24 rounded-full object-cover" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setAvatar(String(reader.result || ''));
            reader.readAsDataURL(file);
          }} />
          <button onClick={() => fileRef.current?.click()} className="font-semibold text-[#0095f6]">
            تغيير صورة الحساب
          </button>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم الحساب" className={`w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="النبذة التعريفية" rows={3} className={`w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
          <a href={NINJA_URL} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-[#0095f6]">
            <LinkIcon size={17} /> موقع نينجا <ExternalLink size={15} />
          </a>
        </div>
      </div>
    );
  };

  // Story viewer
  const StoryViewer = () => {
    const story = STORIES[activeStory];

    return (
      <div className="absolute inset-0 z-[100] flex flex-col bg-black text-white">
        <div className="absolute inset-0">
          <img src={story.image} alt={story.name} className="h-full w-full object-cover" />
        </div>

        <div className="relative z-20 flex gap-1 px-3 pt-3">
          {STORIES.map((s, i) => (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/40">
              <div className={`h-full ${i <= activeStory ? 'w-full' : 'w-0'} bg-white`} />
            </div>
          ))}
        </div>

        <header className="relative z-30 flex items-center gap-2 px-4 py-4">
          <img src={story.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <b className="text-sm">{story.name}</b>
          <span className="text-xs text-white/70">منذ ساعة</span>
          <button onClick={() => setModal(null)} className="mr-auto rounded-full bg-black/30 p-2" aria-label="إغلاق القصة">
            <X size={22} />
          </button>
        </header>

        <div className="relative z-10 flex flex-1">
          <button
            className="h-full w-1/3"
            aria-label="القصة السابقة"
            onClick={() => setActiveStory(i => Math.max(0, i - 1))}
          />
          <div className="h-full flex-1" />
          <button
            className="h-full w-1/3"
            aria-label="القصة التالية"
            onClick={() => {
              if (activeStory < STORIES.length - 1) setActiveStory(i => i + 1);
              else setModal(null);
            }}
          />
        </div>

        <div className="relative z-30 flex items-center gap-3 p-4">
          <input placeholder="رد على القصة..." className="flex-1 rounded-full border border-white/60 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/80" dir="rtl" />
          <button aria-label="إعجاب"><Heart /></button>
          <button aria-label="إرسال"><Send /></button>
        </div>
      </div>
    );
  };

  // Post action menu
  const PostMenu = () => {
    if (!menuPost) return null;

    return (
      <div className="absolute inset-0 z-[90] flex items-end justify-center bg-black/50" onClick={() => setMenuPost(null)}>
        <div className={`w-full rounded-t-3xl p-4 ${bg}`} onClick={e => e.stopPropagation()} dir="rtl">
          <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full ${soft}`} />
          <button
            onClick={() => {
              setEditingPost(menuPost);
              setMenuPost(null);
              setModal('edit-post');
            }}
            className={`flex w-full items-center gap-3 border-b py-4 ${border} ${text}`}
          >
            <Edit3 size={20} /> تعديل المنشور
          </button>
          <button
            onClick={() => {
              setPosts(prev => prev.filter(p => p.id !== menuPost.id));
              setMenuPost(null);
            }}
            className="flex w-full items-center gap-3 py-4 text-red-500"
          >
            <Trash2 size={20} /> حذف المنشور
          </button>
          <button onClick={() => setMenuPost(null)} className={`w-full rounded-xl py-3 ${soft} ${text}`}>
            إلغاء
          </button>
        </div>
      </div>
    );
  };

  // Edit existing post
  const EditPost = () => {
    const [title, setTitle] = useState(editingPost?.title || '');
    const [caption, setCaption] = useState(editingPost?.caption || '');
    const [image, setImage] = useState(editingPost?.image || '');
    const fileRef = useRef<HTMLInputElement>(null);

    if (!editingPost) return null;

    return (
      <div className={`absolute inset-0 z-[85] flex flex-col ${bg}`} dir="rtl">
        <header className={`flex h-14 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)}><X className={text} /></button>
          <b className={text}>تعديل المنشور</b>
          <button onClick={() => {
            updatePost(editingPost.id, { title, caption, image });
            setModal(null);
            setEditingPost(null);
          }} className="font-bold text-[#0095f6]">حفظ</button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {image && <img src={image} alt="" className="mb-4 h-56 w-full rounded-xl object-cover" />}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => setImage(String(reader.result || ''));
            reader.readAsDataURL(file);
          }} />
          <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl bg-[#0095f6] py-3 text-white">
            تغيير صورة المنشور
          </button>
          <label className={`mt-4 block text-sm font-semibold ${text}`}>العنوان</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className={`mt-1 w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
          <label className={`mt-4 block text-sm font-semibold ${text}`}>الوصف</label>
          <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5} className={`mt-1 w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
        </div>
      </div>
    );
  };
