/* ============================================================
 * Ninja delivery app — Eid Al-Adha campaign sample data
 * "العيد يجمعنا، ونينجا يجهّزنا"
 * ============================================================ */

export interface NinjaCategory {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  gradient: string;
}

export interface NinjaBanner {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  gradient: string;
}

export interface NinjaBundle {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  emoji: string;
  gradient: string;
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
  items: { productId: string; name: string; price: number; qty: number; emoji: string; gradient: string }[];
  total: number;
  address: string;
  payment: string;
  deliverySlot: string;
  /** index into ORDER_STAGES */
  stage: number;
  placedAt: number;
}

/** 4-stage Eid campaign tracking */
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
  EID20: { percent: 20, label: 'خصم العيد ٢٠٪' },
  NINJA50: { percent: 50, label: 'خصم أول طلب ٥٠٪' },
};

/** Eid countdown target — days until Eid Al-Adha (10 Dhul-Hijjah 1447 ≈ May 27, 2026) */
export const EID_DATE_ISO = '2026-05-27T00:00:00';

export const CAMPAIGN = {
  nameAr: 'العيد يجمعنا، ونينجا يجهّزنا',
  nameEn: 'Eid Brings Us Together. Ninja Gets Us Ready.',
  headline: 'عيدكم مبارك، وتجهيزاتكم علينا!',
  headlineEn: 'Get everything ready for Eid with Ninja.',
  cta: 'تسوق مستلزمات العيد',
  ctaEn: 'Shop Eid Essentials',
};

/* ============================================================
 * Eid shopping categories
 * ============================================================ */

export const NINJA_CATEGORIES: NinjaCategory[] = [
  { id: 'hospitality', name: 'ضيافة العيد', nameEn: 'Eid Hospitality', emoji: '🕌', gradient: 'from-[#047857] to-[#065F46]' },
  { id: 'coffee-dates', name: 'قهوة وتمر', nameEn: 'Arabic Coffee & Dates', emoji: '🫖', gradient: 'from-[#B45309] to-[#78350F]' },
  { id: 'sweets', name: 'حلويات وشوكولاتة', nameEn: 'Sweets & Chocolates', emoji: '🍫', gradient: 'from-[#A16207] to-[#713F12]' },
  { id: 'meat', name: 'لحوم طازجة', nameEn: 'Fresh Meat', emoji: '🥩', gradient: 'from-[#B91C1C] to-[#7F1D1D]' },
  { id: 'bbq', name: 'مستلزمات الشواء', nameEn: 'BBQ Essentials', emoji: '🔥', gradient: 'from-[#C2410C] to-[#7C2D12]' },
  { id: 'produce', name: 'فواكه وخضار', nameEn: 'Fruits & Vegetables', emoji: '🥬', gradient: 'from-[#16A34A] to-[#166534]' },
  { id: 'drinks', name: 'عصائر ومشروبات', nameEn: 'Drinks & Beverages', emoji: '🥤', gradient: 'from-[#0E7490] to-[#155E75]' },
  { id: 'home', name: 'المنزل والنظافة', nameEn: 'Home & Cleaning', emoji: '🧹', gradient: 'from-[#475569] to-[#1E293B]' },
];

/* ============================================================
 * Campaign banners
 * ============================================================ */

export const NINJA_BANNERS: NinjaBanner[] = [
  {
    id: 'b1',
    title: 'خصم ٢٠٪ على كل مستلزمات العيد',
    subtitle: 'استخدم كود الخصم عند إتمام الطلب',
    code: 'EID20',
    gradient: 'from-[#047857] to-[#065F46]',
  },
  {
    id: 'b2',
    title: 'توصيل مجاني للطلبات فوق ٧٥ ريال',
    subtitle: 'اطلب تجمعات العيد بلا قلق',
    code: 'FREESHIP',
    gradient: 'from-[#D4A017] to-[#92400E]',
  },
  {
    id: 'b3',
    title: 'عروض محدودة على اللحوم الطازجة',
    subtitle: 'ذبائح مختارة وأسعار مميزة',
    code: 'EIDMEAT',
    gradient: 'from-[#166534] to-[#052E16]',
  },
];

/* ============================================================
 * Eid bundles
 * ============================================================ */

