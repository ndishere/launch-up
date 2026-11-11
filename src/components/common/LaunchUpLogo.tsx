import React, { useId } from 'react';

interface LaunchUpLogoProps {
  size?: number;
  className?: string;
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
