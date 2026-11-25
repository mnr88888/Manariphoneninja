'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { readStore, writeStore, STORE_CHANGE_EVENT } from '../../system/storage';

/**
 * Persistent state hook backed by localStorage.
 * Survives page refreshes. Works with JSON-serializable values.
 */
export function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef(state);
  const initialRef = useRef(initialValue);
  stateRef.current = state;

  useEffect(() => {
    // Never save a stale React snapshot over a message delivered by another app.
    const value = readStore(key, initialRef.current);
    stateRef.current = value;
    setState(value);
    if (localStorage.getItem(key) === null) writeStore(key, value);
    const reload = (event: Event) => {
      const changedKey = event instanceof StorageEvent ? event.key : (event as CustomEvent<{key: string}>).detail?.key;
      if (changedKey !== key && changedKey !== null) return;
      const next = readStore(key, initialRef.current);
      stateRef.current = next;
      setState(next);
    };
    window.addEventListener(STORE_CHANGE_EVENT, reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener(STORE_CHANGE_EVENT, reload);
      window.removeEventListener('storage', reload);
    };
  }, [key]);

  const update = useCallback((value: T | ((prev: T) => T)) => {
    const current = readStore(key, stateRef.current);
    const next = typeof value === 'function' ? (value as (p: T) => T)(current) : value;
    stateRef.current = next;
    writeStore(key, next);
    setState(next);
  }, [key]);

  return [state, update];
}

/**
 * Generate a simple unique id.
 */
export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Format a timestamp as Arabic time (e.g. "٢:٣٠ م").
 */
export function formatArabicTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
}

/**
 * Format a date as short Arabic date.
 */
export function formatArabicDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format relative time for messages (e.g. "الآن", "منذ ٥ دقائق").
 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return formatArabicDate(timestamp);
}

/** Arabic weekday names (Sunday first) */
export const ARABIC_WEEKDAYS = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت',
];

/** Short Arabic weekday names */
export const ARABIC_WEEKDAYS_SHORT = [
  'أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت',
];

/** Arabic month names */
export const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** Arabic-Indic digit conversion */
export function toArabicDigits(input: string | number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(input).replace(/[0-9]/g, (d) => arabicDigits[parseInt(d)]);
}
