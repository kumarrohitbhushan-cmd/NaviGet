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

  useEffect(() => {
    if (statusIndex < statusFlow.length - 1) {
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
      }, statusFlow[statusIndex].duration);
      return () => clearTimeout(timer);
    }
  }, [statusIndex]);

  useEffect(() => {
    if (rideStatus === 'searching' || !pickupCoords || !dropCoords) {
      setDriverCoords(null);
      return;
    }
    if (rideStatus === 'arrived') {
      setDriverCoords(pickupCoords);
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

  const handleCancel = () => { router.push('/booking'); };

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
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white rounded-full px-3 py-1.5 text-xs font-medium text-[#545454]
                       flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            Details <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Status pill on map */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="rounded-2xl p-3 flex items-center gap-3 bg-white shadow-lg">
            {rideStatus === 'searching' ? (
              <>
                <div className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#E8E6F0] border-t-[#6C5CE7] rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#000]">Finding your ride...</p>
                  <p className="text-[11px] text-[#A0A0A0]">Matching with nearby drivers</p>
                </div>
              </>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  rideStatus === 'arrived' ? 'bg-[#ECFDF5]' : 'bg-[#F3F0FF]'
                }`}>
                  {rideStatus === 'arrived' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  ) : (
                    <Navigation className="w-5 h-5 text-[#6C5CE7]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#000]">
                    {statusFlow[statusIndex].label}
                  </p>
                  <p className="text-[11px] text-[#A0A0A0]">
                    {rideStatus === 'arrived'
                      ? `Share OTP: ${mockDriver.otp}`
                      : `ETA: ${eta} min · ${mockDriver.vehiclePlate}`
                    }
                  </p>
                </div>
                {rideStatus === 'arrived' && (
                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#000]">
                    OTP: {mockDriver.otp}
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

        {rideStatus !== 'searching' ? (
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
                <button className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center transition-all active:scale-90">
                  <Phone className="w-4 h-4 text-[#059669]" />
                </button>
                <button className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center transition-all active:scale-90">
                  <MessageCircle className="w-4 h-4 text-[#6C5CE7]" />
                </button>
              </div>
            </div>

            {/* Vehicle info */}
            <div className="rounded-xl p-3 mb-4 bg-[#F6F6F6]">
              <div className="flex items-center gap-3">
                <Car className="w-5 h-5 text-[#545454]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#000]">{mockDriver.vehicleModel}</p>
                  <p className="text-xs text-[#A0A0A0]">{mockDriver.vehicleColor} · {mockDriver.vehiclePlate}</p>
                </div>
              </div>
            </div>

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

            {/* Safety + Cancel */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl text-sm font-medium text-[#545454]
                               flex items-center justify-center gap-2 border border-[#EBEBEB] transition-all active:scale-[0.98]">
                <Shield className="w-4 h-4" />
                Safety
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-[#DC2626]
                         flex items-center justify-center gap-2 bg-red-50 border border-red-100
                         transition-all active:scale-[0.98]">
                <X className="w-4 h-4" />
                Cancel ride
              </button>
            </div>

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
    </div>
  );
}
