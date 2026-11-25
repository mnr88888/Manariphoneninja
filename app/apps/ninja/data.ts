/* ============================================================
 * Ninja delivery app — Ramadan campaign sample data
 * "رمضان يجمعنا، ونينجا يجهّزنا"
 * ============================================================ */

export interface NinjaCategory {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  gradient: string;
  image?: string;
}

export interface NinjaBanner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  gradient: string;
  image?: string;
}

export interface NinjaBundle {
  id: string;
  name: string;
  /** Full description (product details page) */
  description: string;
  /** Short line for the bundle card (fits 2 lines) */
  shortDescription?: string;
  price: number;
  oldPrice: number;
  emoji: string;
  gradient: string;
  image?: string;
  productIds: string[];
}

export interface NinjaProduct {
  id: string;
  name: string;
  description: string;
  price: number; // SAR
  oldPrice?: number; // SAR, when discounted
  rating: number;
  category: string;
  emoji: string;
  gradient: string;
  image?: string;
  store: string;
  eta: number; // minutes
}

export interface NinjaAddress {
  id: string;
  label: string;
  details: string;
  icon: string;
}

export interface NinjaOrder {
  id: string;
  date: number;
  items: { productId: string; name: string; price: number; qty: number; emoji: string; gradient: string; image?: string }[];
  total: number;
  address: string;
  payment: string;
  deliverySlot: string;
  /** index into ORDER_STAGES */
  stage: number;
  placedAt: number;
}

/** 4-stage order tracking */
export const ORDER_STAGES = [
  'تم تأكيد الطلب',
  'جاري تحضير طلبك',
  'في الطريق إليك',
  'تم التوصيل',
];
export const ORDER_STAGES_EN = [
  'Order Confirmed',
  'Preparing Your Order',
  'Out for Delivery',
  'Delivered',
];

export const DELIVERY_FEE = 9;
export const FREE_DELIVERY_THRESHOLD = 75;

/** Campaign discount codes */
export const DISCOUNT_CODES: Record<string, { percent: number; label: string }> = {
  RAMADAN20: { percent: 20, label: 'خصم رمضان ٢٠٪' },
  NINJA50: { percent: 50, label: 'خصم أول طلب ٥٠٪' },
};

/** Ramadan countdown target — 1 Ramadan 1448 ≈ Feb 8, 2027 (تقديري، يتأكد بالرؤية) */
export const RAMADAN_DATE_ISO = '2027-02-08T00:00:00';

export const CAMPAIGN = {
  nameAr: 'رمضان يجمعنا، ونينجا يجهّزنا',
  nameEn: 'Ramadan Brings Us Together. Ninja Gets Us Ready.',
  headline: 'رمضانكم مبارك، وتجهيزاتكم علينا!',
  headlineEn: 'Get everything ready for Ramadan with Ninja.',
  cta: 'تسوق مستلزمات رمضان',
  ctaEn: 'Shop Ramadan Essentials',
};

/* ============================================================
 * Ramadan shopping categories
 * ============================================================ */

export const NINJA_CATEGORIES: NinjaCategory[] = [
  { id: 'coffee-dates', name: 'تمور وقهوة', nameEn: 'Dates & Arabic Coffee', emoji: '🌴', gradient: 'from-[#B45309] to-[#78350F]' },
  { id: 'iftar', name: 'سفرة الإفطار', nameEn: 'Iftar Table', emoji: '🍽️', gradient: 'from-[#047857] to-[#065F46]' },
  { id: 'sweets', name: 'قطايف وحلويات رمضان', nameEn: 'Ramadan Sweets', emoji: '🥮', gradient: 'from-[#A16207] to-[#713F12]' },
  { id: 'drinks', name: 'مشروبات رمضان', nameEn: 'Ramadan Drinks', emoji: '🥤', gradient: 'from-[#0E7490] to-[#155E75]' },
  { id: 'suhoor', name: 'السحور', nameEn: 'Suhoor Essentials', emoji: '🌙', gradient: 'from-[#4338CA] to-[#312E81]' },
  { id: 'meat', name: 'لحوم ودواجن', nameEn: 'Meat & Poultry', emoji: '🍗', gradient: 'from-[#B91C1C] to-[#7F1D1D]' },
  { id: 'produce', name: 'فواكه وخضار', nameEn: 'Fruits & Vegetables', emoji: '🥬', gradient: 'from-[#16A34A] to-[#166534]' },
  { id: 'decor', name: 'زينة وضيافة رمضان', nameEn: 'Ramadan Decor & Hosting', emoji: '🏮', gradient: 'from-[#D97706] to-[#92400E]' },
];

