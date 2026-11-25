'use client';

import {
  BROTHER_CONTACT_ID,
  BROTHER_NAME,
  BROTHER_PHONE,
  WA_CALLS_KEY,
  deliverBrotherCallMessage,
  type WARecentCall,
} from './whatsappStore';

export const BROTHER_SIM_EVENT = 'brother-call-simulation';
export const BROTHER_SIM_STATE_KEY = 'brother-call-simulation-v1';
export const BROTHER_CALLS = [
  { id: 'brother-call-1', delay: 20_000, message: 'ردي بكلمك' as const },
  { id: 'brother-call-2', delay: 80_000, message: 'ردي ياخيييي' as const },
] as const;

type SimState = { startedAt: number | null; delivered: string[] };

function readState(): SimState {
  if (typeof window === 'undefined') return { startedAt: null, delivered: [] };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(BROTHER_SIM_STATE_KEY) || 'null') as Partial<SimState> | null;
    return { startedAt: parsed && typeof parsed.startedAt === 'number' ? parsed.startedAt : null, delivered: parsed && Array.isArray(parsed.delivered) ? parsed.delivered : [] };
  } catch { return { startedAt: null, delivered: [] }; }
}

function writeState(state: SimState) {
  window.localStorage.setItem(BROTHER_SIM_STATE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent(BROTHER_SIM_EVENT));
}

function appendCallLog(callId: string, timestamp: number) {
  try {
    const existing = JSON.parse(window.localStorage.getItem(WA_CALLS_KEY) || '[]') as WARecentCall[];
    if (!existing.some((call) => call.id === callId)) {
      const next: WARecentCall = { id: callId, contactId: BROTHER_CONTACT_ID, type: 'in', timestamp, simulated: true };
      window.localStorage.setItem(WA_CALLS_KEY, JSON.stringify([next, ...existing]));
    }
    const phoneRecents = JSON.parse(window.localStorage.getItem('phone-recents') || '[]') as Array<Record<string, unknown>>;
    if (!phoneRecents.some((call) => call.id === callId)) {
      window.localStorage.setItem('phone-recents', JSON.stringify([{ id: callId, contactId: BROTHER_CONTACT_ID, number: BROTHER_PHONE, type: 'in', timestamp }, ...phoneRecents]));
    }
  } catch { /* localStorage is optional; the WhatsApp message remains authoritative */ }
}

export function startBrotherSimulationOnUnlock(): void {
  if (typeof window === 'undefined') return;
  const state = readState();
  if (state.startedAt == null) writeState({ ...state, startedAt: Date.now() });
}

/** Delivers any due calls exactly once, surviving reloads and multiple mounted apps. */
export function tickBrotherSimulation(now = Date.now()): void {
  if (typeof window === 'undefined') return;
  const state = readState();
  const startedAt = state.startedAt;
  if (startedAt == null) return;
  BROTHER_CALLS.forEach((call) => {
    if (state.delivered.indexOf(call.id) !== -1 || now - startedAt < call.delay) return;
    const timestamp = now;
    const delivered = deliverBrotherCallMessage(call.id, call.message, timestamp);
    if (!delivered) return;
    appendCallLog(call.id, timestamp);
    state.delivered = [...state.delivered, call.id];
    writeState(state);
  });
}

export function getBrotherSimulationState(): SimState {
  return readState();
}

export function getBrotherCallLabel(): string {
  return BROTHER_NAME;
}