export const NINJA_BUNDLES: NinjaBundle[] = [
  {
    id: 'bundle-family',
    name: 'صندوق تجمعات العائلة',
    description: 'كل ما تحتاجه تجمعتك العائلية: أرز فاخر، لحوم، مرق، وخبازة التميس.',
    price: 189,
    oldPrice: 245,
    emoji: '👨‍👩‍👧‍👦',
    gradient: 'from-[#047857] to-[#022C22]',
    productIds: ['p5', 'p-m1', 'p2'],
  },
  {
    id: 'bundle-bbq',
    name: 'صندوق الشواء',
    description: 'فحم طبيعي، أدوات شواء، توابل مشكلة، وأسياخ جاهزة للحفل.',
    price: 129,
    oldPrice: 165,
    emoji: '🔥',
    gradient: 'from-[#C2410C] to-[#431407]',
    productIds: ['p-b1', 'p-b2', 'p-b3'],
  },
  {
    id: 'bundle-hospitality',
    name: 'صندوق الضيافة',
    description: 'قهوة عربية، دلال، تمر مجدول، وعلكات تراثية لضيوف العيد.',
    price: 99,
    oldPrice: 135,
    emoji: '🕌',
    gradient: 'from-[#B45309] to-[#451A03]',
    productIds: ['p10', 'p-c1', 'p-c2'],
  },
  {
    id: 'bundle-sweets',
    name: 'صندوق الحلويات',
    description: 'شوكولاتة فاخرة، معمول، كيك عيد، وحلويات مشكلة للأطفال.',
    price: 115,
    oldPrice: 150,
    emoji: '🍫',
    gradient: 'from-[#A16207] to-[#3B2A0B]',
    productIds: ['p-s1', 'p-s2', 'p13'],
  },
];

/* ============================================================
 * Eid products by category
 * ============================================================ */

