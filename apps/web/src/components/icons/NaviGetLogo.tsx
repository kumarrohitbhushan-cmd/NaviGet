'use client';

import React from 'react';

interface NaviGetLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function NaviGetLogo({ size = 'md', showText = true, className = '' }: NaviGetLogoProps) {
  const sizes = {
    sm: { icon: 26, text: 'text-lg', gap: 'gap-1.5' },
    md: { icon: 32, text: 'text-xl', gap: 'gap-2' },
    lg: { icon: 44, text: 'text-3xl', gap: 'gap-2.5' },
    xl: { icon: 56, text: 'text-4xl', gap: 'gap-3' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Logo Icon — Geometric bookmark / navigation mark */}
      <div className="relative" style={{ width: s.icon, height: s.icon }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={s.icon}
          height={s.icon}
        >
          {/* Left fold */}
          <path d="M8 6L24 18L24 42L8 30V6Z" fill="#3654DB" />
          {/* Right fold */}
          <path d="M40 6L24 18L24 42L40 30V6Z" fill="#2A45B8" />
          {/* Top chevron accent */}
          <path d="M8 6L24 18L40 6L32 6L24 12L16 6Z" fill="#4A6CF7" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={`font-display font-bold ${s.text} tracking-tight`}>
          <span style={{ color: '#1A1F36' }}>Navi</span>
          <span style={{ color: '#1A1F36' }}>Get</span>
          <span className="text-[8px] align-super font-normal" style={{ color: '#8892A6' }}>™</span>
        </span>
      )}
    </div>
  );
}
