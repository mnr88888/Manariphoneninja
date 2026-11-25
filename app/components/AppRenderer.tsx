'use client';

import { useOS } from '../OSContext';
import { useSystem } from '../system/SystemContext';
import { getApp } from '../apps/registry';
import AppPlaceholder from './AppPlaceholder';
import CalculatorApp from '../apps/calculator/CalculatorApp';
import MessagesApp from '../apps/messages/MessagesApp';
import SettingsApp from '../apps/settings/SettingsApp';
import WhatsAppApp from '../apps/whatsapp/WhatsAppApp';
import PhoneApp from '../apps/phone/PhoneApp';
import SafariApp from '../apps/safari/SafariApp';
import PhotosApp from '../apps/photos/PhotosApp';
import CameraApp from '../apps/camera/CameraApp';
import CalendarApp from '../apps/calendar/CalendarApp';
import NotesApp from '../apps/notes/NotesApp';
import ClockApp from '../apps/clock/ClockApp';
import ContactsApp from '../apps/contacts/ContactsApp';
import MailApp from '../apps/mail/MailApp';
import WeatherApp from '../apps/weather/WeatherApp';
import FilesApp from '../apps/files/FilesApp';
import TerminalApp from '../apps/terminal/TerminalApp';
import NinjaApp from '../apps/ninja/NinjaApp';
import InstagramApp from '../apps/instagram/InstagramApp';
import XApp from '../apps/x/XApp';

function renderApp(appId: string): React.ReactNode {
  switch (appId) {
    case 'calculator':
      return <CalculatorApp />;
    case 'messages':
      return <MessagesApp />;
    case 'settings':
      return <SettingsApp />;
    case 'whatsapp':
      return <WhatsAppApp />;
    case 'phone':
      return <PhoneApp />;
    case 'safari':
    case 'safari-dock':
      return <SafariApp />;
    case 'photos':
      return <PhotosApp />;
    case 'camera':
      return <CameraApp />;
    case 'calendar':
      return <CalendarApp />;
    case 'notes':
      return <NotesApp />;
    case 'clock':
      return <ClockApp />;
    case 'contacts':
      return <ContactsApp />;
    case 'mail':
      return <MailApp />;
    case 'weather':
      return <WeatherApp />;
    case 'files':
      return <FilesApp />;
    case 'terminal':
      return <TerminalApp />;
    case 'instagram':
      return <InstagramApp />;
    case 'x':
      return <XApp />;
    case 'ninja':
      return <NinjaApp />;
    default:
      return <AppPlaceholder appId={appId} />;
  }
}

/**
 * Renders a single app instance. Receives whether this app is the
 * currently active one so it can apply open/close animations.
 */
export default function AppRenderer({
  appId,
  active,
  dragProgress = 0,
  dragMode = 'home',
}: {
  appId: string;
  active: boolean;
  /** 0..1 continuous home-indicator drag progress */
  dragProgress?: number;
  dragMode?: 'home' | 'switcher';
}) {
  const { closing, opening, screenMode } = useOS();
  const { isDark } = useSystem();
  const app = getApp(appId);
  if (!app) return null;

  let animClass = '';
  if (active) {
    if (closing) {
      animClass = 'app-close';
    } else if (opening) {
      animClass = 'app-open';
    }
  }

  const isHidden = !active;
  // Continuous drag: scale down + fade + round corners as the finger pulls up
  const dragging = active && dragProgress > 0;
  const scale = dragging ? 1 - 0.18 * dragProgress : 1;
  const opacity = dragging ? 1 - 0.35 * dragProgress : 1;
  const radius = dragging ? 12 + 40 * dragProgress : 0;

  return (
    <div
      data-simulator-app={appId}
      data-app-active={active ? 'true' : 'false'}
      aria-hidden={!active}
      className={`absolute inset-0 z-30 ${animClass} ${isDark && appId !== 'whatsapp' ? 'dark-shell' : ''}`}
      style={{
        visibility: isHidden ? 'hidden' : 'visible',
        pointerEvents: isHidden || dragging ? 'none' : 'auto',
        transform: dragging ? `scale(${scale})` : undefined,
        opacity: dragging ? opacity : undefined,
        borderRadius: dragging ? radius : undefined,
        overflow: dragging ? 'hidden' : undefined,
        transformOrigin: 'center center',
        transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1), opacity 0.3s, border-radius 0.3s',
      }}
    >
      {renderApp(appId)}
    </div>
  );
}