export const NINJA_PRODUCTS: NinjaProduct[] = [
  // Eid Hospitality
  { id: 'p-h1', name: 'دلة قهوة عربية فاخرة', description: 'دلة ستانلس ستيل مزدوجة الجدار لحفظ حرارة القهوة طوال الجلسة.', price: 89, oldPrice: 110, rating: 4.8, category: 'hospitality', emoji: '🫖', gradient: 'from-[#FDE68A] to-[#D97706]', store: 'تراث الخليج', eta: 30 },
  { id: 'p-h2', name: 'أكواب ضيافة فنجان (١٢ حبة)', description: 'فناجين بلاستيكية فاخرة بتصميم تراثي لضيافة العيد.', price: 24, rating: 4.6, category: 'hospitality', emoji: '🥃', gradient: 'from-[#FEF3C7] to-[#F59E0B]', store: 'تراث الخليج', eta: 30 },
  { id: 'p-h3', name: 'طبق تقديم تراثي كبير', description: 'طبق تقديم بنقوش إسلامية ذهبية مثالي للتمر والفواكه.', price: 55, oldPrice: 70, rating: 4.7, category: 'hospitality', emoji: '🍽️', gradient: 'from-[#FEF9C3] to-[#FACC15]', store: 'ديكور العيد', eta: 40 },
  { id: 'p-h4', name: 'فوانيس عيد مزينة (٦ حبات)', description: 'فوانيس مضيئة بألوان ذهبية وزخارف إسلامية لتجميل المنزل.', price: 45, oldPrice: 60, rating: 4.9, category: 'hospitality', emoji: '🏮', gradient: 'from-[#FBBF24] to-[#B45309]', store: 'ديكور العيد', eta: 40 },
  { id: 'p-h5', name: 'علكات ونعنات تراثية', description: 'علبة علكات ونعنات تراثية للتقديم بعد القهوة.', price: 15, rating: 4.5, category: 'hospitality', emoji: '🍬', gradient: 'from-[#FECACA] to-[#F87171]', store: 'تراث الخليج', eta: 30 },

  // Arabic Coffee & Dates
  { id: 'p10', name: 'قهوة عربية سعودية بالهيل', description: 'قهوة عربية محمصة طازجة بالهيل والزعفران، النكهة الأصيلة للعيد.', price: 16, rating: 4.9, category: 'coffee-dates', emoji: '☕', gradient: 'from-[#D6D3D1] to-[#78716C]', store: 'محمصة الرياض', eta: 20 },
  { id: 'p-c1', name: 'تمر مجدول فاخر ١ كجم', description: 'تمر مجدول ملكي من نخيل القصيم، حبة كبيرة ولون بني غني.', price: 48, oldPrice: 60, rating: 4.9, category: 'coffee-dates', emoji: '🌴', gradient: 'from-[#FDE68A] to-[#92400E]', store: 'تمور القصيم', eta: 25 },
  { id: 'p-c2', name: 'تمر سخري مغموس بالشوكولاتة', description: 'تمر سخري مغطى بشوكولاتة داكنة، مثالي لضيافة العيد.', price: 38, oldPrice: 46, rating: 4.8, category: 'coffee-dates', emoji: '🍫', gradient: 'from-[#FDBA74] to-[#7C2D12]', store: 'تمور القصيم', eta: 25 },
  { id: 'p-c3', name: 'زعفران إيراني فاخر ٥ جرام', description: 'زعفران عالي الجودة بلون أحمر غامق ورائحة قوية.', price: 65, rating: 4.9, category: 'coffee-dates', emoji: '🌾', gradient: 'from-[#FEF3C7] to-[#F59E0B]', store: 'محمصة الرياض', eta: 20 },
  { id: 'p-c4', name: 'هيل أخضر ممتاز ١٠٠ جرام', description: 'هيل أخضر حبيبات ممتلئة برائحة قوية للقهوة العربية.', price: 28, rating: 4.7, category: 'coffee-dates', emoji: '🫒', gradient: 'from-[#DCFCE7] to-[#65A30D]', store: 'محمصة الرياض', eta: 20 },

  // Sweets & Chocolates
  { id: 'p-s1', name: 'شوكولاتة عيد فاخرة مشكلة ٥٠٠ جرام', description: 'تشكيلة شوكولاتة بلجيكية بحشوات الفستق والكراميل والبندق.', price: 55, oldPrice: 70, rating: 4.9, category: 'sweets', emoji: '🍫', gradient: 'from-[#FED7AA] to-[#7C2D12]', store: 'حلويات نجد', eta: 35 },
  { id: 'p-s2', name: 'معمول التمر بالسمن البلدي', description: 'معمول طازج محشو بالتمر ومطلي بالسمن البلدي.', price: 42, oldPrice: 52, rating: 4.8, category: 'sweets', emoji: '🍪', gradient: 'from-[#FDE68A] to-[#B45309]', store: 'حلويات نجد', eta: 35 },
  { id: 'p13', name: 'كيك العيد بالكراميل', description: 'كيك تمر إسفنجي بطبقات صوص الكراميل الدافئ.', price: 26, oldPrice: 32, rating: 4.8, category: 'sweets', emoji: '🍰', gradient: 'from-[#FBCFE8] to-[#EC4899]', store: 'حلويات الشام', eta: 40 },
  { id: 'p-s3', name: 'كنافة بالقشطة والقطر', description: 'كنافة نابلسية طازجة محضرة يومياً مع القشطة البلدية.', price: 32, rating: 4.9, category: 'sweets', emoji: '🍮', gradient: 'from-[#FDE68A] to-[#D97706]', store: 'حلويات الشام', eta: 40 },
  { id: 'p-s4', name: 'بقلاوة مشكلة ١ كجم', description: 'تشكيلة بقلاوة بالفستق والجوز من الأفران الشرقية.', price: 68, oldPrice: 85, rating: 4.7, category: 'sweets', emoji: '🥮', gradient: 'from-[#FDBA74] to-[#92400E]', store: 'حلويات الشام', eta: 40 },

  // Fresh Meat
  { id: 'p-m1', name: 'لحم غنم طازج مفروم ١ كجم', description: 'لحم غنم طازج مفروم طازج من مزارع معتمدة، مثالي للكبسة.', price: 78, oldPrice: 95, rating: 4.9, category: 'meat', emoji: '🥩', gradient: 'from-[#FECACA] to-[#991B1B]', store: 'ذبائح نجد', eta: 45 },
  { id: 'p-m2', name: 'ريش غنم طازجة ١ كجم', description: 'ريش غنم طازج مقطعة وجاهزة للشواء أو الفرن.', price: 62, rating: 4.8, category: 'meat', emoji: '🍖', gradient: 'from-[#FCA5A5] to-[#7F1D1D]', store: 'ذبائح نجد', eta: 45 },
  { id: 'p-m3', name: 'خروف العيد كامل (مجهز)', description: 'خروف كامل مذبوح حسب الشريعة، مقطع ومعبأ حسب الطلب.', price: 850, oldPrice: 980, rating: 5.0, category: 'meat', emoji: '🐑', gradient: 'from-[#FED7AA] to-[#7C2D12]', store: 'ذبائح نجد', eta: 120 },
  { id: 'p-m4', name: 'برجر لحم بقري عالي الجودة × ٦', description: 'أقراص برجر لحم بقري طازج بنسبة لحم ٩٠٪.', price: 38, oldPrice: 45, rating: 4.7, category: 'meat', emoji: '🍔', gradient: 'from-[#FECACA] to-[#B91C1C]', store: 'ذبائح نجد', eta: 45 },

  // BBQ Essentials
  { id: 'p-b1', name: 'فحم طبيعي معتبر ٥ كجم', description: 'فحم طبيعي عالي الحرارة يدوم طويلاً، بدون دخان.', price: 35, oldPrice: 45, rating: 4.8, category: 'bbq', emoji: '🔥', gradient: 'from-[#D6D3D1] to-[#292524]', store: 'مستلزمات الشواء', eta: 35 },
  { id: 'p-b2', name: 'أدوات شواء ستانلس (٥ قطع)', description: 'طقم شواء احترافي بمشط وأسياخ ومقص وفرشاة.', price: 75, oldPrice: 95, rating: 4.7, category: 'bbq', emoji: '🍢', gradient: 'from-[#E7E5E4] to-[#57534E]', store: 'مستلزمات الشواء', eta: 35 },
  { id: 'p-b3', name: 'توابل مشكلة للشواء ٣٠٠ جرام', description: 'خلطة توابل الشواء السرية من مطبخ نينجا.', price: 22, rating: 4.6, category: 'bbq', emoji: '🧂', gradient: 'from-[#FDE68A] to-[#B45309]', store: 'مستلزمات الشواء', eta: 35 },
  { id: 'p-b4', name: 'شواية متنقلة قابلة للطي', description: 'شواية فحم مضغوط قابلة للحمل، مثالية للرحلات والحدائق.', price: 145, oldPrice: 180, rating: 4.8, category: 'bbq', emoji: '♨️', gradient: 'from-[#A8A29E] to-[#292524]', store: 'مستلزمات الشواء', eta: 35 },

  // Fruits & Vegetables
  { id: 'p16', name: 'موز فلبيني ١ كجم', description: 'موز فلبيني طازج حلو المذاق، مصدر غني بالبوتاسيوم.', price: 9.5, oldPrice: 12, rating: 4.7, category: 'produce', emoji: '🍌', gradient: 'from-[#FEF9C3] to-[#FACC15]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p1', name: 'بطيخ أحمر ١ حبة', description: 'بطيخ أحمر حلو ومنعش، مثالي لجلسات العيد.', price: 18, oldPrice: 24, rating: 4.6, category: 'produce', emoji: '🍉', gradient: 'from-[#BBF7D0] to-[#15803D]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p2', name: 'عنب أوسترالي ٥٠٠ جرام', description: 'عنب أوسترالي حلو بلا بذور، محبوب من الأطفال.', price: 16, rating: 4.7, category: 'produce', emoji: '🍇', gradient: 'from-[#E9D5FF] to-[#7E22CE]', store: 'خضار الحدائق', eta: 25 },
  { id: 'p-p3', name: 'سلطة فواكه طازجة ١ كجم', description: 'تشكيلة فواكه مقطعة طازجة جاهزة للتقديم.', price: 25, oldPrice: 32, rating: 4.8, category: 'produce', emoji: '🍉', gradient: 'from-[#FECACA] to-[#F43F5E]', store: 'خضار الحدائق', eta: 25 },

  // Drinks & Beverages
  { id: 'p-d1', name: 'عصير برتقال طبيعي ٢ لتر', description: 'عصير برتقال طبيعي ١٠٠٪ بدون سكر مضاف.', price: 14, oldPrice: 18, rating: 4.6, category: 'drinks', emoji: '🍊', gradient: 'from-[#FED7AA] to-[#EA580C]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d2', name: 'ليموناضة بالنعناع ١.٥ لتر', description: 'ليموناضة طازجة بالنعناع، المنعش الأمثل لجلسات العيد.', price: 12, rating: 4.7, category: 'drinks', emoji: '🍋', gradient: 'from-[#FEF9C3] to-[#84CC16]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d3', name: 'مياه غازية مشكلة × ١٢', description: 'تشكيلة مشروبات غازية بنكهات متنوعة، عبوة ٣٣٠ مل.', price: 27, oldPrice: 33, rating: 4.5, category: 'drinks', emoji: '🥤', gradient: 'from-[#BAE6FD] to-[#0369A1]', store: 'عصائر الشرق', eta: 20 },
  { id: 'p-d4', name: 'شاي أحمر بالنعناع (٢٥ كيس)', description: 'شاي أحمر فاخر بأكياس مغلفة برائحة النعناع المنعشة.', price: 18, rating: 4.6, category: 'drinks', emoji: '🫖', gradient: 'from-[#FDE68A] to-[#B45309]', store: 'بيت الشاي', eta: 20 },

  // Home & Cleaning
  { id: 'p-home1', name: 'موائد ضيافة فاخرة (١٢ مقعد)', description: 'مفارش وأغطية طاولة فاخرة بتصميم عيد أنيق.', price: 95, oldPrice: 120, rating: 4.7, category: 'home', emoji: '🕯️', gradient: 'from-[#FEF3C7] to-[#B45309]', store: 'ديكور العيد', eta: 40 },
  { id: 'p-home2', name: 'مناديل ورقية × ١٠ علب', description: 'مناديل ورقية ناعمة وثنائية الطبقة، عبوة اقتصادية للعيد.', price: 29.5, rating: 4.4, category: 'home', emoji: '🧻', gradient: 'from-[#F1F5F9] to-[#CBD5E1]', store: 'مستلزمات البيت', eta: 30 },
  { id: 'p-home3', name: 'منظف أسطح متعدد ٢ لتر', description: 'منظف قوي لكل أسطح المطبخ والحمام برائحة منعشة.', price: 22, oldPrice: 26, rating: 4.5, category: 'home', emoji: '🧼', gradient: 'from-[#BAE6FD] to-[#38BDF8]', store: 'مستلزمات البيت', eta: 30 },
  { id: 'p-home4', name: 'أكياس قمامة كبيرة × ٥٠', description: 'أكياس قمامة متينة بسحب معدني، حجم ١٠٠ لتر.', price: 17.25, rating: 4.3, category: 'home', emoji: '🗑️', gradient: 'from-[#E7E5E4] to-[#A8A29E]', store: 'مستلزمات البيت', eta: 30 },
];

