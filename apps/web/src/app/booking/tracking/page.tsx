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
  phone: '+91 98765 43***',
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
  { status: 'arrived', label: 'Driver has arrived', duration: 0 },
];

export default function TrackingPage() {
  const router = useRouter();
  const [rideStatus, setRideStatus] = useState<RideStatus>('searching');
  const [eta, setEta] = useState(7);
  const [statusIndex, setStatusIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Load booking data for map coordinates
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
      }
    } catch {}
  }, []);

  // Simulate ride status progression
  useEffect(() => {
    if (statusIndex < statusFlow.length - 1) {
      const timer = setTimeout(() => {
        const nextIndex = statusIndex + 1;
        setStatusIndex(nextIndex);
        setRideStatus(statusFlow[nextIndex].status);
        if (statusFlow[nextIndex].status === 'arriving') {
          // Count down ETA
          const etaInterval = setInterval(() => {
            setEta((prev) => {
              if (prev <= 1) {
                clearInterval(etaInterval);
                return 1;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(etaInterval);
        }
      }, statusFlow[statusIndex].duration);
      return () => clearTimeout(timer);
    }
  }, [statusIndex]);

  // Simulate driver position moving toward pickup
  useEffect(() => {
    if (rideStatus === 'searching' || !pickupCoords || !dropCoords) {
      setDriverCoords(null);
      return;
    }

    if (rideStatus === 'arrived') {
      setDriverCoords(pickupCoords);
      return;
    }

    // Simulate driver approaching from a nearby offset
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

  const handleCancel = () => {
    router.push('/booking');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Map area */}
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
          <NaviGetLogo size="sm" />
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--text-secondary)]
                       flex items-center gap-1 transition-all active:scale-95"
            style={{ background: 'rgba(28, 26, 39, 0.85)', backdropFilter: 'blur(8px)' }}
          >
            Details <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Status pill */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="rounded-2xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(28, 26, 39, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}>
            {rideStatus === 'searching' ? (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(108, 92, 231, 0.15)' }}>
                  <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Finding your ride...</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Matching with nearby drivers</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: rideStatus === 'arrived'
                      ? 'rgba(0, 230, 118, 0.15)'
                      : 'rgba(108, 92, 231, 0.15)',
                  }}>
                  {rideStatus === 'arrived' ? (
                    <CheckCircle2 className="w-5 h-5 text-accent-green" />
                  ) : (
                    <Navigation className="w-5 h-5 text-brand" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {statusFlow[statusIndex].label}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {rideStatus === 'arrived'
                      ? `Share OTP: ${mockDriver.otp}`
                      : `ETA: ${eta} min • ${mockDriver.vehiclePlate}`
                    }
                  </p>
                </div>
                {rideStatus === 'arrived' && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-[var(--text-primary)]"
                    style={{ background: 'var(--brand)' }}>
                    OTP: {mockDriver.otp}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div
        className="relative rounded-t-3xl -mt-4 z-20"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderBottom: 'none' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        {/* Driver card */}
        {rideStatus !== 'searching' ? (
          <div className="px-5 pb-4">
            {/* Driver info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-[var(--text-primary)]"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
                {mockDriver.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{mockDriver.name}</h3>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-[var(--text-secondary)]">{mockDriver.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{mockDriver.trips} trips</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(0, 230, 118, 0.1)' }}>
                  <Phone className="w-4 h-4 text-accent-green" />
                </button>
                <button className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(108, 92, 231, 0.1)' }}>
                  <MessageCircle className="w-4 h-4 text-brand" />
                </button>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="card-glass rounded-xl p-3 mb-4">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-brand-light" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{mockDriver.vehicleModel}</p>
                  <p className="text-xs text-[var(--text-muted)]">{mockDriver.vehicleColor} • {mockDriver.vehiclePlate}</p>
                </div>
              </div>
            </div>

            {/* Route summary */}
            {showDetails && (
              <div className="card-glass rounded-xl p-4 mb-4 animate-scale-in">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <Circle className="w-3 h-3 text-accent-green" fill="#00E676" />
                    <div className="w-px h-8 bg-white/10" />
                    <MapPin className="w-3 h-3 text-red-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">PICKUP</p>
                      <p className="text-sm text-[var(--text-secondary)]">{pickupName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-muted)] mb-0.5">DROP</p>
                      <p className="text-sm text-[var(--text-secondary)]">{dropName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">~35 min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">22.4 km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-accent-green/40" />
                    <span className="text-xs text-accent-green/60">₹0 cancellation</span>
                  </div>
                </div>
              </div>
            )}

            {/* Safety + Cancel */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)]
                               flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                <Shield className="w-4 h-4" />
                Safety
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-red-400/70
                         flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{ background: 'rgba(255, 82, 82, 0.05)', border: '1px solid rgba(255,82,82,0.1)' }}>
                <X className="w-4 h-4" />
                Cancel ride
              </button>
            </div>

            <p className="text-center text-[10px] text-white/15 mt-3">
              ₹0 cancellation fee • Fixed fare guaranteed
            </p>
          </div>
        ) : (
          /* Searching state */
          <div className="px-5 pb-6">
            <div className="flex flex-col items-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(108, 92, 231, 0.08)' }}>
                <div className="w-12 h-12 border-3 border-brand/20 border-t-brand rounded-full animate-spin" />
              </div>
              <p className="text-base font-semibold text-[var(--text-primary)] mb-1">Looking for drivers nearby</p>
              <p className="text-sm text-[var(--text-muted)] mb-6">This usually takes under a minute</p>

              <div className="w-full space-y-2">
                {['Checking 12 drivers nearby...', '₹0 cancellation if no match', 'Fixed fare guaranteed'].map((text, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    {i === 0 ? (
                      <AlertCircle className="w-3.5 h-3.5 text-brand-light/50" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-green/50" />
                    )}
                    <span className="text-xs text-[var(--text-muted)]">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-red-400/60
                       transition-all active:scale-[0.98]"
              style={{ background: 'rgba(255, 82, 82, 0.05)', border: '1px solid rgba(255,82,82,0.08)' }}>
              Cancel search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
