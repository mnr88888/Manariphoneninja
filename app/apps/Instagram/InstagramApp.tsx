'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Home, Search, Clapperboard, Heart, Send, MessageCircle, Bookmark,
  MoreHorizontal, Plus, X, User, Menu, Grid3X3, Play, ChevronRight,
  ExternalLink, Link as LinkIcon, Settings,
} from 'lucide-react';
import { useSystem } from '../../system/SystemContext';
import { usePersistentState, formatRelativeTime, toArabicDigits } from '../shared/utils';

const NINJA_WEBSITE_URL = 'https://ninja.com.sa';

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

const NINJA_AVATAR = '/ninja.webp';

const SEED_POSTS: IGPost[] = [
  {
    id: 'ninja-post-1',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1080&auto=format&fit=crop',
    title: 'كل اللي تشتهيه.. يوصلك',
    caption: 'اختياراتك المفضلة صارت أقرب لك 🍕 اطلبها من نينجا واستمتع!',
    likes: 1280, liked: false, saved: false, comments: [],
    timestamp: Date.now() - 2 * 3600000,
  },
  {
    id: 'ninja-post-2',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1080&auto=format&fit=crop',
    title: 'مزاجك له طلبه',
    caption: 'من أول اليوم لآخره، نينجا معك في كل وقت 💚',
    likes: 946, liked: false, saved: false, comments: [],
    timestamp: Date.now() - 8 * 3600000,
  },
  {
    id: 'ninja-post-3',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1080&auto=format&fit=crop',
    title: 'جمعتكم أحلى مع نينجا',
    caption: 'وش طلبكم المفضل لجمعة اليوم؟ 👀',
    likes: 2104, liked: false, saved: false, comments: [],
    timestamp: Date.now() - 24 * 3600000,
  },
];

