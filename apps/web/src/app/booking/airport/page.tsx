'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import { ChevronLeft, Plane, ChevronRight, Building2 } from 'lucide-react';

const AIRLINES = [
  { code: '6E', name: 'IndiGo', color: '#1A237E' },
  { code: 'AI', name: 'Air India', color: '#E53935' },
  { code: 'UK', name: 'Vistara', color: '#4A154B' },
  { code: 'SG', name: 'SpiceJet', color: '#FFB300' },
  { code: 'IX', name: 'Air India Express', color: '#E65100' },
  { code: 'QP', name: 'Akasa Air', color: '#FF6B00' },
  { code: 'G8', name: 'Go First', color: '#00695C' },
  { code: 'I5', name: 'AirAsia India', color: '#D32F2F' },
];

export default function AirportDetailsPage() {
  const router = useRouter();
  const [terminal, setTerminal] = useState<'T1' | 'T2' | null>(null);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [flightNumber, setFlightNumber] = useState('');

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('airport_booking');
      if (!data) { router.push('/booking'); return; }
    } catch { router.push('/booking'); }
  }, [router]);

  const handleContinue = () => {
    if (!terminal) return;
    // Save airport details and proceed to vehicle selection
    try {
      const existing = JSON.parse(sessionStorage.getItem('airport_booking') || '{}');
      existing.terminal = terminal;
      existing.airline = selectedAirline;
      existing.flightNumber = selectedAirline ? `${selectedAirline}${flightNumber}` : '';
      sessionStorage.setItem('airport_booking', JSON.stringify(existing));
    } catch {}
    router.push('/booking/vehicles');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white px-5 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[var(--surface-3)] flex items-center justify-center transition-all active:scale-95">
          <ChevronLeft className="w-5 h-5 text-[var(--text-primary)]" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[var(--text-primary)]">Airport Details</h1>
          <p className="text-xs text-[var(--text-muted)]">Help us serve you better</p>
        </div>
        <Plane className="w-5 h-5 text-[var(--brand)]" />
      </header>

      <div className="flex-1 px-5 pt-6 pb-4 flex flex-col">
        {/* Terminal Selection */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            Select Terminal
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['T1', 'T2'] as const).map((t) => (
              <button key={t} onClick={() => setTerminal(t)}
                className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                  terminal === t
                    ? 'border-[var(--brand)] bg-[#F3F0FF]'
                    : 'border-[var(--border)] bg-white hover:bg-[var(--surface-3)]'
                }`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  terminal === t ? 'bg-[var(--brand)] text-white' : 'bg-[var(--surface-3)] text-[var(--text-secondary)]'
                }`}>
                  <Building2 className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <span className={`text-sm font-bold ${terminal === t ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'}`}>
                  Terminal {t.slice(1)}
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {t === 'T1' ? 'Domestic' : 'International & Domestic'}
                </span>
                {terminal === t && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--brand)] flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Details (Optional) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Flight Details
            </p>
            <span className="text-[10px] text-[var(--text-muted)] italic">Optional</span>
          </div>

          {/* Airline selector */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {AIRLINES.map((a) => (
              <button key={a.code} onClick={() => setSelectedAirline(selectedAirline === a.code ? null : a.code)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-150 active:scale-[0.97] ${
                  selectedAirline === a.code
                    ? 'border-[var(--brand)] bg-[#F3F0FF]'
                    : 'border-[var(--border)] bg-white'
                }`}>
                <span className="text-xs font-bold" style={{ color: a.color }}>{a.code}</span>
                <span className="text-[9px] text-[var(--text-muted)] leading-tight text-center truncate w-full">{a.name}</span>
              </button>
            ))}
          </div>

          {/* Flight number */}
          {selectedAirline && (
            <div className="flex gap-2 items-center animate-fade-in">
              <div className="px-4 py-3 rounded-xl bg-[var(--surface-3)] text-sm font-bold text-[var(--text-primary)]">
                {selectedAirline}
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Flight number (e.g. 1234)"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="input-field flex-1"
                maxLength={4}
              />
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="rounded-xl bg-[#F3F0FF] p-3 mb-auto border border-[rgba(108,92,231,0.1)]">
          <p className="text-xs text-[var(--brand)] leading-relaxed">
            <strong>Why we ask:</strong> Knowing your terminal and flight helps your driver reach the correct pickup zone and wait for you if your flight is delayed.
          </p>
        </div>

        {/* Continue button */}
        <div className="pt-4">
          <button onClick={handleContinue} disabled={!terminal}
            className="btn-primary flex items-center justify-center gap-2">
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => { 
            try {
              const existing = JSON.parse(sessionStorage.getItem('airport_booking') || '{}');
              existing.terminal = null;
              existing.airline = null;
              existing.flightNumber = '';
              sessionStorage.setItem('airport_booking', JSON.stringify(existing));
            } catch {}
            router.push('/booking/vehicles');
          }}
            className="w-full text-center text-sm font-medium text-[var(--text-muted)] mt-3 py-2">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
