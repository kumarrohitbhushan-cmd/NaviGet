'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, Clock, Users2, Route } from 'lucide-react';

interface VehicleSelectorProps {
  pickup: string;
  drop: string;
  pickupCoords: { lat: number; lng: number };
  dropCoords: { lat: number; lng: number };
  onSelect: (vehicleType: string, fare: number) => void;
  onClose: () => void;
}

const VEHICLES = [
  {
    type: 'BIKE',
    label: 'Bike',
    icon: '🏍️',
    desc: 'Fastest, single rider',
    eta: '2 min',
    ratePerKm: 7,
    capacity: 1,
    tag: 'FASTEST',
    tagColor: '#2563EB',
    tagBg: 'rgba(37, 99, 235, 0.08)',
  },
  {
    type: 'AUTO',
    label: 'Auto',
    icon: '🛺',
    desc: 'Quick & affordable',
    eta: '3 min',
    ratePerKm: 11,
    capacity: 3,
    tag: null,
    tagColor: '',
    tagBg: '',
  },
  {
    type: 'MINI',
    label: 'Mini',
    icon: '🚗',
    desc: 'Budget-friendly AC',
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
    icon: '🚙',
    desc: 'Comfortable AC',
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
    icon: '🚐',
    desc: 'Spacious, 6 seater',
    eta: '7 min',
    ratePerKm: 18,
    capacity: 6,
    tag: 'PREMIUM',
    tagColor: '#D97706',
    tagBg: 'rgba(245, 158, 11, 0.08)',
  },
  {
    type: 'SHARED',
    label: 'Shared Cab',
    icon: '👥',
    desc: 'Share & save big',
    eta: '6 min',
    ratePerKm: 5,
    capacity: 4,
    tag: 'CHEAPEST',
    tagColor: '#059669',
    tagBg: 'rgba(16, 185, 129, 0.08)',
  },
];

export default function VehicleSelector({ pickup, drop, pickupCoords, dropCoords, onSelect, onClose }: VehicleSelectorProps) {
  const [selected, setSelected] = useState('SEDAN');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=false`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          const km = data.routes[0].distance / 1000;
          const min = Math.ceil(data.routes[0].duration / 60);
          setDistanceKm(Math.round(km * 10) / 10);
          setDurationMin(min);
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
  }, [pickupCoords, dropCoords]);

  const getFare = (ratePerKm: number) => {
    if (!distanceKm) return null;
    const fare = Math.max(Math.round(ratePerKm * distanceKm), ratePerKm === 5 ? 30 : ratePerKm === 7 ? 25 : 50);
    return fare;
  };

  const selectedVehicle = VEHICLES.find((v) => v.type === selected)!;
  const selectedFare = getFare(selectedVehicle.ratePerKm);

  return (
    <div className="bottom-sheet z-[5000]" style={{ maxHeight: '80dvh' }}>
      <div className="bottom-sheet-handle" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Choose a ride</h2>
        <button onClick={onClose} className="text-sm font-medium text-[var(--text-muted)] px-3 py-1.5 rounded-lg bg-[#F6F6F6] active:scale-95 transition-all">
          Close
        </button>
      </div>

      {/* Route info bar */}
      <div className="rounded-xl bg-[#F6F6F6] px-3.5 py-2.5 mb-4 flex items-center gap-2.5">
        <div className="flex flex-col items-center gap-0">
          <div className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />
          <div className="w-px h-3 bg-[#D4D4D4]" />
          <div className="w-2 h-2 rounded-sm rotate-45 bg-[var(--brand)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-primary)] truncate font-medium">{pickup}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{drop}</p>
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

      {/* Vehicles list */}
      <div className="space-y-1 max-h-[42dvh] overflow-y-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}>
        {VEHICLES.map((v) => {
          const fare = getFare(v.ratePerKm);
          const isSelected = selected === v.type;
          return (
            <button
              key={v.type}
              onClick={() => setSelected(v.type)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-150 active:scale-[0.99] ${isSelected ? 'bg-[#F6F6F6]' : ''}`}
              style={isSelected ? { outline: '2px solid var(--text-primary)' } : {}}
            >
              {/* Vehicle icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-[#F6F6F6]">
                {v.icon}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{v.label}</span>
                  {v.tag && (
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: v.tagBg, color: v.tagColor }}>
                      {v.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />{v.eta}
                  </span>
                  <span className="mx-1">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Users2 className="w-3 h-3" />{v.capacity}
                  </span>
                  <span className="mx-1">·</span>
                  ₹{v.ratePerKm}/km
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                {fare !== null ? (
                  <>
                    <p className="font-bold text-base text-[var(--text-primary)]">₹{fare}</p>
                    <p className="text-[10px] font-semibold text-[#059669]">FIXED</p>
                  </>
                ) : (
                  <div className="w-12 h-6 rounded shimmer" />
                )}
              </div>

              {/* Selection check */}
              {isSelected && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[var(--text-primary)]">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Book button */}
      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => selectedFare !== null && onSelect(selectedVehicle.type, selectedFare)}
          disabled={selectedFare === null}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {selectedFare !== null ? (
            <>
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
    </div>
  );
}
