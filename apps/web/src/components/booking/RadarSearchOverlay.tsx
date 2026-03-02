'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car, Star, Phone, MessageCircle, Navigation, Shield, MapPin, CreditCard, Wallet, Clock, ChevronRight, X, CheckCircle2 } from 'lucide-react';

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

  useEffect(() => {
    const timer = setTimeout(() => setPhase('found'), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'found') return;
    const interval = setInterval(() => {
      setEta((prev) => (prev <= 1 ? 1 : prev - 1));
    }, 10000);
    return () => clearInterval(interval);
  }, [phase]);

  const handlePayNow = () => {
    setPayingNow(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SMIZyCKFSoApcm',
        amount: fare * 100,
        currency: 'INR',
        name: 'NaviGet',
        description: `${vehicleType} ride - ${pickup.split(',')[0]} to ${drop.split(',')[0]}`,
        image: '',
        handler: function () {
          setPayingNow(false);
          setSelectedPay('paid');
        },
        modal: { ondismiss: function () { setPayingNow(false); } },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#000000' },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const RazorpayConstructor = (window as any).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.open();
    };
    script.onerror = () => {
      setTimeout(() => {
        setPayingNow(false);
        setSelectedPay('paid');
      }, 2000);
    };
    document.body.appendChild(script);
  };

  const handlePayLater = () => setSelectedPay('later');

  const handleNaviWallet = () => {
    if (walletBalance >= fare) {
      setSelectedPay('wallet');
      setWalletPaid(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-white">
      {/* ===== SEARCHING PHASE ===== */}
      {phase === 'searching' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
          {/* Radar container */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-8">
            <div className="radar-ring radar-ring-1" />
            <div className="radar-ring radar-ring-2" />
            <div className="radar-ring radar-ring-3" />
            <div className="radar-ring radar-ring-4" />

            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="radar-sweep" />
            </div>

            {/* Center icon */}
            <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center bg-[var(--text-primary)]"
              style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}>
              <Car className="w-9 h-9 text-white" />
            </div>

            {/* Floating driver pins */}
            <div className="driver-pin" style={{ top: '15%', left: '20%', animationDelay: '0.5s' }}>
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">AK</div>
            </div>
            <div className="driver-pin" style={{ top: '25%', right: '15%', animationDelay: '1.2s' }}>
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">VS</div>
            </div>
            <div className="driver-pin" style={{ bottom: '20%', left: '12%', animationDelay: '2s' }}>
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">RK</div>
            </div>
            <div className="driver-pin" style={{ bottom: '15%', right: '22%', animationDelay: '0.8s' }}>
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">MS</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Finding your ride</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Scanning nearby drivers...</p>

          {/* Info chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['₹0 cancellation', 'Fixed fare', 'No surge'].map((text) => (
              <span key={text} className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)] bg-[#F6F6F6]">
                {text}
              </span>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-8 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 transition-all active:scale-[0.98]"
          >
            Cancel search
          </button>
        </div>
      )}

      {/* ===== FOUND PHASE ===== */}
      {phase === 'found' && (
        <div className="flex-1 flex flex-col animate-fade-in overflow-y-auto">
          {/* Top bar */}
          <div className="sticky top-0 bg-white z-10 px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Ride Confirmed</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#F6F6F6] text-xs font-bold text-[var(--text-primary)]">
              {eta} min away
            </div>
          </div>

          {/* Driver card */}
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white bg-[var(--text-primary)]">
                {mockDriver.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-[var(--text-primary)]">{mockDriver.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{mockDriver.rating}</span>
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="text-xs text-[var(--text-muted)]">{mockDriver.trips} trips</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] transition-all active:scale-90">
                  <Phone className="w-4 h-4 text-[var(--text-primary)]" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#F6F6F6] transition-all active:scale-90">
                  <MessageCircle className="w-4 h-4 text-[var(--text-primary)]" />
                </button>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="rounded-xl bg-[#F6F6F6] p-3.5 mb-4 flex items-center gap-3">
              <Car className="w-5 h-5 text-[var(--text-secondary)]" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{mockDriver.vehicleModel}</p>
                <p className="text-xs text-[var(--text-muted)]">{mockDriver.vehicleColor} · {mockDriver.vehiclePlate}</p>
              </div>
            </div>

            {/* OTP */}
            <div className="rounded-xl bg-[#F6F6F6] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-2">Share OTP with driver</p>
                <div className="flex gap-2">
                  {mockDriver.otp.split('').map((digit, i) => (
                    <span key={i} className="w-10 h-11 rounded-lg flex items-center justify-center text-lg font-bold text-[var(--text-primary)] bg-white"
                      style={{ border: '1px solid var(--border)' }}>
                      {digit}
                    </span>
                  ))}
                </div>
              </div>
              <Shield className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
          </div>

          {/* Divider */}
          <div className="h-2 bg-[#F6F6F6]" />

          {/* Route summary */}
          <div className="px-5 py-4">
            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)]" />
                <div className="w-px h-8 bg-[#E0E0E0]" />
                <div className="w-2.5 h-2.5 rounded-sm rotate-45 bg-[var(--brand)]" />
              </div>
              <div className="flex-1 space-y-4 min-w-0">
                <div>
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider mb-0.5">PICKUP</p>
                  <p className="text-sm text-[var(--text-primary)] truncate">{pickup}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] tracking-wider mb-0.5">DROP-OFF</p>
                  <p className="text-sm text-[var(--text-primary)] truncate">{drop}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-2 bg-[#F6F6F6]" />

          {/* Payment */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Payment</h4>
              <span className="text-base font-bold text-[var(--text-primary)]">₹{fare}</span>
            </div>

            {selectedPay === 'paid' ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ECFDF5]">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#059669]">Paid via Razorpay</p>
                  <p className="text-[11px] text-[var(--text-muted)]">₹{fare} debited</p>
                </div>
              </div>
            ) : walletPaid ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ECFDF5]">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#059669]">Paid from NaviWallet</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Balance: ₹{walletBalance - fare}</p>
                </div>
              </div>
            ) : selectedPay === 'later' ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF7ED]">
                <Clock className="w-5 h-5 text-[#D97706]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#D97706]">Pay Later / COD selected</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Pay cash after ride ends</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Pay Now */}
                <button onClick={handlePayNow} disabled={payingNow}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#F6F6F6] transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white" style={{ border: '1px solid var(--border)' }}>
                    {payingNow ? (
                      <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5 text-[var(--text-primary)]" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Pay Now</p>
                    <p className="text-[11px] text-[var(--text-muted)]">UPI, Card, Net Banking</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>

                {/* Pay Later / COD */}
                <button onClick={handlePayLater}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#F6F6F6] transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white" style={{ border: '1px solid var(--border)' }}>
                    <Clock className="w-5 h-5 text-[var(--text-primary)]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Pay Later / COD</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Pay cash after ride</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>

                {/* NaviWallet */}
                <button onClick={handleNaviWallet} disabled={walletBalance < fare}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#F6F6F6] transition-all active:scale-[0.98] disabled:opacity-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white" style={{ border: '1px solid var(--border)' }}>
                    <Wallet className="w-5 h-5 text-[var(--text-primary)]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">NaviWallet</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Balance: ₹{walletBalance}{walletBalance < fare && ' (Insufficient)'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="mt-auto px-5 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-3">
              <button className="flex-1 py-3.5 rounded-xl text-sm font-medium text-[var(--text-primary)]
                               flex items-center justify-center gap-2 bg-[#F6F6F6] transition-all active:scale-[0.98]">
                <Shield className="w-4 h-4" />
                Safety
              </button>
              <button onClick={onClose}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium text-red-500
                         flex items-center justify-center gap-2 bg-red-50 transition-all active:scale-[0.98]">
                Cancel ride
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">
              ₹0 cancellation fee · Fixed fare guaranteed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
