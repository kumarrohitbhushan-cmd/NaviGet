'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Shield,
  FileText,
  RefreshCcw,
  Ban,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  IndianRupee,
  Clock,
  Users,
  MapPin,
  Zap,
} from 'lucide-react';

interface PolicyItem {
  id: string;
  icon: React.ElementType;
  color: string;
  title: string;
  summary: string;
  details: string[];
}

const policies: PolicyItem[] = [
  {
    id: 'fixed-fare',
    icon: IndianRupee,
    color: '#6C5CE7',
    title: 'Fixed Fare Policy',
    summary: 'Same fare 24×7, no dynamic or surge pricing ever.',
    details: [
      'Fares are calculated based on distance only: Base Fare + (Distance × Per Km Rate)',
      'The fare shown at booking time is the final fare — no changes after ride completion',
      'Fare remains the same regardless of time, weather, demand, or festivals',
      'Surge multiplier is permanently set to 1.0× and cannot be modified',
      'Fare estimates are valid for the route shown at the time of booking',
    ],
  },
  {
    id: 'cancellation',
    icon: Ban,
    color: '#00E676',
    title: '₹0 Cancellation Policy',
    summary: 'Cancel anytime, completely free. No questions asked.',
    details: [
      'Riders can cancel any ride at any time with zero cancellation fee',
      'No cancellation charges apply regardless of ride status or timing',
      'Cancelled rides are instantly removed — no waiting period',
      'Frequent cancellations do not result in penalties or account restrictions',
      'This policy applies to both instant and scheduled rides',
    ],
  },
  {
    id: 'refund',
    icon: RefreshCcw,
    color: '#FF9100',
    title: '2× Refund Guarantee',
    summary: 'If we cancel your ride, you get double the fare back.',
    details: [
      'If a driver or the system cancels your confirmed ride, you receive 2× the estimated fare',
      'Refund is credited instantly to your NaviGet Wallet',
      'The 2× refund applies to the full fare amount, not a partial amount',
      'Wallet balance from refunds can be used for future rides or withdrawn',
      'This guarantee does not apply to rider-initiated cancellations (which are free anyway)',
    ],
  },
  {
    id: 'shared-rides',
    icon: Users,
    color: '#00D2FF',
    title: 'Shared Ride Policy',
    summary: 'Share rides starting at ₹399 with up to 40% savings.',
    details: [
      'Shared rides offer up to 40% discount on the standard fare',
      'Minimum fare for any shared ride is ₹399',
      'You may be matched with 1-3 other riders going in a similar direction',
      'The route may include minor detours for pickups/drops of co-riders',
      'Fixed fare guarantee applies to shared rides as well — your fare doesn\'t change if more riders join',
    ],
  },
  {
    id: 'scheduling',
    icon: Clock,
    color: '#A29BFE',
    title: 'Ride Scheduling Policy',
    summary: 'Schedule rides up to 2 hours in advance.',
    details: [
      'Rides can be scheduled between 30 minutes and 2 hours before the desired pickup time',
      'A driver is assigned approximately 15 minutes before the scheduled pickup',
      'Scheduled rides can be cancelled at any time with ₹0 fee',
      'The fare is locked at the time of scheduling — no changes at pickup time',
      'You will receive notifications when a driver is assigned and when they are en route',
    ],
  },
  {
    id: 'privacy',
    icon: Shield,
    color: '#FF4081',
    title: 'Privacy & Data Policy',
    summary: 'Your data is secure and never sold to third parties.',
    details: [
      'Phone numbers are verified via OTP and stored securely with encryption',
      'Location data is used only during active rides and not tracked otherwise',
      'Payment information is processed via PCI-DSS compliant gateways',
      'Ride history is retained for 12 months and can be deleted upon request',
      'We never sell or share your personal data with advertisers or third parties',
    ],
  },
];

export default function PoliciesPage() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(19, 17, 28, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[var(--text-primary)]">Our Policies</h1>
          <p className="text-[11px] text-[var(--text-muted)]">Transparent. Fair. Always.</p>
        </div>
        <Shield className="w-5 h-5 text-brand-light/30" />
      </header>

      {/* Trust banner */}
      <div className="mx-4 mt-4 mb-3 p-3 rounded-2xl flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(0,210,255,0.05))', border: '1px solid rgba(108,92,231,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(108,92,231,0.12)' }}>
          <Zap className="w-5 h-5 text-brand" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--text-secondary)]">NaviGet Promise</p>
          <p className="text-[11px] text-[var(--text-muted)]">All policies are hardcoded — no exceptions, no overrides.</p>
        </div>
      </div>

      {/* Policy cards */}
      <div className="px-4 py-2 space-y-3 pb-8">
        {policies.map((policy) => {
          const Icon = policy.icon;
          const isExpanded = expandedId === policy.id;

          return (
            <div key={policy.id}
              className="card-glass rounded-2xl overflow-hidden transition-all"
              style={{ border: isExpanded ? `1px solid ${policy.color}20` : '1px solid var(--border)' }}>
              <button
                onClick={() => toggle(policy.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${policy.color}12` }}>
                  <Icon className="w-5 h-5" style={{ color: policy.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{policy.title}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">{policy.summary}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/15 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/15 flex-shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="pt-2 space-y-2.5" style={{ borderTop: '1px solid var(--border)' }}>
                    {policy.details.map((detail, i) => (
                      <div key={i} className="flex gap-2.5">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: `${policy.color}60` }} />
                        <p className="text-xs text-white/35 leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
