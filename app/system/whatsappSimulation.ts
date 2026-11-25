'use client';
export { useNotificationSimulation as useWhatsAppSimulation } from './notificationSimulation';
import { sendIncomingForApp } from './notificationSimulation';
import type { NewNotification } from './SystemContext';
export function sendIncomingWhatsApp(addNotification: (n: NewNotification) => void) {
  return sendIncomingForApp('whatsapp', addNotification);
}
