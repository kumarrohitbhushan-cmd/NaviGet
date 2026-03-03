'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });
import {
  Phone,
  MessageCircle,
  Star,
  Navigation,
  Shield,
  Clock,
  MapPin,
  ChevronDown,
  X,
  Car,
  CheckCircle2,
  Circle,
  AlertCircle,
  Share2,
  ExternalLink,
  PartyPopper,
} from 'lucide-react';

type RideStatus = 'searching' | 'accepted' | 'arriving' | 'arrived' | 'in_progress' | 'completed';

interface DriverInfo {
  name: string;
  phone: string;
  rating: number;
  trips: number;
  vehicleModel: string;
  vehicleColor: string;
  vehiclePlate: string;
  avatar: string;
  otp: string;
}

const mockDriver: DriverInfo = {
  name: 'Rajesh Kumar',
  phone: '+91 98765 43210',
  rating: 4.9,
  trips: 2847,
  vehicleModel: 'Maruti Suzuki Dzire',
  vehicleColor: 'White',
  vehiclePlate: 'DL 01 AB 1234',
  avatar: 'RK',
  otp: '4829',
};

const statusFlow: { status: RideStatus; label: string; duration: number }[] = [
  { status: 'searching', label: 'Finding your ride...', duration: 3000 },
  { status: 'accepted', label: 'Driver assigned!', duration: 4000 },
  { status: 'arriving', label: 'Driver is on the way', duration: 8000 },
  { status: 'arrived', label: 'Driver has arrived', duration: 6000 },
  { status: 'in_progress', label: 'Trip in progress', duration: 10000 },
  { status: 'completed', label: 'Trip completed! 🎉', duration: 0 },
];

