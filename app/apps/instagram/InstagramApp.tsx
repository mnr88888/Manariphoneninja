
'use client';

import { useRef, useState } from 'react';
import {
  Home, Search, Clapperboard, Heart, Send, MessageCircle,
  Bookmark, MoreHorizontal, Plus, X, User,
  ChevronRight, ExternalLink, Link as LinkIcon,
  Settings, Trash2, MoreHorizontal as More
} from 'lucide-react';

import { useSystem } from '../../system/SystemContext';
import { usePersistentState } from '../shared/utils';

const NINJA_URL = 'https://ninja.com.sa';
const NINJA_AVATAR = '/ninja.webp';

type Tab = 'home' | 'explore' | 'reels' | 'activity' | 'profile' | 'messages';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  image: string;
  title: string;
  caption: string;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
  timestamp: number;
}

const COMMENT_NAMES = [
  'نورة', 'سارة', 'ريم', 'جود', 'لينا',
  'دانة', 'شهد', 'مريم', 'هيا', 'أمل',
  'رغد', 'غادة', 'ليان', 'تالا', 'جنى',
  'فاطمة', 'نوف', 'عبير', 'لمى', 'مي',
  'روان', 'يارا', 'بسمة', 'دلال', 'العنود'
];

const COMMENT_TEXTS = [
  'ما شاء الله السلة تجنن 😍',
  'أتمنى أفوز فيها 💚',
  'العيد أحلى مع نينجا!',
  'أتوقع قيمتها 250 ريال',
  'مسابقة جميلة 🎉',
  'كل عام وأنتم بخير',
  'السلة مرة فخمة!',
  'أتوقع قيمتها 300 ريال',
  'يارب الحظ يكون من نصيبي',
  'نينجا دايم مبدعين 💚',
  'متحمسة للمسابقة 😍',
  'أتوقع 350 ريال',
  'الله يرزقنا الفوز',
  'فكرة حلوة للعيد',
  'السلة تستاهل والله 💚',
  'أتوقع 280 ريال',
  'يا رب أفوز هالمرة',
  'كل عام و نينجا بخير',
  'أحلى مسابقة للعيد',
  'توقعي 400 ريال'
];

const createSampleComments = (): Comment[] =>
  Array.from({ length: 100 }, (_, i) => ({
    id: `sample-${i + 1}`,
    author: COMMENT_NAMES[i % COMMENT_NAMES.length],
    avatar: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    text: COMMENT_TEXTS[i % COMMENT_TEXTS.length],
    likes: i % 13,
    time: `${(i % 23) + 1} س`
  }));

const INITIAL_POSTS: Post[] = [
  {
    id: 'ninja-campaign',
    author: 'Ninja',
    avatar: NINJA_AVATAR,
    image: '/eid-basket.png',
    title: 'مسابقة العيد',
    caption:
      'العيد أحلى مع نينجا! 🎉💚 خمّن قيمة سلة العيد الموجودة بالصورة وادخل السحب للفوز بقسيمة 300 ريال. كل اللي عليك: تابع حسابنا، اعمل لايك للمنشور، واكتب توقعك بالتعليقات. بالتوفيق للجميع!',
    likes: 348,
    liked: false,
    saved: false,
    comments: createSampleComments(),
    timestamp: Date.now() - 3600000
  },
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
    timestamp: Date.now() - 7200000
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
    timestamp: Date.now() - 28800000
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
    timestamp: Date.now() - 86400000
  }
];

const STORIES = [
  {
    id: 's1',
    name: 'قصتك',
    avatar: NINJA_AVATAR,
    image: '/eid-basket.png'
  },
  {
    id: 's2',
    name: 'نورة',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1080'
  },
  {
    id: 's3',
    name: 'سارة',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1080'
  },
  {
    id: 's4',
    name: 'فاطمة',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300',
    image: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1080'
  },
  {
    id: 's5',
    name: 'أحمد',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1080'
  }
];

