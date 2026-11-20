'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface AppShellProps {
  /** Header title (Arabic) */
  title?: string;
  /** Back button handler — if provided, shows a back chevron */
  onBack?: () => void;
  /** Right-side action label */
  rightAction?: string;
  onRightAction?: () => void;
  /** Left-side action label */
  leftAction?: string;
  onLeftAction?: () => void;
  /** Background color classes */
  bgClassName?: string;
  /** Show large title (iOS large title style) */
  largeTitle?: boolean;
  /** Header tint color for text */
  headerTintColor?: string;
  /** Content */
  children: React.ReactNode;
  /** Whether to render the bottom home indicator bar */
  showHomeIndicator?: boolean;
  /** Tab bar at bottom */
  tabBar?: React.ReactNode;
  /** Extra header content below the title row */
  headerExtra?: React.ReactNode;
  /** Whether the nav bar is transparent (no solid bg) */
  transparentHeader?: boolean;
}

/**
 * Reusable iOS-style app shell. Provides a status bar spacer,
 * a navigation bar with optional back/right/left actions, a scrollable
 * content area, optional tab bar, and home indicator.
 *
 * Every app uses this for consistent layout and navigation.
 */
export default function AppShell({
  title,
  onBack,
  rightAction,
  onRightAction,
  leftAction,
  onLeftAction,
  bgClassName = 'bg-white',
  largeTitle = false,
  headerTintColor = 'text-[#007AFF]',
  children,
  showHomeIndicator = true,
  tabBar,
  headerExtra,
  transparentHeader = false,
}: AppShellProps) {
  return (
    <div className={`absolute inset-0 flex flex-col ${bgClassName}`}>
      {/* Status bar spacer */}
      <div className="h-12 shrink-0" />

      {/* Navigation bar */}
      {(title || onBack || rightAction || leftAction) && (
        <div
          className={`relative z-10 flex h-11 shrink-0 items-center justify-between px-4 ${
            transparentHeader ? '' : 'bg-transparent'
          }`}
        >
          {/* Right side (RTL: visually right = start) */}
          <div className="flex min-w-[80px] items-center justify-start">
            {onBack && (
              <button
                onClick={onBack}
                className={`flex items-center text-[17px] font-normal ${headerTintColor} active:opacity-60`}
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
                {rightAction && <span className="mr-0.5">{rightAction}</span>}
              </button>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-1 items-center justify-center">
            <h1
              className={`truncate text-center font-semibold ${
                largeTitle ? 'text-[28px]' : 'text-[17px]'
              } text-black`}
            >
              {title}
            </h1>
          </div>

          {/* Left side (RTL: visually left = end) */}
          <div className="flex min-w-[80px] items-center justify-end">
            {leftAction && (
              <button
                onClick={onLeftAction}
                className={`text-[17px] font-normal ${headerTintColor} active:opacity-60`}
              >
                {leftAction}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Extra header content */}
      {headerExtra}

      {/* Content area */}
      <div className="relative flex-1 overflow-hidden">{children}</div>

      {/* Tab bar */}
      {tabBar && <div className="shrink-0">{tabBar}</div>}

      {/* Home indicator */}
      {showHomeIndicator && (
        <div className="flex shrink-0 justify-center pb-1.5">
          <div className="h-[5px] w-36 rounded-full bg-black/80" />
        </div>
      )}
    </div>
  );
}

/**
 * iOS-style bottom tab bar.
 */
export function TabBar({
  tabs,
  activeTab,
  onTabChange,
  tint = '#007AFF',
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  tint?: string;
}) {
  return (
    <div className="flex items-center justify-around border-t border-black/10 bg-white/95 px-2 pb-2 pt-2 backdrop-blur-xl">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-1 flex-col items-center gap-0.5 transition active:scale-95"
          >
            {tab.icon && (
              <span style={{ color: active ? tint : '#8E8E93' }}>
                {tab.icon}
              </span>
            )}
            <span
              className="text-[10px] font-medium"
              style={{ color: active ? tint : '#8E8E93' }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Search bar component used across many apps.
 */
export function SearchBar({
  value,
  onChange,
  placeholder = 'بحث',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 rounded-[10px] bg-black/5 px-3 py-2">
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-black/40"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-black placeholder-black/40 outline-none"
          dir="rtl"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-black/20 text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={3}>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * iOS-style list row.
 */
export function ListRow({
  icon,
  iconBg = 'bg-[#007AFF]',
  title,
  subtitle,
  value,
  accessory,
  onClick,
  showChevron = false,
  destructive = false,
  lastInSection = false,
}: {
  icon?: React.ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  value?: string;
  accessory?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  lastInSection?: boolean;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`flex w-full items-center gap-3 bg-white px-4 py-2.5 text-right transition active:bg-black/5 ${
        lastInSection ? '' : 'border-b border-black/5'
      }`}
    >
      {icon && (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] ${iconBg} text-white`}
        >
          {icon}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className={`truncate text-[16px] ${
            destructive ? 'text-[#FF3B30]' : 'text-black'
          }`}
        >
          {title}
        </span>
        {subtitle && (
          <span className="truncate text-[13px] text-black/50">
            {subtitle}
          </span>
        )}
      </div>
      {value && (
        <span className="shrink-0 text-[15px] text-black/50">{value}</span>
      )}
      {accessory}
      {showChevron && (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-black/20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      )}
    </Comp>
  );
}

/**
 * Section grouping with optional header.
 */
export function Section({
  header,
  footer,
  children,
}: {
  header?: string;
  footer?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {header && (
        <div className="px-4 pb-1 pt-4 text-[13px] font-normal uppercase tracking-wide text-black/50">
          {header}
        </div>
      )}
      <div className="overflow-hidden rounded-[12px] mx-4">{children}</div>
      {footer && (
        <div className="px-5 pt-2 text-[13px] text-black/50">{footer}</div>
      )}
    </div>
  );
}

/**
 * Empty state component.
 */
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      {icon && <div className="mb-4 text-black/20">{icon}</div>}
      <h2 className="text-[17px] font-semibold text-black/60">{title}</h2>
      {subtitle && (
        <p className="mt-1 max-w-[250px] text-[14px] text-black/40">
          {subtitle}
        </p>
      )}
    </div>
  );
}
