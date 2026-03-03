'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import { ChevronRight, User } from 'lucide-react';

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('navigate_auth');
      if (!auth) { router.push('/login'); return; }
      const parsed = JSON.parse(auth);
      // If name is already set (and isn't default), skip to booking
      if (parsed?.name && parsed.name !== 'Demo User') {
        router.push('/booking');
      }
    } catch { router.push('/login'); }
  }, [router]);

  const handleContinue = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    try {
      const auth = JSON.parse(localStorage.getItem('navigate_auth') || '{}');
      auth.name = name.trim();
      localStorage.setItem('navigate_auth', JSON.stringify(auth));
    } catch {}
    window.location.href = '/booking';
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="mb-8">
          <NaviGetLogo size="xl" />
        </div>

        <div className="w-20 h-20 rounded-full bg-[var(--surface-3)] flex items-center justify-center mb-6">
          <User className="w-10 h-10 text-[var(--text-muted)]" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-bold text-center text-[var(--text-primary)] mb-2">
          What should we call you?
        </h1>
        <p className="text-[var(--text-muted)] text-center text-sm mb-4">
          This helps your driver identify you
        </p>
      </div>

      {/* Bottom card */}
      <div className="px-5 pb-8">
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field text-center text-lg"
            maxLength={30}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleContinue(); }}
          />

          <button
            onClick={handleContinue}
            disabled={!name.trim() || loading}
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
        </div>
      </div>
    </div>
  );
}
