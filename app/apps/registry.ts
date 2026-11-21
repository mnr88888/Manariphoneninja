import {
  MessageCircle,
  Phone,
  Compass,
  Image as ImageIcon,
  Camera,
  Settings,
  Calendar,
  StickyNote,
  CloudSun,
  Folder,
  Calculator,
  Terminal,
  Clock,
  Users,
  Mail,
  MessagesSquare,
  ShoppingBag,
  LucideIcon,
} from 'lucide-react';

export interface AppDefinition {
  id: string;
  name: string; // Arabic display name
  icon: LucideIcon;
  /** Real image icon asset in /public (path only, no extension assumptions) */
  imageIcon: string;
  /** Tailwind gradient classes — used for fallback surfaces and switcher tiles */
  gradient: string;
  /** Icon color */
  iconColor?: string;
  /** Whether the app lives in the dock */
  inDock?: boolean;
}

export const APPS: AppDefinition[] = [
  // --- Home screen apps (first page) ---
  {
    id: 'whatsapp',
    name: 'واتساب',
    icon: MessageCircle,
    imageIcon: '/whatsapp.webp',
    gradient: 'from-[#25D366] to-[#128C7E]',
    iconColor: 'text-white',
  },
  {
    id: 'phone',
    name: 'الهاتف',
    icon: Phone,
    imageIcon: '/phone.webp',
    gradient: 'from-[#34C759] to-[#30D158]',
    iconColor: 'text-white',
    inDock: true,
  },
  {
    id: 'messages',
    name: 'الرسائل',
    icon: MessagesSquare,
    imageIcon: '/messages.webp',
    gradient: 'from-[#5EF36F] to-[#25D366]',
    iconColor: 'text-white',
  },
  {
    id: 'mail',
    name: 'البريد',
    icon: Mail,
    imageIcon: '/mail.webp',
    gradient: 'from-[#0A84FF] to-[#007AFF]',
    iconColor: 'text-white',
  },
  {
    id: 'safari',
    name: 'سفاري',
    icon: Compass,
    imageIcon: '/safari.webp',
    gradient: 'from-[#E8F0FE] to-[#C2D7FF]',
    iconColor: 'text-[#1573E6]',
  },
  {
    id: 'photos',
    name: 'الصور',
    icon: ImageIcon,
    imageIcon: '/photos.webp',
    gradient: 'from-[#FFD60A] via-[#FF6B35] to-[#FF375F]',
    iconColor: 'text-white',
  },
  {
    id: 'camera',
    name: 'الكاميرا',
    icon: Camera,
    imageIcon: '/camera.webp',
    gradient: 'from-[#3A3A3C] to-[#1C1C1E]',
    iconColor: 'text-white',
  },
  {
    id: 'settings',
    name: 'الإعدادات',
    icon: Settings,
    imageIcon: '/settings.webp',
    gradient: 'from-[#8E8E93] to-[#48484A]',
    iconColor: 'text-white',
  },
  {
    id: 'calendar',
    name: 'التقويم',
    icon: Calendar,
    imageIcon: '/calendar.webp',
    gradient: 'from-[#FF3B30] to-[#FF453A]',
    iconColor: 'text-white',
  },
  {
    id: 'notes',
    name: 'الملاحظات',
    icon: StickyNote,
    imageIcon: '/notes.webp',
    gradient: 'from-[#FFE89A] to-[#FFD60A]',
    iconColor: 'text-[#9A7B00]',
  },
  {
    id: 'clock',
    name: 'الساعة',
    icon: Clock,
    imageIcon: '/clock.webp',
    gradient: 'from-[#1C1C1E] to-[#000000]',
    iconColor: 'text-white',
  },
  {
    id: 'weather',
    name: 'الطقس',
    icon: CloudSun,
    imageIcon: '/weather.webp',
    gradient: 'from-[#0A84FF] to-[#40C8FF]',
    iconColor: 'text-white',
  },
  {
    id: 'contacts',
    name: 'جهات الاتصال',
    icon: Users,
    imageIcon: '/contacts.webp',
    gradient: 'from-[#8E8E93] to-[#636366]',
    iconColor: 'text-white',
  },
  {
    id: 'files',
    name: 'الملفات',
    icon: Folder,
    imageIcon: '/files.webp',
    gradient: 'from-[#007AFF] to-[#0A84FF]',
    iconColor: 'text-white',
  },
  {
    id: 'calculator',
    name: 'الحاسبة',
    icon: Calculator,
    imageIcon: '/calculator.webp',
    gradient: 'from-[#FF9F0A] to-[#FF6B35]',
    iconColor: 'text-white',
  },
  {
    id: 'terminal',
    name: 'الطرفية',
    icon: Terminal,
    imageIcon: '/terminal.webp',
    gradient: 'from-[#1C1C1E] to-[#000000]',
    iconColor: 'text-[#34C759]',
  },
  {
    id: 'instagram',
    name: 'إنستغرام',
    icon: Camera,
    imageIcon: '/instagram.webp',
    gradient: 'from-[#833AB4] via-[#E1306C] to-[#F77737]',
    iconColor: 'text-white',
  },
  {
    id: 'x',
    name: 'X',
    icon: MessageCircle,
    imageIcon: '/x.webp',
    gradient: 'from-[#000000] to-[#1C1C1E]',
    iconColor: 'text-white',
  },
  {
    id: 'ninja',
    name: 'نينجا',
    icon: ShoppingBag,
    imageIcon: '/ninja.webp',
    gradient: 'from-[#6D28D9] to-[#FFC107]',
    iconColor: 'text-white',
  },
  // --- Dock apps ---
  {
    id: 'whatsapp-dock',
    name: 'واتساب',
    icon: MessageCircle,
    imageIcon: '/whatsapp.webp',
    gradient: 'from-[#25D366] to-[#128C7E]',
    iconColor: 'text-white',
    inDock: true,
  },
  {
    id: 'safari-dock',
    name: 'سفاري',
    icon: Compass,
    imageIcon: '/safari.webp',
    gradient: 'from-[#E8F0FE] to-[#C2D7FF]',
    iconColor: 'text-[#1573E6]',
    inDock: true,
  },
  {
    id: 'messages-dock',
    name: 'الرسائل',
    icon: MessagesSquare,
    imageIcon: '/messages.webp',
    gradient: 'from-[#5EF36F] to-[#25D366]',
    iconColor: 'text-white',
    inDock: true,
  },
];

/** Dock app ids in display order: WhatsApp, Safari, Messages, Phone */
export const DOCK_APPS = ['whatsapp-dock', 'safari-dock', 'messages-dock', 'phone'];

/** Home screen (non-dock) app ids in display order */
export const HOME_APPS = APPS.filter((a) => !a.inDock).map((a) => a.id);

export function getApp(id: string): AppDefinition | undefined {
  return APPS.find((a) => a.id === id);
}

/** Map dock duplicate ids back to their canonical app for rendering */
export const DOCK_APP_MAP: Record<string, string> = {
  'whatsapp-dock': 'whatsapp',
  'safari-dock': 'safari',
  'messages-dock': 'messages',
};
