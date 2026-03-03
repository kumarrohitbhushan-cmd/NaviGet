'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import RadarSearchOverlay from '@/components/booking/RadarSearchOverlay';
import { ChevronLeft, ChevronRight, Clock, Users2, Route, Check, Sparkles } from 'lucide-react';

const VEHICLES = [
  {
    type: 'MINI',
    label: 'Mini',
    desc: 'Budget-friendly AC cab',
    eta: '4 min',
    ratePerKm: 13,
    capacity: 4,
    tag: null,
    tagColor: '',
    tagBg: '',
  },
  {
    type: 'SEDAN',
    label: 'Sedan',
    desc: 'Comfortable AC ride',
    eta: '5 min',
    ratePerKm: 15,
    capacity: 4,
    tag: 'POPULAR',
    tagColor: '#6C5CE7',
    tagBg: 'rgba(108, 92, 231, 0.08)',
  },
  {
    type: 'SUV',
    label: 'SUV',
    desc: 'Spacious 6-seater',
    eta: '7 min',
    ratePerKm: 18,
    capacity: 6,
    tag: 'PREMIUM',
    tagColor: '#D97706',
    tagBg: 'rgba(245, 158, 11, 0.08)',
  },
  {
    type: 'SHARED',
    label: 'Shared',
    desc: 'Share & save big',
    eta: '6 min',
    ratePerKm: 5,
    capacity: 4,
    tag: 'CHEAPEST',
    tagColor: '#059669',
    tagBg: 'rgba(16, 185, 129, 0.08)',
  },
];

// Minimalist vehicle SVG icons
function VehicleIcon({ type, size = 32, active = false }: { type: string; size?: number; active?: boolean }) {
  const color = active ? '#6C5CE7' : '#545454';
  switch (type) {
    case 'MINI':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="6" y="16" width="28" height="12" rx="4" stroke={color} strokeWidth="1.8" fill={active ? '#F3F0FF' : '#F6F6F6'} />
          <path d="M10 16V13a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v3" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="28" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <line x1="16" y1="12" x2="16" y2="16" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <line x1="24" y1="12" x2="24" y2="16" stroke={color} strokeWidth="1.2" opacity="0.5" />
        </svg>
      );
    case 'SEDAN':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="16" width="32" height="12" rx="4" stroke={color} strokeWidth="1.8" fill={active ? '#F3F0FF' : '#F6F6F6'} />
          <path d="M8 16V12a6 6 0 0 1 6-6h12a6 6 0 0 1 6 6v4" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="11" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="29" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <line x1="14" y1="10" x2="14" y2="16" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <line x1="20" y1="8" x2="20" y2="16" stroke={color} strokeWidth="1.2" opacity="0.4" />
          <line x1="26" y1="10" x2="26" y2="16" stroke={color} strokeWidth="1.2" opacity="0.5" />
        </svg>
      );
    case 'SUV':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="4" y="14" width="32" height="14" rx="4" stroke={color} strokeWidth="1.8" fill={active ? '#F3F0FF' : '#F6F6F6'} />
          <path d="M7 14V11a6 6 0 0 1 6-6h14a6 6 0 0 1 6 6v3" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="11" cy="28" r="3.5" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="29" cy="28" r="3.5" stroke={color} strokeWidth="1.8" fill="white" />
          <line x1="13" y1="9" x2="13" y2="14" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <line x1="20" y1="7" x2="20" y2="14" stroke={color} strokeWidth="1.2" opacity="0.4" />
          <line x1="27" y1="9" x2="27" y2="14" stroke={color} strokeWidth="1.2" opacity="0.5" />
          <rect x="8" y="18" width="6" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.3" />
          <rect x="26" y="18" width="6" height="3" rx="1" stroke={color} strokeWidth="1" opacity="0.3" />
        </svg>
      );
    case 'SHARED':
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="6" y="16" width="28" height="12" rx="4" stroke={color} strokeWidth="1.8" fill={active ? '#F3F0FF' : '#F6F6F6'} />
          <path d="M10 16V13a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v3" stroke={color} strokeWidth="1.8" fill="none" />
          <circle cx="12" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="28" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="15" cy="11" r="2" stroke={color} strokeWidth="1.2" fill="white" />
          <circle cx="25" cy="11" r="2" stroke={color} strokeWidth="1.2" fill="white" />
          <circle cx="20" cy="9" r="2" stroke={color} strokeWidth="1.2" fill="white" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect x="6" y="16" width="28" height="12" rx="4" stroke={color} strokeWidth="1.8" fill={active ? '#F3F0FF' : '#F6F6F6'} />
          <circle cx="12" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
          <circle cx="28" cy="28" r="3" stroke={color} strokeWidth="1.8" fill="white" />
        </svg>
      );
  }
}

