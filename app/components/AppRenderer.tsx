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
import MusicApp from '../apps/music/MusicApp';
import ContactsApp from '../apps/contacts/ContactsApp';
import MailApp from '../apps/mail/MailApp';
import WeatherApp from '../apps/weather/WeatherApp';
import FilesApp from '../apps/files/FilesApp';
import MapsApp from '../apps/maps/MapsApp';
import TerminalApp from '../apps/terminal/TerminalApp';
import NinjaApp from '../apps/ninja/NinjaApp';

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
    case 'music':
    case 'music-dock':
      return <MusicApp />;
    case 'contacts':
      return <ContactsApp />;
    case 'mail':
      return <MailApp />;
    case 'weather':
      return <WeatherApp />;
    case 'files':
      return <FilesApp />;
    case 'maps':
      return <MapsApp />;
    case 'terminal':
      return <TerminalApp />;
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
}: {
  appId: string;
  active: boolean;
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

  return (
    <div
      className={`absolute inset-0 z-30 ${animClass} ${isDark ? 'dark-shell' : ''}`}
      style={{
        visibility: isHidden ? 'hidden' : 'visible',
        pointerEvents: isHidden ? 'none' : 'auto',
      }}
    >
      {renderApp(appId)}
    </div>
  );
}