/* ============================================================
 * Campaign banners
 * ============================================================ */

export const NINJA_BANNERS: NinjaBanner[] = [
  {
    id: 'b1',
    title: 'خصم ٢٠٪ على كل مستلزمات رمضان',
    subtitle: 'استخدم كود الخصم عند إتمام الطلب',
    code: 'RAMADAN20',
    gradient: 'from-[#047857] to-[#065F46]',
  },
  {
    id: 'b2',
    title: 'توصيل مجاني للطلبات فوق ٧٥ ريال',
    subtitle: 'جهّز سفرتك وسحورك بلا قلق',
    code: 'FREESHIP',
    gradient: 'from-[#D4A017] to-[#92400E]',
  },
  {
    id: 'b3',
    title: 'عروض محدودة على تمور وقطايف رمضان',
    subtitle: 'أفضل الأسعار لسفرة الإفطار',
    code: 'IFTAR',
    gradient: 'from-[#166534] to-[#052E16]',
  },
];

/* ============================================================
 * Ramadan bundles
 * ============================================================ */

export const NINJA_BUNDLES: NinjaBundle[] = [
  {
    id: 'bundle-iftar',
    name: 'صندوق سفرة الإفطار',
    description: 'صندوق إفطار متكامل بأطباق مقسّمة: حمص ومتبّل، أجبان ولبنة، زيتون أسود ومخللات، بيض مسلوق، طبق مطبوخ بالطماطم، مع خبز عربي طازج — سفرتك جاهزة قبل الأذان.',
    shortDescription: 'حمص ومتبّل وأجبان وزيتون ومخللات مع خبز عربي طازج.',
    price: 99,
    oldPrice: 122,
    emoji: '🍽️',
    gradient: 'from-[#047857] to-[#022C22]',
    productIds: ['p-c1', 'p-i1', 'p-i3', 'p-d5'],
  },
  {
    id: 'bundle-suhoor',
    name: 'صندوق السحور',
    description: 'صندوق سحور بأطباق ساخنة وجانبية: عجّة بالجبن والطماطم والأعشاب، فطائر مقرمشة، خبز طازج، مع أطباق الفول والحمص والصلصات والزبادي — سحور مشبع يعينك على الصيام.',
    shortDescription: 'عجّة بالجبن والطماطم، فطائر، خبز، وأطباق فول وصلصات.',
    price: 69,
    oldPrice: 87,
    emoji: '🌙',
    gradient: 'from-[#4338CA] to-[#1E1B4B]',
    productIds: ['p-su1', 'p-su2', 'p-su3', 'p-su5'],
  },
  {
    id: 'bundle-hospitality',
    name: 'صندوق الضيافة الرمضانية',
    description: 'صينية مقبلات رمضانية متنوعة تكفي الضيوف: ورق عنب بدبس الرمان، فطائر ومعجنات صغيرة، رقائق مقرمشة محشية، وسمبوسة، مع شرائح الليمون — ضيافة جاهزة بعد التراويح.',
    shortDescription: 'ورق عنب بدبس الرمان، فطائر، رقائق وسمبوسة مقرمشة.',
    price: 129,
    oldPrice: 153,
    emoji: '☕',
    gradient: 'from-[#B45309] to-[#451A03]',
    productIds: ['p10', 'p-c1', 'p-h1'],
  },
  {
    id: 'bundle-sweets',
    name: 'صندوق حلويات رمضان',
    description: 'علبة رولز القرفة الصغيرة بتغطيات متنوعة: كريمة بيضاء، فستق، صوص الشوكولاتة، ومكسرات مقرمشة — حلا خفيف للسهرة مع القهوة.',
    shortDescription: 'رولز قرفة صغيرة بالكريمة والفستق والشوكولاتة والمكسرات.',
    price: 85,
    oldPrice: 102,
    emoji: '🥮',
    gradient: 'from-[#A16207] to-[#3B2A0B]',
    productIds: ['p-q1', 'p-s3', 'p-s2'],
  },
];

