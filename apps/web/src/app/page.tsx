'use client';

import { useEffect, useState } from 'react';
import NaviGetLogo from '@/components/icons/NaviGetLogo';

export default function SplashPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
      const auth = localStorage.getItem('navigate_auth');
      const target = auth ? '/booking' : '/login';
      setTimeout(() => {
        window.location.href = target;
      }, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-white">
      {/* Logo */}
      <div className={`transition-all duration-700 ${ready ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="animate-scale-in">
          <NaviGetLogo size="xl" />
        </div>

        <p className="text-center text-[var(--text-muted)] text-sm mt-6 animate-fade-in"
          style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          Fixed fares. Zero surge. Always.
        </p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8 animate-fade-in"
          style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[var(--text-primary)]"
              style={{ animation: `splashPulse 1.2s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-[var(--text-muted)] tracking-wider uppercase">Navigate your city</p>
      </div>
    </div>
  );
}
