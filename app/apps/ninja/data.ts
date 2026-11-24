/*
 * Ninja Eid Al-Adha campaign demo data
 * Compatible with the supplied NinjaApp.tsx component.
 * All prices, offers, dates and products below are illustrative project data,
 * not official Ninja promotions or live inventory.
 */

export type NinjaProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  rating: number;
  category: string;
  emoji: string;
  gradient: string;
  image?: string;
  store: string;
  eta: number;
};

export type NinjaBundle = {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number;
  emoji: string;
  gradient: string;
  image?: string;
};

export type NinjaAddress = {
  id: string;
  label: string;
  details: string;
  icon: string;
};

export type NinjaOrder = {
  id: string;
  date: number;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    qty: number;
    emoji: string;
    gradient: string;
    image?: string;
  }>;
  total: number;
  address: string;
  payment: string;
  deliverySlot: string;
  stage: number;
  placedAt: number;
};

const photo = (id: string, width = 700) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const CAMPAIGN = {
  nameAr: 'عيد الأضحى مع نينجا',
  nameEn: 'Ninja Eid Al-Adha',
  headline: 'العيد يجمعنا، ونينجا يجهّزنا',
  headlineEn: 'Everything you need for your Eid gathering',
  cta: 'تسوّق تجهيزات العيد',
  ctaEn: 'Shop Eid Essentials',
};

// Demonstration date only. Adjust to the intended campaign date if needed.
export const EID_DATE_ISO = '2027-05-17T00:00:00+03:00';

export const NINJA_CATEGORIES = [
  { id: 'meat', name: 'اللحوم الطازجة', emoji: '🥩', gradient: 'from-rose-100 to-orange-50', image: photo('photo-1607623814075-e51df1bdc82f', 400) },
  { id: 'bbq', name: 'مستلزمات الشواء', emoji: '🔥', gradient: 'from-orange-100 to-amber-50', image: photo('photo-1529193591184-b1d58069ecdd', 400) },
  { id: 'hospitality', name: 'ضيافة العيد', emoji: '☕', gradient: 'from-amber-100 to-yellow-50', image: photo('photo-1544787219-7f47voor5d4', 400) },
  { id: 'sweets', name: 'حلويات وشوكولاتة', emoji: '🍫', gradient: 'from-pink-100 to-rose-50', image: photo('photo-1481391319762-47dff72954d9', 400) },
  { id: 'dates', name: 'تمور وقهوة', emoji: '🌴', gradient: 'from-yellow-100 to-amber-50', image: photo('photo-1606313564200-e75d5e30476c', 400) },
  { id: 'produce', name: 'فواكه وخضار', emoji: '🍉', gradient: 'from-green-100 to-lime-50', image: photo('photo-1610832958506-aa56368176cf', 400) },
  { id: 'drinks', name: 'المشروبات', emoji: '🥤', gradient: 'from-sky-100 to-cyan-50', image: photo('photo-1544145945-f90425340c7e', 400) },
  { id: 'bakery', name: 'المخبوزات', emoji: '🥐', gradient: 'from-orange-100 to-yellow-50', image: photo('photo-1509440159596-0249088772ff', 400) },
];

export const NINJA_BANNERS = [
  { id: 'eid-main', title: 'كل تجهيزات العيد بلمسة واحدة', subtitle: 'كل احتياجات الضيافة في مكان واحد', code: 'EID20', gradient: 'from-teal-500 to-cyan-400', image: photo('photo-1517248135467-4c7edcad34c4', 900) },
  { id: 'eid-bbq', title: 'جمعة العيد أحلى بالشواء', subtitle: 'اكتشف مستلزمات الشواء والعروض', code: 'EID20', gradient: 'from-orange-700 to-amber-500', image: photo('photo-1529193591184-b1d58069ecdd', 900) },
  { id: 'eid-hospitality', title: 'ضيافتك علينا', subtitle: 'قهوة وتمور وحلويات للعيد', code: 'EID20', gradient: 'from-amber-700 to-yellow-500', image: photo('photo-1495474472287-4d71bcdd2085', 900) },
];