/* ============================================================
 * Ramadan products by category
 * ============================================================ */

export const NINJA_PRODUCTS: NinjaProduct[] = [
  // Dates & Arabic Coffee
  { id: 'p-c1', name: 'تمر مجدول فاخر ١ كجم', description: 'تمر مجدول ملكي من نخيل القصيم، أول ما تفطر عليه في رمضان.', price: 48, oldPrice: 60, rating: 4.9, category: 'coffee-dates', emoji: '🌴', gradient: 'from-[#FDE68A] to-[#92400E]', store: 'تمور القصيم', eta: 25 },
  { id: 'p-c5', name: 'عجوة المدينة ٥٠٠ جرام', description: 'عجوة المدينة المنورة الأصلية، سنة الإفطار على التمر.', price: 55, oldPrice: 68, rating: 4.9, category: 'coffee-dates', emoji: '🌴', gradient: 'from-[#D6D3D1] to-[#44403C]', store: 'تمور القصيم', eta: 25 },
  { id: 'p-c2', name: 'تمر سخري محشي باللوز والشوكولاتة', description: 'تمر سخري محشي لوز ومغطى بشوكولاتة داكنة، مثالي لضيافة رمضان.', price: 38, oldPrice: 46, rating: 4.8, category: 'coffee-dates', emoji: '🍫', gradient: 'from-[#FDBA74] to-[#7C2D12]', store: 'تمور القصيم', eta: 25 },
  { id: 'p10', name: 'قهوة عربية سعودية بالهيل', description: 'قهوة عربية محمصة طازجة بالهيل والزعفران، رفيقة سهرات رمضان.', price: 16, rating: 4.9, category: 'coffee-dates', emoji: '☕', gradient: 'from-[#D6D3D1] to-[#78716C]', store: 'محمصة الرياض', eta: 20 },
  { id: 'p-c3', name: 'زعفران إيراني فاخر ٥ جرام', description: 'زعفران عالي الجودة بلون أحمر غامق، للقهوة والحلويات.', price: 65, rating: 4.9, category: 'coffee-dates', emoji: '🌾', gradient: 'from-[#FEF3C7] to-[#F59E0B]', store: 'محمصة الرياض', eta: 20 },
  { id: 'p-c4', name: 'هيل أخضر ممتاز ١٠٠ جرام', description: 'هيل أخضر حبيبات ممتلئة برائحة قوية للقهوة العربية.', price: 28, rating: 4.7, category: 'coffee-dates', emoji: '🫒', gradient: 'from-[#DCFCE7] to-[#65A30D]', store: 'محمصة الرياض', eta: 20 },

  // Iftar Table
  { id: 'p-i1', name: 'سمبوسة لحم جاهزة للقلي × ٥٠', description: 'سمبوسة بحشوة اللحم المتبلة، تقلى في دقائق وتنزل سفرتك ساخنة.', price: 45, oldPrice: 55, rating: 4.8, category: 'iftar', emoji: '🥟', gradient: 'from-[#FDE68A] to-[#B45309]', store: 'مطبخ الإفطار', eta: 35 },
  { id: 'p-i2', name: 'سمبوسة جبنة وسبانخ × ٥٠', description: 'سمبوسة مقرمشة محشوة بالجبنة والسبانخ، خيار خفيف للصائمين.', price: 39, rating: 4.7, category: 'iftar', emoji: '🥟', gradient: 'from-[#D9F99D] to-[#65A30D]', store: 'مطبخ الإفطار', eta: 35 },
  { id: 'p-i3', name: 'شوربة شعير بالخضار ٥٠٠ جرام', description: 'خلطة شوربة الشعير والخضار الجاهزة، تفتح الشهية بعد الصيام.', price: 14, rating: 4.8, category: 'iftar', emoji: '🥣', gradient: 'from-[#FED7AA] to-[#C2410C]', store: 'مطبخ الإفطار', eta: 30 },
  { id: 'p-i4', name: 'ورق سمبوسة ولفائف ٥٠٠ جرام', description: 'ورق رقيق جاهز للسمبوسة واللفائف، ينتفخ ويقرمش بعد القلي.', price: 12, oldPrice: 15, rating: 4.6, category: 'iftar', emoji: '🫓', gradient: 'from-[#FEF3C7] to-[#D97706]', store: 'مطبخ الإفطار', eta: 30 },
  { id: 'p-i5', name: 'خلطة الهريس والجريش ١ كجم', description: 'قمح مجروش جاهز للطبخ لأكلة الهريس والجريش الرمضانية.', price: 19, rating: 4.7, category: 'iftar', emoji: '🍲', gradient: 'from-[#FEF9C3] to-[#CA8A04]', store: 'مطبخ الإفطار', eta: 30 },

  // Ramadan Sweets
  { id: 'p-q1', name: 'قطايف بالقشطة والمكسرات × ١٢', description: 'قطايف عصافيري طازجة محشوة بالقشطة والمكسرات، حلا رمضان الأول.', price: 28, oldPrice: 35, rating: 4.9, category: 'sweets', emoji: '🥞', gradient: 'from-[#FDE68A] to-[#D97706]', store: 'حلويات الشام', eta: 40 },
  { id: 'p-q2', name: 'لقيمات بالدبس والسمسم (٣٠ حبة)', description: 'لقيمات ذهبية مقرمشة تُغمس بالدبس وتُرش بالسمسم.', price: 22, rating: 4.8, category: 'sweets', emoji: '🍡', gradient: 'from-[#FED7AA] to-[#B45309]', store: 'حلويات نجد', eta: 35 },
  { id: 'p-s3', name: 'كنافة بالقشطة والقطر', description: 'كنافة نابلسية طازجة محضرة يومياً مع القشطة البلدية.', price: 32, rating: 4.9, category: 'sweets', emoji: '🍮', gradient: 'from-[#FDE68A] to-[#D97706]', store: 'حلويات الشام', eta: 40 },
  { id: 'p-s2', name: 'معمول التمر بالسمن البلدي', description: 'معمول طازج محشو بالتمر، يناسب السهرة مع القهوة.', price: 42, oldPrice: 52, rating: 4.8, category: 'sweets', emoji: '🍪', gradient: 'from-[#FDE68A] to-[#B45309]', store: 'حلويات نجد', eta: 35 },
  { id: 'p-s4', name: 'بقلاوة مشكلة ١ كجم', description: 'تشكيلة بقلاوة بالفستق والجوز من الأفران الشرقية.', price: 68, oldPrice: 85, rating: 4.7, category: 'sweets', emoji: '🥮', gradient: 'from-[#FDBA74] to-[#92400E]', store: 'حلويات الشام', eta: 40 },
  { id: 'p13', name: 'كيك التمر بالكراميل', description: 'كيك تمر إسفنجي بطبقات صوص الكراميل الدافئ.', price: 26, oldPrice: 32, rating: 4.8, category: 'sweets', emoji: '🍰', gradient: 'from-[#FBCFE8] to-[#EC4899]', store: 'حلويات الشام', eta: 40 },

  // Ramadan Drinks
  { id: 'p-d5', name: 'عصير قمر الدين ١ لتر', description: 'عصير قمر الدين المشمشي الأصيل، مشروب السفرة الرمضانية.', price: 15, oldPrice: 19, rating: 4.8, category: 'drinks', emoji: '🧃', gradient: 'from-[#FED7AA] to-[#EA580C]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d6', name: 'تمر هندي مركز ١ لتر', description: 'شراب تمر هندي مركز يُخفف بالماء البارد، منعش بعد الصيام.', price: 13, rating: 4.6, category: 'drinks', emoji: '🥃', gradient: 'from-[#D6D3D1] to-[#78350F]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d7', name: 'جلاب بالزبيب والصنوبر ١ لتر', description: 'شراب الجلاب التقليدي بالزبيب والصنوبر، من أجواء رمضان.', price: 17, rating: 4.7, category: 'drinks', emoji: '🍇', gradient: 'from-[#E9D5FF] to-[#7E22CE]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d2', name: 'ليموناضة بالنعناع ١.٥ لتر', description: 'ليموناضة طازجة بالنعناع، المرطب الأمثل بعد يوم صيام طويل.', price: 12, rating: 4.7, category: 'drinks', emoji: '🍋', gradient: 'from-[#FEF9C3] to-[#84CC16]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d1', name: 'عصير برتقال طبيعي ٢ لتر', description: 'عصير برتقال طبيعي ١٠٠٪ بدون سكر مضاف.', price: 14, oldPrice: 18, rating: 4.6, category: 'drinks', emoji: '🍊', gradient: 'from-[#FED7AA] to-[#EA580C]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d8', name: 'مياه شرب × ٢٤ عبوة', description: 'مياه شرب نقية لترطيب الجسم بين الإفطار والسحور.', price: 21, oldPrice: 24, rating: 4.5, category: 'drinks', emoji: '💧', gradient: 'from-[#BAE6FD] to-[#0369A1]', store: 'عصائر الشرق', eta: 20 },

  // Suhoor
  { id: 'p-su1', name: 'فول مدمس جاهز × ٦ علب', description: 'فول مدمس بالليمون والكمون، أساس السحور المشبع.', price: 18, oldPrice: 22, rating: 4.7, category: 'suhoor', emoji: '🫘', gradient: 'from-[#FDE68A] to-[#92400E]', store: 'بقالة السحور', eta: 25 },
  { id: 'p-su2', name: 'جبنة حلوم ٥٠٠ جرام', description: 'جبنة حلوم طرية تُشوى أو تؤكل باردة، مثالية للسحور.', price: 29, rating: 4.8, category: 'suhoor', emoji: '🧀', gradient: 'from-[#FEF9C3] to-[#EAB308]', store: 'بقالة السحور', eta: 25 },
  { id: 'p-su3', name: 'لبن طازج × ٤ عبوات', description: 'لبن رائب طازج يرطب ويهضم بسهولة، شريك السحور.', price: 16, oldPrice: 19, rating: 4.6, category: 'suhoor', emoji: '🥛', gradient: 'from-[#F1F5F9] to-[#94A3B8]', store: 'بقالة السحور', eta: 25 },
  { id: 'p-su4', name: 'شوفان سريع التحضير ١ كجم', description: 'شوفان بطيء الهضم يمدك بالطاقة لساعات الصيام الطويلة.', price: 17, rating: 4.6, category: 'suhoor', emoji: '🥣', gradient: 'from-[#FEF3C7] to-[#B45309]', store: 'بقالة السحور', eta: 25 },
  { id: 'p-su5', name: 'بيض طازج ٣٠ حبة', description: 'بيض مزرعة طازج، بروتين ممتاز لوجبة السحور.', price: 24, oldPrice: 27, rating: 4.7, category: 'suhoor', emoji: '🥚', gradient: 'from-[#FEF3C7] to-[#FBBF24]', store: 'بقالة السحور', eta: 25 },
  { id: 'p-su6', name: 'عسل سدر ٥٠٠ جرام', description: 'عسل سدر طبيعي، ملعقة منه مع السحور تمدك بالطاقة.', price: 85, oldPrice: 110, rating: 4.9, category: 'suhoor', emoji: '🍯', gradient: 'from-[#FDE68A] to-[#CA8A04]', store: 'مناحل الجنوب', eta: 30 },

  // Meat & Poultry
  { id: 'p-m1', name: 'لحم غنم طازج مفروم ١ كجم', description: 'لحم غنم مفروم طازج من مزارع معتمدة، مثالي لحشوة السمبوسة والكبسة.', price: 78, oldPrice: 95, rating: 4.9, category: 'meat', emoji: '🥩', gradient: 'from-[#FECACA] to-[#991B1B]', store: 'ذبائح نجد', eta: 45 },
  { id: 'p-m5', name: 'دجاج طازج كامل ١٢٠٠ جرام', description: 'دجاج طازج كامل نظيف وجاهز للتتبيل والفرن أو المندي.', price: 24, oldPrice: 28, rating: 4.7, category: 'meat', emoji: '🍗', gradient: 'from-[#FED7AA] to-[#EA580C]', store: 'دواجن الوطنية', eta: 40 },
  { id: 'p-m6', name: 'صدور دجاج طازجة ١ كجم', description: 'صدور دجاج طازجة بدون عظم، للمقليات والمشاوي والشوربة.', price: 32, rating: 4.7, category: 'meat', emoji: '🍗', gradient: 'from-[#FEF3C7] to-[#F59E0B]', store: 'دواجن الوطنية', eta: 40 },
  { id: 'p-m7', name: 'لحم بقري مقطع للهريس والمرق ١ كجم', description: 'مكعبات لحم بقري طازج مناسبة للهريس والمرق والشوربة.', price: 69, oldPrice: 82, rating: 4.8, category: 'meat', emoji: '🥩', gradient: 'from-[#FCA5A5] to-[#7F1D1D]', store: 'ذبائح نجد', eta: 45 },

  // Fruits & Vegetables
  { id: 'p16', name: 'موز فلبيني ١ كجم', description: 'موز فلبيني طازج حلو المذاق، مصدر غني بالبوتاسيوم للصائمين.', price: 9.5, oldPrice: 12, rating: 4.7, category: 'produce', emoji: '🍌', gradient: 'from-[#FEF9C3] to-[#FACC15]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p1', name: 'بطيخ أحمر ١ حبة', description: 'بطيخ أحمر حلو ومنعش، يرطب الجسم بعد الإفطار.', price: 18, oldPrice: 24, rating: 4.6, category: 'produce', emoji: '🍉', gradient: 'from-[#BBF7D0] to-[#15803D]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p3', name: 'سلطة فواكه طازجة ١ كجم', description: 'تشكيلة فواكه مقطعة طازجة جاهزة لسفرة الإفطار.', price: 25, oldPrice: 32, rating: 4.8, category: 'produce', emoji: '🍓', gradient: 'from-[#FECACA] to-[#F43F5E]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p4', name: 'تشكيلة الفتوش (خس، فجل، خيار)', description: 'خضار طازجة مغسولة لتحضير سلطة الفتوش على السفرة.', price: 14, rating: 4.6, category: 'produce', emoji: '🥗', gradient: 'from-[#BBF7D0] to-[#16A34A]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p5', name: 'ليمون أخضر ١ كجم', description: 'ليمون طازج للعصائر والسلطات، أساسي في مطبخ رمضان.', price: 11, rating: 4.5, category: 'produce', emoji: '🍋', gradient: 'from-[#ECFCCB] to-[#65A30D]', store: 'خضار الحدائق', eta: 25 },

  // Ramadan Decor & Hosting
  { id: 'p-h4', name: 'فوانيس رمضان مضيئة (٦ حبات)', description: 'فوانيس مضيئة بألوان ذهبية وزخارف إسلامية لتزيين البيت.', price: 45, oldPrice: 60, rating: 4.9, category: 'decor', emoji: '🏮', gradient: 'from-[#FBBF24] to-[#B45309]', store: 'ديكور رمضان', eta: 40 },
  { id: 'p-h1', name: 'دلة قهوة عربية فاخرة', description: 'دلة ستانلس ستيل مزدوجة الجدار تحفظ حرارة القهوة طوال السهرة.', price: 89, oldPrice: 110, rating: 4.8, category: 'decor', emoji: '🫖', gradient: 'from-[#FDE68A] to-[#D97706]', store: 'تراث الخليج', eta: 30 },
  { id: 'p-h2', name: 'فناجين ضيافة (١٢ حبة)', description: 'فناجين فاخرة بتصميم تراثي لضيافة رمضان.', price: 24, rating: 4.6, category: 'decor', emoji: '☕', gradient: 'from-[#FEF3C7] to-[#F59E0B]', store: 'تراث الخليج', eta: 30 },
  { id: 'p-h3', name: 'طبق تقديم تراثي كبير', description: 'طبق تقديم بنقوش إسلامية ذهبية مثالي للتمر والحلويات.', price: 55, oldPrice: 70, rating: 4.7, category: 'decor', emoji: '🍽️', gradient: 'from-[#FEF9C3] to-[#FACC15]', store: 'ديكور رمضان', eta: 40 },
  { id: 'p-r1', name: 'مفرش سفرة رمضان فاخر', description: 'مفرش سفرة وأغطية بتصميم هلال ونجوم لسفرة إفطار أنيقة.', price: 65, oldPrice: 85, rating: 4.7, category: 'decor', emoji: '🌙', gradient: 'from-[#FEF3C7] to-[#B45309]', store: 'ديكور رمضان', eta: 40 },
];

