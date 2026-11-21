
'use client';

import { useRef, useState } from 'react';
import {
  Home, Search, Clapperboard, Heart, Send, MessageCircle,
  Bookmark, MoreHorizontal, Plus, X, User, Grid3X3,
  Camera, Settings, ChevronLeft, ImagePlus
} from 'lucide-react';

import { useSystem } from '../../system/SystemContext';
import { usePersistentState, formatRelativeTime, toArabicDigits } from '../shared/utils';

/* =====================================================
   NINJA POSTS
   عدّلي الصور والعناوين والأوصاف من هنا فقط.
   image: ضعي مسار الصورة داخل public.
   مثال: /images/ninja-post-1.jpg
===================================================== */

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
  comments: { id: string; author: string; text: string }[];
  timestamp: number;
}

const NINJA_POSTS: IGPost[] = [
  {
    id: 'ninja-1',
    author: 'Ninja',
    avatar: '/ninja.webp',
    image: '',
    title: 'عنوان المنشور الأول',
    caption: 'اكتبي وصف منشور نينجا هنا ✨',
    likes: 1280,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'ninja-2',
    author: 'Ninja',
    avatar: '/ninja.webp',
    image: '',
    title: 'عنوان المنشور الثاني',
    caption: 'اكتبي وصف المنشور الثاني هنا',
    likes: 950,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 7200000,
  },
  {
    id: 'ninja-3',
    author: 'Ninja',
    avatar: '/ninja.webp',
    image: '',
    title: 'عنوان المنشور الثالث',
    caption: 'اكتبي وصف المنشور الثالث هنا',
    likes: 2100,
    liked: false,
    saved: false,
    comments: [],
    timestamp: Date.now() - 86400000,
  },
];

/* =====================================================
   STORIES
   صور شخصية حقيقية بدل الحروف والأيقونات.
===================================================== */

const STORIES = [
  {
    id: 'story-1',
    name: 'Ninja',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop',
  },
  {
    id: 'story-2',
    name: 'سارة',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop',
  },
  {
    id: 'story-3',
    name: 'نورة',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop',
  },
  {
    id: 'story-4',
    name: 'فاطمة',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=160&h=160&fit=crop',
  },
  {
    id: 'story-5',
    name: 'محمد',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop',
  },
  {
    id: 'story-6',
    name: 'أحمد',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop',
  },
];

type Tab = 'home' | 'explore' | 'reels' | 'activity' | 'profile';

function Avatar({
  src,
  name,
  size = 'h-10 w-10',
  ring = false,
}: {
  src?: string;
  name: string;
  size?: string;
  ring?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`${size} shrink-0 rounded-full overflow-hidden flex items-center justify-center ${ring ? 'p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-neutral-200'}`}>
      {!failed && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="h-full w-full rounded-full bg-neutral-800 flex items-center justify-center text-white font-bold">
          {name.charAt(0)}
        </div>
      )}
    </div>
  );
}

