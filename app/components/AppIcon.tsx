'use client';

import { useState } from 'react';
import { AppDefinition } from '../apps/registry';
import { useSystem } from '../system/SystemContext';

interface AppIconProps {
  app: AppDefinition;
  onPress: (id: string) => void;
  /** Show app name label underneath */
  showLabel?: boolean;
  /** Badge number */
  badge?: number;
}

/**
 * iOS 26-style app icon rendered from a real image asset with appearance
 * modes: light (native artwork), dark (dimmed + vignette), tinted
 * (monochrome gradient over the artwork) and auto (follows system theme).
 */
export default function AppIcon({
  app,
  onPress,
  showLabel = true,
  badge,
}: AppIconProps) {
  const [pressed, setPressed] = useState(false);
  const { settings, isDark } = useSystem();

  const mode =
    settings.iconAppearance === 'auto' ? (isDark ? 'dark' : 'light') : settings.iconAppearance;

  const handlePress = () => {
    setPressed(true);
    setTimeout(() => setPressed(false), 300);
    onPress(app.id);
  };

  return (
    <button
      onClick={handlePress}
      className="flex w-full min-w-0 flex-col items-center gap-1.5 focus:outline-none"
      aria-label={app.name}
    >
      <div className="relative">
      <div
        className={`home-icon-art relative flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-[14px] shadow-lg transition-transform duration-150 ${
          pressed ? 'icon-press scale-90' : 'scale-100'
        }`}
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1C1C1E',
        }}
      >
        {/* Real image artwork */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={app.imageIcon}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={
            mode === 'dark'
              ? { filter: 'brightness(0.62) saturate(0.85)' }
              : mode === 'tinted'
                ? {
                    filter:
                      'grayscale(1) brightness(0.9) contrast(1.05) sepia(0.35) saturate(2.4) hue-rotate(175deg)',
                  }
                : undefined
          }
        />
        {/* Glass sheen highlight */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 35%, transparent 60%)',
          }}
        />
        {mode === 'dark' && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 30%, transparent 40%, rgba(0,0,0,0.35) 100%)' }}
          />
        )}
      </div>
      {/* Badge lives OUTSIDE the clipped icon so it straddles the corner like iOS */}
      {badge != null && badge > 0 && (
        <span className="pointer-events-none absolute -right-[7px] -top-[7px] z-10 flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#FF3B30] px-1.5 text-[13px] font-semibold leading-none text-white shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      </div>
      {showLabel && (
        <span className="max-w-full truncate text-[11px] font-medium text-white drop-shadow-md">
          {app.name}
        </span>
      )}
    </button>
  );
}