// Local image slots. Drop your Ramadan product photos under public/ninja-images using these names (see RAMADAN_IMAGES_LIST.md).
// If a file is missing, the app falls back to the emoji + gradient automatically.
NINJA_CATEGORIES.forEach((item) => { item.image = `/ninja-images/categories/${item.id}.jpg`; });
NINJA_BANNERS.forEach((item) => { item.image = `/ninja-images/banners/${item.id}.jpg`; });
NINJA_BUNDLES.forEach((item) => { item.image = `/ninja-images/bundles/${item.id}.jpg`; });
NINJA_PRODUCTS.forEach((item) => { item.image = `/ninja-images/products/${item.id}.jpg`; });

export const DEFAULT_ADDRESSES: NinjaAddress[] = [
  { id: 'a1', label: 'المنزل', details: 'حي الياسمين، شارع الأمير سلطان، الرياض', icon: '🏠' },
  { id: 'a2', label: 'بيت الجدة (عزائم رمضان)', details: 'حي حطين، شارع أنس بن مالك، الرياض', icon: '🏡' },
  { id: 'a3', label: 'العمل', details: 'برج المملكة، الطابق ١٢، طريق الملك فهد، الرياض', icon: '🏢' },
];

export const SAMPLE_USER = {
  name: 'عبدالرحمن المطيري',
  phone: '٠٥٥٩٨٧٦٥٤٣',
  email: 'abdulrahman@example.com',
  joined: 'مارس ٢٠٢٤',
};

