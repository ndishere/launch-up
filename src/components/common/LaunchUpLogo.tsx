import React, { useId } from 'react';

interface LaunchUpLogoProps {
  size?: number;
  className?: string;
}

export interface LaunchUpFaviconOptions {
  isDark?: boolean;
  accent?: string;
  shade200?: string;
  shade300?: string;
  shade400?: string;
  shade700?: string;
}

/**
 * Generates an SVG data URL matching LaunchUpLogo for dynamic browser favicon syncing.
 */
export function buildLaunchUpFaviconDataUrl({
  isDark = false,
  accent = '#6366f1',
  shade200 = '#c7d2fe',
  shade300 = '#a5b4fc',
  shade400 = '#818cf8',
  shade700 = '#4338ca',
}: LaunchUpFaviconOptions = {}): string {
  const bg = isDark ? '#0f172a' : '#f8fafc';
  const border = isDark ? '#334155' : '#e2e8f0';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none"><defs><linearGradient id="p" x1="6" y1="28" x2="26" y2="4" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="${shade700}"/><stop offset="55%" stop-color="${accent}"/><stop offset="100%" stop-color="${shade400}"/></linearGradient><linearGradient id="c" x1="16" y1="8" x2="16" y2="27" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="100%" stop-color="${shade200}" stop-opacity="0.85"/></linearGradient></defs><rect x="0.75" y="0.75" width="32.5" height="32.5" rx="9" fill="${bg}" stroke="${border}" stroke-width="1.2"/><g transform="translate(5, 5) scale(0.75)"><path d="M16 3L6.5 23.5L12.5 21L16 11.5L19.5 21L25.5 23.5L16 3Z" fill="url(#p)"/><path d="M16 3L16 11.5L19.5 21L25.5 23.5L16 3Z" fill="${shade300}" fill-opacity="0.32"/><path d="M16 12.2L12.6 22.8L16 20.8L19.4 22.8L16 12.2Z" fill="url(#c)"/><path d="M11.8 25.4L16 28.8L20.2 25.4L16 26.8L11.8 25.4Z" fill="${accent}"/></g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Theme-adaptive geometric ascend prism logo for Launch Up.
 * Inherits CSS palette custom properties (--theme-accent, --palette-*)
 * across Light, Dark, System modes and all 5 color palettes.
 */
export const LaunchUpLogo: React.FC<LaunchUpLogoProps> = ({
  size = 34,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const prismGradId = `launchup-prism-${uid}`;
  const coreGradId = `launchup-core-${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-xl shrink-0 select-none border border-slate-200/80 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-900/90 ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: '0 2px 10px -2px var(--theme-accent-subtle, rgba(99, 102, 241, 0.2))',
      }}
      aria-label="Launch Up Logo"
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={prismGradId} x1="6" y1="28" x2="26" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--palette-700, #4338ca)" />
            <stop offset="55%" stopColor="var(--theme-accent, #6366f1)" />
            <stop offset="100%" stopColor="var(--palette-400, #818cf8)" />
          </linearGradient>
          <linearGradient id={coreGradId} x1="16" y1="8" x2="16" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--palette-200, #c7d2fe)" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Outer Left & Right Geometric Ascend Wings */}
        <path
          d="M16 3L6.5 23.5L12.5 21L16 11.5L19.5 21L25.5 23.5L16 3Z"
          fill={`url(#${prismGradId})`}
        />

        {/* Subtle Inner Highlight Facet */}
        <path
          d="M16 3L16 11.5L19.5 21L25.5 23.5L16 3Z"
          fill="var(--palette-300, #a5b4fc)"
          fillOpacity="0.32"
        />

        {/* Ascend Core Prism */}
        <path
          d="M16 12.2L12.6 22.8L16 20.8L19.4 22.8L16 12.2Z"
          fill={`url(#${coreGradId})`}
        />

        {/* Ignition Thrust Chevron */}
        <path
          d="M11.8 25.4L16 28.8L20.2 25.4L16 26.8L11.8 25.4Z"
          fill="var(--theme-accent, #6366f1)"
        />
      </svg>
    </div>
  );
};