const STORIES = [
  { id: 'st0', name: 'قصتك', avatar: NINJA_AVATAR, own: true },
  { id: 'st1', name: 'نورة', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&h=240&fit=crop' },
  { id: 'st2', name: 'سارة', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=240&h=240&fit=crop' },
  { id: 'st3', name: 'فاطمة', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=240&h=240&fit=crop' },
  { id: 'st4', name: 'أحمد', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&h=240&fit=crop' },
  { id: 'st5', name: 'محمد', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&h=240&fit=crop' },
];

type Tab = 'home' | 'explore' | 'reels' | 'activity' | 'profile' | 'messages';
type Modal = 'campaign' | 'profile-edit' | 'comments' | 'story' | null;

export default function InstagramApp() {
  const { isDark, ninjaCampaign, updateNinjaCampaign, ninjaProfile, updateNinjaProfile } = useSystem();
  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = usePersistentState<IGPost[]>('ig-ninja-posts-v2', SEED_POSTS);
  const [modal, setModal] = useState<Modal>(null);
  const [activePost, setActivePost] = useState<IGPost | null>(null);
  const [activeStory, setActiveStory] = useState(0);
  const [search, setSearch] = useState('');
  const [following, setFollowing] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-[#262626]';
  const muted = isDark ? 'text-white/55' : 'text-[#8e8e8e]';
  const border = isDark ? 'border-white/10' : 'border-[#efefef]';
  const soft = isDark ? 'bg-[#171717]' : 'bg-[#f6f6f6]';

  const feedPosts = useMemo(() => {
    const base = posts.filter(p => p.author === 'Ninja' || p.isCampaign);
    return base.map(p => p.isCampaign ? {
      ...p,
      author: ninjaProfile.name || 'Ninja',
      avatar: ninjaProfile.avatar || NINJA_AVATAR,
      image: ninjaCampaign.image || p.image,
      title: ninjaCampaign.title || p.title,
      caption: ninjaCampaign.description || p.caption,
    } : p);
  }, [posts, ninjaProfile, ninjaCampaign]);

  const toggleLike = (id: string) => setPosts(prev => prev.map(p =>
    p.id === id ? { ...p, liked: !p.liked, likes: Math.max(0, p.likes + (p.liked ? -1 : 1)) } : p
  ));
  const toggleSave = (id: string) => setPosts(prev => prev.map(p =>
    p.id === id ? { ...p, saved: !p.saved } : p
  ));

  const CampaignEditor = () => {
    const [image, setImage] = useState(ninjaCampaign.image || '');
    const [title, setTitle] = useState(ninjaCampaign.title || '');
    const [desc, setDesc] = useState(ninjaCampaign.description || '');
    const fileRef = useRef<HTMLInputElement>(null);
    const chooseImage = (file?: File) => {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setImage(String(reader.result || ''));
      reader.readAsDataURL(file);
    };
    const publish = () => {
      updateNinjaCampaign({ image, title, description: desc, status: 'published', updatedAt: Date.now() });
      setPosts(prev => {
        const next = prev.filter(p => !p.isCampaign);
        return [{
          id: 'ninja-campaign',
          author: ninjaProfile.name || 'Ninja',
          avatar: ninjaProfile.avatar || NINJA_AVATAR,
          image: image || NINJA_AVATAR,
          title,
          caption: desc,
          likes: 0, liked: false, saved: false, comments: [],
          timestamp: Date.now(), isCampaign: true,
        }, ...next];
      });
      setModal(null);
    };
    return (
      <div className={`absolute inset-0 z-50 flex flex-col ${bg}`}>
        <div className={`flex h-14 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)} aria-label="إغلاق"><X className={text} /></button>
          <b className={text}>إدارة منشور نينجا</b>
          <button onClick={publish} className="font-bold text-[#0095f6]">نشر</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4" dir="rtl">
          <div className={`mb-4 overflow-hidden rounded-xl border ${border}`}>
            {image ? <img src={image} alt="معاينة المنشور" className="h-56 w-full object-cover" /> :
              <div className={`flex h-56 items-center justify-center ${soft} ${muted}`}>أضيفي صورة المنشور</div>}
            <div className="p-3">
              <b className={text}>{title || 'عنوان المنشور'}</b>
              <p className={`mt-1 text-sm ${muted}`}>{desc || 'وصف المنشور'}</p>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => chooseImage(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="w-full rounded-xl bg-[#0095f6] py-3 font-semibold text-white">
            {image ? 'تغيير صورة المنشور' : 'اختيار صورة المنشور'}
          </button>
          <label className={`mt-4 block text-sm font-semibold ${text}`}>عنوان المنشور</label>
          <input value={title} onChange={e => setTitle(e.target.value)} dir="rtl"
            className={`mt-1 w-full rounded-xl border p-3 ${border} ${soft} ${text}`} placeholder="اكتبي العنوان" />
          <label className={`mt-4 block text-sm font-semibold ${text}`}>الوصف</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} dir="rtl" rows={4}
            className={`mt-1 w-full resize-none rounded-xl border p-3 ${border} ${soft} ${text}`} placeholder="اكتبي وصف المنشور" />
          <p className={`mt-3 text-xs ${muted}`}>سيظهر المنشور في الصفحة الرئيسية وشبكة حساب نينجا.</p>
        </div>
      </div>
    );
  };

  const ProfileEditor = () => {
    const [name, setName] = useState(ninjaProfile.name || 'Ninja');
    const [bio, setBio] = useState(ninjaProfile.bio || 'كل احتياجاتك توصلك مع نينجا 💚');
    const [avatar, setAvatar] = useState(ninjaProfile.avatar || NINJA_AVATAR);
    const fileRef = useRef<HTMLInputElement>(null);
    return (
      <div className={`absolute inset-0 z-50 flex flex-col ${bg}`}>
        <div className={`flex h-14 items-center justify-between border-b px-4 ${border}`}>
          <button onClick={() => setModal(null)}><X className={text} /></button>
          <b className={text}>تعديل الملف الشخصي</b>
          <button onClick={() => { updateNinjaProfile({ name, bio, avatar }); setModal(null); }} className="font-bold text-[#0095f6]">حفظ</button>
        </div>
        <div className="flex flex-col items-center gap-4 p-6" dir="rtl">
          <img src={avatar} alt="صورة الحساب" className="h-24 w-24 rounded-full object-cover" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
            const f = e.target.files?.[0]; if (!f) return;
            const r = new FileReader(); r.onload = () => setAvatar(String(r.result || '')); r.readAsDataURL(f);
          }} />
          <button onClick={() => fileRef.current?.click()} className="font-semibold text-[#0095f6]">تغيير صورة الملف الشخصي</button>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم" dir="rtl" className={`w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="النبذة التعريفية" dir="rtl" rows={3} className={`w-full rounded-xl border p-3 ${border} ${soft} ${text}`} />
          <a href={NINJA_WEBSITE_URL} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border p-3 text-[#0095f6]">
            <LinkIcon size={17} /> رابط موقع نينجا <ExternalLink size={15} />
          </a>
        </div>
      </div>
    );
  };

  const StoryViewer = () => {
    const story = STORIES[activeStory];
    return (
      <div className="absolute inset-0 z-[60] flex flex-col justify-between bg-black p-3 text-white">
        <div className="flex gap-1 pt-2">
          {STORIES.map((s, i) => <div key={s.id} className="h-[3px] flex-1 rounded-full bg-white/30"><div className={`h-full rounded-full ${i <= activeStory ? 'w-full bg-white' : 'w-0'}`} /></div>)}
        </div>
        <div className="flex items-center gap-2">
          <img src={story.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <b className="text-sm">{story.name}</b>
          <span className="text-xs text-white/60">منذ ساعة</span>
          <button onClick={() => setModal(null)} className="mr-auto"><X /></button>
        </div>
        <div className="absolute inset-x-0 top-16 bottom-20 flex items-center justify-between">
          <button className="h-full w-1/3" onClick={() => setActiveStory(i => Math.max(0, i - 1))} />
          <div className="h-full w-1/3" />
          <button className="h-full w-1/3" onClick={() => setActiveStory(i => Math.min(STORIES.length - 1, i + 1))} />
        </div>
        <div className="flex items-center gap-3">
          <input placeholder="رد على القصة..." className="flex-1 rounded-full border border-white/60 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/80" dir="rtl" />
          <Heart /><Send />
        </div>
      </div>
    );
  };

  const renderStories = () => (
    <div className={`flex gap-4 overflow-x-auto border-b px-3 py-3 ${border}`} dir="rtl">
      {STORIES.map((s, i) => (
        <button key={s.id} onClick={() => { setActiveStory(i); setModal('story'); }} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <span className={`relative block rounded-full p-[3px] ${s.own ? (isDark ? 'bg-white/20' : 'bg-gray-300') : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'}`}>
            <img src={s.avatar} alt={s.name} className={`h-[62px] w-[62px] rounded-full border-[2px] object-cover ${isDark ? 'border-black' : 'border-white'}`} />
            {s.own && <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#0095f6] text-white"><Plus size={12} /></span>}
          </span>
          <span className={`w-full truncate text-center text-[11px] ${text}`}>{s.name}</span>
        </button>
      ))}
    </div>
  );

  const renderPost = (p: IGPost) => (
    <article key={p.id} className={`border-b ${border}`}>
      <div className="flex items-center gap-2.5 px-3 py-3" dir="rtl">
        <img src={p.avatar || NINJA_AVATAR} alt={p.author} className="h-9 w-9 rounded-full object-cover" />
        <div className="min-w-0 flex-1 text-right">
          <p className={`text-[13px] font-semibold ${text}`}>{p.author}</p>
          <p className={`text-[10px] ${muted}`}>{formatRelativeTime(p.timestamp)}</p>
        </div>
        <button aria-label="المزيد"><MoreHorizontal className={text} /></button>
      </div>
      {p.image && <img src={p.image} alt={p.title || 'منشور نينجا'} className="max-h-[430px] w-full object-cover" />}
      <div className="flex items-center gap-4 px-3 py-2.5" dir="rtl">
        <button onClick={() => toggleLike(p.id)} aria-label="إعجاب"><Heart className={`h-[25px] w-[25px] ${p.liked ? 'fill-[#ff3040] text-[#ff3040]' : text}`} /></button>
        <button onClick={() => { setActivePost(p); setModal('comments'); }} aria-label="تعليق"><MessageCircle className={`h-[24px] w-[24px] ${text}`} /></button>
        <button aria-label="مشاركة"><Send className={`h-[23px] w-[23px] ${text}`} /></button>
        <button onClick={() => toggleSave(p.id)} className="mr-auto" aria-label="حفظ"><Bookmark className={`h-[24px] w-[24px] ${text} ${p.saved ? 'fill-current' : ''}`} /></button>
      </div>
      <div className="px-3 pb-3 text-right" dir="rtl">
        <p className={`text-[13px] font-bold ${text}`}>{toArabicDigits(p.likes)} إعجاب</p>
        {p.title && <p className={`mt-1 text-[13px] font-bold ${text}`}>{p.title}</p>}
        {p.caption && <p className={`mt-0.5 whitespace-pre-wrap text-[13px] ${text}`}>{p.caption}</p>}
        {p.comments.length > 0 && <button onClick={() => { setActivePost(p); setModal('comments'); }} className={`mt-1 text-xs ${muted}`}>عرض التعليقات ({toArabicDigits(p.comments.length)})</button>}
      </div>
    </article>
  );

  const renderHome = () => (
    <>
      <header className={`flex h-12 shrink-0 items-center justify-between border-b px-4 ${border}`} dir="rtl">
        <div className="flex items-center gap-4">
          <span className={`text-[25px] font-bold tracking-tight ${text}`} style={{ fontFamily: 'cursive' }}>Instagram</span>
          <button onClick={() => setModal('campaign')} aria-label="إنشاء منشور"><Plus className={text} /></button>
        </div>
        <button onClick={() => setTab('messages')} aria-label="الرسائل"><Send className={text} /></button>
      </header>
      {renderStories()}
      <div className="flex-1 overflow-y-auto">{feedPosts.map(renderPost)}</div>
    </>
  );

  const renderExplore = () => {
    const filtered = feedPosts.filter(p => `${p.title} ${p.caption}`.includes(search));
    return <>
      <div className={`flex items-center gap-2 border-b p-3 ${border}`}>
        <div className={`flex flex-1 items-center gap-2 rounded-xl px-3 py-2 ${soft}`}>
          <Search size={18} className={muted} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث" className={`w-full bg-transparent text-sm outline-none ${text}`} dir="rtl" />
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-[2px] overflow-y-auto">
        {filtered.concat(feedPosts).map((p, i) => <img key={`${p.id}-${i}`} src={p.image} alt={p.title} className="aspect-square w-full object-cover" />)}
      </div>
    </>;
  };

  const renderReels = () => (
    <div className="flex flex-1 flex-col overflow-y-auto bg-black text-white">
      {feedPosts.map(p => <div key={p.id} className="relative flex min-h-[430px] flex-1 items-end">
        <img src={p.image} alt={p.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="relative z-10 w-full bg-gradient-to-t from-black/80 to-transparent p-4" dir="rtl">
          <b>{p.author}</b><p className="mt-1 text-sm">{p.caption}</p>
        </div>
        <div className="absolute bottom-16 left-3 z-10 flex flex-col gap-5"><Heart /><MessageCircle /><Send /></div>
        <div className="absolute right-1/2 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full bg-black/25 p-3"><Play size={30} /></div>
      </div>)}
    </div>
  );

  const renderActivity = () => (
    <div className="flex-1 overflow-y-auto">
      <h2 className={`border-b px-4 py-4 text-xl font-bold ${text} ${border}`}>النشاط</h2>
      <p className={`px-4 py-5 text-sm ${muted}`} dir="rtl">عندما يتفاعل الأشخاص مع منشورات نينجا ستظهر التحديثات هنا.</p>
      {feedPosts.map(p => <div key={p.id} className={`flex items-center gap-3 border-b px-4 py-3 ${border}`} dir="rtl">
        <img src={p.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
        <p className={`flex-1 text-sm ${text}`}>أعجب الأشخاص بمنشور <b>{p.author}</b></p>
        <img src={p.image} alt="" className="h-11 w-11 object-cover" />
      </div>)}
    </div>
  );

  const renderProfile = () => (
    <div className="flex-1 overflow-y-auto" dir="rtl">
      <div className={`flex items-center justify-between px-4 py-3 ${text}`}>
        <b className="text-lg">{ninjaProfile.name || 'Ninja'}</b>
        <div className="flex gap-4"><button onClick={() => setModal('campaign')}><Plus /></button><button><Menu /></button></div>
      </div>
      <div className="flex items-center gap-5 px-4 py-3">
        <img src={ninjaProfile.avatar || NINJA_AVATAR} alt="Ninja" className="h-[78px] w-[78px] rounded-full object-cover" />
        <div className="flex flex-1 justify-around text-center">
          {[{v: feedPosts.length, l:'منشور'},{v:ninjaProfile.followers || 128000, l:'متابعون'},{v:ninjaProfile.following || 42, l:'يتابع'}].map(x =>
            <div key={x.l}><b className={`block text-base ${text}`}>{toArabicDigits(x.v)}</b><span className={`text-xs ${muted}`}>{x.l}</span></div>
          )}
        </div>
      </div>
      <div className="px-4">
        <b className={`text-sm ${text}`}>{ninjaProfile.name || 'Ninja'}</b>
        <p className={`mt-1 whitespace-pre-wrap text-sm ${text}`}>{ninjaProfile.bio || 'كل احتياجاتك توصلك مع نينجا 💚'}</p>
        <a href={NINJA_WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-[#00376b] dark:text-[#8ab4f8]">
          <LinkIcon size={14} /> ninja.com.sa <ExternalLink size={12} />
        </a>
      </div>
      <div className="flex gap-2 px-4 py-3">
        <button onClick={() => setFollowing(v => !v)} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${following ? `${soft} ${text}` : 'bg-[#0095f6] text-white'}`}>{following ? 'تتابع' : 'متابعة'}</button>
        <button onClick={() => setTab('messages')} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${soft} ${text}`}>مراسلة</button>
        <button onClick={() => setModal('profile-edit')} className={`flex-1 rounded-lg py-2 text-sm font-semibold ${soft} ${text}`}>تعديل الملف</button>
      </div>
      <div className={`mt-2 flex justify-around border-y py-3 ${border}`}>
        <Grid3X3 className={text} /><Clapperboard className={muted} /><User className={muted} />
      </div>
      <div className="grid grid-cols-3 gap-[2px]">
        {feedPosts.map(p => <img key={p.id} src={p.image} alt={p.title} className="aspect-square w-full object-cover" />)}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="flex flex-1 flex-col overflow-hidden" dir="rtl">
      <div className={`flex items-center justify-between border-b px-4 py-3 ${border}`}>
        <button onClick={() => setTab('home')}><ChevronRight className={text} /></button>
        <b className={`text-lg ${text}`}>ninja</b>
        <Settings className={text} />
      </div>
      <div className={`border-b p-3 ${border}`}><input placeholder="بحث" className={`w-full rounded-lg p-2 ${soft} ${text}`} /></div>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 p-4">
          <img src={NINJA_AVATAR} alt="" className="h-12 w-12 rounded-full object-cover" />
          <div><b className={`text-sm ${text}`}>رسائل نينجا</b><p className={`text-xs ${muted}`}>هذه محاكاة محلية لصندوق الرسائل</p></div>
        </div>
      </div>
      <div className={`flex gap-2 border-t p-3 ${border}`}>
        <input value={messageDraft} onChange={e => setMessageDraft(e.target.value)} placeholder="اكتب رسالة..." className={`flex-1 rounded-full px-4 py-2 text-sm ${soft} ${text}`} />
        <button onClick={() => setMessageDraft('')} className="font-semibold text-[#0095f6]">إرسال</button>
      </div>
    </div>
  );

  return (
    <div className={`absolute inset-0 flex flex-col ${bg}`} dir="rtl">
      <div className="h-12 shrink-0" />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === 'home' && renderHome()}
        {tab === 'explore' && renderExplore()}
        {tab === 'reels' && renderReels()}
        {tab === 'activity' && renderActivity()}
        {tab === 'profile' && renderProfile()}
        {tab === 'messages' && renderMessages()}
      </main>
      {tab !== 'messages' && <nav className={`flex shrink-0 items-center justify-around border-t py-2 ${border} ${bg}`} dir="rtl">
        {[
          { id: 'home' as Tab, icon: Home, label: 'الرئيسية' },
          { id: 'explore' as Tab, icon: Search, label: 'بحث' },
          { id: 'reels' as Tab, icon: Clapperboard, label: 'ريلز' },
          { id: 'activity' as Tab, icon: Heart, label: 'النشاط' },
          { id: 'profile' as Tab, icon: User, label: 'الملف الشخصي' },
        ].map(item => {
          const Icon = item.icon;
          return <button key={item.id} onClick={() => setTab(item.id)} aria-label={item.label} className={`${text} ${tab === item.id ? 'opacity-100' : 'opacity-45'}`}>
            <Icon size={24} strokeWidth={tab === item.id ? 2.5 : 1.8} />
          </button>;
        })}
      </nav>}
      {modal === 'campaign' && <CampaignEditor />}
      {modal === 'profile-edit' && <ProfileEditor />}
      {modal === 'story' && <StoryViewer />}
      {modal === 'comments' && activePost && <CommentsSheet post={activePost} isDark={isDark} bg={bg} text={text} muted={muted} border={border} onClose={() => setModal(null)} />}
    </div>
  );
}

function CommentsSheet({ post, isDark, bg, text, muted, border, onClose }: {
  post: IGPost; isDark: boolean; bg: string; text: string; muted: string; border: string; onClose: () => void;
}) {
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState('');
  const add = () => {
    if (!draft.trim()) return;
    setComments(prev => [...prev, { id: Date.now().toString(), author: 'أنت', text: draft.trim() }]);
    setDraft('');
  };
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/45" onClick={onClose}>
      <div className={`max-h-[75%] overflow-y-auto rounded-t-3xl p-4 ${bg}`} onClick={e => e.stopPropagation()} dir="rtl">
        <div className={`mx-auto mb-4 h-1.5 w-12 rounded-full ${isDark ? 'bg-white/20' : 'bg-black/15'}`} />
        <div className={`flex items-center justify-between border-b pb-3 ${border}`}><b className={text}>التعليقات</b><button onClick={onClose}><X className={text} /></button></div>
        {comments.map(c => <div key={c.id} className="py-3 text-sm"><b className={text}>{c.author}</b><span className={`mr-2 ${text}`}>{c.text}</span></div>)}
        {!comments.length && <p className={`py-8 text-center text-sm ${muted}`}>لا توجد تعليقات بعد</p>}
        <div className={`mt-2 flex items-center gap-2 rounded-full border px-3 py-2 ${border}`}>
          <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); }} placeholder="أضف تعليقًا..." className={`flex-1 bg-transparent text-sm outline-none ${text}`} />
          <button onClick={add} className="text-sm font-semibold text-[#0095f6]">نشر</button>
        </div>
      </div>
    </div>
  );
}