/** Ramadan campaign promotional notifications */
export const RAMADAN_NOTIFICATIONS = [
  { title: 'رمضانك أحلى مع نينجا!', body: 'خصم ٢٠٪ على كل مستلزمات رمضان بكود RAMADAN20' },
  { title: 'لا تنسى مقاضي رمضان!', body: 'باقي أيام على رمضان — جهّز سفرتك من الحين' },
  { title: 'عروض رمضان وصلت، اطلب الآن!', body: 'تمور وقطايف وصناديق إفطار بأسعار مميزة' },
  { title: 'سفرة الإفطار علينا!', body: 'صندوق سفرة الإفطار بـ٩٩ ريال شامل التمر والسمبوسة والشوربة' },
  { title: 'كود التوصيل المجاني', body: 'استخدم FREESHIP لتوصيل مجاني على طلبك التجريبي' },
  { title: 'عرض التمور اليوم', body: 'خصم ١٥٪ على التمور الفاخرة بكود DATES15' },
  { title: 'جهز قهوتك', body: 'خصم ١٠٪ على القهوة العربية بكود COFFEE10' },
  { title: 'عرض السحور', body: 'صندوق السحور التجريبي يبدأ من ٦٩ ريالاً' },
  { title: 'حلويات رمضان وصلت', body: 'قطايف وكنافة بأسعار خاصة بكود SWEET20' },
  { title: 'خصم منتصف الأسبوع', body: 'وفر ٢٥٪ على طلبك بكود MID25' },
  { title: 'عرض المشروبات', body: 'اشترِ مشروبات رمضان واحصل على توصيل مخفض' },
  { title: 'ضيافتك علينا', body: 'خصم ١٨٪ على مستلزمات الضيافة بكود HOST18' },
  { title: 'عرض الخضار الطازجة', body: 'تشكيلة خضار طازجة مع خصم تجريبي ١٢٪' },
  { title: 'عرض اللحوم والدواجن', body: 'اطلب احتياجاتك بكود FRESH15 ووفر ١٥٪' },
  { title: 'فوانيس وزينة رمضان', body: 'خصم ٢٠٪ على الزينة بكود DECOR20' },
  { title: 'آخر فرصة للعرض', body: 'ينتهي العرض التجريبي الليلة، استخدم كود LAST10' },
];

/** Products highlighted on the Ramadan home screen */
export const FEATURED_IDS = [
  'p-c1', 'p-q1', 'p-i1', 'p-su6', 'p-h4', 'p-s3',
];

/** Discounted products (special Ramadan offers) */
export function getOfferProducts(products: NinjaProduct[]): NinjaProduct[] {
  return products.filter((p) => p.oldPrice != null);
}

/** Backward-compatible aliases — other files (e.g. SystemContext.tsx) still import the old names. */
export const EID_NOTIFICATIONS = RAMADAN_NOTIFICATIONS;
export const EID_DATE_ISO = RAMADAN_DATE_ISO;
