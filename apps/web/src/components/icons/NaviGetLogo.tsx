'use client';

import React, { useId } from 'react';

interface NaviGetLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function NaviGetLogo({ size = 'md', showText = true, className = '' }: NaviGetLogoProps) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 36, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-4xl', gap: 'gap-3' },
  };

  const s = sizes[size];
  const uid = useId();
  const gradId = `logoGrad-${uid}`;
  const arrowId = `arrowGrad-${uid}`;

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Logo Icon — Abstract navigation arrow with signal rings */}
      <div className="relative" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s.icon}
          height={s.icon}
        >
          {/* Background circle with gradient */}
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C5CE7" />
              <stop offset="50%" stopColor="#A29BFE" />
              <stop offset="100%" stopColor="#00D2FF" />
            </linearGradient>
            <linearGradient id={arrowId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E8E4FF" />
            </linearGradient>
          </defs>
          
          {/* Main circle */}
          <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#${gradId})`} />
          
          {/* Navigation arrow / pin shape */}
          <path
            d="M32 14C32 14 20 26 20 34C20 40.627 25.373 46 32 46C38.627 46 44 40.627 44 34C44 26 32 14 32 14Z"
            fill="white"
            fillOpacity="0.95"
          />
          
          {/* Inner dot */}
          <circle cx="32" cy="34" r="5" fill={`url(#${gradId})`} />
          
          {/* Signal arcs */}
          <path
            d="M48 20C48 20 50 24 50 28"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeOpacity="0.5"
          />
          <path
            d="M51 16C51 16 54 22 54 28"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.3"
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-display font-bold ${s.text} tracking-tight`}>
          <span className="text-[var(--text-primary)]">Navi</span>
          <span style={{ color: '#A29BFE' }}>Get</span>
        </span>
      )}
    </div>
  );
}