export const DEFAULT_ADDRESSES: NinjaAddress[] = [
  { id: 'a1', label: 'المنزل', details: 'حي الياسمين، شارع الأمير سلطان، الرياض', icon: '🏠' },
  { id: 'a2', label: 'بيت الجدة (تجمعات العيد)', details: 'حي حطين، شارع أنس بن مالك، الرياض', icon: '🏡' },
  { id: 'a3', label: 'العمل', details: 'برج المملكة، الطابق ١٢، طريق الملك فهد، الرياض', icon: '🏢' },
];

export const SAMPLE_USER = {
  name: 'عبدالرحمن المطيري',
  phone: '٠٥٥٩٨٧٦٥٤٣',
  email: 'abdulrahman@example.com',
  joined: 'مارس ٢٠٢٤',
};

/** Eid campaign promotional notifications */
export const EID_NOTIFICATIONS = [
  { title: 'عيدك أحلى مع نينجا!', body: 'خصم ٢٠٪ على كل مستلزمات العيد بكود EID20' },
  { title: 'لا تنسى تجهيزات العيد!', body: 'باقي أيام على العيد — جهز بيتك من الحين' },
  { title: 'عروض العيد وصلت، اطلب الآن!', body: 'لحوم طازجة وصناديق تجمعات بأسعار مميزة' },
  { title: 'ضيافتك علينا!', body: 'صندوق الضيافة بـ٩٩ ريال شامل القهوة والتمر' },
];

/** Products highlighted on the Eid home screen */
export const FEATURED_IDS = [
  'p-m3', 'p-h1', 'p-c1', 'p-s1', 'p-b1', 'p13',
];

/** Discounted products (special Eid offers) */
export function getOfferProducts(products: NinjaProduct[]): NinjaProduct[] {
  return products.filter((p) => p.oldPrice != null);
}
