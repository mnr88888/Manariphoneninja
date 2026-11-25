'use client';

import { useEffect, useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useSystem } from '../system/SystemContext';
import {
  BROTHER_SIM_EVENT,
  BROTHER_CALLS,
  getBrotherSimulationState,
  startBrotherSimulationOnUnlock,
  tickBrotherSimulation,
} from '../system/brotherSimulation';
import { BROTHER_NAME, BROTHER_PHONE } from '../system/whatsappStore';

type IncomingCall = { id: string; message: string };

export default function BrotherCalls() {
  const { locked, addNotification } = useSystem();
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);

  useEffect(() => {
    if (!locked) startBrotherSimulationOnUnlock();
    tickBrotherSimulation();
    const timer = window.setInterval(() => tickBrotherSimulation(), 1000);
    const refresh = () => {
      tickBrotherSimulation();
      const state = getBrotherSimulationState();
      const responses = JSON.parse(window.localStorage.getItem('brother-call-responses-v1') || '{}') as Record<string, string>;
      const call = BROTHER_CALLS.find((candidate) => state.delivered.indexOf(candidate.id) !== -1 && !responses[candidate.id]);
      state.delivered.forEach((id) => {
        const deliveredCall = BROTHER_CALLS.find((candidate) => candidate.id === id);
        if (deliveredCall) addNotification({ id: `${id}-message`, appId: 'whatsapp', title: BROTHER_NAME, body: deliveredCall.message, targetId: 'wa-chat-c-brother', messageId: `${id}-message` });
      });
      if (call) setIncoming({ id: call.id, message: call.message });
    };
    window.addEventListener(BROTHER_SIM_EVENT, refresh);
    refresh();
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(BROTHER_SIM_EVENT, refresh);
    };
  }, [locked, addNotification]);

  useEffect(() => {
    const onMessage = (event: Event) => {
      const detail = (event as CustomEvent<{ messageId?: string; chatId?: string; title?: string; text?: string }>).detail;
      if (detail?.messageId && detail.text) addNotification({ id: detail.messageId, appId: 'whatsapp', title: detail.title || BROTHER_NAME, body: detail.text, targetId: detail.chatId, messageId: detail.messageId });
      const state = getBrotherSimulationState();
      const responses = JSON.parse(window.localStorage.getItem('brother-call-responses-v1') || '{}') as Record<string, string>;
      const call = BROTHER_CALLS.find((candidate) => state.delivered.indexOf(candidate.id) !== -1 && !responses[candidate.id]);
      if (call) setIncoming({ id: call.id, message: call.message });
    };
    window.addEventListener('wa-sim-message', onMessage);
    return () => window.removeEventListener('wa-sim-message', onMessage);
  }, [addNotification]);

  const resolve = (answered: boolean) => {
    if (!incoming) return;
    try {
      const key = 'brother-call-responses-v1';
      const current = JSON.parse(window.localStorage.getItem(key) || '{}') as Record<string, string>;
      current[incoming.id] = answered ? 'answered' : 'declined';
      window.localStorage.setItem(key, JSON.stringify(current));
      window.localStorage.setItem('brother-call-active', '');
    } catch { /* best effort; the call itself is already persisted */ }
    setIncoming(null);
  };

  if (!incoming) return null;
  return (
    <div className="absolute inset-0 z-[90] flex flex-col items-center bg-black/75 px-6 pt-24 text-white" dir="rtl">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#5B6EF5] text-4xl font-bold shadow-xl">أ</div>
      <p className="mt-4 text-2xl font-semibold">{BROTHER_NAME}</p>
      <p className="mt-1 text-sm text-white/60">{BROTHER_PHONE}</p>
      <p className="mt-5 text-lg">مكالمة واردة</p>
      <p className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-center text-sm text-white/80">{incoming.message}</p>
      <div className="mt-auto mb-20 flex w-full max-w-[280px] justify-between">
        <button onClick={() => resolve(false)} className="flex flex-col items-center gap-2 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF3B30]"><PhoneOff className="h-7 w-7" /></span>
          <span className="text-sm">رفض</span>
        </button>
        <button onClick={() => resolve(true)} className="flex flex-col items-center gap-2 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#34C759]"><Phone className="h-7 w-7" /></span>
          <span className="text-sm">رد</span>
        </button>
      </div>
    </div>
  );
}