export default function TrackingPage() {
  const router = useRouter();
  const [rideStatus, setRideStatus] = useState<RideStatus>('searching');
  const [eta, setEta] = useState(7);
  const [statusIndex, setStatusIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [fare, setFare] = useState(0);
  const [vehicleType, setVehicleType] = useState('');

  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [driverCoords, setDriverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pickupName, setPickupName] = useState('Pickup');
  const [dropName, setDropName] = useState('Drop');

  useEffect(() => {
    try {
      const data = sessionStorage.getItem('booking_data');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.pickupCoords) setPickupCoords(parsed.pickupCoords);
        if (parsed.dropCoords) setDropCoords(parsed.dropCoords);
        if (parsed.pickup) setPickupName(parsed.pickup);
        if (parsed.drop) setDropName(parsed.drop);
        if (parsed.fare) setFare(parsed.fare);
        if (parsed.vehicleType) setVehicleType(parsed.vehicleType);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (statusIndex < statusFlow.length - 1) {
      const current = statusFlow[statusIndex];
      if (current.duration === 0) return;
      const timer = setTimeout(() => {
        const nextIndex = statusIndex + 1;
        setStatusIndex(nextIndex);
        setRideStatus(statusFlow[nextIndex].status);
        if (statusFlow[nextIndex].status === 'arriving') {
          const etaInterval = setInterval(() => {
            setEta((prev) => {
              if (prev <= 1) { clearInterval(etaInterval); return 1; }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(etaInterval);
        }
      }, current.duration);
      return () => clearTimeout(timer);
    }
  }, [statusIndex]);

  useEffect(() => {
    if (rideStatus === 'searching' || !pickupCoords || !dropCoords) {
      setDriverCoords(null);
      return;
    }
    if (rideStatus === 'arrived' || rideStatus === 'in_progress') {
      setDriverCoords(pickupCoords);
      return;
    }
    if (rideStatus === 'completed') {
      setDriverCoords(dropCoords);
      return;
    }
    const offsetLat = pickupCoords.lat + 0.015;
    const offsetLng = pickupCoords.lng + 0.012;
    let step = 0;
    const totalSteps = 20;
    const interval = setInterval(() => {
      step++;
      const progress = Math.min(step / totalSteps, 1);
      setDriverCoords({
        lat: offsetLat + (pickupCoords.lat - offsetLat) * progress,
        lng: offsetLng + (pickupCoords.lng - offsetLng) * progress,
      });
      if (step >= totalSteps) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [rideStatus, pickupCoords, dropCoords]);

  const handleCancel = () => { setShowCancelConfirm(true); };
  const confirmCancel = () => { setShowCancelConfirm(false); router.push('/booking'); };

  const handleCallDriver = () => { window.open(`tel:${mockDriver.phone}`, '_self'); };

  const handleNavigate = () => {
    const coords = rideStatus === 'in_progress' ? dropCoords : pickupCoords;
    if (coords) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
    }
  };

  const handleShareTrip = async () => {
    const text = `I'm on a NaviGet ride from ${pickupName.split(',')[0]} to ${dropName.split(',')[0]}. Track my trip! 🚗`;
    if (navigator.share) {
      try { await navigator.share({ title: 'NaviGet Trip', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Trip details copied to clipboard!');
    }
  };

  // Progress dots for ride stages (skip 'searching')
  const progressStages = statusFlow.filter(s => s.status !== 'searching');
  const activeStageIdx = progressStages.findIndex(s => s.status === rideStatus);

  const statusPillInfo = () => {
    if (rideStatus === 'completed') {
      return { icon: '🎉', label: 'Trip completed!', sub: `Fare: ₹${fare || '—'}`, badge: null };
    }
    if (rideStatus === 'in_progress') {
      return { icon: null, iconEl: <Navigation className="w-5 h-5 text-[#6C5CE7]" />, label: 'Trip in progress', sub: `Drop: ${dropName.split(',')[0]}`, badge: null };
    }
    if (rideStatus === 'arrived') {
      return { icon: null, iconEl: <CheckCircle2 className="w-5 h-5 text-[#059669]" />, label: 'Driver has arrived', sub: `Share OTP: ${mockDriver.otp}`, badge: mockDriver.otp };
    }
    if (rideStatus === 'searching') {
      return { icon: null, spinner: true, label: 'Finding your ride...', sub: 'Matching with nearby drivers', badge: null };
    }
    return { icon: null, iconEl: <Navigation className="w-5 h-5 text-[#6C5CE7]" />, label: statusFlow[statusIndex].label, sub: `ETA: ${eta} min · ${mockDriver.vehiclePlate}`, badge: null };
  };

  const pill = statusPillInfo();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Map */}
      <div className="relative flex-1 min-h-[45vh]">
        <MapView
          pickupCoords={pickupCoords}
          dropCoords={dropCoords}
          driverCoords={driverCoords}
          showRoute={true}
          height="100%"
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <div className="bg-white rounded-full px-3 py-2 shadow-md">
            <NaviGetLogo size="sm" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShareTrip}
              className="bg-white rounded-full p-2 shadow-md transition-all active:scale-95"
              title="Share trip"
            >
              <Share2 className="w-4 h-4 text-[#6C5CE7]" />
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-white rounded-full px-3 py-1.5 text-xs font-medium text-[#545454]
                         flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              Details <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status pill on map */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="rounded-2xl p-3 flex items-center gap-3 bg-white shadow-lg">
            {pill.spinner ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#E8E6F0] border-t-[#6C5CE7] rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#000]">{pill.label}</p>
                  <p className="text-[11px] text-[#A0A0A0]">{pill.sub}</p>
                </div>
              </>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  rideStatus === 'completed' ? 'bg-[#FEF3C7]' : rideStatus === 'arrived' ? 'bg-[#ECFDF5]' : 'bg-[#F3F0FF]'
                }`}>
                  {pill.icon ? <span className="text-xl">{pill.icon}</span> : pill.iconEl}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#000]">{pill.label}</p>
                  <p className="text-[11px] text-[#A0A0A0]">{pill.sub}</p>
                </div>
                {pill.badge && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#000]">
                    OTP: {pill.badge}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative rounded-t-3xl -mt-4 z-20 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#E8E6F0]" />
        </div>

        {/* ===== Progress dots ===== */}
        {rideStatus !== 'searching' && (
          <div className="px-5 mb-3">
            <div className="flex items-center gap-1">
              {progressStages.map((stage, i) => (
                <div key={stage.status} className="flex items-center flex-1">
                  <div className={`progress-dot ${i <= activeStageIdx ? 'bg-[var(--brand)]' : 'bg-[#E8E6F0]'}`}
                    style={{ width: 8, height: 8, borderRadius: '50%', transition: 'background 0.3s' }} />
                  {i < progressStages.length - 1 && (
                    <div className={`progress-segment flex-1 h-[3px] mx-0.5 rounded-full transition-all duration-500 ${
                      i < activeStageIdx ? 'bg-[var(--brand)]' : 'bg-[#E8E6F0]'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-center text-[var(--text-muted)] mt-1.5">{statusFlow[statusIndex].label}</p>
          </div>
        )}

        {/* ===== COMPLETED STATE ===== */}
        {rideStatus === 'completed' ? (
          <div className="px-5 pb-5">
            <div className="flex flex-col items-center py-6">
              <span className="text-5xl mb-3">🎉</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Trip Completed!</h2>
              <p className="text-sm text-[var(--text-muted)] mb-4">Thank you for riding with NaviGet</p>

              {/* Fare card */}
              {fare > 0 && (
                <div className="w-full rounded-xl p-4 mb-4 bg-[#F6F6F6] flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Total Fare</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">₹{fare}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">{vehicleType || 'Ride'}</p>
                    <p className="text-xs text-[#059669] font-medium">Fixed Fare ✓</p>
                  </div>
                </div>
              )}

              {/* Route summary */}
              <div className="w-full rounded-xl p-3 mb-4 bg-[#F6F6F6]">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#000]" />
                    <div className="w-px h-6 bg-[#E8E6F0]" />
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#6C5CE7] rotate-45" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-xs text-[var(--text-secondary)]">{pickupName.split(',').slice(0, 2).join(', ')}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{dropName.split(',').slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => router.push('/booking')}
                className="btn-primary w-full flex items-center justify-center gap-2">
                🚗 Book another ride
              </button>
            </div>
          </div>
        ) : rideStatus !== 'searching' ? (
          <div className="px-5 pb-5">
            {/* Driver info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#000] flex items-center justify-center text-lg font-bold text-white">
                {mockDriver.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#000]">{mockDriver.name}</h3>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" />
                    <span className="text-xs text-[#545454]">{mockDriver.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#A0A0A0]">{mockDriver.trips} trips</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCallDriver}
                  className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center transition-all active:scale-90">
                  <Phone className="w-4 h-4 text-[#059669]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center transition-all active:scale-90">
                  <MessageCircle className="w-4 h-4 text-[#6C5CE7]" />
                </button>
              </div>
            </div>

            {/* Vehicle info + Fare */}
            <div className="rounded-xl p-3 mb-4 bg-[#F6F6F6]">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-[#545454]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#000]">{mockDriver.vehicleModel}</p>
                  <p className="text-xs text-[#A0A0A0]">{mockDriver.vehicleColor} · {mockDriver.vehiclePlate}</p>
                </div>
                {fare > 0 && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--text-primary)]">₹{fare}</p>
                    <p className="text-[10px] text-[#059669]">Fixed</p>
                  </div>
                )}
              </div>
            </div>

            {/* OTP display for 'arrived' status */}
            {rideStatus === 'arrived' && (
              <div className="rounded-xl p-3 mb-4 bg-[#F3F0FF] border border-[rgba(108,92,231,0.15)]">
                <p className="text-xs text-[var(--brand)] font-semibold text-center mb-2">Share OTP with driver</p>
                <div className="flex justify-center gap-2">
                  {mockDriver.otp.split('').map((digit, i) => (
                    <div key={i} className="w-11 h-12 rounded-lg bg-white border-2 border-[var(--brand)] flex items-center justify-center text-lg font-bold text-[var(--text-primary)]">
                      {digit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Route summary */}
            {showDetails && (
              <div className="rounded-xl p-4 mb-4 bg-[#F6F6F6] animate-scale-in">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3 h-3 rounded-full bg-[#000]" />
                    <div className="w-px h-8 bg-[#E8E6F0]" />
                    <div className="w-3 h-3 rounded-sm bg-[#6C5CE7] rotate-45" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wider mb-0.5">Pickup</p>
                      <p className="text-sm text-[#545454]">{pickupName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#A0A0A0] uppercase tracking-wider mb-0.5">Drop</p>
                      <p className="text-sm text-[#545454]">{dropName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8E6F0]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    <span className="text-xs text-[#A0A0A0]">~35 min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    <span className="text-xs text-[#A0A0A0]">22.4 km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#059669]" />
                    <span className="text-xs text-[#059669]">₹0 cancellation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigate + Share + Safety buttons */}
            <div className="flex gap-2 mb-3">
              <button onClick={handleNavigate}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[var(--brand)]
                         flex items-center justify-center gap-1.5 bg-[#F3F0FF] border border-[rgba(108,92,231,0.12)] transition-all active:scale-[0.98]">
                <ExternalLink className="w-3.5 h-3.5" />
                Navigate
              </button>
              <button onClick={handleShareTrip}
                className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#545454]
                         flex items-center justify-center gap-1.5 border border-[#EBEBEB] transition-all active:scale-[0.98]">
                <Share2 className="w-3.5 h-3.5" />
                Share Trip
              </button>
              <button className="flex-1 py-2.5 rounded-xl text-xs font-medium text-[#545454]
                               flex items-center justify-center gap-1.5 border border-[#EBEBEB] transition-all active:scale-[0.98]">
                <Shield className="w-3.5 h-3.5" />
                Safety
              </button>
            </div>

            {/* Cancel ride */}
            {rideStatus !== 'in_progress' && (
              <button
                onClick={handleCancel}
                className="w-full py-3 rounded-xl text-sm font-medium text-[#DC2626]
                         flex items-center justify-center gap-2 bg-red-50 border border-red-100
                         transition-all active:scale-[0.98]">
                <X className="w-4 h-4" />
                Cancel ride
              </button>
            )}

            <p className="text-center text-[10px] text-[#A0A0A0] mt-3">
              ₹0 cancellation fee · Fixed fare guaranteed
            </p>
          </div>
        ) : (
          /* Searching state */
          <div className="px-5 pb-6">
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 rounded-full bg-[#F6F6F6] flex items-center justify-center mb-4">
                <div className="w-12 h-12 border-[3px] border-[#E8E6F0] border-t-[#000] rounded-full animate-spin" />
              </div>
              <p className="text-base font-semibold text-[#000] mb-1">Looking for drivers nearby</p>
              <p className="text-sm text-[#A0A0A0] mb-6">This usually takes under a minute</p>

              <div className="w-full space-y-2">
                {['Checking 12 drivers nearby...', '₹0 cancellation if no match', 'Fixed fare guaranteed'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#F6F6F6]">
                    {i === 0 ? (
                      <AlertCircle className="w-3.5 h-3.5 text-[#6C5CE7]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    )}
                    <span className="text-xs text-[#545454]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-[#DC2626]
                       bg-red-50 border border-red-100 transition-all active:scale-[0.98]">
              Cancel search
            </button>
          </div>
        )}
      </div>

      {/* ===== CANCEL CONFIRMATION DIALOG ===== */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50" onClick={() => setShowCancelConfirm(false)}>
          <div className="w-full max-w-lg bg-white rounded-t-2xl p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center py-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
                <X className="w-7 h-7 text-[#DC2626]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">Cancel Ride?</h3>
              <p className="text-sm text-[var(--text-muted)] text-center mb-5">
                Are you sure you want to cancel? No cancellation fee will be charged.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-[var(--text-primary)] bg-[#F6F6F6] transition-all active:scale-[0.98]">
                  Keep Ride
                </button>
                <button onClick={confirmCancel}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[#DC2626] transition-all active:scale-[0.98]">
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
