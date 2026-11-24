'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Search,
  ShoppingCart,
  MapPin,
  ChevronLeft,
  Star,
  Plus,
  Minus,
  Trash2,
  Bike,
  Clock,
  User,
  Home,
  Heart,
  Receipt,
  Wallet,
  CreditCard,
  Banknote,
  Check,
  Bell,
  X,
  Store,
  Tag,
  Gift,
  HelpCircle,
  Sparkles,
  Moon,
  Calendar,
} from 'lucide-react';
import {
  usePersistentState,
  uid,
  formatArabicTime,
  toArabicDigits,
  formatRelativeTime,
} from '../shared/utils';
import { useSystem } from '../../system/SystemContext';
import {
  NINJA_CATEGORIES,
  NINJA_BANNERS,
  NINJA_PRODUCTS,
  NINJA_BUNDLES,
  DEFAULT_ADDRESSES,
  SAMPLE_USER,
  RAMADAN_NOTIFICATIONS,
  CAMPAIGN,
  RAMADAN_DATE_ISO,
  FEATURED_IDS,
  getOfferProducts,
  ORDER_STAGES,
  ORDER_STAGES_EN,
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  DISCOUNT_CODES,
  type NinjaProduct,
  type NinjaAddress,
  type NinjaOrder,
  type NinjaBundle,
} from './data';

/* Ninja Ramadan campaign UI — turquoise visual direction based on supplied reference video. */
/* ============================================================
 * Theme + helpers
 * ============================================================ */

const EMB = '#20B8B5'; // Ninja-inspired turquoise
const EMB_DARK = '#087F83';
const GOLD = '#F4D66D';
const GOLD_LIGHT = '#FFF0B3';
const CARD_BG = '#FFFFFF';

/** Bundles behave like products inside cart / details / favorites */
const BUNDLES_AS_PRODUCTS: NinjaProduct[] = NINJA_BUNDLES.map((b: NinjaBundle) => ({
  id: b.id,
  name: b.name,
  description: b.description,
  price: b.price,
  oldPrice: b.oldPrice,
  rating: 4.9,
  category: 'bundles',
  emoji: b.emoji,
  gradient: b.gradient,
  image: b.image,
  store: 'نينجا رمضان',
  eta: 45,
}));

const ALL_ITEMS: NinjaProduct[] = [...NINJA_PRODUCTS, ...BUNDLES_AS_PRODUCTS];

function findItem(id: string): NinjaProduct | undefined {
  return ALL_ITEMS.find((p) => p.id === id);
}

function fmtPrice(p: number): string {
  const s = p % 1 === 0 ? String(p) : p.toFixed(2);
  return toArabicDigits(s);
}

function sar(n: number): string {
  return `${toArabicDigits(n.toFixed(2))} ر.س`;
}

const DELIVERY_SLOTS = [
  { id: 's1', label: 'اليوم · ٤ — ٦ م', note: 'الأسرع' },
  { id: 's2', label: 'اليوم · ٦ — ٨ م', note: '' },
  { id: 's3', label: 'اليوم · ٨ — ١٠ م', note: '' },
  { id: 's4', label: 'غداً · ١٠ ص — ١٢ م', note: 'الأرخص' },
  { id: 's5', label: 'غداً · ٥ — ٧ م', note: '' },
];

/* Subtle Islamic geometric pattern (SVG data URI) */
const PATTERN_URI =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23FFFFFF' stroke-opacity='0.07'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z'/%3E%3Ccircle cx='30' cy='30' r='12'/%3E%3Cpath d='M30 8 L52 30 L30 52 L8 30 Z'/%3E%3C/g%3E%3C/svg%3E\")";

/* ============================================================
 * Small shared pieces
 * ============================================================ */

/** Shows the emoji only when no image exists or the image fails to load. */
function ImageOrEmoji({
  src,
  alt = '',
  emoji,
  imageClassName,
  emojiClassName = '',
  loading = 'lazy',
}: {
  src?: string;
  alt?: string;
  emoji?: string;
  imageClassName: string;
  emojiClassName?: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  if (showImage) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={imageClassName}
        onError={() => setFailedSrc(src || null)}
      />
    );
  }

  return emoji ? <span className={emojiClassName}>{emoji}</span> : null;
}

function ProductImage({
  product,
  size = 'md',
  rounded = 'rounded-xl',
}: {
  product: Pick<NinjaProduct, 'emoji' | 'gradient' | 'image'>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: string;
}) {
  const dims =
    size === 'xl'
      ? 'h-52 text-7xl'
      : size === 'lg'
        ? 'h-44 text-6xl'
        : size === 'sm'
          ? 'h-14 text-2xl'
          : 'h-20 text-3xl';
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-b ${product.gradient} ${dims} ${rounded}`}
    >
      <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
      <ImageOrEmoji
        src={product.image}
        alt={product.emoji}
        emoji={product.emoji}
        imageClassName="absolute inset-0 z-10 h-full w-full object-cover"
        emojiClassName="relative z-0"
      />
    </div>
  );
}

function Stepper({
  qty,
  onInc,
  onDec,
  small = false,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
  small?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 rounded-full font-bold ${small ? 'text-[13px]' : 'text-[15px]'}`}
      style={{ backgroundColor: EMB }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDec();
        }}
        className={`flex items-center justify-center rounded-full text-white active:scale-90 ${small ? 'h-7 w-7' : 'h-9 w-9'}`}
        aria-label="إنقاص"
      >
        <Minus className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={3} />
      </button>
      <span className={`min-w-[20px] text-center text-white`}>{toArabicDigits(qty)}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInc();
        }}
        className={`flex items-center justify-center rounded-full text-white active:scale-90 ${small ? 'h-7 w-7' : 'h-9 w-9'}`}
        aria-label="زيادة"
      >
        <Plus className={small ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={3} />
      </button>
    </div>
  );
}