export default function VehiclesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState('SEDAN');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [showRadar, setShowRadar] = useState(false);
  const [bookingData, setBookingData] = useState<{
    pickup: string; drop: string;
    pickupCoords: { lat: number; lng: number };
    dropCoords: { lat: number; lng: number };
  } | null>(null);

  useEffect(() => {
    try {
      const airport = sessionStorage.getItem('airport_booking');
      if (airport) {
        const parsed = JSON.parse(airport);
        if (parsed.pickup && parsed.drop && parsed.pickupCoords && parsed.dropCoords) {
          setBookingData({
            pickup: parsed.pickup,
            drop: parsed.drop,
            pickupCoords: parsed.pickupCoords,
            dropCoords: parsed.dropCoords,
          });
          return;
        }
      }
      const data = sessionStorage.getItem('booking_data');
      if (data) {
        const parsed = JSON.parse(data);
        setBookingData({
          pickup: parsed.pickup,
          drop: parsed.drop,
          pickupCoords: parsed.pickupCoords,
          dropCoords: parsed.dropCoords,
        });
      } else {
        router.push('/booking');
      }
    } catch { router.push('/booking'); }
  }, [router]);

  useEffect(() => {
    if (!bookingData) return;
    const { pickupCoords, dropCoords } = bookingData;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          setDistanceKm(Math.round(data.routes[0].distance / 100) / 10);
          setDurationMin(Math.ceil(data.routes[0].duration / 60));
        }
      } catch {
        const R = 6371;
        const dLat = ((dropCoords.lat - pickupCoords.lat) * Math.PI) / 180;
        const dLon = ((dropCoords.lng - pickupCoords.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((pickupCoords.lat * Math.PI) / 180) * Math.cos((dropCoords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3;
        setDistanceKm(Math.round(km * 10) / 10);
        setDurationMin(Math.ceil(km * 2.5));
      }
    };
    fetchRoute();
  }, [bookingData]);

  const getFare = (ratePerKm: number) => {
    if (!distanceKm) return null;
    return Math.max(Math.round(ratePerKm * distanceKm), ratePerKm === 5 ? 30 : 50);
  };

  const selectedVehicle = VEHICLES.find((v) => v.type === selected)!;
  const selectedFare = getFare(selectedVehicle.ratePerKm);

  const handleBook = () => {
    if (!selectedFare || !bookingData) return;
    sessionStorage.setItem('booking_data', JSON.stringify({
      ...bookingData, vehicleType: selectedVehicle.type, fare: selectedFare,
    }));
    setShowRadar(true);
  };

  if (!bookingData) return null;

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
          <h1 className="text-base font-bold text-[var(--text-primary)]">Choose your ride</h1>
          <p className="text-xs text-[var(--text-muted)]">All fares are fixed — zero surge</p>
        </div>
      </header>

      {/* Route info */}
      <div className="px-5 pt-4 pb-2">
        <div className="rounded-xl bg-[var(--surface-3)] px-4 py-3 flex items-center gap-3">
          <div className="flex flex-col items-center gap-0">
            <div className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
            <div className="w-px h-4 bg-[#D4D4D4]" />
            <div className="w-2 h-2 rounded-sm rotate-45 bg-[var(--brand)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[var(--text-primary)] truncate font-medium">{bookingData.pickup.split(',').slice(0, 2).join(',')}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate mt-1">{bookingData.drop.split(',').slice(0, 2).join(',')}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {distanceKm !== null ? (
              <>
                <p className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1">
                  <Route className="w-3 h-3" /> {distanceKm} km
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">~{durationMin} min</p>
              </>
            ) : (
              <div className="w-14 h-6 rounded shimmer" />
            )}
          </div>
        </div>
      </div>

      {/* Vehicles list */}
      <div className="flex-1 px-5 pt-2 pb-2">
        <div className="space-y-2">
          {VEHICLES.map((v) => {
            const fare = getFare(v.ratePerKm);
            const isSelected = selected === v.type;
            return (
              <button key={v.type} onClick={() => setSelected(v.type)}
                className={`w-full flex items-center gap-3.5 p-4 rounded-2xl transition-all duration-200 active:scale-[0.99] border-2 ${
                  isSelected
                    ? 'border-[var(--brand)] bg-[#FAFAFF]'
                    : 'border-transparent bg-[var(--surface-3)] hover:bg-[#F0F0F0]'
                }`}>
                <div className="flex-shrink-0">
                  <VehicleIcon type={v.type} size={40} active={isSelected} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${isSelected ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'}`}>{v.label}</span>
                    {v.tag && (
                      <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ background: v.tagBg, color: v.tagColor }}>
                        {v.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{v.desc}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5"><Clock className="w-3 h-3" />{v.eta}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-0.5"><Users2 className="w-3 h-3" />{v.capacity}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {fare !== null ? (
                    <>
                      <p className={`font-bold text-lg ${isSelected ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'}`}>₹{fare}</p>
                      <p className="text-[10px] font-semibold text-[#059669]">FIXED</p>
                    </>
                  ) : (
                    <div className="w-12 h-6 rounded shimmer" />
                  )}
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--brand)]">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book button */}
      <div className="px-5 pb-6 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={handleBook} disabled={selectedFare === null}
          className="btn-primary flex items-center justify-center gap-2">
          {selectedFare !== null ? (
            <>
              <Sparkles className="w-4 h-4" />
              Book {selectedVehicle.label} · ₹{selectedFare}
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Calculating fare...
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-[var(--text-muted)] mt-2">
          ₹0 cancellation · 2× refund if we cancel · Fixed fare always
        </p>
      </div>

      {/* Radar overlay */}
      {showRadar && selectedFare && (
        <RadarSearchOverlay
          pickup={bookingData.pickup}
          drop={bookingData.drop}
          fare={selectedFare}
          vehicleType={selectedVehicle.type}
          pickupCoords={bookingData.pickupCoords}
          dropCoords={bookingData.dropCoords}
          onClose={() => setShowRadar(false)}
        />
      )}
    </div>
  );
}
