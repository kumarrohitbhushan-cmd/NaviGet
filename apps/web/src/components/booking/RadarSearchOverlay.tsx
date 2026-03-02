'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Star, Phone, MessageCircle, Navigation, Shield, MapPin, CreditCard, Wallet, Clock, ChevronRight } from 'lucide-react';

interface DriverInfo {
  name: string;
  rating: number;
  trips: number;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  avatar: string;
  eta: number;
  otp: string;
}

const mockDriver: DriverInfo = {
  name: 'Rajesh Kumar',
  rating: 4.9,
  trips: 2847,
  vehicleModel: 'Maruti Suzuki Dzire',
  vehicleColor: 'White',
  vehiclePlate: 'DL 01 AB 1234',
  avatar: 'RK',
  eta: 7,
  otp: '4829',
};

interface RadarSearchOverlayProps {
  pickup: string;
  drop: string;
  fare: number;
  vehicleType: string;
  onClose: () => void;
}

export default function RadarSearchOverlay({ pickup, drop, fare, vehicleType, onClose }: RadarSearchOverlayProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<'searching' | 'found'>('searching');
  const [eta, setEta] = useState(mockDriver.eta);
  const [selectedPay, setSelectedPay] = useState<string | null>(null);
  const [walletBalance] = useState(1250);
  const [payingNow, setPayingNow] = useState(false);
  const [walletPaid, setWalletPaid] = useState(false);

  // After 5 seconds, transition from searching → found
  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('found');
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // ETA countdown once found
  useEffect(() => {
    if (phase !== 'found') return;
    const interval = setInterval(() => {
      setEta((prev) => (prev <= 1 ? 1 : prev - 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [phase]);

  const handlePayNow = () => {
    setPayingNow(true);
    // Load Razorpay script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: 'rzp_test_placeholder',
        amount: fare * 100,
        currency: 'INR',
        name: 'NaviGet',
        description: `${vehicleType} ride - ${pickup.split(',')[0]} to ${drop.split(',')[0]}`,
        image: '',
        handler: function () {
          // Payment successful
          setPayingNow(false);
          setSelectedPay('paid');
        },
        modal: {
          ondismiss: function () {
            setPayingNow(false);
          },
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#6C5CE7',
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.open();
    };
    script.onerror = () => {
      // Simulate payment success as fallback
      setTimeout(() => {
        setPayingNow(false);
        setSelectedPay('paid');
      }, 2000);
    };
    document.body.appendChild(script);
  };

  const handlePayLater = () => {
    setSelectedPay('later');
  };

  const handleNaviWallet = () => {
    if (walletBalance >= fare) {
      setSelectedPay('wallet');
      setWalletPaid(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Searching Phase — Radar Animation */}
      {phase === 'searching' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
          {/* Radar container */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            {/* Radar ripple rings */}
            <div className="radar-ring radar-ring-1" />
            <div className="radar-ring radar-ring-2" />
            <div className="radar-ring radar-ring-3" />
            <div className="radar-ring radar-ring-4" />

            {/* Radar sweep */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="radar-sweep" />
            </div>

            {/* Center car icon */}
            <div
              className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center animate-glow-pulse"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
                boxShadow: '0 0 30px rgba(108, 92, 231, 0.4)',
              }}
            >
              <Car className="w-9 h-9 text-white" />
            </div>

            {/* Floating driver pins */}
            <div className="driver-pin" style={{ top: '15%', left: '20%', animationDelay: '0.5s' }}>
              <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
                AK
              </div>
            </div>
            <div className="driver-pin" style={{ top: '25%', right: '15%', animationDelay: '1.2s' }}>
              <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
                VS
              </div>
            </div>
            <div className="driver-pin" style={{ bottom: '20%', left: '12%', animationDelay: '2s' }}>
              <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
                RK
              </div>
            </div>
            <div className="driver-pin" style={{ bottom: '15%', right: '22%', animationDelay: '0.8s' }}>
              <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
                MS
              </div>
            </div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Finding your ride</h2>
          <p className="text-sm text-[var(--text-muted)] mb-1">Scanning nearby drivers...</p>

          {/* Animated dots */}
          <div className="flex gap-1 mt-3">
            <div className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 rounded-full bg-brand animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Info pills */}
          <div className="flex gap-3 mt-8">
            {['₹0 cancellation', 'Fixed fare', 'No surge'].map((text) => (
              <span
                key={text}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium text-[var(--text-muted)]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                {text}
              </span>
            ))}
          </div>

          {/* Cancel */}
          <button
            onClick={onClose}
            className="mt-10 px-8 py-3 rounded-xl text-sm font-medium text-red-400/70
                       transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255, 82, 82, 0.06)', border: '1px solid rgba(255,82,82,0.12)' }}
          >
            Cancel search
          </button>
        </div>
      )}

      {/* Found Phase — Confirmed Cab Details */}
      {phase === 'found' && (
        <div className="flex-1 flex flex-col animate-fade-in">
          {/* Top status banner */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              background: 'linear-gradient(135deg, rgba(108, 92, 231, 0.12) 0%, rgba(0, 230, 118, 0.08) 100%)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0, 230, 118, 0.15)' }}
            >
              <Navigation className="w-5 h-5 text-[#00E676]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--text-primary)]">Ride Confirmed!</p>
              <p className="text-xs text-[var(--text-muted)]">Your driver is on the way</p>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00E676' }}
            >
              Arriving
            </div>
          </div>

          {/* Driver card */}
          <div className="px-5 pt-6 pb-4">
            <div className="card-glass rounded-2xl p-5">
              {/* Driver info */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                  style={{
                    background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
                    boxShadow: '0 4px 15px rgba(108, 92, 231, 0.3)',
                  }}
                >
                  {mockDriver.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{mockDriver.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-[var(--text-secondary)]">{mockDriver.rating}</span>
                    </div>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span className="text-xs text-[var(--text-muted)]">{mockDriver.trips} trips</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style={{ background: 'rgba(0, 230, 118, 0.1)', border: '1px solid rgba(0, 230, 118, 0.15)' }}
                  >
                    <Phone className="w-4.5 h-4.5 text-[#00E676]" />
                  </button>
                  <button
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90"
                    style={{ background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.15)' }}
                  >
                    <MessageCircle className="w-4.5 h-4.5 text-brand" />
                  </button>
                </div>
              </div>

              {/* Vehicle */}
              <div
                className="rounded-xl p-3.5 mb-4 flex items-center gap-3"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
              >
                <Car className="w-6 h-6 text-brand" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{mockDriver.vehicleModel}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {mockDriver.vehicleColor} • {mockDriver.vehiclePlate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand">{eta} min</p>
                  <p className="text-[10px] text-[var(--text-muted)]">ETA</p>
                </div>
              </div>

              {/* OTP */}
              <div
                className="rounded-xl p-3.5 flex items-center justify-between"
                style={{ background: 'rgba(108, 92, 231, 0.06)', border: '1px solid rgba(108, 92, 231, 0.15)' }}
              >
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Share this OTP with driver</p>
                  <div className="flex gap-2">
                    {mockDriver.otp.split('').map((digit, i) => (
                      <span
                        key={i}
                        className="w-9 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-brand"
                        style={{ background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.2)' }}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </div>
                <Shield className="w-6 h-6 text-brand/40" />
              </div>
            </div>
          </div>

          {/* Route summary */}
          <div className="px-5 mb-4">
            <div className="card-glass rounded-xl p-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: '#00E676', boxShadow: '0 0 8px rgba(0,230,118,0.4)' }}
                  />
                  <div className="w-px h-8" style={{ background: 'var(--border)' }} />
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="flex-1 space-y-4 min-w-0">
                  <div>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] tracking-wider mb-0.5">PICKUP</p>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{pickup}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[var(--text-muted)] tracking-wider mb-0.5">DROP</p>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{drop}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="px-5 mb-4">
            <div className="card-glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[var(--text-muted)] tracking-wider uppercase">Payment</h4>
                <span className="text-base font-bold text-[var(--text-primary)]">₹{fare}</span>
              </div>

              {selectedPay === 'paid' ? (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,230,118,0.15)' }}>
                    <CreditCard className="w-5 h-5 text-[#00E676]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#00E676]">Paid via Razorpay</p>
                    <p className="text-[11px] text-[var(--text-muted)]">₹{fare} debited</p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#00E676' }}>
                    <ChevronRight className="w-3 h-3 text-[var(--bg)]" style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </div>
              ) : walletPaid ? (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,230,118,0.15)' }}>
                    <Wallet className="w-5 h-5 text-[#00E676]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#00E676]">Paid from NaviWallet</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Balance: ₹{walletBalance - fare}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#00E676' }}>
                    <ChevronRight className="w-3 h-3 text-[var(--bg)]" style={{ transform: 'rotate(-90deg)' }} />
                  </div>
                </div>
              ) : selectedPay === 'later' ? (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255, 145, 0, 0.08)', border: '1px solid rgba(255,145,0,0.2)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,145,0,0.12)' }}>
                    <Clock className="w-5 h-5 text-[#FF9100]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#FF9100]">Pay Later selected</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Pay after ride ends</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Pay Now - Razorpay */}
                  <button
                    onClick={handlePayNow}
                    disabled={payingNow}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]"
                    style={{ background: 'rgba(108, 92, 231, 0.06)', border: '1px solid rgba(108,92,231,0.2)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(108,92,231,0.15)' }}>
                      {payingNow ? (
                        <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                      ) : (
                        <CreditCard className="w-5 h-5 text-brand" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Pay Now</p>
                      <p className="text-[11px] text-[var(--text-muted)]">UPI, Card, Net Banking via Razorpay</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>

                  {/* Pay Later */}
                  <button
                    onClick={handlePayLater}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98]"
                    style={{ background: 'rgba(255, 145, 0, 0.04)', border: '1px solid rgba(255,145,0,0.15)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,145,0,0.12)' }}>
                      <Clock className="w-5 h-5 text-[#FF9100]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Pay Later</p>
                      <p className="text-[11px] text-[var(--text-muted)]">Pay after your ride ends</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>

                  {/* NaviWallet */}
                  <button
                    onClick={handleNaviWallet}
                    disabled={walletBalance < fare}
                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'rgba(0, 230, 118, 0.04)', border: '1px solid rgba(0,230,118,0.15)' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,230,118,0.12)' }}>
                      <Wallet className="w-5 h-5 text-[#00E676]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">NaviWallet</p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Balance: ₹{walletBalance}
                        {walletBalance < fare && ' (Insufficient)'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom actions */}
          <div className="mt-auto px-5 pb-6">
            <div className="flex gap-3">
              <button
                className="flex-1 py-3.5 rounded-xl text-sm font-medium text-[var(--text-secondary)]
                           flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <Shield className="w-4 h-4" />
                Safety
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium text-red-400/70
                           flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'rgba(255, 82, 82, 0.05)', border: '1px solid rgba(255,82,82,0.12)' }}
              >
                Cancel ride
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
              ₹0 cancellation fee • Fixed fare guaranteed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