export const NINJA_PRODUCTS: NinjaProduct[] = [
  { id: 'm01', name: 'ريش غنم طازجة', description: 'ريش غنم طازجة مناسبة لشواء العيد، تحفظ مبردة.', price: 59.95, oldPrice: 69.95, rating: 4.8, category: 'meat', emoji: '🥩', gradient: 'from-rose-100 to-orange-50', image: photo('photo-1607623814075-e51df1bdc82f'), store: 'ملحمة نينجا', eta: 35 },
  { id: 'm02', name: 'لحم مكعبات', description: 'قطع لحم جاهزة للطبخ والتقديم في جمعة العيد.', price: 42.5, rating: 4.7, category: 'meat', emoji: '🍖', gradient: 'from-red-100 to-orange-50', image: photo('photo-1603048297172-c92544798d5a'), store: 'ملحمة نينجا', eta: 35 },
  { id: 'm03', name: 'لحم مفروم طازج', description: 'لحم مفروم طازج لتحضير أطباق العائلة.', price: 29.95, oldPrice: 34.95, rating: 4.6, category: 'meat', emoji: '🥩', gradient: 'from-rose-100 to-red-50', image: photo('photo-1602470520998-f4a52199a3d6'), store: 'ملحمة نينجا', eta: 35 },
  { id: 'b01', name: 'فحم للشواء', description: 'فحم سريع الاشتعال لجلسات الشواء الخارجية.', price: 19.95, rating: 4.5, category: 'bbq', emoji: '🔥', gradient: 'from-stone-200 to-orange-100', image: photo('photo-1529193591184-b1d58069ecdd'), store: 'نينجا ماركت', eta: 30 },
  { id: 'b02', name: 'عدة شواء أساسية', description: 'أدوات شواء عملية لتحضير وجبة العيد.', price: 34.95, oldPrice: 44.95, rating: 4.7, category: 'bbq', emoji: '🍢', gradient: 'from-orange-100 to-amber-50', image: photo('photo-1558030006-450675393462'), store: 'نينجا ماركت', eta: 30 },
  { id: 'b03', name: 'صلصة باربكيو', description: 'صلصة غنية مناسبة للحوم والدجاج المشوي.', price: 12.5, rating: 4.6, category: 'bbq', emoji: '🫙', gradient: 'from-amber-100 to-orange-50', image: photo('photo-1472476443507-c7a5948772fc'), store: 'نينجا ماركت', eta: 25 },
  { id: 'h01', name: 'قهوة سعودية', description: 'قهوة عربية لتحضير ضيافة العيد.', price: 32, oldPrice: 38, rating: 4.9, category: 'hospitality', emoji: '☕', gradient: 'from-amber-100 to-yellow-50', image: photo('photo-1495474472287-4d71bcdd2085'), store: 'نينجا ماركت', eta: 25 },
  { id: 'h02', name: 'طقم أكواب ضيافة', description: 'أكواب أنيقة لتقديم القهوة والشاي للضيوف.', price: 24.95, rating: 4.5, category: 'hospitality', emoji: '🍵', gradient: 'from-stone-100 to-amber-50', image: photo('photo-1513558161293-cdaf765edfd4'), store: 'نينجا ماركت', eta: 30 },
  { id: 's01', name: 'معمول فاخر', description: 'تشكيلة معمول بالتمر مناسبة للعيد.', price: 28.95, oldPrice: 34.95, rating: 4.8, category: 'sweets', emoji: '🍪', gradient: 'from-pink-100 to-amber-50', image: photo('photo-1558961363-fa8fdf82db35'), store: 'مخبز نينجا', eta: 25 },
  { id: 's02', name: 'علبة شوكولاتة مشكلة', description: 'تشكيلة شوكولاتة لتقديمها للضيوف.', price: 39.95, rating: 4.9, category: 'sweets', emoji: '🍫', gradient: 'from-rose-100 to-fuchsia-50', image: photo('photo-1481391319762-47dff72954d9'), store: 'نينجا ماركت', eta: 25 },
  { id: 'd01', name: 'تمر سكري فاخر', description: 'تمر سكري مختار لتقديمه مع القهوة.', price: 26.95, rating: 4.9, category: 'dates', emoji: '🌴', gradient: 'from-amber-100 to-yellow-50', image: photo('photo-1606313564200-e75d5e30476c'), store: 'نينجا ماركت', eta: 25 },
  { id: 'd02', name: 'قهوة عربية بالهيل', description: 'خلطة قهوة عربية بنكهة الهيل.', price: 29.95, rating: 4.8, category: 'dates', emoji: '☕', gradient: 'from-yellow-100 to-amber-50', image: photo('photo-1442512595331-e89e73853f31'), store: 'نينجا ماركت', eta: 25 },
  { id: 'p01', name: 'سلة فواكه العيد', description: 'تشكيلة فواكه موسمية طازجة.', price: 34.95, rating: 4.7, category: 'produce', emoji: '🍉', gradient: 'from-green-100 to-lime-50', image: photo('photo-1610832958506-aa56368176cf'), store: 'نينجا ماركت', eta: 25 },
  { id: 'd03', name: 'عصائر مشكلة', description: 'مجموعة عصائر باردة لمائدة العيد.', price: 18.95, rating: 4.5, category: 'drinks', emoji: '🥤', gradient: 'from-sky-100 to-cyan-50', image: photo('photo-1544145945-f90425340c7e'), store: 'نينجا ماركت', eta: 20 },
  { id: 'bk01', name: 'كرواسون طازج', description: 'كرواسون طازج للفطور واجتماعات العائلة.', price: 14.95, rating: 4.6, category: 'bakery', emoji: '🥐', gradient: 'from-orange-100 to-yellow-50', image: photo('photo-1509440159596-0249088772ff'), store: 'مخبز نينجا', eta: 25 },
];

