'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import {
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  HelpCircle,
  AlertTriangle,
  Wallet,
  Car,
  Shield,
  MapPin,
  Send,
  ExternalLink,
} from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const faqs: FaqItem[] = [
  {
    q: 'Why is my fare different from what was shown?',
    a: 'NaviGet guarantees fixed fares. The fare shown at booking is your final fare. If you see a discrepancy, please contact us — it may be a route change or promo adjustment.',
  },
  {
    q: 'How does the 2× refund work?',
    a: 'If a driver or NaviGet cancels your confirmed ride, you receive 2× the estimated fare instantly in your NaviGet Wallet. Rider-initiated cancellations are free but don\'t trigger the 2× refund.',
  },
  {
    q: 'Can I schedule a ride?',
    a: 'Yes! You can schedule rides 30 minutes to 2 hours in advance. A driver will be assigned ~15 minutes before your pickup time.',
  },
  {
    q: 'Is there really ₹0 cancellation?',
    a: 'Absolutely. You can cancel any ride at any time with zero charges. No penalties, no restrictions, no questions asked.',
  },
  {
    q: 'How do shared rides work?',
    a: 'Shared rides match you with 1-3 co-riders headed in a similar direction. You save up to 40% with a minimum fare of ₹399. Your fare is fixed at booking — it doesn\'t change if more riders join.',
  },
];

const contactOptions = [
  { icon: MessageCircle, label: 'Live Chat', desc: 'Avg. reply: 2 min', color: '#6C5CE7', action: 'chat' },
  { icon: Phone, label: 'Call Us', desc: '1800-NAVIGATE', color: '#00E676', action: 'call' },
  { icon: Mail, label: 'Email', desc: 'help@navigate.in', color: '#00D2FF', action: 'email' },
];

const issueCategories = [
  { icon: Car, label: 'Ride Issue', color: '#A29BFE' },
  { icon: Wallet, label: 'Payment / Refund', color: '#00E676' },
  { icon: MapPin, label: 'Route Problem', color: '#FF9100' },
  { icon: Shield, label: 'Safety Concern', color: '#FF4081' },
  { icon: AlertTriangle, label: 'Report Driver', color: '#FF5252' },
  { icon: HelpCircle, label: 'Other', color: '#78909C' },
];

export default function SupportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
          <h1 className="text-base font-bold text-[var(--text-primary)]">Help & Support</h1>
          <p className="text-[11px] text-[var(--text-muted)]">We're here 24/7</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4 flex gap-2">
        {(['faq', 'contact'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
            style={{
              background: activeTab === tab ? 'var(--brand)' : 'rgba(255,255,255,0.03)',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.3)',
              border: `1px solid ${activeTab === tab ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            {tab === 'faq' ? 'FAQs' : 'Contact Us'}
          </button>
        ))}
      </div>

      {activeTab === 'faq' ? (
        /* FAQ Section */
        <div className="px-4 py-4 space-y-2.5 pb-8">
          {faqs.map((faq, i) => (
            <div key={i} className="card-glass rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full p-4 flex items-start gap-3 text-left"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(108,92,231,0.1)' }}>
                  <HelpCircle className="w-3.5 h-3.5 text-brand-light" />
                </div>
                <p className="flex-1 text-sm text-[var(--text-secondary)] font-medium leading-snug">{faq.q}</p>
                <ChevronRight className={`w-4 h-4 text-white/15 flex-shrink-0 mt-0.5 transition-transform ${expandedFaq === i ? 'rotate-90' : ''}`} />
              </button>
              {expandedFaq === i && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="ml-9 pt-2 text-xs text-[var(--text-muted)] leading-relaxed"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <p className="pt-2">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Contact Section */
        <div className="px-4 py-4 space-y-4 pb-8">
          {/* Quick contact */}
          <div>
            <p className="text-[10px] font-bold text-white/15 tracking-[0.15em] uppercase mb-2 px-1">
              GET IN TOUCH
            </p>
            <div className="space-y-2">
              {contactOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button key={opt.action}
                    className="menu-item w-full group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${opt.color}12` }}>
                      <Icon className="w-5 h-5" style={{ color: opt.color }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[var(--text-secondary)]">{opt.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{opt.desc}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Report an issue */}
          <div>
            <p className="text-[10px] font-bold text-white/15 tracking-[0.15em] uppercase mb-2 px-1">
              REPORT AN ISSUE
            </p>
            <div className="grid grid-cols-3 gap-2">
              {issueCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button key={cat.label}
                    className="card-glass rounded-xl p-3 flex flex-col items-center gap-2 transition-all active:scale-95">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${cat.color}10` }}>
                      <Icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>
                    <p className="text-[10px] text-white/35 text-center leading-tight">{cat.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emergency */}
          <div className="card-glass rounded-2xl p-4 flex items-center gap-3"
            style={{ border: '1px solid rgba(255, 64, 129, 0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 64, 129, 0.1)' }}>
              <AlertTriangle className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[var(--text-secondary)]">Emergency?</p>
              <p className="text-[11px] text-[var(--text-muted)]">Call 112 for immediate assistance</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-primary)]"
              style={{ background: 'rgba(255, 64, 129, 0.2)' }}>
              Call 112
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
