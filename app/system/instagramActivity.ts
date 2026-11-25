import { readStore, writeStore } from './storage';

export const INSTAGRAM_ACTIVITY_KEY = 'instagram-likes-v1';

/** The account's posts, including its campaign and any saved custom posts. */
export interface InstagramActivityPost {
  id: string;
  timestamp: number;
  likes: number;
  liked: boolean;
}

export interface InstagramLike {
  id: string;
  type: 'like';
  postId: string;
  /** Republishing a campaign reuses its id, but starts a new post revision. */
  postTimestamp: number;
  actor: string;
  avatar: string;
  otherLikes: number;
  timestamp: number;
  read: boolean;
}

export interface InstagramActivityStore {
  version: 1;
  items: InstagramLike[];
  initializedPosts: string[];
}

const EMPTY_STORE: InstagramActivityStore = {
  version: 1,
  items: [],
  initializedPosts: [],
};

const ACTORS = [
  { name: 'نورة', avatar: 'https://i.pravatar.cc/120?img=10' },
  { name: 'ريم', avatar: 'https://i.pravatar.cc/120?img=11' },
  { name: 'جود', avatar: 'https://i.pravatar.cc/120?img=12' },
  { name: 'سارة', avatar: 'https://i.pravatar.cc/120?img=13' },
  { name: 'لينا', avatar: 'https://i.pravatar.cc/120?img=14' },
];

function isLike(value: unknown): value is InstagramLike {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<InstagramLike>;
  return item.type === 'like'
    && typeof item.id === 'string'
    && typeof item.postId === 'string'
    && typeof item.postTimestamp === 'number'
    && typeof item.actor === 'string'
    && typeof item.avatar === 'string'
    && typeof item.otherLikes === 'number'
    && Number.isFinite(item.otherLikes)
    && item.otherLikes >= 0
    && typeof item.timestamp === 'number'
    && Number.isFinite(item.timestamp)
    && typeof item.read === 'boolean';
}

/** Unknown/corrupt schemas are left intact instead of being reset on hydration. */
function writableStore(): InstagramActivityStore | null {
  if (typeof window === 'undefined') return null;
  const stored = readStore<InstagramActivityStore | null>(INSTAGRAM_ACTIVITY_KEY, null);
  if (stored === null) {
    try {
      return window.localStorage.getItem(INSTAGRAM_ACTIVITY_KEY) === null
        ? { ...EMPTY_STORE, items: [], initializedPosts: [] }
        : null;
    } catch {
      return null;
    }
  }
  return stored.version === 1 && Array.isArray(stored.items) && Array.isArray(stored.initializedPosts)
    ? stored
    : null;
}

export function readInstagramActivity(): InstagramActivityStore {
  return writableStore() ?? EMPTY_STORE;
}

function postKey(post: Pick<InstagramActivityPost, 'id' | 'timestamp'>): string {
  return JSON.stringify([post.id, post.timestamp]);
}

/**
 * Represent engagement already present on hydrated account posts, only once.
 * No DM data is migrated, no extra likes are added, and historical likes are read.
 * Zero-like/new campaigns remain empty until they actually have incoming likes.
 */
export function ensureInstagramActivity(posts: InstagramActivityPost[]): void {
  const store = writableStore();
  if (!store) return;
  const initialized = new Set(store.initializedPosts);
  const additions: InstagramLike[] = [];

  for (const post of posts) {
    const key = postKey(post);
    const incomingLikes = Math.max(0, Math.floor(post.likes) - (post.liked ? 1 : 0));
    if (!Number.isFinite(incomingLikes) || incomingLikes === 0 || initialized.has(key)) continue;
    initialized.add(key);
    if (store.items.some((item) => isLike(item) && item.postId === post.id && item.postTimestamp === post.timestamp)) continue;

    const actorIndex = Array.from(post.id).reduce((sum, character) => sum + character.charCodeAt(0), 0) % ACTORS.length;
    const actor = ACTORS[actorIndex];
    additions.push({
      id: `instagram-like-${key}`,
      type: 'like',
      postId: post.id,
      postTimestamp: post.timestamp,
      actor: actor.name,
      avatar: actor.avatar,
      otherLikes: incomingLikes - 1,
      timestamp: Math.min(Date.now(), post.timestamp + 15 * 60000),
      read: true,
    });
  }

  if (additions.length || initialized.size !== store.initializedPosts.length) {
    writeStore(INSTAGRAM_ACTIVITY_KEY, {
      ...store,
      items: [...additions, ...store.items],
      initializedPosts: Array.from(initialized),
    });
  }
}

/** Hide deleted/replaced posts without deleting their saved activity history. */
export function getInstagramLikesForPosts(
  store: InstagramActivityStore,
  posts: Pick<InstagramActivityPost, 'id' | 'timestamp'>[],
): InstagramLike[] {
  const currentPosts = new Set(posts.map(postKey));
  return store.items.filter((item) => isLike(item)
    && currentPosts.has(postKey({ id: item.postId, timestamp: item.postTimestamp })))
    .sort((a, b) => b.timestamp - a.timestamp);
}

export function getInstagramUnread(
  store: InstagramActivityStore = readInstagramActivity(),
  posts?: Pick<InstagramActivityPost, 'id' | 'timestamp'>[],
): number {
  const likes = posts ? getInstagramLikesForPosts(store, posts) : store.items.filter(isLike);
  return likes.filter((item) => !item.read).length;
}

/** Re-read the latest store to preserve likes delivered between React renders. */
export function markInstagramLikesRead(ids: string[]): void {
  const store = writableStore();
  if (!store) return;
  const visibleIds = new Set(ids);
  if (!store.items.some((item) => isLike(item) && !item.read && visibleIds.has(item.id))) return;
  writeStore(INSTAGRAM_ACTIVITY_KEY, {
    ...store,
    items: store.items.map((item) => isLike(item) && visibleIds.has(item.id)
      ? { ...item, read: true }
      : item),
  });
}
