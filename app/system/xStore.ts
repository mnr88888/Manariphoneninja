import type { NinjaCampaign, NinjaProfile } from './SystemContext';
import { readStore, writeStore } from './storage';

/** Account identity is stable even when its display name or handle is edited. */
export const X_SELF_ID = 'x-account-self';
export const X_POSTS_KEY = 'x-posts-v2';
export const X_POST_TARGET_PREFIX = 'x-post:';
const HASHTAG = '#رمضان_مع_نينجا_احلى';
const MIN = 60000;
const HOUR = 60 * MIN;

export interface XPost {
  id: string;
  ownerId: string;
  source?: 'campaign';
  author: string;
  username: string;
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

function seed(post: Pick<XPost, 'id' | 'author' | 'username' | 'avatar' | 'text'> & Partial<XPost>): XPost {
  return {
    ownerId: `x-account-${post.username}`, likes: 0, liked: false,
    reposts: 0, reposted: false, replies: 0, views: 1, bookmarked: false,
    timestamp: Date.now(), ...post,
  };
}

const ORIGINAL_POSTS: XPost[] = [
  seed({ id: 'x1', ownerId: X_SELF_ID, author: 'Ninja', username: 'ninja', avatar: '/ninja.webp', verified: true,
    text: `سفرة الإفطار جاهزة قبل الأذان 🍽️ حمص ومتبّل وأجبان وزيتون مع خبز عربي طازج.\nخصم ٢٠٪ بكود RAMADAN20\n${HASHTAG} #سفرة_رمضان`,
    image: '/ninja-images/bundles/bundle-iftar.jpg', likes: 4821, reposts: 932, replies: 214, views: 182000, timestamp: Date.now() - 25 * MIN }),
  seed({ id: 'x2', author: 'أحمد العتيبي', username: 'ahmed_otebi', avatar: '#FF3B30',
    text: `أول يوم رمضان ومقاضي السفرة وصلتني بعشر دقايق 👌 الله يبارك لهم\n${HASHTAG} #مقاضي_رمضان`,
    likes: 634, reposts: 58, replies: 41, views: 12400, timestamp: Date.now() - 50 * MIN }),
  seed({ id: 'x3', author: 'نورة القحطاني', username: 'noura_q', avatar: '#007AFF',
    text: 'القطايف بالقشطة والمكسرات… ما تكتمل السفرة بدونها 🥞🌙\n#رمضان_كريم #حلويات_رمضان',
    image: '/ninja-images/products/p-q1.jpg', likes: 1892, reposts: 320, replies: 76, views: 45300, timestamp: Date.now() - 2 * HOUR }),
  seed({ id: 'x4', ownerId: X_SELF_ID, author: 'Ninja', username: 'ninja', avatar: '/ninja.webp', verified: true,
    text: `زيّنوا بيوتكم بفوانيس رمضان المضيئة ✨ توصيل خلال دقائق.\n#رمضان_كريم ${HASHTAG}`,
    image: '/ninja-images/products/p-h4.jpg', likes: 2310, reposts: 405, replies: 98, views: 74100, timestamp: Date.now() - 3 * HOUR }),
  seed({ id: 'x5', author: 'محمد سالم', username: 'moh_salem', avatar: '#34C759',
    text: 'التمر أول ما نفطر عليه، وجودة تمر القصيم ما لها مثيل 🌴\n#تمر_رمضان #سفرة_رمضان',
    image: '/ninja-images/products/p-c1.jpg', likes: 487, reposts: 33, replies: 12, views: 9800, timestamp: Date.now() - 5 * HOUR }),
  seed({ id: 'x6', author: 'سارة الحربي', username: 'sara_h', avatar: '#FF2D55',
    text: 'سحور خفيف يعينك على الصيام: فول، لبن، وملعقة عسل سدر 🍯\n#سحور_رمضان #اجواء_رمضان',
    image: '/ninja-images/products/p-su6.jpg', likes: 905, reposts: 112, replies: 27, views: 21700, timestamp: Date.now() - 8 * HOUR }),
  seed({ id: 'x7', author: 'خالد المطيري', username: 'khaled_m', avatar: '#5856D6',
    text: 'كنافة بالقشطة بعد التراويح؟ أكيد 😋\n#اجواء_رمضان #حلويات_رمضان',
    image: '/ninja-images/products/p-s3.jpg', likes: 321, reposts: 19, replies: 8, views: 6200, timestamp: Date.now() - 11 * HOUR }),
];

const EVERYDAY_DATA: Array<[string, string, string, string]> = [
  ['ريم الدوسري', 'reem_d', '#00A7A0', 'صحيت قبل المنبه بخمس دقايق وحسيت إني أنجزت أهم شيء اليوم. صباح الخير!'],
  ['أحمد العتيبي', 'ahmed_otebi', '#E76A52', 'وش القهوة اللي ترجعون لها مهما جربتوا أماكن جديدة؟ أنا للحين مع قهوة البيت.'],
  ['نورة القحطاني', 'noura_q', '#6089BD', '@ahmed_otebi قهوة البيت ومعها سوالف أمي، ما فيه مقارنة أصلاً.'],
  ['سارة الحربي', 'sara_h', '#BC769C', 'خلصت أول فصل من الكتاب اللي له شهر على مكتبي. البداية كانت أصعب من القراءة نفسها.'],
  ['خالد المطيري', 'khaled_m', '#877CB1', 'قلت بطلع أمشي عشر دقايق، رجعت بعد ساعة. الجو اليوم ما يتفوت. #مشي'],
  ['عبدالله الشمري', 'abdullah_s', '#B28662', 'فيه أحد مثلي ينسى وين وقف السيارة ويقعد يمشي بثقة كأنه عارف؟'],
  ['جود صالح', 'jood_s', '#B87B66', 'رتبت سطح المكتب وأخيرًا شفت الخلفية. الملفات الحين كلها في مجلد اسمه ترتيب جديد.'],
  ['لينا أحمد', 'lina_a', '#599B89', '@jood_s عندي نفس المجلد بس اسمه مهم جدًا، وله سنتين ما فتحته.'],
  ['محمد سالم', 'moh_salem', '#64855D', 'أبوي أرسل لي صورة نبتته الجديدة ثلاث مرات اليوم. خلاص صارت فرد من العائلة.'],
  ['هند يوسف', 'hind_y', '#B7839B', 'جربت وصفة مكرونة من غير مقادير دقيقة وطلعت حلوة. المشكلة ما أعرف أعيدها.'],
  ['دانة فهد', 'dana_f', '#5E94A8', 'اقتراح مسلسل خفيف للحلقة وقت العشاء؟ أبي شيء ما يحتاج دفتر عشان أفهم الشخصيات.'],
  ['ريم الدوسري', 'reem_d', '#00A7A0', '@dana_f إذا لقيتي قولي لي، آخر مسلسل تابعته خلاني أراجع شجرة العائلة.'],
  ['ماجد ناصر', 'majed_n', '#8B8A68', 'المشوار اللي تقول عنه خمس دقايق دائمًا يطلع نصف ساعة. خصوصًا إذا وقفت عند المخبز.'],
  ['نورة القحطاني', 'noura_q', '#6089BD', 'ريحة المطر من الشباك، وكوب شاي، ولا موعد مستعجل. يوم بسيط وحلو. #أجواء_الرياض'],
  ['سارة الحربي', 'sara_h', '#BC769C', 'من الأشياء اللي تسعدني: صديقة تتذكر سالفة صغيرة قلتها من أسبوع وتسألني عنها.'],
  ['تركي عمر', 'turki_o', '#6387A7', 'طلعنا نلعب كورة بعد فترة طويلة. لياقتي تقول كفاية، حماسي يقول مباراة ثانية. #كورة'],
  ['بدر العبدالله', 'badr_a', '#8C7DAD', '@turki_o أهم شيء بكرة تقدر تطلع الدرج، المباراة الثانية تنتظر.'],
  ['لينا أحمد', 'lina_a', '#599B89', 'سويت قائمة للمقاضي ونسيتها في البيت. رجعت بكل شيء إلا اللي كاتبته.'],
  ['هند يوسف', 'hind_y', '#B7839B', 'وش وجبتكم السريعة إذا رجعتوا تعبانين؟ أنا بيض وخبز، ثابتة على المبدأ.'],
  ['أحمد العتيبي', 'ahmed_otebi', '#E76A52', '@hind_y نفس الشيء، بس أحط جبن وأعتبرها وصفة خاصة.'],
  ['جود صالح', 'jood_s', '#B87B66', 'وصلت المحاضرة بدري لأول مرة، طلع الدكتور معتذر اليوم. نحتسب المشوار تجربة.'],
  ['فهد راشد', 'fahad_r', '#9C8064', 'اكتشفت شارع هادي جنب البيت وأنا لي ثلاث سنين هنا. أحيانًا التغيير بس لفة يمين.'],
  ['دانة فهد', 'dana_f', '#5E94A8', 'كنت بشتري هدية بسيطة، طلعت بهدية وكيس لنفسي. توازن في العلاقات.'],
  ['محمد سالم', 'moh_salem', '#64855D', 'قعدة الأهل بعد العشاء وكل واحد يعيد نفس السالفة، ومع ذلك نضحك كل مرة.'],
  ['بدر العبدالله', 'badr_a', '#8C7DAD', 'توصية بودكاست للطريق؟ أحب الحلقات اللي تحس فيها إنك جالس مع أصحابك. #بودكاست'],
  ['ريم الدوسري', 'reem_d', '#00A7A0', 'ألغيت كل خطط الليلة عشان أرتاح، والحين جالسة أخطط لبكرة. المخ ما يعرف إجازة.'],
  ['نورة القحطاني', 'noura_q', '#6089BD', 'أمي تقول الشاي ما يضبط إلا في إبريقها القديم. بعد تجارب كثيرة أعلن استسلامي، معها حق.'],
  ['خالد المطيري', 'khaled_m', '#877CB1', 'تصوير الغروب بالجوال ما ينصفه، بس هذا ما يمنعني أصوره كل يوم.'],
];

export const EVERYDAY_POSTS: XPost[] = EVERYDAY_DATA.map(([author, username, avatar, text], index) => seed({
  id: `x-everyday-${index + 1}`, author, username, avatar, text,
  likes: 7 + (index * 13) % 94, replies: 1 + index % 8, reposts: index % 4,
  views: 185 + index * 73, timestamp: Date.now() - (index + 1) * 7 * MIN,
}));
export const X_SEED_POSTS = [...EVERYDAY_POSTS, ...ORIGINAL_POSTS];

function migratePost(post: XPost): XPost {
  if (post.ownerId) return post;
  // These are the original own seeds and the old compose-generated IDs. Never infer ownership from body/handle.
  const own = post.id === 'x1' || post.id === 'x4' || post.id === 'campaign' || /^u[a-z0-9]+$/.test(post.id);
  return { ...post, ownerId: own ? X_SELF_ID : `x-account-${post.username || post.id}`,
    ...(post.id === 'campaign' ? { source: 'campaign' as const } : {}) };
}

/** Add new feed seeds once, preserving stored edits, interaction counters, and every user post. */
export function ensureXStore(): void {
  if (typeof window === 'undefined') return;
  const stored = readStore<XPost[] | null>(X_POSTS_KEY, null);
  const legacy = readStore<XPost[] | null>('x-posts', null);
  const current = Array.isArray(stored) ? stored : Array.isArray(legacy) ? legacy : X_SEED_POSTS;
  let next = current.map(migratePost);
  if (Array.isArray(legacy) && Array.isArray(stored)) {
    const ids = new Set(next.map((p) => p.id));
    next = [...next, ...legacy.filter((p) => !ids.has(p.id)).map(migratePost)];
  }
  const ids = new Set(next.map((p) => p.id));
  next = [...next, ...EVERYDAY_POSTS.filter((p) => !ids.has(p.id))];
  const campaign = readStore<NinjaCampaign | null>('ninja-campaign', null);
  if (campaign?.status === 'published') {
    const profile = readStore<NinjaProfile>('ninja-profile', { name: 'Ninja', username: 'ninja', avatar: '/ninja.webp', bio: '', followers: 128000, following: 42 });
    const existing = next.find((p) => p.id === 'campaign');
    const campaignPost = seed({ ...existing, id: 'campaign', ownerId: X_SELF_ID, source: 'campaign',
      author: profile.name, username: profile.username, avatar: profile.avatar, verified: true,
      text: `${campaign.title || ''}\n${campaign.description || ''}\n${HASHTAG}`.trim(),
      image: campaign.image || undefined, timestamp: campaign.updatedAt || existing?.timestamp || Date.now() });
    next = [campaignPost, ...next.filter((p) => p.id !== 'campaign')];
  }
  if (!Array.isArray(stored) || JSON.stringify(next) !== JSON.stringify(stored)) writeStore(X_POSTS_KEY, next);
}

export function readXPosts(): XPost[] {
  return readStore<XPost[]>(X_POSTS_KEY, X_SEED_POSTS);
}
export function readXPost(postId: string): XPost | undefined {
  return readXPosts().find((p) => p.id === postId);
}
export function isOwnXPost(post: XPost): boolean {
  return post.ownerId === X_SELF_ID;
}
export function getOwnXPosts(): XPost[] {
  const published = readStore<NinjaCampaign | null>('ninja-campaign', null)?.status === 'published';
  return readXPosts().filter((p) => isOwnXPost(p) && (p.source !== 'campaign' || published));
}
export function xPostTarget(postId: string): string {
  return `${X_POST_TARGET_PREFIX}${postId}`;
}
export function postIdFromTarget(target?: string): string | null {
  return target?.startsWith(X_POST_TARGET_PREFIX) ? target.slice(X_POST_TARGET_PREFIX.length) : null;
}

/** Same persisted record drives both the incoming activity and every mounted X view. */
export function incrementXPostActivity(postId: string, type: 'like' | 'repost'): boolean {
  const posts = readXPosts();
  const post = posts.find((p) => p.id === postId);
  if (!post || !isOwnXPost(post) || !getOwnXPosts().some((p) => p.id === postId)) return false;
  const field = type === 'like' ? 'likes' : 'reposts';
  return writeStore(X_POSTS_KEY, posts.map((p) => p.id === postId ? { ...p, [field]: Math.max(0, p[field]) + 1 } : p));
}
