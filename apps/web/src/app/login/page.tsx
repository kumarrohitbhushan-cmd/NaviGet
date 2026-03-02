'use client';

import { useState } from 'react';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import { ChevronRight, Shield, Phone } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    // Dummy login — no OTP required
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem('navigate_auth', JSON.stringify({
      phone: `+91${phone}`,
      token: 'demo-token',
      name: 'Demo User',
    }));
    window.location.href = '/booking';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col gradient-mesh">
      {/* Top section with logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Animated background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20 blur-[80px]"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #00D2FF)' }}
        />

        {/* Logo */}
        <div className="relative animate-float mb-8">
          <NaviGetLogo size="xl" />
        </div>

        {/* Tagline */}
        <p className="text-[var(--text-muted)] text-sm font-medium tracking-wide uppercase mb-2">
          Navigate Smarter
        </p>
        <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-1">
          Fixed fares. Zero surge.
        </h1>
        <p className="text-[var(--text-muted)] text-center text-sm">
          Same price whether it's 2 AM or 2 PM
        </p>

        {/* USP pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Fixed Fare 24×7', 'No Surge', '2× Refund', '₹0 Cancel'].map((usp) => (
            <span key={usp} className="usp-pill text-xs">{usp}</span>
          ))}
        </div>
      </div>

      {/* Bottom card */}
      <div className="px-4 pb-8">
        <div className="card-glass p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">Get started</h2>
            <p className="text-sm text-[var(--text-muted)]">Enter your phone number to continue</p>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center justify-center px-3.5 rounded-2xl text-sm font-medium text-[var(--text-secondary)]"
              style={{ background: 'var(--surface-3)', border: '1.5px solid var(--border)' }}>
              +91
            </div>
            <div className="relative flex-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-field pl-10 text-[15px]"
                autoFocus
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={phone.length !== 10 || loading}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            <Shield className="w-3 h-3 text-[var(--text-muted)]" />
            <p className="text-[11px] text-[var(--text-muted)] tracking-wide">
              Demo mode — no OTP required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
