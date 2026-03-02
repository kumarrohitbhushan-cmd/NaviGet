'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  ChevronRight,
  Shield,
  Check,
  Clock,
  MapPin,
  Banknote,
} from 'lucide-react';

interface BookingData {
  pickup: string;
  drop: string;
  vehicleType: string;
  fare: number;
}

const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI',
    description: 'Google Pay, PhonePe, Paytm',
    icon: Smartphone,
    iconBg: 'rgba(108, 92, 231, 0.12)',
    iconColor: '#A29BFE',
  },
  {
    id: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
    iconBg: 'rgba(0, 210, 255, 0.12)',
    iconColor: '#00D2FF',
  },
  {
    id: 'wallet',
    label: 'NaviGet Wallet',
    description: 'Balance: ₹1,250',
    icon: Wallet,
    iconBg: 'rgba(0, 230, 118, 0.12)',
    iconColor: '#00E676',
  },
  {
    id: 'cash',
    label: 'Cash',
    description: 'Pay driver directly',
    icon: Banknote,
    iconBg: 'rgba(255, 145, 0, 0.12)',
    iconColor: '#FF9100',
  },
];

export default function PaymentPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('booking_data');
      if (data) {
        setBooking(JSON.parse(data));
      } else {
        router.push('/booking');
      }
    } catch {
      router.push('/booking');
    }
  }, [router]);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setConfirmed(true);

    // Navigate to tracking after 2s
    setTimeout(() => {
      router.push('/booking/tracking');
    }, 2500);
  };

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FIRST50') {
      setPromoApplied(true);
    }
  };

  if (!booking) return null;

  const discount = promoApplied ? Math.round(booking.fare * 0.1) : 0;
  const total = booking.fare - discount;

  // ===== CONFIRMED STATE =====
  if (confirmed) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gradient-mesh px-6">
        <div className="relative animate-scale-in">
          {/* Glow */}
          <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full blur-[40px]"
            style={{ background: 'rgba(0, 230, 118, 0.3)' }} />
          
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg, #00E676, #00C853)' }}>
            <Check className="w-10 h-10 text-[var(--text-primary)]" strokeWidth={3} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2 animate-fade-in">Ride Confirmed!</h1>
        <p className="text-[var(--text-muted)] text-sm text-center mb-2 animate-fade-in">
          Your {booking.vehicleType.toLowerCase()} is on the way
        </p>
        <p className="text-brand-400 font-semibold text-lg animate-fade-in">₹{total}</p>

        <div className="mt-6 flex items-center gap-2 text-[var(--text-muted)] text-sm animate-fade-in">
          <Clock className="w-4 h-4" />
          Finding your driver...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(19, 17, 28, 0.88)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <button onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: 'var(--surface-3)' }}>
          <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
        <h1 className="text-base font-semibold text-[var(--text-primary)] flex-1">Payment</h1>
        <NaviGetLogo size="sm" showText={false} />
      </header>

      <div className="flex-1 px-4 pt-5 pb-6 space-y-4">
        {/* ===== RIDE SUMMARY ===== */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Ride Summary</h3>
            <span className="badge-brand text-[10px]">{booking.vehicleType}</span>
          </div>

          <div className="flex gap-3 mb-3">
            <div className="flex flex-col items-center pt-1 gap-0.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00E676' }} />
              <div className="flex flex-col gap-0.5 py-0.5">
                {[...Array(3)].map((_, i) => <div key={i} className="w-0.5 h-1 rounded-full bg-white/10" />)}
              </div>
              <div className="w-2.5 h-2.5 rounded-sm rotate-45" style={{ background: '#FF5252' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--text-primary)] mb-2.5">{booking.pickup}</p>
              <p className="text-sm text-[var(--text-primary)]">{booking.drop}</p>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <MapPin className="w-3.5 h-3.5" /> ~8.2 km • 25 min
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)]">Fare</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">₹{booking.fare}</p>
            </div>
          </div>
        </div>

        {/* ===== PROMO CODE ===== */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Promo Code</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={promoApplied}
              className="input-field text-sm flex-1"
              style={{ padding: '10px 14px' }}
            />
            <button
              onClick={handleApplyPromo}
              disabled={!promoCode || promoApplied}
              className="px-4 rounded-xl text-sm font-semibold transition-all active:scale-95
                       disabled:opacity-40"
              style={{
                background: promoApplied ? 'rgba(0, 230, 118, 0.12)' : 'var(--surface-3)',
                color: promoApplied ? '#00E676' : 'white',
                border: `1.5px solid ${promoApplied ? 'rgba(0,230,118,0.3)' : 'var(--border)'}`,
              }}
            >
              {promoApplied ? '✓ Applied' : 'Apply'}
            </button>
          </div>
          {promoApplied && (
            <p className="text-xs mt-2" style={{ color: '#00E676' }}>
              FIRST50 applied! You saved ₹{discount}
            </p>
          )}
        </div>

        {/* ===== PAYMENT METHODS ===== */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Payment Method</h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 active:scale-[0.99]"
                  style={{
                    background: isSelected ? 'rgba(108, 92, 231, 0.06)' : 'transparent',
                    border: isSelected ? '1.5px solid rgba(108, 92, 231, 0.25)' : '1.5px solid transparent',
                  }}
                >
                  {/* Icon */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: method.iconBg }}>
                    <Icon className="w-5 h-5" style={{ color: method.iconColor }} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{method.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{method.description}</p>
                  </div>

                  {/* Radio */}
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: isSelected ? '#6C5CE7' : 'rgba(255,255,255,0.15)',
                    }}>
                    {isSelected && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#6C5CE7' }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* UPI ID input (conditional) */}
        {selectedMethod === 'upi' && (
          <div className="card p-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Enter UPI ID</h3>
            <input
              type="text"
              placeholder="username@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="input-field text-sm"
            />
          </div>
        )}
      </div>

      {/* ===== BOTTOM PAY BAR ===== */}
      <div className="sticky bottom-0 px-4 pt-4 pb-6 backdrop-blur-xl"
        style={{ background: 'rgba(19, 17, 28, 0.92)', borderTop: '1px solid var(--border)' }}>
        {/* Price breakdown */}
        <div className="flex justify-between text-sm mb-1">
          <span className="text-[var(--text-muted)]">Ride fare</span>
          <span className="text-[var(--text-secondary)]">₹{booking.fare}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: '#00E676' }}>Promo discount</span>
            <span style={{ color: '#00E676' }}>-₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between text-sm mb-4">
          <span className="text-[var(--text-primary)] font-semibold">Total</span>
          <span className="text-[var(--text-primary)] font-bold text-lg">₹{total}</span>
        </div>

        <button
          onClick={handlePayment}
          disabled={processing || (selectedMethod === 'upi' && !upiId)}
          className="btn-primary flex items-center justify-center gap-2 text-[15px]"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              Pay ₹{total}
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-white/15 mt-2.5 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" />
          Secured by Razorpay • 256-bit SSL encrypted
        </p>
      </div>
    </div>
  );
}
