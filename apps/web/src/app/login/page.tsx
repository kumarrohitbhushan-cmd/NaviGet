'use client';

import { useState } from 'react';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import { ChevronRight, Shield } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem('navigate_auth', JSON.stringify({
      phone: `+91${phone}`,
      token: 'demo-token',
      name: '',
    }));
    window.location.href = '/name';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Hero image section */}
      <div className="relative w-full h-[42dvh] overflow-hidden">
        <Image
          src="/cab-banner.jpg"
          alt="NaviGet Ride"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white" />
        {/* Logo on top of image */}
        <div className="absolute top-10 left-0 right-0 flex justify-center z-10">
          <div className="bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-2xl shadow-md">
            <NaviGetLogo size="lg" />
          </div>
        </div>
      </div>

      {/* Content below image */}
      <div className="relative -mt-6 z-10 bg-white rounded-t-3xl flex-1 flex flex-col">
        <div className="px-6 pt-6 pb-2 flex-1">
          <h1 className="text-[26px] font-bold text-[var(--text-primary)] mb-1.5 leading-tight">
            Fixed fares. Zero surge.
          </h1>
          <p className="text-[var(--text-muted)] text-sm mb-5">
            Same price whether it&apos;s 2 AM or 2 PM
          </p>

          {/* USP chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Fixed Fare 24×7', 'No Surge', '2× Refund', '₹0 Cancel'].map((usp) => (
              <span key={usp} className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--brand)] bg-[#F3F0FF] border border-[rgba(108,92,231,0.1)]">
                {usp}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom card */}
        <div className="px-5 pb-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-0.5">Get started</h2>
              <p className="text-sm text-[var(--text-muted)]">Enter your phone number to continue</p>
            </div>

            <div className="flex gap-2">
              <div className="flex items-center justify-center px-4 rounded-xl text-sm font-semibold text-[var(--text-primary)] bg-[var(--surface-3)] border border-[var(--border)]">
                +91
              </div>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="input-field flex-1"
                autoFocus
              />
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

            <div className="flex items-center justify-center gap-1.5">
              <Shield className="w-3 h-3 text-[var(--text-muted)]" />
              <p className="text-[11px] text-[var(--text-muted)]">
                Demo mode — no OTP required
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
