'use client';

import { useEffect, useState } from 'react';
import NaviGetLogo from '@/components/icons/NaviGetLogo';

export default function SplashPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Show splash briefly, then redirect via window.location (reliable even if React router fails)
    const timer = setTimeout(() => {
      setReady(true);
      const auth = localStorage.getItem('navigate_auth');
      const target = auth ? '/booking' : '/login';
      // Small delay after fade-out animation starts
      setTimeout(() => {
        window.location.href = target;
      }, 400);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #6C5CE7, transparent 70%)' }} />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(108,92,231,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Logo */}
      <div className={`transition-all duration-700 ${ready ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="animate-scale-in">
          <NaviGetLogo size="xl" />
        </div>

        {/* Tagline */}
        <p className="text-center text-[var(--text-muted)] text-sm mt-6 tracking-wide animate-fade-in"
          style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
          Fixed fares. Zero surge. Always.
        </p>

        {/* Loading dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8 animate-fade-in"
          style={{ animationDelay: '0.8s', animationFillMode: 'backwards' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--brand)',
                animation: `splashPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center">
        <p className="text-[10px] text-[var(--text-muted)] tracking-wider">NAVIGATE YOUR CITY</p>
      </div>
    </div>
  );
}