export const NINJA_BUNDLES: NinjaBundle[] = [
  { id: 'bundle-family', name: 'صندوق جمعة العيد', description: 'قهوة وتمور وحلويات لضيافة العائلة.', price: 89, oldPrice: 109, emoji: '🎁', gradient: 'from-cyan-100 to-teal-50', image: photo('photo-1517248135467-4c7edcad34c4'), },
  { id: 'bundle-bbq', name: 'صندوق الشواء', description: 'اختيارات أساسية لجلسة شواء العيد.', price: 119, oldPrice: 145, emoji: '🔥', gradient: 'from-orange-100 to-amber-50', image: photo('photo-1529193591184-b1d58069ecdd'), },
  { id: 'bundle-hospitality', name: 'صندوق الضيافة', description: 'قهوة عربية وتمور ومعمول للضيوف.', price: 74, oldPrice: 89, emoji: '☕', gradient: 'from-yellow-100 to-amber-50', image: photo('photo-1495474472287-4d71bcdd2085'), },
  { id: 'bundle-sweets', name: 'صندوق حلويات العيد', description: 'تشكيلة حلوة لمشاركة فرحة العيد.', price: 65, oldPrice: 79, emoji: '🍬', gradient: 'from-pink-100 to-rose-50', image: photo('photo-1481391319762-47dff72954d9'), },
];

export const DEFAULT_ADDRESSES: NinjaAddress[] = [
  { id: 'addr-home', label: 'المنزل', details: 'حي الشاطئ، الدمام، المملكة العربية السعودية', icon: '🏠' },
  { id: 'addr-family', label: 'بيت العائلة', details: 'حي الفيصلية، الدمام، المملكة العربية السعودية', icon: '🏡' },
];

export const SAMPLE_USER = {
  name: 'عميل نينجا',
  phone: '+966 5X XXX XXXX',
  joined: '٢٠٢٥',
};

export const EID_NOTIFICATIONS = [
  { title: 'العيد قرب! جهّز مقاضيك 🎉', body: 'كل احتياجات العيد في مكان واحد. اكتشف تشكيلة نينجا الآن.' },
  { title: 'خصم خاص لك 💚', body: 'استخدم كود EID20 واحصل على خصم ٢٠٪ على طلبك التجريبي.' },
  { title: 'ضيافتك علينا ☕', body: 'قهوة وتمور وحلويات العيد بانتظارك في نينجا.' },
  { title: 'جاهز للشواء؟ 🔥', body: 'تسوّق مستلزمات الشواء وجهّز جمعة العيد.' },
];

export const FEATURED_IDS = ['m01', 'h01', 's01', 'bundle-family'];
export const getOfferProducts = (products: NinjaProduct[]) => products.filter((p) => p.oldPrice != null);

export const ORDER_STAGES = ['تم استلام طلبك', 'جاري تجهيز الطلب', 'الطلب في الطريق إليك', 'تم التوصيل بنجاح'];
export const ORDER_STAGES_EN = ['Order confirmed', 'Preparing your order', 'Out for delivery', 'Delivered'];

export const DELIVERY_FEE = 8;
export const FREE_DELIVERY_THRESHOLD = 100;
export const DISCOUNT_CODES: Record<string, { percent: number; label: string }> = {
  EID20: { percent: 20, label: 'خصم العيد ٢٠٪' },
};
