'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Phone, MessageCircle, Navigation, Shield, CreditCard, Wallet, Clock, ChevronRight, X, CheckCircle2, Share2 } from 'lucide-react';

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

// Minimalist car icon SVG for radar spots
function MiniCarIcon({ size = 16, color = '#6C5CE7' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="8" width="14" height="6" rx="2" fill={color} opacity="0.9" />
      <path d="M5 8V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="6.5" cy="14" r="1.5" fill="white" stroke={color} strokeWidth="0.8" />
      <circle cx="13.5" cy="14" r="1.5" fill="white" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

// Vehicle spots on radar (angle, radius)
const VEHICLE_SPOTS = [
  { angle: 30, radius: 50 },
  { angle: 110, radius: 85 },
  { angle: 195, radius: 65 },
  { angle: 310, radius: 95 },
  { angle: 160, radius: 115 },
  { angle: 70, radius: 125 },
  { angle: 250, radius: 55 },
];

const GUIDE_RADII = [50, 90, 130];

interface RadarSearchOverlayProps {
  pickup: string;
  drop: string;
  fare: number;
  vehicleType: string;
  pickupCoords?: { lat: number; lng: number } | null;
  dropCoords?: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function RadarSearchOverlay({ pickup, drop, fare, vehicleType, pickupCoords, dropCoords, onClose }: RadarSearchOverlayProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<'searching' | 'found'>('searching');
  const [eta, setEta] = useState(mockDriver.eta);
  const [selectedPay, setSelectedPay] = useState<string | null>(null);
  const [walletBalance] = useState(1250);
  const [payingNow, setPayingNow] = useState(false);
  const [walletPaid, setWalletPaid] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('found'), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'found') return;
    const interval = setInterval(() => { setEta((prev) => (prev <= 1 ? 1 : prev - 1)); }, 10000);
    return () => clearInterval(interval);
  }, [phase]);

  const handlePayNow = () => {
    setPayingNow(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SMIZyCKFSoApcm',
        amount: fare * 100, currency: 'INR', name: 'NaviGet',
        description: `${vehicleType} ride`, image: '',
        handler: function () { setPayingNow(false); setSelectedPay('paid'); },
        modal: { ondismiss: function () { setPayingNow(false); } },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#6C5CE7' },
      };
      const RazorpayConstructor = (window as any).Razorpay;
      const rzp = new RazorpayConstructor(options); rzp.open();
    };
    script.onerror = () => { setTimeout(() => { setPayingNow(false); setSelectedPay('paid'); }, 2000); };
    document.body.appendChild(script);
  };

  const handlePayLater = () => setSelectedPay('later');
  const handleNaviWallet = () => { if (walletBalance >= fare) { setSelectedPay('wallet'); setWalletPaid(true); } };

  const handleTrackRide = () => {
    sessionStorage.setItem('booking_data', JSON.stringify({ pickup, drop, pickupCoords, dropCoords, vehicleType, fare, otp: mockDriver.otp, driverName: mockDriver.name }));
    router.push('/booking/tracking');
  };

  const handleCancelRide = () => setShowCancelConfirm(true);
  const confirmCancel = () => { setShowCancelConfirm(false); onClose(); };

  const handleShareRide = async () => {
    const text = `I'm taking a NaviGet ${vehicleType} ride from ${pickup.split(',')[0]} to ${drop.split(',')[0]}. Fare: Rs.${fare}. OTP: ${mockDriver.otp}`;
    if (navigator.share) { try { await navigator.share({ title: 'NaviGet Ride', text }); } catch {} }
    else { await navigator.clipboard.writeText(text); alert('Ride details copied to clipboard!'); }
  };

  const RADAR_SIZE = 290;

  return (
    <div className="fixed inset-0 z-[5000] flex flex-col bg-white">
      {phase === 'searching' && (
        <div className="flex-1 flex flex-col items-center justify-center animate-fade-in px-6">
          <div className="relative flex items-center justify-center mb-8" style={{ width: RADAR_SIZE, height: RADAR_SIZE }}>
            {GUIDE_RADII.map((r, i) => (
              <div key={`guide-${i}`} className="radar-guide-ring" style={{ width: r * 2, height: r * 2, borderRadius: r }} />
            ))}
            <div className="radar-crosshair-h" />
            <div className="radar-crosshair-v" />
            <div className="radar-pulse radar-pulse-1" />
            <div className="radar-pulse radar-pulse-2" />
            <div className="radar-pulse radar-pulse-3" />
            <div className="radar-pulse radar-pulse-4" />
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="radar-sweep" />
            </div>
            {VEHICLE_SPOTS.map((v, i) => {
              const rad = (v.angle * Math.PI) / 180;
              const left = RADAR_SIZE / 2 + v.radius * Math.cos(rad) - 14;
              const top = RADAR_SIZE / 2 + v.radius * Math.sin(rad) - 14;
              return (
                <div key={`v-${i}`} className={`radar-vehicle radar-vehicle-${i + 1}`} style={{ left, top }}>
                  <MiniCarIcon size={16} color="white" />
                </div>
              );
            })}
            <div className="radar-center-glow" />
            <div className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center bg-[var(--brand)]"
              style={{ boxShadow: '0 0 20px rgba(108,92,231,0.5)' }}>
              <Navigation className="w-6 h-6 text-white" strokeWidth={1.8} />
            </div>
          </div>

          <div className="flex items-center gap-0 mb-1.5">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Finding your ride</h2>
            <span className="search-dots text-xl font-bold">...</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Matching with nearby drivers</p>

          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {['₹0 cancellation', 'Fixed fare', vehicleType].map((text) => (
              <span key={text} className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--brand)] bg-[#F3F0FF] border border-[rgba(108,92,231,0.15)]">
                {text}
              </span>
            ))}
          </div>

          <button onClick={onClose}
            className="px-8 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50/60 border border-red-100 transition-all active:scale-[0.98]">
            Cancel search
          </button>
        </div>
      )}

      {phase === 'found' && (
        <div className="flex-1 flex flex-col animate-fade-in overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
              <span className="text-sm font-semibold text-[var(--text-primary)]">Ride Confirmed</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-[var(--surface-3)] text-xs font-bold text-[var(--text-primary)]">{eta} min away</div>
          </div>

          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white bg-[var(--text-primary)]">{mockDriver.avatar}</div>
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
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-3)] transition-all active:scale-90">
                  <Phone className="w-4 h-4 text-[var(--text-primary)]" strokeWidth={1.8} />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--surface-3)] transition-all active:scale-90">
                  <MessageCircle className="w-4 h-4 text-[var(--text-primary)]" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--surface-3)] p-3.5 mb-4 flex items-center gap-3">
              <MiniCarIcon size={24} color="var(--text-secondary)" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{mockDriver.vehicleModel}</p>
                <p className="text-xs text-[var(--text-muted)]">{mockDriver.vehicleColor} · {mockDriver.vehiclePlate}</p>
              </div>
            </div>

            <div className="rounded-xl bg-[var(--surface-3)] p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-2">Share OTP with driver</p>
                <div className="flex gap-2">
                  {mockDriver.otp.split('').map((digit, i) => (
                    <span key={i} className="w-10 h-11 rounded-lg flex items-center justify-center text-lg font-bold text-[var(--text-primary)] bg-white border-2 border-[var(--border)]">{digit}</span>
                  ))}
                </div>
              </div>
              <Shield className="w-5 h-5 text-[var(--text-muted)]" strokeWidth={1.8} />
            </div>
          </div>

          <div className="h-2 bg-[var(--surface-3)]" />

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

          <div className="h-2 bg-[var(--surface-3)]" />

          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Payment</h4>
              <span className="text-base font-bold text-[var(--text-primary)]">Rs.{fare}</span>
            </div>

            {selectedPay === 'paid' ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ECFDF5]">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#059669]">Paid via Razorpay</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Rs.{fare} debited</p>
                </div>
              </div>
            ) : walletPaid ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#ECFDF5]">
                <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#059669]">Paid from NaviWallet</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Balance: Rs.{walletBalance - fare}</p>
                </div>
              </div>
            ) : selectedPay === 'later' ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FFF7ED]">
                <Clock className="w-5 h-5 text-[#D97706]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#D97706]">Cash / Pay Later selected</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Pay cash after ride ends</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button onClick={handlePayLater} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-3)] transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[var(--border)]">
                    <Clock className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Cash / Pay Later</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Pay cash after ride</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button onClick={handleNaviWallet} disabled={walletBalance < fare}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-3)] transition-all active:scale-[0.98] disabled:opacity-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[var(--border)]">
                    <Wallet className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">NaviWallet</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Balance: Rs.{walletBalance}{walletBalance < fare && ' (Insufficient)'}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
                <button onClick={handlePayNow} disabled={payingNow}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface-3)] transition-all active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[var(--border)]">
                    {payingNow ? <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--brand)] rounded-full animate-spin" />
                      : <CreditCard className="w-5 h-5 text-[var(--text-primary)]" strokeWidth={1.8} />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">Pay Online</p>
                    <p className="text-[11px] text-[var(--text-muted)]">UPI, Card, Net Banking</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-auto px-5 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            {selectedPay ? (
              <button onClick={handleTrackRide} className="btn-primary flex items-center justify-center gap-2 mb-3">
                <Navigation className="w-4 h-4" strokeWidth={1.8} /> Track your ride
              </button>
            ) : (
              <button onClick={handleTrackRide} className="btn-primary flex items-center justify-center gap-2 mb-3">
                <Navigation className="w-4 h-4" strokeWidth={1.8} /> Pay Rs.{fare} & Confirm
              </button>
            )}
            <div className="flex gap-3">
              <button onClick={handleShareRide}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] flex items-center justify-center gap-2 bg-[var(--surface-3)] transition-all active:scale-[0.98]">
                <Share2 className="w-4 h-4" strokeWidth={1.8} /> Share
              </button>
              <button onClick={handleCancelRide}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-red-500 flex items-center justify-center gap-2 bg-red-50 transition-all active:scale-[0.98]">
                Cancel ride
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--text-muted)] mt-3">Rs.0 cancellation fee · Fixed fare guaranteed</p>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 mx-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Cancel Ride?</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-1">Rs.0 cancellation fee applies.</p>
            <p className="text-xs text-[var(--text-muted)] mb-6">Your driver has already been assigned.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[var(--surface-3)] text-[var(--text-primary)] transition-all active:scale-[0.98]">Keep Ride</button>
              <button onClick={confirmCancel}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-500 text-white transition-all active:scale-[0.98]">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