export default function InstagramApp() {
  const { isDark, ninjaProfile, updateNinjaProfile } = useSystem();

  const [tab, setTab] = useState<Tab>('home');
  const [posts, setPosts] = usePersistentState<IGPost[]>(
    'ig-ninja-posts-v2',
    NINJA_POSTS
  );

  const [editing, setEditing] = useState(false);
  const [activePost, setActivePost] = useState<IGPost | null>(null);
  const [story, setStory] = useState<typeof STORIES[number] | null>(null);
  const [search, setSearch] = useState('');

  const [name, setName] = useState(ninjaProfile.name);
  const [bio, setBio] = useState(ninjaProfile.bio);
  const [avatar, setAvatar] = useState(ninjaProfile.avatar);
  const fileRef = useRef<HTMLInputElement>(null);

  const dark = isDark;
  const bg = dark ? 'bg-black' : 'bg-white';
  const surface = dark ? 'bg-[#121212]' : 'bg-white';
  const text = dark ? 'text-white' : 'text-[#171717]';
  const muted = dark ? 'text-white/50' : 'text-black/45';
  const line = dark ? 'border-white/10' : 'border-black/10';

  const validAvatar =
    avatar && (
      avatar.startsWith('http') ||
      avatar.startsWith('/') ||
      avatar.startsWith('data:')
    )
      ? avatar
      : '/ninja.webp';

  const toggleLike = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.likes + (p.liked ? -1 : 1),
            }
          : p
      )
    );
  };

  const toggleSave = (id: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, saved: !p.saved } : p
      )
    );
  };

  const changeAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ================= HEADER ================= */

  const Header = () => (
    <div className={`h-[54px] shrink-0 flex items-center justify-between px-4 border-b ${line}`}>
      <button onClick={() => setEditing(true)}>
        <Plus className={`h-6 w-6 ${text}`} />
      </button>

      <div className={`text-[23px] font-bold tracking-tight ${text}`}>
        Instagram
      </div>

      <button onClick={() => setTab('activity')}>
        <Heart className={`h-6 w-6 ${text}`} />
      </button>
    </div>
  );

  /* ================= STORIES ================= */

  const Stories = () => (
    <div className={`flex gap-4 overflow-x-auto px-3 py-3 border-b ${line} shrink-0`}>
      {STORIES.map(s => (
        <button
          key={s.id}
          onClick={() => setStory(s)}
          className="flex flex-col items-center gap-1 shrink-0 w-[65px]"
        >
          <Avatar src={s.image} name={s.name} size="h-[62px] w-[62px]" ring />
          <span className={`text-[11px] truncate max-w-full ${text}`}>
            {s.name}
          </span>
        </button>
      ))}
    </div>
  );

  /* ================= POST IMAGE ================= */

  const PostImage = ({ post }: { post: IGPost }) => {
    const [failed, setFailed] = useState(false);

    if (!post.image || failed) {
      return (
        <div className="aspect-square w-full bg-gradient-to-br from-[#111827] via-[#087E8B] to-[#31B6A2] flex flex-col items-center justify-center gap-3 text-white">
          <div className="text-5xl font-black tracking-tight">Ninja</div>
          <div className="text-sm opacity-80">{post.title}</div>
          <div className="text-xs opacity-60">مكان تصميم منشور نينجا</div>
        </div>
      );
    }

    return (
      <img
        src={post.image}
        alt={post.title}
        onError={() => setFailed(true)}
        className="w-full aspect-square object-cover"
      />
    );
  };

  /* ================= POST ================= */

  const Post = ({ post }: { post: IGPost }) => (
    <article className={`pb-3 border-b ${line}`}>
      <div className="flex items-center gap-2.5 px-3 py-3">
        <Avatar src={validAvatar} name={ninjaProfile.name} size="h-10 w-10" />
        <div className="flex-1 text-right">
          <p className={`text-[13px] font-bold ${text}`}>
            {ninjaProfile.name || 'Ninja'}
            <span className="text-[#3897F0] mr-1">✓</span>
          </p>
          <p className={`text-[10px] ${muted}`}>
            {formatRelativeTime(post.timestamp)}
          </p>
        </div>
        <button>
          <MoreHorizontal className={`h-5 w-5 ${text}`} />
        </button>
      </div>

      <PostImage post={post} />

      <div className="flex items-center gap-4 px-3 pt-3">
        <button onClick={() => toggleLike(post.id)}>
          <Heart className={`h-[25px] w-[25px] ${post.liked ? 'fill-red-500 text-red-500' : text}`} />
        </button>

        <button onClick={() => setActivePost(post)}>
          <MessageCircle className={`h-[25px] w-[25px] ${text}`} />
        </button>

        <button>
          <Send className={`h-[25px] w-[25px] ${text}`} />
        </button>

        <button onClick={() => toggleSave(post.id)} className="mr-auto">
          <Bookmark className={`h-[25px] w-[25px] ${post.saved ? 'fill-current' : ''} ${text}`} />
        </button>
      </div>

      <div className="px-3 pt-2" dir="rtl">
        <p className={`text-[13px] font-bold ${text}`}>
          {toArabicDigits(post.likes)} إعجاب
        </p>

        {post.title && (
          <p className={`mt-1 text-[14px] font-bold ${text}`}>
            {post.title}
          </p>
        )}

        <p className={`mt-1 text-[13px] leading-6 ${text}`}>
          <b>{ninjaProfile.name || 'Ninja'}</b>
          {' '}
          {post.caption}
        </p>

        {post.comments.length > 0 && (
          <button
            onClick={() => setActivePost(post)}
            className={`mt-1 text-[12px] ${muted}`}
          >
            عرض التعليقات ({toArabicDigits(post.comments.length)})
          </button>
        )}
      </div>
    </article>
  );

  /* ================= HOME ================= */

  const HomePage = () => (
    <>
      <Header />
      <Stories />
      <div className="flex-1 overflow-y-auto">
        {posts.map(post => <Post key={post.id} post={post} />)}
      </div>
    </>
  );

  /* ================= EXPLORE ================= */

  const ExplorePage = () => (
    <>
      <div className={`px-3 py-3 border-b ${line}`}>
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${dark ? 'bg-white/10' : 'bg-[#EFEFEF]'}`}>
          <Search className={muted + ' h-5 w-5'} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث عن نينجا..."
            className={`flex-1 bg-transparent outline-none text-[13px] ${text}`}
            dir="rtl"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[2px] overflow-y-auto">
        {posts.filter(p =>
          (p.title + p.caption).includes(search)
        ).map(post => (
          <div key={post.id} className="aspect-square overflow-hidden">
            <PostImage post={post} />
          </div>
        ))}
      </div>
    </>
  );

  /* ================= REELS ================= */

  const ReelsPage = () => (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-black text-white">
      <Clapperboard className="h-12 w-12 opacity-50" />
      <h2 className="text-lg font-bold">ريلز نينجا</h2>
      <p className="text-xs text-white/50">مساحة مقاطع الفيديو القصيرة</p>
    </div>
  );

  /* ================= ACTIVITY ================= */

  const ActivityPage = () => (
    <>
      <div className={`px-4 py-4 text-xl font-bold ${text}`}>النشاط</div>
      <div className="flex-1 overflow-y-auto">
        {posts.map(post => (
          <div key={post.id} className={`flex items-center gap-3 px-4 py-3 border-b ${line}`}>
            <Avatar src={validAvatar} name={ninjaProfile.name} />
            <p className={`flex-1 text-[13px] ${text}`} dir="rtl">
              <b>{ninjaProfile.name || 'Ninja'}</b>
              {' '}منشور جديد من نينجا
            </p>
            <div className="text-[#E1306C]">
              <Heart className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </>
  );

  /* ================= PROFILE ================= */

  const ProfilePage = () => (
    <>
      <div className={`h-[54px] shrink-0 flex items-center justify-between px-4 border-b ${line}`}>
        <button onClick={() => setEditing(true)}>
          <Settings className={`h-5 w-5 ${text}`} />
        </button>
        <span className={`font-bold text-[16px] ${text}`}>
          {ninjaProfile.name || 'Ninja'}
        </span>
        <button>
          <Plus className={`h-6 w-6 ${text}`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center px-4 pt-5 gap-5">
          <Avatar src={validAvatar} name={ninjaProfile.name} size="h-[82px] w-[82px]" />

          <div className="flex flex-1 justify-around text-center">
            {[
              { value: posts.length, label: 'منشور' },
              { value: ninjaProfile.followers, label: 'متابعون' },
              { value: ninjaProfile.following, label: 'يتابع' },
            ].map(item => (
              <div key={item.label}>
                <p className={`text-[17px] font-bold ${text}`}>
                  {toArabicDigits(item.value)}
                </p>
                <p className={`text-[11px] ${muted}`}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3" dir="rtl">
          <p className={`text-[14px] font-bold ${text}`}>
            {ninjaProfile.name || 'Ninja'}
          </p>
          <p className={`mt-1 text-[13px] leading-6 ${text}`}>
            {ninjaProfile.bio}
          </p>
          <p className="text-[12px] text-[#3897F0]">ninja.sa</p>
        </div>

        <button
          onClick={() => setEditing(true)}
          className={`mx-4 mt-4 w-[calc(100%-32px)] rounded-lg py-2 text-[13px] font-semibold ${dark ? 'bg-white/10 text-white' : 'bg-[#EFEFEF] text-black'}`}
        >
          تعديل الملف الشخصي
        </button>

        <div className={`mt-5 flex items-center justify-around border-b ${line}`}>
          <Grid3X3 className={`h-6 w-6 pb-1 border-b-2 ${text}`} />
          <User className={`h-6 w-6 ${muted}`} />
        </div>

        <div className="grid grid-cols-3 gap-[2px]">
          {posts.map(post => (
            <div key={post.id} className="aspect-square overflow-hidden">
              <PostImage post={post} />
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ================= BOTTOM NAV ================= */

  const NAV = [
    { id: 'home' as const, icon: Home },
    { id: 'explore' as const, icon: Search },
    { id: 'reels' as const, icon: Clapperboard },
    { id: 'activity' as const, icon: Heart },
    { id: 'profile' as const, icon: User },
  ];

  /* ================= MAIN ================= */

  return (
    <div className={`absolute inset-0 flex flex-col overflow-hidden ${bg}`} dir="rtl">
      <div className="h-12 shrink-0" />

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === 'home' && <HomePage />}
        {tab === 'explore' && <ExplorePage />}
        {tab === 'reels' && <ReelsPage />}
        {tab === 'activity' && <ActivityPage />}
        {tab === 'profile' && <ProfilePage />}
      </main>

      <nav className={`h-[54px] shrink-0 flex items-center justify-around border-t ${line} ${surface}`}>
        {NAV.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex h-full flex-1 items-center justify-center transition-all active:scale-90 ${tab === item.id ? text : muted}`}
            >
              <Icon
                className="h-[25px] w-[25px]"
                strokeWidth={tab === item.id ? 2.5 : 1.8}
                fill={item.id === 'activity' && tab === 'activity' ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </nav>

      {/* PROFILE EDIT MODAL */}

      {editing && (
        <div className={`absolute inset-0 z-50 flex flex-col ${bg}`}>
          <div className={`h-14 shrink-0 flex items-center justify-between px-4 border-b ${line}`}>
            <button onClick={() => setEditing(false)}>
              <X className={`h-6 w-6 ${text}`} />
            </button>
            <h2 className={`font-bold ${text}`}>تعديل الملف الشخصي</h2>
            <button
              onClick={() => {
                updateNinjaProfile({ name, bio, avatar });
                setEditing(false);
              }}
              className="text-[#0095F6] font-bold text-sm"
            >
              تم
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6">
            <div className="flex flex-col items-center gap-3 mb-8">
              <Avatar src={avatar} name={name} size="h-24 w-24" />
              <button
                onClick={() => fileRef.current?.click()}
                className="text-[#0095F6] text-sm font-bold"
              >
                تغيير صورة الملف الشخصي
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => changeAvatar(e.target.files?.[0])}
              />
            </div>

            <label className={`block text-[13px] font-bold mb-2 ${text}`}>
              الاسم
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none mb-5 ${line} ${text} ${dark ? 'bg-white/5' : 'bg-[#F7F7F7]'}`}
              dir="rtl"
            />

            <label className={`block text-[13px] font-bold mb-2 ${text}`}>
              النبذة التعريفية
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className={`w-full rounded-xl border px-3 py-3 text-sm outline-none resize-none ${line} ${text} ${dark ? 'bg-white/5' : 'bg-[#F7F7F7]'}`}
              dir="rtl"
            />
          </div>
        </div>
      )}

      {/* STORY VIEWER */}

      {story && (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <Avatar src={story.image} name={story.name} />
              <span className="text-sm font-bold">{story.name}</span>
            </div>
            <button onClick={() => setStory(null)}>
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-white/60 text-sm">
            مساحة عرض الستوري
          </div>
        </div>
      )}

      {/* COMMENTS */}

      {activePost && (
        <CommentsSheet
          post={activePost}
          isDark={dark}
          onClose={() => setActivePost(null)}
          onUpdate={(comments) => {
            setPosts(prev =>
              prev.map(p =>
                p.id === activePost.id ? { ...p, comments } : p
              )
            );
            setActivePost(null);
          }}
        />
      )}
    </div>
  );
}

/* ================= COMMENTS ================= */

function CommentsSheet({
  post,
  isDark,
  onClose,
  onUpdate,
}: {
  post: IGPost;
  isDark: boolean;
  onClose: () => void;
  onUpdate: (comments: IGPost['comments']) => void;
}) {
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState('');

  const bg = isDark ? 'bg-[#171717]' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';

  const addComment = () => {
    if (!draft.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        author: 'أنت',
        text: draft.trim(),
      },
    ]);
    setDraft('');
  };

  return (
    <div
      className="absolute inset-0 z-[70] flex items-end bg-black/50"
      onClick={onClose}
    >
      <div
        className={`w-full max-h-[75%] rounded-t-3xl p-4 ${bg}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-neutral-400/50" />
        <div className="flex justify-between items-center border-b border-neutral-400/20 pb-3">
          <h3 className={`font-bold ${text}`}>التعليقات</h3>
          <button onClick={onClose}>
            <X className={text} />
          </button>
        </div>

        <div className="max-h-[40vh] overflow-y-auto">
          {comments.map(comment => (
            <div key={comment.id} className="py-3 text-sm" dir="rtl">
              <b className={text}>{comment.author}</b>
              <span className={`mr-2 ${text}`}>{comment.text}</span>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">
              لا توجد تعليقات بعد
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-neutral-400/20 pt-3">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addComment()}
            placeholder="أضف تعليقًا..."
            className={`flex-1 bg-transparent outline-none text-sm ${text}`}
            dir="rtl"
          />
          <button onClick={addComment} className="text-[#0095F6] font-bold text-sm">
            نشر
          </button>
        </div>
      </div>
    </div>
  );
}