/** Countdown lives in its own component so its 1s tick never re-renders the whole app. */
function CountdownStrip() {
  const [now, setNow] = useState(Date.now());
  const ramadanTime = useMemo(() => new Date(RAMADAN_DATE_ISO).getTime(), []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, ramadanTime - now);
  const countdown = {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
    passed: diff === 0,
  };

  return (
    <div className="mx-4 mt-4 overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: CARD_BG }}>
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-1.5">
          <Moon className="h-4 w-4" style={{ color: GOLD }} />
          <span className="text-[13px] font-extrabold text-black">العد التنازلي لرمضان</span>
        </div>
        <span className="text-[10px] text-black/40">Ramadan Countdown</span>
      </div>
      {countdown.passed ? (
        <p className="px-4 py-4 text-[15px] font-extrabold" style={{ color: EMB }}>
          رمضان كريم — كل عام وأنتم بخير! 🌙
        </p>
      ) : (
        <div className="flex items-center justify-around px-3 py-3">
          {[
            { v: countdown.days, l: 'يوم' },
            { v: countdown.hours, l: 'ساعة' },
            { v: countdown.mins, l: 'دقيقة' },
            { v: countdown.secs, l: 'ثانية' },
          ].map((c) => (
            <div
              key={c.l}
              className="flex w-16 flex-col items-center rounded-xl py-2"
              style={{ backgroundColor: '#F0FDF4' }}
            >
              <span className="text-[20px] font-black tabular-nums" style={{ color: EMB }}>
                {toArabicDigits(c.v)}
              </span>
              <span className="text-[10px] text-black/50">{c.l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Main app
 * ============================================================ */

type Screen =
  | 'home'
  | 'ramadan-shop'
  | 'category'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'tracking'
  | 'orders'
  | 'favorites'
  | 'addresses'
  | 'rewards'
  | 'support'
  | 'inbox'
  | 'account';

export default function NinjaApp() {
  // ---- persisted state ----
  const [cart, setCart] = usePersistentState<{ productId: string; qty: number }[]>('ninja-cart', []);
  const [favorites, setFavorites] = usePersistentState<string[]>('ninja-favorites', []);
  const [addresses, setAddresses] = usePersistentState<NinjaAddress[]>('ninja-addresses', DEFAULT_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = usePersistentState<string>('ninja-selected-address', DEFAULT_ADDRESSES[0].id);
  const [orders, setOrders] = usePersistentState<NinjaOrder[]>('ninja-orders', []);
  const [recentIds, setRecentIds] = usePersistentState<string[]>('ninja-recent', []);
  const [appliedCode, setAppliedCode] = usePersistentState<string>('ninja-promo', '');
  const [rewards, setRewards] = usePersistentState<number>('ninja-rewards', 120);

  // ---- synced notification inbox (shared with Notification Center) ----
  const {
    notifications: systemNotifications,
    markNotificationRead,
    pendingDeepLink,
    consumeDeepLink,
  } = useSystem();
  const [inboxRead, setInboxRead] = usePersistentState<string[]>('ninja-inbox-read', []);
  const [activeInboxId, setActiveInboxId] = useState<string | null>(null);

  // ---- local UI state ----
  const [screen, setScreen] = useState<Screen>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [slotId, setSlotId] = useState('s1');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) ?? addresses[0];
  const activeItem = activeProductId ? findItem(activeProductId) : undefined;
  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const subtotal = cart.reduce((s, line) => {
    const p = findItem(line.productId);
    return s + (p ? p.price * line.qty : 0);
  }, 0);

  // ---- discount ----
  const appliedDiscount = appliedCode && DISCOUNT_CODES[appliedCode] ? DISCOUNT_CODES[appliedCode] : null;
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const deliveryFee = subtotal === 0 || discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = discountedSubtotal + deliveryFee;

  // ---- scroll to top on navigation ----
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [screen, activeCategoryId, activeProductId]);

  // Source messages: stable ids shared with the system notification store
  const ninjaMessages = useMemo(
    () => RAMADAN_NOTIFICATIONS.map((n, i) => ({ id: `ninja-ramadan-${i}`, ...n })),
    []
  );

  const isInboxRead = useCallback(
    (id: string) =>
      systemNotifications.find((n) => n.id === id)?.read ?? inboxRead.includes(id),
    [systemNotifications, inboxRead]
  );

  const markInboxRead = useCallback(
    (id: string) => {
      setInboxRead((prev) => (prev.includes(id) ? prev : [...prev, id]));
      const sys = systemNotifications.find((n) => n.id === id);
      if (sys && !sys.read) markNotificationRead(sys);
    },
    [systemNotifications, markNotificationRead, setInboxRead]
  );

  const ninjaUnread = ninjaMessages.filter((m) => !isInboxRead(m.id)).length;

  // Deep link: Notification Center tapped a Ninja notification → open it here
  useEffect(() => {
    if (pendingDeepLink && pendingDeepLink.appId === 'ninja') {
      const target = pendingDeepLink.targetId;
      if (target) {
        setActiveInboxId(target);
        markInboxRead(target);
      }
      setScreen('inbox');
      consumeDeepLink();
    }
  }, [pendingDeepLink, consumeDeepLink, markInboxRead]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  // ---- cart ops ----
  const getQty = (productId: string) => cart.find((l) => l.productId === productId)?.qty ?? 0;

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing)
        return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { productId, qty: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) =>
      prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)
    );
  };

  const deleteLine = (productId: string) => setCart((prev) => prev.filter((l) => l.productId !== productId));

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const openProduct = (productId: string) => {
    setActiveProductId(productId);
    setScreen('product');
    setRecentIds((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 10));
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (DISCOUNT_CODES[code]) {
      setAppliedCode(code);
      setPromoMsg(`تم تفعيل ${DISCOUNT_CODES[code].label}!`);
      showToast(`تم تفعيل الكود ${code}`);
    } else {
      setAppliedCode('');
      setPromoMsg('كود الخصم غير صحيح — جرّب RAMADAN20');
    }
    setTimeout(() => setPromoMsg(null), 2500);
  };

  const confirmOrder = () => {
    if (cart.length === 0) return;
    const slot = DELIVERY_SLOTS.find((s) => s.id === slotId);
    const newOrder: NinjaOrder = {
      id: uid(),
      date: Date.now(),
      items: cart.map((l) => {
        const p = findItem(l.productId)!;
        return { productId: p.id, name: p.name, price: p.price, qty: l.qty, emoji: p.emoji, gradient: p.gradient, image: p.image };
      }),
      total,
      address: selectedAddress ? `${selectedAddress.label} — ${selectedAddress.details}` : '',
      payment: paymentMethod === 'cash' ? 'نقداً عند التوصيل' : 'بطاقة (مدى / فيزا)',
      deliverySlot: slot?.label ?? '',
      stage: 0,
      placedAt: Date.now(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedCode('');
    setRewards((prev) => prev + Math.round(total));
    setActiveOrderId(newOrder.id);
    setOrderPlaced(true);
    setScreen('tracking');
  };

  // ---- simulated order progression ----
  useEffect(() => {
    if (!activeOrder || activeOrder.stage >= ORDER_STAGES.length - 1) return;
    const timer = setTimeout(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id ? { ...o, stage: Math.min(o.stage + 1, ORDER_STAGES.length - 1) } : o
        )
      );
    }, 12000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrder?.id, activeOrder?.stage]);

  /* ============================================================
   * Product card
   * ============================================================ */

  const renderProductCard = (product: NinjaProduct) => {
    const qty = getQty(product.id);
    return (
      <button
        onClick={() => openProduct(product.id)}
        className="flex w-full flex-col overflow-hidden rounded-2xl text-right shadow-sm transition active:scale-[0.98]"
        style={{ backgroundColor: CARD_BG }}
      >
        <div className="relative">
          <ProductImage product={product} />
          {product.oldPrice != null && (
            <span
              className="absolute top-2 right-2 z-20 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: '#B91C1C' }}
            >
              وفّر {toArabicDigits(Math.round((1 - product.price / product.oldPrice) * 100))}٪
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className="absolute top-2 left-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="المفضلة"
          >
            <Heart
              className={`h-4 w-4 ${favorites.includes(product.id) ? 'fill-[#B91C1C] text-[#B91C1C]' : 'text-black/40'}`}
            />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-2.5">
          <span className="line-clamp-2 min-h-[36px] text-[13px] font-semibold leading-snug text-black">
            {product.name}
          </span>
          <div className="flex items-center gap-1 text-[11px] text-black/50">
            <Store className="h-3 w-3" />
            <span className="truncate">{product.store}</span>
            <span className="mr-auto flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {toArabicDigits(product.rating)}
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-1">
            <div className="flex flex-col">
              {product.oldPrice != null && (
                <span className="text-[11px] text-black/40 line-through">{fmtPrice(product.oldPrice)}</span>
              )}
              <span className="text-[14px] font-extrabold" style={{ color: EMB }}>
                {fmtPrice(product.price)} <span className="text-[10px] font-medium">ر.س</span>
              </span>
            </div>
            {qty > 0 ? (
              <Stepper qty={qty} small onInc={() => addToCart(product.id)} onDec={() => removeFromCart(product.id)} />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product.id);
                  showToast('تمت الإضافة إلى السلة');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow active:scale-90"
                style={{ backgroundColor: EMB }}
                aria-label="أضف إلى السلة"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </button>
    );
  };

  /* ============================================================
   * Ramadan hero
   * ============================================================ */

  const renderRamadanHero = () => (
    <div className="px-3 pb-2 pt-1" style={{ backgroundColor: '#A9E9E7' }}>
      <div className="flex items-center justify-between px-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-base font-black" style={{ color: EMB_DARK }}>ن</div>
          <div>
            <p className="text-[12px] font-extrabold leading-tight" style={{ color: '#164E52' }}>نينجا رمضان</p>
            <p className="text-[9px] font-semibold" style={{ color: '#397D80' }}>NINJA RAMADAN EDITION</p>
          </div>
        </div>
        <button onClick={() => setScreen('inbox')} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/80" aria-label="الإشعارات">
          <Bell className="h-4 w-4" style={{ color: EMB_DARK }} />
          {ninjaUnread > 0 && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />}
        </button>
      </div>
      <button onClick={() => setSearchOpen(true)} className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-3 text-right shadow-sm">
        <Search className="h-4 w-4 text-black/45" />
        <span className="flex-1 text-[12px] text-black/45">ابحث عن تمر، قطايف، مقاضي رمضان...</span>
      </button>
      <button onClick={() => setScreen('ramadan-shop')} className="relative mt-2 flex h-[106px] w-full items-center justify-between overflow-hidden rounded-xl px-4 text-right text-white shadow-sm" style={{ background: 'linear-gradient(100deg, #159E9F 0%, #53CECA 100%)' }}>
        <div className="absolute -left-4 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="relative z-10 max-w-[68%]">
          <p className="text-[10px] font-bold text-white/90">🌙 رمضان مع نينجا</p>
          <h2 className="mt-1 text-[17px] font-black leading-snug">{CAMPAIGN.headline}</h2>
          <p className="mt-1 text-[10px] text-white/90">تسوّق احتياجات رمضان في مكان واحد</p>
          <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-extrabold" style={{ color: EMB_DARK }}>تسوّق الآن ←</span>
        </div>
        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-5xl">🎁</div>
      </button>
    </div>
  );

  /* ============================================================
   * Bundles
   * ============================================================ */

  const renderBundles = () => (
    <>
      <div className="flex items-center justify-between px-4 pb-2 pt-5">
        <h3 className="flex items-center gap-1.5 text-[16px] font-extrabold text-black">
          <Gift className="h-4 w-4" style={{ color: GOLD }} />
          صناديق رمضان الجاهزة
        </h3>
        <span className="text-[10px] text-black/40">Ramadan Bundles</span>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {NINJA_BUNDLES.map((b) => {
          const qty = getQty(b.id);
          return (
            <div key={b.id} className="overflow-hidden rounded-2xl shadow-sm" style={{ backgroundColor: CARD_BG }}>
              <button onClick={() => openProduct(b.id)} className="relative block w-full text-right active:opacity-80">
                <div className={`relative flex h-24 items-center justify-center bg-gradient-to-b ${b.gradient} text-4xl`}>
                  <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
                  <ImageOrEmoji src={b.image} alt={b.name} emoji={b.emoji} imageClassName="absolute inset-0 z-10 h-full w-full object-cover" emojiClassName="relative z-0" />
                  <span
                    className="absolute top-2 right-2 z-20 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: '#B91C1C' }}
                  >
                    وفّر {toArabicDigits(Math.round((1 - b.price / b.oldPrice) * 100))}٪
                  </span>
                </div>
              </button>
              <div className="p-2.5">
                <span className="line-clamp-1 text-[13px] font-extrabold text-black">{b.name}</span>
                <span className="mt-0.5 line-clamp-2 min-h-[28px] text-[10px] leading-snug text-black/50">
                  {b.description}
                </span>
                <div className="mt-1.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-black/40 line-through">{fmtPrice(b.oldPrice)} ر.س</span>
                    <span className="text-[15px] font-black" style={{ color: EMB }}>
                      {fmtPrice(b.price)} ر.س
                    </span>
                  </div>
                  {qty > 0 ? (
                    <Stepper qty={qty} small onInc={() => addToCart(b.id)} onDec={() => removeFromCart(b.id)} />
                  ) : (
                    <button
                      onClick={() => {
                        addToCart(b.id);
                        showToast('أُضيف صندوق رمضان إلى السلة');
                      }}
                      className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-extrabold text-white active:scale-95"
                      style={{ backgroundColor: EMB }}
                    >
                      <Plus className="h-3 w-3" strokeWidth={3} />
                      أضف
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  /* ============================================================
   * Screens
   * ============================================================ */

  const renderHome = () => {
    const offers = getOfferProducts(NINJA_PRODUCTS).slice(0, 8);
    const featured = FEATURED_IDS.map((id) => findItem(id)!).filter(Boolean);
    const recent = recentIds.map((id) => findItem(id)).filter((p): p is NinjaProduct => Boolean(p));

    return (
      <div className="pb-4">
        {renderRamadanHero()}

        {/* Campaign banners */}
        <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {NINJA_BANNERS.map((b) => (
            <div
              key={b.id}
              className={`relative flex h-24 w-[260px] shrink-0 flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-l ${b.gradient} px-4 text-white shadow`}
            >
              <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
              {b.image && <img src={b.image} alt="" loading="lazy" className="absolute inset-0 z-10 h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
              <div className="absolute inset-0 bg-black/35" />
              <span className="relative z-10 text-[15px] font-extrabold leading-snug">{b.title}</span>
              <span className="relative z-10 mt-0.5 text-[11px] text-white/85">{b.subtitle}</span>
              <span className="relative z-10 mt-1.5 w-fit rounded-full border border-white/40 px-2 py-0.5 text-[10px] font-bold">
                كود: {b.code}
              </span>
            </div>
          ))}
        </div>

        <CountdownStrip />

        {/* Categories */}
        <div className="flex items-center justify-between px-4 pb-2 pt-5">
          <h3 className="text-[16px] font-extrabold text-black">تسوق رمضان</h3>
          <span className="text-[10px] text-black/40">Ramadan Categories</span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 px-3">
          {NINJA_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategoryId(c.id);
                setScreen('category');
              }}
              className="relative flex h-[126px] flex-col justify-between overflow-hidden rounded-xl bg-white p-2 text-right shadow-sm active:scale-[0.98]"
            >
              <span className="relative z-20 text-[11px] font-extrabold leading-tight text-[#263638]">{c.name}</span>
              <div className={`absolute inset-x-0 bottom-0 h-[88px] bg-gradient-to-b ${c.gradient}`} />
              <ImageOrEmoji src={c.image} alt={c.name} emoji={c.emoji} imageClassName="absolute inset-x-0 bottom-0 z-10 h-[88px] w-full object-cover" emojiClassName="relative z-10 self-center text-4xl" />
            </button>
          ))}
        </div>

        {renderBundles()}

        {/* Special offers */}
        <div className="flex items-center justify-between px-4 pb-2 pt-5">
          <h3 className="text-[16px] font-extrabold text-black">عروض رمضان المحدودة</h3>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold"
            style={{ backgroundColor: GOLD, color: EMB_DARK }}
          >
            RAMADAN20
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {offers.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p.id)}
              className="flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl text-right shadow-sm active:scale-[0.98]"
              style={{ backgroundColor: CARD_BG }}
            >
              <ProductImage product={p} rounded="rounded-none" />
              <div className="p-2.5">
                <span className="line-clamp-1 text-[13px] font-semibold text-black">{p.name}</span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[14px] font-extrabold" style={{ color: EMB }}>
                    {fmtPrice(p.price)} ر.س
                  </span>
                  <span className="text-[11px] text-black/40 line-through">{fmtPrice(p.oldPrice!)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Popular products */}
        <div className="flex items-center justify-between px-4 pb-2 pt-5">
          <h3 className="text-[16px] font-extrabold text-black">الأكثر طلباً في رمضان</h3>
          <span className="text-[10px] text-black/40">Popular</span>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4">
          {featured.map((p) => (
            <React.Fragment key={p.id}>{renderProductCard(p)}</React.Fragment>
          ))}
        </div>

        {/* Recently viewed */}
        {recent.length > 0 && (
          <>
            <h3 className="px-4 pb-2 pt-5 text-[16px] font-extrabold text-black">شوهدت مؤخراً</h3>
            <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              {recent.map((p) => (
                <button
                  key={p.id}
                  onClick={() => openProduct(p.id)}
                  className="flex w-28 shrink-0 flex-col items-center gap-1.5 rounded-2xl p-2.5 shadow-sm active:scale-95"
                  style={{ backgroundColor: CARD_BG }}
                >
                  <ProductImage product={p} size="sm" rounded="rounded-full" />
                  <span className="line-clamp-1 text-[11px] font-medium text-black">{p.name}</span>
                  <span className="text-[12px] font-bold" style={{ color: EMB }}>
                    {fmtPrice(p.price)} ر.س
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ---- Inbox (synced with Notification Center) ----
  const renderInbox = () => {
    const active = ninjaMessages.find((m) => m.id === activeInboxId);
    if (active) {
      return (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div
              className="relative overflow-hidden rounded-3xl p-5"
              style={{ background: `linear-gradient(135deg, ${EMB} 0%, ${EMB_DARK} 100%)` }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
              <div className="relative flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-black"
                  style={{ backgroundColor: GOLD, color: EMB_DARK }}
                >
                  ن
                </div>
                <div className="flex-1">
                  <p className="text-[16px] font-black text-white">{active.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/85">{active.body}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between px-1">
              <span className="text-[12px] text-black/40">
                {formatRelativeTime(
                  systemNotifications.find((n) => n.id === active.id)?.timestamp ?? Date.now()
                )}
              </span>
              <span className="text-[11px] font-bold" style={{ color: EMB }}>
                {isInboxRead(active.id) ? 'مقروءة' : 'جديدة'}
              </span>
            </div>
            <button
              onClick={() => setScreen('ramadan-shop')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[15px] font-extrabold text-white active:scale-[0.98]"
              style={{ backgroundColor: EMB }}
            >
              <Sparkles className="h-4 w-4" />
              تسوق عروض رمضان الآن
            </button>
          </div>
          <div className="border-t px-4 pb-6 pt-3" style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
            <button
              onClick={() => setActiveInboxId(null)}
              className="w-full rounded-full py-3 text-[15px] font-extrabold active:scale-[0.98]"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              كل الرسائل
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-4">
        {ninjaMessages.map((m) => {
          const sys = systemNotifications.find((n) => n.id === m.id);
          const ts = sys?.timestamp ?? Date.now();
          const read = isInboxRead(m.id);
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveInboxId(m.id);
                markInboxRead(m.id);
              }}
              className="relative mb-2.5 flex w-full items-start gap-3 overflow-hidden rounded-2xl p-4 text-right shadow-sm active:scale-[0.98]"
              style={{ backgroundColor: CARD_BG }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-black"
                style={{ backgroundColor: GOLD, color: EMB_DARK }}
              >
                ن
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-[14px] font-extrabold ${read ? 'text-black/60' : 'text-black'}`}>
                    {m.title}
                  </span>
                  <span className="shrink-0 text-[10px] text-black/40">{formatRelativeTime(ts)}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-black/60">{m.body}</p>
              </div>
              {!read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: '#B91C1C' }} />}
            </button>
          );
        })}
        <p className="pt-2 text-center text-[11px] text-black/35">
          الرسائل محفوظة هنا حتى بعد مسح إشعارات النظام
        </p>
      </div>
    );
  };

  // ---- Ramadan shop (CTA target) ----
  const renderRamadanShop = () => {
    const ramadanItems = ALL_ITEMS.filter((p) => p.oldPrice != null);
    return (
      <div className="pb-4">
        <div
          className="relative flex flex-col items-center overflow-hidden px-4 py-5 text-center"
          style={{ background: `linear-gradient(160deg, ${EMB} 0%, ${EMB_DARK} 100%)` }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
          <span className="relative text-3xl">🌙 ✨</span>
          <h2 className="relative mt-1 text-[19px] font-black text-white">{CAMPAIGN.headline}</h2>
          <p className="relative text-[11px] text-white/75">{CAMPAIGN.nameEn}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
          {ramadanItems.map((p) => (
            <React.Fragment key={p.id}>{renderProductCard(p)}</React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // ---- Category listing ----
  const renderCategory = () => {
    const category = NINJA_CATEGORIES.find((c) => c.id === activeCategoryId);
    const products = NINJA_PRODUCTS.filter((p) => p.category === activeCategoryId);
    return (
      <div className="pb-4">
        <div className="relative flex items-center gap-3 overflow-hidden px-4 py-4" style={{ backgroundColor: EMB }}>
          <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-3xl">
            <ImageOrEmoji src={category?.image} alt={category?.name || ''} emoji={category?.emoji} imageClassName="absolute inset-0 z-10 h-full w-full object-cover" emojiClassName="relative" />
          </div>
          <div className="relative">
            <h2 className="text-[18px] font-extrabold text-white">{category?.name}</h2>
            <p className="text-[11px] text-white/70">{category?.nameEn}</p>
            <p className="text-[12px] text-white/70">{toArabicDigits(products.length)} منتج جاهز للتوصيل</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <Clock className="h-4 w-4 text-black/40" />
          <span className="text-[12px] text-black/60">
            التوصيل خلال {toArabicDigits(Math.min(...products.map((p) => p.eta)))} دقيقة
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4">
          {products.map((p) => (
            <React.Fragment key={p.id}>{renderProductCard(p)}</React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // ---- Product details ----
  const renderProduct = () => {
    if (!activeItem) return null;
    const p = activeItem;
    const qty = getQty(p.id);
    return (
      <div className="flex h-full flex-col">
        <div className="relative flex h-56 items-center justify-center">
          <div className={`absolute inset-0 bg-gradient-to-b ${p.gradient}`} />
          <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
          <ImageOrEmoji src={p.image} alt={p.name} emoji={p.emoji} imageClassName="absolute inset-0 z-10 h-full w-full object-cover" emojiClassName="relative z-0 text-8xl" />
          <button
            onClick={() => setScreen('home')}
            className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="رجوع"
          >
            <ChevronLeft className="h-5 w-5 rotate-180 text-black" />
          </button>
          <button
            onClick={() => toggleFavorite(p.id)}
            className="absolute top-3 left-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow"
            aria-label="المفضلة"
          >
            <Heart
              className={`h-5 w-5 ${favorites.includes(p.id) ? 'fill-[#B91C1C] text-[#B91C1C]' : 'text-black/50'}`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto rounded-t-3xl px-4 pt-4" style={{ backgroundColor: CARD_BG }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-[20px] font-black text-black">{p.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-[12px] text-black/50">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {toArabicDigits(p.rating)}
                </span>
                <span>·</span>
                <span>{p.store}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <Bike className="h-3.5 w-3.5" />
                  {toArabicDigits(p.eta)} دقيقة
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              {p.oldPrice != null && (
                <span className="text-[13px] text-black/40 line-through">{fmtPrice(p.oldPrice)} ر.س</span>
              )}
              <span className="text-[22px] font-black" style={{ color: EMB }}>
                {fmtPrice(p.price)} <span className="text-[13px]">ر.س</span>
              </span>
            </div>
          </div>

          <div className="mt-3 rounded-2xl p-3.5" style={{ backgroundColor: '#F0FDF4' }}>
            <h4 className="text-[13px] font-extrabold text-black">الوصف</h4>
            <p className="mt-1 text-[14px] leading-relaxed text-black/60">{p.description}</p>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-2xl border p-3.5" style={{ borderColor: `${EMB}22` }}>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ backgroundColor: EMB }}>
                <Bike className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-black">توصيل سريع في رمضان</p>
                <p className="text-[11px] text-black/50">خلال {toArabicDigits(p.eta)} دقيقة تقريباً</p>
              </div>
            </div>
            <span className="text-[12px] font-bold" style={{ color: '#16A34A' }}>
              {discountedSubtotal >= FREE_DELIVERY_THRESHOLD ? 'مجاناً' : sar(DELIVERY_FEE)}
            </span>
          </div>
          <div className="h-28" />
        </div>

        <div className="absolute bottom-0 right-0 left-0 flex items-center justify-between gap-3 border-t px-4 pb-6 pt-3 backdrop-blur-xl"
          style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.95)' }}
        >
          {qty > 0 ? (
            <Stepper qty={qty} onInc={() => addToCart(p.id)} onDec={() => removeFromCart(p.id)} />
          ) : (
            <div className="h-9" />
          )}
          <button
            onClick={() => {
              if (qty === 0) {
                addToCart(p.id);
                showToast('تمت الإضافة إلى السلة');
              }
              setScreen('cart');
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[15px] font-extrabold text-white shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: EMB }}
          >
            <ShoppingCart className="h-4 w-4" />
            {qty > 0 ? 'اذهب إلى السلة' : 'أضف إلى السلة'}
          </button>
        </div>
      </div>
    );
  };

  // ---- Cart ----
  const renderCart = () => {
    if (cart.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/5">
            <ShoppingCart className="h-10 w-10 text-black/25" />
          </div>
          <h2 className="mt-4 text-[17px] font-bold text-black/70">سلتك فارغة</h2>
          <p className="mt-1 text-[13px] text-black/40">جهز مستلزمات رمضان وأضفها هنا</p>
          <button
            onClick={() => setScreen('ramadan-shop')}
            className="mt-5 rounded-full px-8 py-2.5 text-[14px] font-extrabold text-white"
            style={{ backgroundColor: EMB }}
          >
            تسوق مستلزمات رمضان
          </button>
        </div>
      );
    }

    const remaining = FREE_DELIVERY_THRESHOLD - discountedSubtotal;
    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {remaining > 0 ? (
            <div className="mt-3 rounded-2xl p-3" style={{ backgroundColor: '#FEF9C3' }}>
              <p className="text-[12px] font-semibold text-amber-800">
                أضف بقيمة {sar(remaining)} للحصول على توصيل مجاني
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (discountedSubtotal / FREE_DELIVERY_THRESHOLD) * 100)}%`, backgroundColor: EMB }}
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-green-50 p-3">
              <Bike className="h-4 w-4 text-green-600" />
              <p className="text-[12px] font-semibold text-green-700">التوصيل مجاني لطلبك — رمضانك أحلى مع نينجا!</p>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2.5">
            {cart.map((line) => {
              const p = findItem(line.productId);
              if (!p) return null;
              return (
                <div key={line.productId} className="flex items-center gap-3 rounded-2xl p-2.5 shadow-sm" style={{ backgroundColor: CARD_BG }}>
                  <ProductImage product={p} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-1 text-[14px] font-semibold text-black">{p.name}</span>
                    <span className="text-[12px] text-black/50">
                      {fmtPrice(p.price)} ر.س × {toArabicDigits(line.qty)} ={' '}
                      <span className="font-bold" style={{ color: EMB }}>
                        {fmtPrice(p.price * line.qty)} ر.س
                      </span>
                    </span>
                    <button
                      onClick={() => deleteLine(line.productId)}
                      className="mt-1 flex items-center gap-1 text-[11px] text-red-500 active:opacity-60"
                    >
                      <Trash2 className="h-3 w-3" />
                      إزالة
                    </button>
                  </div>
                  <Stepper qty={line.qty} small onInc={() => addToCart(line.productId)} onDec={() => removeFromCart(line.productId)} />
                </div>
              );
            })}
          </div>

          {/* Discount code */}
          <div className="mt-4 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
            <div className="flex items-center gap-2 pb-2">
              <Tag className="h-4 w-4" style={{ color: GOLD }} />
              <span className="text-[14px] font-extrabold text-black">كود الخصم</span>
            </div>
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="مثال: RAMADAN20"
                className="flex-1 rounded-xl bg-black/5 px-3 py-2.5 text-[14px] text-black placeholder-black/40 outline-none"
                dir="ltr"
              />
              <button
                onClick={applyPromo}
                className="rounded-xl px-5 text-[14px] font-extrabold text-white active:opacity-80"
                style={{ backgroundColor: EMB }}
              >
                تفعيل
              </button>
            </div>
            {promoMsg && (
              <p className="mt-2 text-[12px] font-bold" style={{ color: appliedDiscount ? '#16A34A' : '#B91C1C' }}>
                {promoMsg}
              </p>
            )}
            {appliedDiscount && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2">
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-green-700">
                  <Check className="h-3.5 w-3.5" />
                  {appliedDiscount.label} مفعّل ({appliedCode})
                </span>
                <button onClick={() => setAppliedCode('')} className="text-[11px] text-red-500">
                  إزالة
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-3 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between text-black/60">
                <span>المجموع الفرعي</span>
                <span>{sar(subtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between font-semibold text-green-600">
                  <span>خصم {appliedCode} ({toArabicDigits(appliedDiscount.percent)}٪)</span>
                  <span>- {sar(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-black/60">
                <span>رسوم التوصيل</span>
                <span>{deliveryFee === 0 ? 'مجاناً' : sar(deliveryFee)}</span>
              </div>
              <div className="my-1 border-t border-dashed border-black/10" />
              <div className="flex justify-between text-[16px] font-black text-black">
                <span>الإجمالي</span>
                <span style={{ color: EMB }}>{sar(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t px-4 pb-6 pt-3 backdrop-blur-xl" style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <button
            onClick={() => setScreen('checkout')}
            className="flex w-full items-center justify-between rounded-full px-5 py-3.5 text-[15px] font-extrabold text-white shadow-lg active:scale-[0.98]"
            style={{ backgroundColor: EMB }}
          >
            <span>متابعة الدفع</span>
            <span>{sar(total)}</span>
          </button>
        </div>
      </div>
    );
  };

  // ---- Checkout ----
  const renderCheckout = () => (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Address */}
        <h3 className="pb-2 pt-3 text-[15px] font-extrabold text-black">عنوان التوصيل</h3>
        <button
          onClick={() => setShowAddressPicker(true)}
          className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-right shadow-sm active:opacity-80"
          style={{ backgroundColor: CARD_BG }}
        >
          <span className="text-2xl">{selectedAddress?.icon}</span>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-black">{selectedAddress?.label}</p>
            <p className="line-clamp-1 text-[12px] text-black/50">{selectedAddress?.details}</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-black/30" />
        </button>

        {/* Delivery time */}
        <h3 className="pb-2 pt-4 text-[15px] font-extrabold text-black">وقت التوصيل</h3>
        <div className="flex flex-col gap-2">
          {DELIVERY_SLOTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSlotId(s.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-right transition ${s.id === slotId ? '' : 'border-transparent'}`}
              style={{
                backgroundColor: CARD_BG,
                borderColor: s.id === slotId ? EMB : 'rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: s.id === slotId ? EMB : '#9CA3AF' }}
              >
                <Calendar className="h-4 w-4" />
              </div>
              <span className="flex-1 text-[14px] font-bold text-black">{s.label}</span>
              {s.note && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ backgroundColor: GOLD, color: EMB_DARK }}>
                  {s.note}
                </span>
              )}
              {s.id === slotId && <Check className="h-5 w-5" style={{ color: EMB }} />}
            </button>
          ))}
        </div>

        {/* Payment */}
        <h3 className="pb-2 pt-4 text-[15px] font-extrabold text-black">طريقة الدفع</h3>
        <div className="flex flex-col gap-2">
          {(
            [
              { id: 'cash' as const, icon: <Banknote className="h-4 w-4" />, label: 'الدفع نقداً', note: 'ادفع نقداً عند استلام طلبك' },
              { id: 'card' as const, icon: <CreditCard className="h-4 w-4" />, label: 'بطاقة (مدى / فيزا)', note: 'محاكاة دفع — لن يتم خصم أي مبلغ' },
            ]
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-right transition ${paymentMethod === m.id ? '' : 'border-black/10'}`}
              style={{ backgroundColor: CARD_BG, borderColor: paymentMethod === m.id ? EMB : undefined }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: paymentMethod === m.id ? EMB : '#9CA3AF' }}
              >
                {m.icon}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-black">{m.label}</p>
                <p className="text-[12px] text-black/50">{m.note}</p>
              </div>
              {paymentMethod === m.id && <Check className="h-5 w-5" style={{ color: EMB }} />}
            </button>
          ))}
        </div>

        {/* Summary */}
        <h3 className="pb-2 pt-4 text-[15px] font-extrabold text-black">ملخص الطلب</h3>
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
          <div className="flex flex-col gap-2">
            {cart.map((line) => {
              const p = findItem(line.productId);
              if (!p) return null;
              return (
                <div key={line.productId} className="flex items-center gap-2 text-[13px]">
                  <ProductImage product={p} size="sm" />
                  <span className="flex-1 truncate text-black/70">
                    {p.name} <span className="text-black/40">× {toArabicDigits(line.qty)}</span>
                  </span>
                  <span className="font-semibold text-black">{fmtPrice(p.price * line.qty)} ر.س</span>
                </div>
              );
            })}
          </div>
          <div className="my-2 border-t border-dashed border-black/10" />
          <div className="flex justify-between text-[13px] text-black/60">
            <span>المجموع الفرعي</span>
            <span>{sar(subtotal)}</span>
          </div>
          {appliedDiscount && (
            <div className="mt-1 flex justify-between text-[13px] font-semibold text-green-600">
              <span>خصم {appliedCode}</span>
              <span>- {sar(discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between text-[13px] text-black/60">
            <span>رسوم التوصيل</span>
            <span>{deliveryFee === 0 ? 'مجاناً' : sar(deliveryFee)}</span>
          </div>
          <div className="mt-2 flex justify-between text-[15px] font-black text-black">
            <span>الإجمالي</span>
            <span style={{ color: EMB }}>{sar(total)}</span>
          </div>
        </div>
        <div className="h-24" />
      </div>

      <div className="border-t px-4 pb-6 pt-3 backdrop-blur-xl" style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
        <button
          onClick={confirmOrder}
          disabled={cart.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-extrabold text-white shadow-lg active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: EMB }}
        >
          <Wallet className="h-4 w-4" />
          تأكيد الطلب — {sar(total)}
        </button>
      </div>
    </div>
  );

  // ---- Tracking (4 stages) ----
  const renderTracking = () => {
    if (!activeOrder) return null;
    const stage = Math.max(0, activeOrder.stage);
    const eta = Math.max(2, (ORDER_STAGES.length - 1 - stage) * 10 + 5);

    return (
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div
            className="relative mt-3 overflow-hidden rounded-3xl p-5 text-center text-white"
            style={{ background: `linear-gradient(160deg, ${EMB} 0%, ${EMB_DARK} 100%)` }}
          >
            <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
              <Bike className="h-8 w-8" />
            </div>
            <h2 className="relative mt-3 text-[19px] font-black">{ORDER_STAGES[stage]}</h2>
            <p className="relative text-[10px] tracking-wide text-white/50" dir="ltr">
              {ORDER_STAGES_EN[stage]}
            </p>
            {stage < ORDER_STAGES.length - 1 ? (
              <p className="relative mt-1 text-[13px] text-white/75">
                الوصول المتوقع خلال {toArabicDigits(eta)} دقائق تقريباً
              </p>
            ) : (
              <p className="relative mt-1 text-[13px] text-white/85">رمضان كريم — تم التوصيل بنجاح! 🌙</p>
            )}
            <p className="relative mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
              طلب رقم {toArabicDigits(activeOrder.id.slice(-5).toUpperCase())}
            </p>
          </div>

          {stage >= 2 && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl p-3.5 shadow-sm" style={{ backgroundColor: CARD_BG }}>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-black"
                style={{ backgroundColor: GOLD, color: EMB_DARK }}
              >
                س
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-black">سالم ن.</p>
                <p className="text-[12px] text-black/50">سائق النينجا · دراجة · لوحة ٤٥٢١ أ ب</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: EMB }}>
                <span>📞</span>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
            {ORDER_STAGES.map((s, i) => {
              const done = i < stage;
              const current = i === stage;
              return (
                <div key={s} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        done || current ? 'text-white' : 'bg-black/10 text-black/40'
                      }`}
                      style={done || current ? { backgroundColor: EMB } : {}}
                    >
                      {done ? <Check className="h-4 w-4" /> : toArabicDigits(i + 1)}
                    </div>
                    {i < ORDER_STAGES.length - 1 && (
                      <div className={`w-0.5 flex-1 ${done ? '' : 'bg-black/10'}`} style={done ? { backgroundColor: EMB } : {}} />
                    )}
                  </div>
                  <div className={`pb-5 ${current ? '' : 'pt-0.5'}`}>
                    <p className={`text-[14px] font-bold ${current ? 'text-black' : done ? 'text-black/60' : 'text-black/40'}`}>
                      {s}
                    </p>
                    {current && (
                      <p className="mt-0.5 text-[12px]" style={{ color: EMB }}>
                        المرحلة الحالية...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-1 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
            <h4 className="pb-2 text-[14px] font-extrabold text-black">تفاصيل الطلب</h4>
            {activeOrder.items.map((it) => (
              <div key={it.productId} className="flex items-center gap-2 py-1 text-[13px]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5 text-lg"><ImageOrEmoji src={it.image} alt={it.name} emoji={it.emoji} imageClassName="h-full w-full object-cover" emojiClassName="text-lg" /></span>
                <span className="flex-1 truncate text-black/70">{it.name}</span>
                <span className="text-black/40">× {toArabicDigits(it.qty)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-dashed border-black/10 pt-2 text-[14px] font-black">
              <span>الإجمالي</span>
              <span style={{ color: EMB }}>{sar(activeOrder.total)}</span>
            </div>
          </div>
          <div className="h-6" />
        </div>

        <div className="border-t px-4 pb-6 pt-3" style={{ borderColor: 'rgba(0,0,0,0.05)', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <button
            onClick={() => setScreen('home')}
            className="w-full rounded-full py-3 text-[15px] font-extrabold active:scale-[0.98]"
            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    );
  };

  // ---- Orders history ----
  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/5">
            <Receipt className="h-10 w-10 text-black/25" />
          </div>
          <h2 className="mt-4 text-[17px] font-bold text-black/70">لا توجد طلبات سابقة</h2>
          <p className="mt-1 text-[13px] text-black/40">ستظهر طلبات رمضان هنا بعد إتمام أول طلب</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3 p-4">
        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => {
              setActiveOrderId(o.id);
              setOrderPlaced(false);
              setScreen('tracking');
            }}
            className="rounded-2xl p-4 text-right shadow-sm active:scale-[0.98]"
            style={{ backgroundColor: CARD_BG }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-black">
                طلب رقم {toArabicDigits(o.id.slice(-5).toUpperCase())}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  o.stage >= ORDER_STAGES.length - 1 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {ORDER_STAGES[o.stage]}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {o.items.slice(0, 5).map((it) => (
                <div key={it.productId} className={`relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-b ${it.gradient} text-base`}>
                  <ImageOrEmoji src={it.image} alt={it.name} emoji={it.emoji} imageClassName="absolute inset-0 z-10 h-full w-full object-cover" emojiClassName="relative" />
                </div>
              ))}
              {o.items.length > 5 && <span className="text-[12px] text-black/40">+{toArabicDigits(o.items.length - 5)}</span>}
            </div>
            <div className="mt-2 flex items-center justify-between text-[12px] text-black/50">
              <span>{formatArabicTime(o.date)}</span>
              <span className="font-extrabold" style={{ color: EMB }}>
                {sar(o.total)}
              </span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  // ---- Favorites ----
  const renderFavorites = () => {
    const favProducts = favorites.map((id) => findItem(id)).filter((p): p is NinjaProduct => Boolean(p));
    if (favProducts.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-black/5">
            <Heart className="h-10 w-10 text-black/25" />
          </div>
          <h2 className="mt-4 text-[17px] font-bold text-black/70">لا توجد منتجات مفضلة</h2>
          <p className="mt-1 text-[13px] text-black/40">اضغط على القلب في أي منتج لإضافته هنا</p>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {favProducts.map((p) => (
          <React.Fragment key={p.id}>{renderProductCard(p)}</React.Fragment>
        ))}
      </div>
    );
  };

  // ---- Addresses ----
  const renderAddresses = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-2.5">
        {addresses.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-2xl border-2 p-3.5 shadow-sm"
            style={{
              backgroundColor: CARD_BG,
              borderColor: a.id === selectedAddressId ? EMB : 'transparent',
            }}
          >
            <span className="text-2xl">{a.icon}</span>
            <button
              onClick={() => {
                setSelectedAddressId(a.id);
                setScreen('home');
              }}
              className="flex flex-1 flex-col text-right"
            >
              <span className="text-[14px] font-bold text-black">{a.label}</span>
              <span className="text-[12px] text-black/50">{a.details}</span>
            </button>
            {a.id === selectedAddressId && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ backgroundColor: EMB }}>
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>
      <NewAddressForm
        onAdd={(addr) => {
          setAddresses((prev) => [...prev, addr]);
          setSelectedAddressId(addr.id);
          showToast('تمت إضافة العنوان');
        }}
      />
      <div className="h-4" />
    </div>
  );

  // ---- Rewards ----
  const renderRewards = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div
        className="relative overflow-hidden rounded-3xl p-6 text-center text-white"
        style={{ background: `linear-gradient(160deg, ${EMB} 0%, ${EMB_DARK} 100%)` }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
        <span className="relative text-3xl">🌙</span>
        <p className="relative mt-2 text-[13px] text-white/75">نقاط مكافآت نينجا</p>
        <p className="relative text-[40px] font-black tabular-nums" style={{ color: GOLD_LIGHT }}>
          {toArabicDigits(rewards)}
        </p>
        <p className="relative text-[12px] text-white/75">
          اجمع نقطة على كل ريال — استبدلها بخصومات على طلبات رمضان
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {[
          { title: 'خصم ١٠ ريال', points: 500, note: 'على أي طلب فوق ٥٠ ريال' },
          { title: 'توصيل مجاني', points: 300, note: 'على طلبك القادم' },
          { title: 'صندوق ضيافة مجاني', points: 1200, note: 'شامل التمر والقهوة العربية' },
        ].map((r) => {
          const can = rewards >= r.points;
          return (
            <div key={r.title} className="flex items-center gap-3 rounded-2xl p-4 shadow-sm" style={{ backgroundColor: CARD_BG }}>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: can ? EMB : '#D1D5DB' }}
              >
                <Gift className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-black">{r.title}</p>
                <p className="text-[12px] text-black/50">{r.note}</p>
              </div>
              <button
                disabled={!can}
                onClick={() => {
                  setRewards((prev) => prev - r.points);
                  showToast('تم استبدال المكافأة!');
                }}
                className="rounded-full px-3.5 py-1.5 text-[12px] font-extrabold text-white disabled:opacity-40"
                style={{ backgroundColor: EMB }}
              >
                {toArabicDigits(r.points)} نقطة
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- Help & Support ----
  const renderSupport = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-2.5">
        {[
          { icon: '💬', title: 'تواصل واتساب', note: 'فريق نينجا جاهز لمساعدتك في تجهيزات رمضان' },
          { icon: '📞', title: 'اتصال هاتفي', note: '٩٢٠٠٠١٢٣٤ — من ٩ ص إلى ١٢ م' },
          { icon: '❓', title: 'الأسئلة الشائعة', note: 'كيف أستخدم كود RAMADAN20؟ متى يصل طلبي؟' },
          { icon: '🕌', title: 'شروط عروض رمضان', note: 'العروض سارية حتى نهاية شهر رمضان' },
        ].map((r) => (
          <button
            key={r.title}
            onClick={() => showToast('تم إرسال طلبك — سيتواصل معك فريقنا')}
            className="flex items-center gap-3 rounded-2xl p-4 text-right shadow-sm active:bg-black/[0.03]"
            style={{ backgroundColor: CARD_BG }}
          >
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-black">{r.title}</p>
              <p className="text-[12px] text-black/50">{r.note}</p>
            </div>
            <ChevronLeft className="h-4 w-4 text-black/25" />
          </button>
        ))}
      </div>
    </div>
  );

  // ---- Account ----
  const renderAccount = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div
        className="relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 text-white"
        style={{ background: `linear-gradient(160deg, ${EMB} 0%, ${EMB_DARK} 100%)` }}
      >
        <div className="absolute inset-0" style={{ backgroundImage: PATTERN_URI }} />
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-full text-2xl font-black"
          style={{ backgroundColor: GOLD, color: EMB_DARK }}
        >
          ع
        </div>
        <div className="relative flex-1">
          <p className="text-[17px] font-black">{SAMPLE_USER.name}</p>
          <p className="text-[13px] text-white/75">{SAMPLE_USER.phone}</p>
          <p className="text-[12px] text-white/60">عضو منذ {SAMPLE_USER.joined}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5">
        {[
          { label: 'الطلبات', value: orders.length, screen: 'orders' as Screen },
          { label: 'المفضلة', value: favorites.length, screen: 'favorites' as Screen },
          { label: 'النقاط', value: rewards, screen: 'rewards' as Screen },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setScreen(s.screen)}
            className="flex flex-col items-center gap-0.5 rounded-2xl py-3 shadow-sm active:scale-95"
            style={{ backgroundColor: CARD_BG }}
          >
            <span className="text-[20px] font-black" style={{ color: EMB }}>
              {toArabicDigits(s.value)}
            </span>
            <span className="text-[12px] text-black/50">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <ProfileRow icon={<Receipt className="h-4 w-4" />} label="طلباتي" onClick={() => setScreen('orders')} />
        <ProfileRow icon={<MapPin className="h-4 w-4" />} label="عناويني" onClick={() => setScreen('addresses')} />
        <ProfileRow icon={<Heart className="h-4 w-4" />} label="مفضلاتي" onClick={() => setScreen('favorites')} />
        <ProfileRow icon={<Gift className="h-4 w-4" />} label="مكافآتي" onClick={() => setScreen('rewards')} />
        <ProfileRow icon={<HelpCircle className="h-4 w-4" />} label="المساعدة والدعم" onClick={() => setScreen('support')} />
        <button
          onClick={() => {
            setActiveInboxId(null);
            setScreen('inbox');
          }}
          className="flex w-full items-center gap-3 rounded-2xl p-4 text-right shadow-sm active:bg-black/[0.03]"
          style={{ backgroundColor: CARD_BG }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: GOLD }}>
            <Bell className="h-4 w-4" />
          </span>
          <span className="flex-1 text-[14px] font-semibold text-black">إشعارات نينجا</span>
          {ninjaUnread > 0 && (
            <span
              className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: '#B91C1C' }}
            >
              {toArabicDigits(ninjaUnread)}
            </span>
          )}
        </button>

        <div className="rounded-2xl p-4 text-center shadow-sm" style={{ backgroundColor: CARD_BG }}>
          <p className="text-[12px] text-black/40">
            حملة «{CAMPAIGN.nameAr}» — نسخة محاكاة للعرض فقط، لا يتم تنفيذ أي مدفوعات حقيقية.
          </p>
        </div>
      </div>
    </div>
  );

  /* ============================================================
   * Overlays
   * ============================================================ */

  const renderAddressPicker = () => (
    <div className="absolute inset-0 z-40 flex flex-col justify-end" onClick={() => setShowAddressPicker(false)}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative max-h-[75%] overflow-y-auto rounded-t-3xl p-4 pb-8"
        style={{ backgroundColor: CARD_BG }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-black/15" />
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-[17px] font-black text-black">اختر عنوان التوصيل</h3>
          <button onClick={() => setShowAddressPicker(false)} className="text-black/40">
            <X className="h-5 w-5" />
          </button>
        </div>
        {addresses.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAddressId(a.id);
              setShowAddressPicker(false);
            }}
            className="mb-2 flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-right"
            style={{ borderColor: a.id === selectedAddressId ? EMB : 'rgba(0,0,0,0.1)' }}
          >
            <span className="text-2xl">{a.icon}</span>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-black">{a.label}</p>
              <p className="text-[12px] text-black/50">{a.details}</p>
            </div>
            {a.id === selectedAddressId && <Check className="h-5 w-5" style={{ color: EMB }} />}
          </button>
        ))}
        <NewAddressForm
          inline
          onAdd={(addr) => {
            setAddresses((prev) => [...prev, addr]);
            setSelectedAddressId(addr.id);
            setShowAddressPicker(false);
          }}
        />
      </div>
    </div>
  );

  const renderSearch = () => {
    const results = searchQuery.trim()
      ? ALL_ITEMS.filter(
          (p) =>
            p.name.includes(searchQuery.trim()) ||
            p.description.includes(searchQuery.trim()) ||
            p.store.includes(searchQuery.trim())
        )
      : [];
    return (
      <div className="absolute inset-0 z-40 flex flex-col bg-white">
        <div className="flex items-center gap-2 px-4 pt-14">
          <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5"
          >
            <ChevronLeft className="h-5 w-5 rotate-180 text-black" />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-full bg-black/5 px-4 py-2.5">
            <Search className="h-4 w-4 text-black/40" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مستلزمات رمضان..."
              className="w-full bg-transparent text-[15px] text-black placeholder-black/40 outline-none"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {searchQuery.trim() === '' ? (
            <div>
              <h4 className="pb-2 text-[14px] font-bold text-black/60">بحث رمضان الشائع</h4>
              <div className="flex flex-wrap gap-2">
                {['تمر', 'قطايف', 'سمبوسة', 'قهوة عربية', 'عصير', 'لقيمات', 'كنافة'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSearchQuery(q)}
                    className="rounded-full px-3.5 py-1.5 text-[13px]"
                    style={{ backgroundColor: '#F0FDF4', color: EMB }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Search className="h-10 w-10 text-black/20" />
              <p className="mt-3 text-[15px] font-bold text-black/60">لا توجد نتائج</p>
              <p className="text-[13px] text-black/40">جرب كلمات بحث أخرى</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                    openProduct(p.id);
                  }}
                  className="flex items-center gap-3 rounded-2xl p-2.5 text-right active:opacity-70"
                  style={{ backgroundColor: '#FAFAFA' }}
                >
                  <ProductImage product={p} size="sm" />
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-black">{p.name}</p>
                    <p className="text-[12px] text-black/50">{p.store}</p>
                  </div>
                  <span className="text-[14px] font-extrabold" style={{ color: EMB }}>
                    {fmtPrice(p.price)} ر.س
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ============================================================
   * Layout
   * ============================================================ */

  const getPageTitle = (): string => {
    switch (screen) {
      case 'ramadan-shop': return 'مستلزمات رمضان';
      case 'category': return NINJA_CATEGORIES.find((c) => c.id === activeCategoryId)?.name ?? '';
      case 'product': return '';
      case 'cart': return 'سلة التسوق';
      case 'checkout': return 'إتمام الطلب';
      case 'tracking': return 'تتبع الطلب';
      case 'orders': return 'طلباتي';
      case 'favorites': return 'المفضلة';
      case 'addresses': return 'عناويني';
      case 'rewards': return 'مكافآتي';
      case 'support': return 'المساعدة والدعم';
      case 'inbox': return activeInboxId ? 'رسالة من نينجا' : 'إشعارات نينجا';
      case 'account': return 'حسابي';
      default: return '';
    }
  };

  const showBackBtn =
    screen !== 'home' && screen !== 'product' && screen !== 'account' && screen !== 'inbox';

  const scrollContent = () => {
    switch (screen) {
      case 'home': return renderHome();
      case 'ramadan-shop': return renderRamadanShop();
      case 'category': return renderCategory();
      case 'cart': return renderCart();
      case 'checkout': return renderCheckout();
      case 'tracking': return renderTracking();
      case 'orders': return renderOrders();
      case 'favorites': return renderFavorites();
      case 'addresses': return renderAddresses();
      case 'rewards': return renderRewards();
      case 'support': return renderSupport();
      case 'inbox': return renderInbox();
      case 'account': return renderAccount();
      default: return renderHome();
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col" style={{ backgroundColor: '#F7FAFA' }}>
      {/* Top bar */}
      {screen !== 'product' && (
        <div
          className="shrink-0 px-1 pt-12"
          style={{ backgroundColor: screen === 'home' ? '#A9E9E7' : EMB }}
        >
          <div className="relative flex h-11 items-center px-3">
            {showBackBtn ? (
              <button
                onClick={() => setScreen('home')}
                className="flex h-9 w-9 items-center justify-center rounded-full active:opacity-60"
                aria-label="رجوع"
              >
                <ChevronLeft className="h-6 w-6 rotate-180 text-white" />
              </button>
            ) : (
              <div className="h-9 w-9" />
            )}
            <h1 className="absolute inset-x-0 text-center text-[17px] font-black" style={{ color: screen === 'home' ? '#164E52' : 'white' }}>{getPageTitle()}</h1>
            {screen === 'home' ? (
              <div
                className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-lg font-black"
                style={{ backgroundColor: GOLD, color: EMB_DARK }}
              >
                ن
              </div>
            ) : (
              <div className="h-9 w-9" />
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {screen === 'product' ? (
        <div className="flex-1 overflow-hidden">{renderProduct()}</div>
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {scrollContent()}
        </div>
      )}

      {/* Bottom tab bar */}
      <div className="shrink-0 border-t bg-white/95 pb-5 pt-2 backdrop-blur-xl" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <div className="flex items-center justify-around">
          {(
            [
              { id: 'home', label: 'الرئيسية', icon: <Home className="h-5 w-5" /> },
              { id: 'orders', label: 'الطلبات', icon: <Receipt className="h-5 w-5" /> },
              { id: 'favorites', label: 'المفضلة', icon: <Heart className="h-5 w-5" /> },
              { id: 'account', label: 'حسابي', icon: <User className="h-5 w-5" /> },
            ] as const
          ).map((tab) => {
            const active = screen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScreen(tab.id)}
                className="flex flex-1 flex-col items-center gap-0.5 active:scale-95"
              >
                <span style={{ color: active ? EMB : '#9CA3AF' }}>{tab.icon}</span>
                <span className="text-[10px] font-semibold" style={{ color: active ? EMB : '#9CA3AF' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex justify-center">
          <div className="h-[5px] w-36 rounded-full bg-black/80" />
        </div>
      </div>

      {/* Floating cart button */}
      {cartCount > 0 && screen !== 'cart' && screen !== 'checkout' && screen !== 'product' && (
        <button
          onClick={() => setScreen('cart')}
          className="absolute bottom-24 left-4 z-30 flex items-center gap-2 rounded-full py-2.5 pl-4 pr-3 text-white shadow-xl active:scale-95"
          style={{ backgroundColor: EMB }}
        >
          <span className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span
              className="absolute -top-2 -left-2 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
              style={{ backgroundColor: GOLD, color: EMB_DARK }}
            >
              {toArabicDigits(cartCount)}
            </span>
          </span>
          <span className="text-[13px] font-bold">عرض السلة</span>
          <span className="text-[13px] font-extrabold" style={{ color: GOLD_LIGHT }}>
            {sar(total)}
          </span>
        </button>
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute bottom-32 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shadow-xl"
          style={{ backgroundColor: 'rgba(2,44,34,0.9)' }}
        >
          {toast}
        </div>
      )}

      {showAddressPicker && renderAddressPicker()}
      {searchOpen && renderSearch()}
    </div>
  );
}

/* ============================================================
 * Shared sub-components
 * ============================================================ */

function ProfileRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl p-4 text-right shadow-sm active:bg-black/[0.03]"
      style={{ backgroundColor: CARD_BG }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full text-white" style={{ backgroundColor: EMB }}>
        {icon}
      </span>
      <span className="flex-1 text-[14px] font-semibold text-black">{label}</span>
      <ChevronLeft className="h-4 w-4 text-black/25" />
    </button>
  );
}

function NewAddressForm({
  inline = false,
  onAdd,
}: {
  inline?: boolean;
  onAdd: (addr: NinjaAddress) => void;
}) {
  const [label, setLabel] = useState('');
  const [details, setDetails] = useState('');
  const valid = label.trim() && details.trim();

  return (
    <div className={`rounded-2xl p-4 ${inline ? 'mt-2 bg-black/[0.03]' : 'mt-4 shadow-sm'}`} style={inline ? {} : { backgroundColor: CARD_BG }}>
      <h4 className="pb-2 text-[14px] font-extrabold text-black">إضافة عنوان جديد</h4>
      <div className="flex flex-col gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="اسم العنوان (مثال: بيت الجدة)"
          className="rounded-xl bg-black/5 px-3 py-2.5 text-[14px] text-black placeholder-black/40 outline-none"
          dir="rtl"
        />
        <input
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="التفاصيل (الحي، الشارع، المدينة)"
          className="rounded-xl bg-black/5 px-3 py-2.5 text-[14px] text-black placeholder-black/40 outline-none"
          dir="rtl"
        />
        <button
          onClick={() => {
            if (!valid) return;
            onAdd({ id: uid(), label: label.trim(), details: details.trim(), icon: '📍' });
            setLabel('');
            setDetails('');
          }}
          disabled={!valid}
          className="rounded-xl py-2.5 text-[14px] font-extrabold text-white disabled:opacity-40"
          style={{ backgroundColor: EMB }}
        >
          إضافة العنوان
        </button>
      </div>
    </div>
  );
}