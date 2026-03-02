'use client';

import { useState } from 'react';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import { ChevronRight, Shield } from 'lucide-react';

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
      name: 'Demo User',
    }));
    window.location.href = '/booking';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="mb-8">
          <NaviGetLogo size="xl" />
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
          Fixed fares. Zero surge.
        </h1>
        <p className="text-[var(--text-muted)] text-center text-sm mb-8">
          Same price whether it&apos;s 2 AM or 2 PM
        </p>

        {/* USP chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Fixed Fare 24×7', 'No Surge', '2× Refund', '₹0 Cancel'].map((usp) => (
            <span key={usp} className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] bg-[#F6F6F6]">
              {usp}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom card */}
      <div className="px-5 pb-8">
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Get started</h2>
            <p className="text-sm text-[var(--text-muted)]">Enter your phone number to continue</p>
          </div>

          <div className="flex gap-2">
            <div className="flex items-center justify-center px-4 rounded-xl text-sm font-medium text-[var(--text-primary)] bg-[#F6F6F6]">
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
  );
}