function relativeTime(timestamp: number) {
  const minutes = Math.max(
    1,
    Math.floor((Date.now() - timestamp) / 60000)
  );

  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;

  return `منذ ${Math.floor(hours / 24)} يوم`;
}

export default function InstagramApp() {
  const {
    isDark,
    ninjaCampaign,
    updateNinjaCampaign,
    ninjaProfile,
    updateNinjaProfile
  } = useSystem();

  const [tab, setTab] = useState<Tab>('home');

  const [posts, setPosts] = usePersistentState<Post[]>(
    'ig-ninja-posts-v4',
    INITIAL_POSTS
  );

  const [modal, setModal] = useState<
    'story' | 'comments' | 'campaign' | 'profile' | 'post' | null
  >(null);

  const [activeStory, setActiveStory] = useState(0);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [menuPost, setMenuPost] = useState<string | null>(null);

  const bg = isDark ? 'bg-black' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-[#262626]';
  const muted = isDark ? 'text-white/50' : 'text-[#8e8e8e]';
  const border = isDark ? 'border-white/10' : 'border-[#efefef]';
  const soft = isDark ? 'bg-[#1c1c1e]' : 'bg-[#f5f5f5]';

  const displayPosts = posts.map(p =>
    p.id === 'ninja-campaign'
      ? {
          ...p,
          author: ninjaProfile.name || 'Ninja',
          avatar: ninjaProfile.avatar || NINJA_AVATAR,
          image: ninjaCampaign.image || p.image,
          title: ninjaCampaign.title || p.title,
          caption: ninjaCampaign.description || p.caption
        }
      : p
  );

  const updatePost = (id: string, changes: Partial<Post>) => {
    setPosts(prev =>
      prev.map(p => p.id === id ? { ...p, ...changes } : p)
    );
  };

  const toggleLike = (p: Post) => {
    updatePost(p.id, {
      liked: !p.liked,
      likes: Math.max(0, p.likes + (p.liked ? -1 : 1))
    });
  };

  const toggleSave = (p: Post) => {
    updatePost(p.id, { saved: !p.saved });
  };

  const addComment = () => {
    if (!draft.trim() || !activePost) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Ninja',
      avatar: ninjaProfile.avatar || NINJA_AVATAR,
      text: draft.trim(),
      likes: 0,
      time: 'الآن'
    };

    const updatedComments = [
      ...activePost.comments,
      newComment
    ];

    updatePost(activePost.id, {
      comments: updatedComments
    });

    setActivePost({
      ...activePost,
      comments: updatedComments
    });

    setDraft('');
  };

  const renderPost = (p: Post) => (
    <article key={p.id} className={`border-b ${border}`}>
      <div className="flex items-center gap-3 px-3 py-3">
        <img
          src={p.avatar}
          alt=""
          className="h-9 w-9 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <b className={`block text-sm ${text}`}>
            {p.author}
          </b>
          <span className={`text-[11px] ${muted}`}>
            {relativeTime(p.timestamp)}
          </span>
        </div>

        <button
          onClick={() =>
            setMenuPost(menuPost === p.id ? null : p.id)
          }
          aria-label="خيارات المنشور"
        >
          <MoreHorizontal className={text} />
        </button>
      </div>

      {/* الصورة كاملة بدون قص */}
      <button
        className="block w-full bg-black/5"
        onClick={() => {
          setActivePost(p);
          setModal('post');
        }}
      >
        <img
          src={p.image}
          alt={p.title}
          className="block h-auto max-h-none w-full object-contain"
        />
      </button>

      <div className="px-3 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => toggleLike(p)}>
            <Heart
              size={25}
              className={
                p.liked
                  ? 'fill-red-500 text-red-500'
                  : text
              }
            />
          </button>

          <button
            onClick={() => {
              setActivePost(p);
              setModal('comments');
            }}
          >
            <MessageCircle size={24} className={text} />
          </button>

          <button aria-label="إرسال">
            <Send size={23} className={text} />
          </button>

          <button
            className="mr-auto"
            onClick={() => toggleSave(p)}
          >
            <Bookmark
              size={24}
              className={p.saved ? 'fill-current' : text}
            />
          </button>
        </div>

        <b className={`mt-2 block text-sm ${text}`}>
          {p.likes.toLocaleString('en-US')} إعجاب
        </b>

        <p className={`mt-1 text-sm ${text}`}>
          <b>{p.author}</b> {p.caption}
        </p>

        <button
          onClick={() => {
            setActivePost(p);
            setModal('comments');
          }}
          className={`mt-1 text-sm ${muted}`}
        >
          عرض جميع التعليقات ({p.comments.length})
        </button>

        <p className={`mt-1 text-[10px] ${muted}`}>
          {relativeTime(p.timestamp)}
        </p>
      </div>

      {menuPost === p.id && (
        <div
          className="fixed inset-0 z-[120] flex items-end bg-black/50"
          onClick={() => setMenuPost(null)}
        >
          <div
            className={`${bg} w-full rounded-t-3xl p-5`}
            onClick={e => e.stopPropagation()}
          >
            <button
              className={`flex w-full items-center gap-3 py-4 ${text}`}
              onClick={() => {
                setPosts(prev => prev.filter(x => x.id !== p.id));
                setMenuPost(null);
              }}
            >
              <Trash2 className="text-red-500" />
              حذف المنشور
            </button>

            <button
              className={`w-full py-3 ${text}`}
              onClick={() => setMenuPost(null)}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </article>
  );

  const renderHome = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className={`flex shrink-0 items-center justify-between border-b px-4 py-3 ${border}`}>
        <b className={`text-2xl italic ${text}`}>
          Instagram
        </b>

        <div className="flex gap-5">
          <button
            onClick={() => setModal('campaign')}
            aria-label="إدارة الحملة"
          >
            <Plus className={text} />
          </button>

          <button
            onClick={() => setTab('messages')}
            aria-label="الرسائل"
          >
            <Send className={text} />
          </button>
        </div>
      </div>

      {/* شريط الستوريات: ارتفاع ثابت لمنع قص الدوائر */}
      <div className={`relative z-10 h-[104px] w-full shrink-0 border-b ${border}`}>
        <div className="flex h-full w-full items-start gap-4 overflow-x-auto overflow-y-hidden px-3 pt-2 pb-1">
          {STORIES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveStory(i);
                setModal('story');
              }}
              className="flex h-[88px] w-[68px] shrink-0 flex-col items-center gap-1"
            >
              <div
                className={`shrink-0 rounded-full p-[3px] ${
                  i === 0
                    ? 'bg-gray-300'
                    : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                }`}
              >
                <img
                  src={s.avatar}
                  alt=""
                  className={`h-14 w-14 rounded-full border-2 object-cover ${
                    isDark ? 'border-black' : 'border-white'
                  }`}
                />
              </div>

              <span className={`w-full truncate text-center text-xs ${text}`}>
                {s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {displayPosts.map(renderPost)}
    </div>
  );

  const renderExplore = () => {
    const filtered = displayPosts.filter(p =>
      `${p.title} ${p.caption} ${p.author}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="p-3">
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${soft}`}>
            <Search size={18} className={muted} />

            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث"
              className={`w-full bg-transparent outline-none ${text}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[2px]">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setActivePost(p);
                setModal('post');
              }}
            >
              <img
                src={p.image}
                alt=""
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderReels = () => (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
      <Clapperboard size={48} className={muted} />
      <b className={text}>ريلز</b>
      <p className={`text-sm ${muted}`}>
        لا توجد مقاطع فيديو حاليًا
      </p>
    </div>
  );

  const renderActivity = () => (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3">
      <Heart size={42} className={muted} />
      <b className={text}>النشاط</b>
      <p className={`text-sm ${muted}`}>
        أنتِ مطّلعة على كل جديد
      </p>
    </div>
  );

  const renderProfile = () => (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className={`flex items-center justify-between border-b p-4 ${border}`}>
        <b className={text}>
          {ninjaProfile.name || 'ninja'}
        </b>

        <button onClick={() => setModal('profile')}>
          <Settings className={text} />
        </button>
      </header>

      <div className="flex items-center gap-6 p-5">
        <img
          src={ninjaProfile.avatar || NINJA_AVATAR}
          alt=""
          className="h-20 w-20 rounded-full object-cover"
        />

        <div className="flex-1 text-center">
          <b className={text}>{displayPosts.length}</b>
          <p className={`text-xs ${muted}`}>منشورات</p>
        </div>

        <div className="flex-1 text-center">
          <b className={text}>12.8K</b>
          <p className={`text-xs ${muted}`}>متابعون</p>
        </div>

        <div className="flex-1 text-center">
          <b className={text}>120</b>
          <p className={`text-xs ${muted}`}>يتابع</p>
        </div>
      </div>

      <div className="px-4">
        <b className={text}>
          {ninjaProfile.name || 'Ninja'}
        </b>

        <p className={`mt-1 text-sm ${text}`}>
          {ninjaProfile.bio || 'كل احتياجاتك توصلك مع نينجا 💚'}
        </p>

        <a
          href={NINJA_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1 text-sm font-semibold text-blue-500"
        >
          <LinkIcon size={15} />
          ninja.com.sa
          <ExternalLink size={13} />
        </a>

        <button
          onClick={() => setModal('profile')}
          className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold ${soft} ${text}`}
        >
          تعديل الملف الشخصي
        </button>
      </div>

      <div className={`mt-5 grid grid-cols-3 border-t ${border}`}>
        {displayPosts.map(p => (
          <button
            key={p.id}
            onClick={() => {
              setActivePost(p);
              setModal('post');
            }}
          >
            <img
              src={p.image}
              alt=""
              className="aspect-square w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className={`flex items-center justify-between border-b p-4 ${border}`}>
        <button onClick={() => setTab('home')}>
          <ChevronRight className={text} />
        </button>

        <b className={text}>ninja</b>

        <Settings className={text} />
      </header>

      <div className={`m-3 rounded-lg p-3 ${soft} ${muted}`}>
        بحث في الرسائل
      </div>

      <div className="flex items-center gap-3 p-4">
        <img
          src={NINJA_AVATAR}
          alt=""
          className="h-12 w-12 rounded-full object-cover"
        />

        <div>
          <b className={`text-sm ${text}`}>رسائل نينجا</b>
          <p className={`text-xs ${muted}`}>
            صندوق الرسائل التجريبي
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`absolute inset-0 flex flex-col overflow-hidden ${bg}`}
      dir="rtl"
    >
      <div className="h-12 shrink-0" />

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === 'home' && renderHome()}
        {tab === 'explore' && renderExplore()}
        {tab === 'reels' && renderReels()}
        {tab === 'activity' && renderActivity()}
        {tab === 'profile' && renderProfile()}
        {tab === 'messages' && renderMessages()}
      </main>

      {tab !== 'messages' && (
        <nav className={`flex shrink-0 items-center justify-around border-t py-2 ${border} ${bg}`}>
          {[
            { id: 'home' as Tab, icon: Home },
            { id: 'explore' as Tab, icon: Search },
            { id: 'reels' as Tab, icon: Clapperboard },
            { id: 'activity' as Tab, icon: Heart },
            { id: 'profile' as Tab, icon: User }
          ].map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`${text} ${tab === item.id ? '' : 'opacity-40'}`}
              >
                <Icon size={24} />
              </button>
            );
          })}
        </nav>
      )}

      {/* شاشة المنشور */}
      {modal === 'post' && activePost && (
        <div className={`absolute inset-0 z-[90] flex flex-col ${bg}`} dir="rtl">
          <header className={`flex h-14 shrink-0 items-center justify-between border-b px-4 ${border}`}>
            <button onClick={() => setModal(null)}>
              <ChevronRight className={text} />
            </button>

            <b className={text}>المنشور</b>
            <span />
          </header>

          <div className="flex-1 overflow-y-auto">
            {renderPost(
              displayPosts.find(p => p.id === activePost.id) || activePost
            )}
          </div>
        </div>
      )}

      {/* شاشة الستوري */}
      {modal === 'story' && (
        <div className="absolute inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white">
          <img
            src={STORIES[activeStory].image}
            alt=""
            className="absolute inset-0 h-full w-full object-contain"
          />

          <div className="relative z-10 flex shrink-0 items-center gap-3 p-4">
            <img
              src={STORIES[activeStory].avatar}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />

            <b>{STORIES[activeStory].name}</b>

            <button
              className="mr-auto"
              onClick={() => setModal(null)}
            >
              <X />
            </button>
          </div>

          <div className="relative z-10 mt-auto flex h-1/2 shrink-0">
            <button
              className="w-1/3"
              onClick={() =>
                setActiveStory(i => Math.max(0, i - 1))
              }
            />

            <div className="flex-1" />

            <button
              className="w-1/3"
              onClick={() =>
                activeStory < STORIES.length - 1
                  ? setActiveStory(i => i + 1)
                  : setModal(null)
              }
            />
          </div>
        </div>
      )}

      {/* التعليقات بتنسيق إنستقرام */}
      {modal === 'comments' && activePost && (
        <div
          className="absolute inset-0 z-[110] flex flex-col justify-end bg-black/50"
          onClick={() => setModal(null)}
        >
          <div
            className={`flex max-h-[85%] min-h-[55%] flex-col rounded-t-3xl ${bg}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`shrink-0 border-b px-4 pb-3 pt-4 ${border}`}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-400/50" />

              <div className="flex items-center justify-between">
                <span className="w-6" />

                <b className={text}>
                  التعليقات
                </b>

                <button onClick={() => setModal(null)}>
                  <X className={text} />
                </button>
              </div>
            </div>

            {/* قائمة التعليقات */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4">
              {activePost.comments.map(c => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 py-3"
                >
                  <img
                    src={c.avatar || NINJA_AVATAR}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                    loading="lazy"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm leading-6">
                      <b className={`ml-1 ${text}`}>
                        {c.author}
                      </b>

                      <span className={text}>
                        {c.text}
                      </span>
                    </div>

                    <div className={`mt-1 flex items-center gap-4 text-xs ${muted}`}>
                      <span>{c.time}</span>
                      <b>رد</b>
                      <b>إرسال</b>
                    </div>
                  </div>

                  <button className="mt-1 flex shrink-0 flex-col items-center gap-1">
                    <Heart
                      size={13}
                      className={muted}
                    />

                    {c.likes > 0 && (
                      <span className={`text-[10px] ${muted}`}>
                        {c.likes}
                      </span>
                    )}
                  </button>
                </div>
              ))}

              {activePost.comments.length === 0 && (
                <div className="py-12 text-center">
                  <b className={text}>لا توجد تعليقات بعد</b>
                  <p className={`mt-2 text-sm ${muted}`}>
                    كوني أول من يعلق
                  </p>
                </div>
              )}
            </div>

            {/* إضافة تعليق */}
            <div className={`flex shrink-0 items-center gap-3 border-t px-4 py-3 ${border}`}>
              <img
                src={ninjaProfile.avatar || NINJA_AVATAR}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />

              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e =>
                  e.key === 'Enter' && addComment()
                }
                placeholder="أضيفي تعليقاً..."
                className={`min-w-0 flex-1 rounded-full border px-4 py-2 text-sm outline-none ${border} ${bg} ${text}`}
              />

              <button
                onClick={addComment}
                disabled={!draft.trim()}
                className="text-sm font-semibold text-blue-500 disabled:opacity-40"
              >
                نشر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* إدارة الحملة */}
      {modal === 'campaign' && (
        <CampaignPanel
          bg={bg}
          text={text}
          border={border}
          soft={soft}
          initialImage={ninjaCampaign.image || ''}
          initialTitle={ninjaCampaign.title || ''}
          initialDescription={ninjaCampaign.description || ''}
          onClose={() => setModal(null)}
          onSave={(image, title, description, publish) => {
            updateNinjaCampaign({
              image,
              title,
              description,
              status: publish ? 'published' : 'draft',
              updatedAt: Date.now()
            });

            if (publish) {
              setPosts(prev => [
                {
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
                  timestamp: Date.now()
                },
                ...prev.filter(p => p.id !== 'ninja-campaign')
              ]);
            }

            setModal(null);
          }}
        />
      )}

      {/* الملف الشخصي */}
      {modal === 'profile' && (
        <ProfilePanel
          bg={bg}
          text={text}
          border={border}
          initialName={ninjaProfile.name || 'Ninja'}
          initialBio={ninjaProfile.bio || 'كل احتياجاتك توصلك مع نينجا 💚'}
          initialAvatar={ninjaProfile.avatar || NINJA_AVATAR}
          onClose={() => setModal(null)}
          onSave={(name, bio, avatar) => {
            updateNinjaProfile({ name, bio, avatar });
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function CampaignPanel({
  bg, text, border, soft,
  initialImage, initialTitle, initialDescription,
  onClose, onSave
}: any) {
  const [image, setImage] = useState(initialImage);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`absolute inset-0 z-[120] flex flex-col ${bg} p-4`} dir="rtl">
      <header className="flex items-center justify-between py-3">
        <button onClick={onClose}>
          <X className={text} />
        </button>

        <b className={text}>إدارة منشور نينجا</b>

        <button
          onClick={() => onSave(image, title, description, true)}
          className="font-bold text-blue-500"
        >
          نشر
        </button>
      </header>

      {image && (
        <img
          src={image}
          alt=""
          className="h-52 w-full rounded-xl object-contain"
        />
      )}

      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;

          const r = new FileReader();
          r.onload = () => setImage(String(r.result || ''));
          r.readAsDataURL(f);
        }}
      />

      <button
        onClick={() => ref.current?.click()}
        className="mt-3 rounded-xl bg-blue-500 py-3 text-white"
      >
        اختيار صورة
      </button>

      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="عنوان المنشور"
        className={`mt-4 rounded-xl border p-3 ${border} ${soft} ${text}`}
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="وصف المنشور"
        rows={4}
        className={`mt-3 rounded-xl border p-3 ${border} ${soft} ${text}`}
      />

      <button
        onClick={() => onSave(image, title, description, false)}
        className={`mt-3 rounded-xl py-3 ${soft} ${text}`}
      >
        حفظ كمسودة
      </button>
    </div>
  );
}

function ProfilePanel({
  bg, text, border,
  initialName, initialBio, initialAvatar,
  onClose, onSave
}: any) {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [avatar, setAvatar] = useState(initialAvatar);
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className={`absolute inset-0 z-[120] flex flex-col ${bg} p-4`} dir="rtl">
      <header className="flex items-center justify-between py-3">
        <button onClick={onClose}>
          <X className={text} />
        </button>

        <b className={text}>تعديل الملف الشخصي</b>

        <button
          onClick={() => onSave(name, bio, avatar)}
          className="font-bold text-blue-500"
        >
          حفظ
        </button>
      </header>

      <div className="flex flex-col items-center gap-3 p-4">
        <img
          src={avatar}
          alt=""
          className="h-24 w-24 rounded-full object-cover"
        />

        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;

            const r = new FileReader();
            r.onload = () => setAvatar(String(r.result || ''));
            r.readAsDataURL(f);
          }}
        />

        <button
          onClick={() => ref.current?.click()}
          className="text-sm font-semibold text-blue-500"
        >
          تغيير صورة الحساب
        </button>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="اسم الحساب"
          className={`w-full rounded-xl border p-3 ${border} ${bg} ${text}`}
        />

        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          rows={3}
          placeholder="النبذة التعريفية"
          className={`w-full rounded-xl border p-3 ${border} ${bg} ${text}`}
        />
      </div>
    </div>
  );
}
