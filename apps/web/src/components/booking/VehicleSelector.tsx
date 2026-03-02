'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronRight, Zap, Shield, Route } from 'lucide-react';

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
  },
  {
    type: 'AUTO',
    label: 'Auto',
    icon: '🛺',
    desc: 'Quick & affordable, 3 seater',
    eta: '3 min',
    ratePerKm: 11,
    capacity: 3,
    tag: null,
  },
  {
    type: 'MINI',
    label: 'Mini',
    icon: '🚗',
    desc: 'Budget-friendly, 4 seater',
    eta: '4 min',
    ratePerKm: 13,
    capacity: 4,
    tag: null,
  },
  {
    type: 'SEDAN',
    label: 'Sedan',
    icon: '🚙',
    desc: 'Comfortable, 4 seater',
    eta: '5 min',
    ratePerKm: 15,
    capacity: 4,
    tag: 'POPULAR',
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
  },
  {
    type: 'SHARED',
    label: 'Shared Cab',
    icon: '👥',
    desc: 'Share & save, up to 4 riders',
    eta: '6 min',
    ratePerKm: 5,
    capacity: 4,
    tag: 'CHEAPEST',
  },
];

export default function VehicleSelector({ pickup, drop, pickupCoords, dropCoords, onSelect, onClose }: VehicleSelectorProps) {
  const [selected, setSelected] = useState('SEDAN');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);

  // Fetch distance from OSRM
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
        // Fallback: straight-line distance
        const R = 6371;
        const dLat = ((dropCoords.lat - pickupCoords.lat) * Math.PI) / 180;
        const dLon = ((dropCoords.lng - pickupCoords.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos((pickupCoords.lat * Math.PI) / 180) * Math.cos((dropCoords.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
        const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3; // 1.3x for road factor
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
    <div className="bottom-sheet z-50" style={{ maxHeight: '78dvh' }}>
      <div className="bottom-sheet-handle" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Choose your ride</h2>
          <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            Fixed fare • No surge • Cancel free
          </p>
        </div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--surface-3)' }}>
          Close
        </button>
      </div>

      {/* Route summary */}
      <div className="rounded-xl px-3.5 py-2.5 mb-4 flex items-center gap-2.5"
        style={{ background: 'var(--surface-3)' }}>
        <div className="flex flex-col items-center gap-0">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00E676' }} />
          <div className="w-px h-3 bg-white/10" />
          <div className="w-2 h-2 rounded-sm rotate-45" style={{ background: '#FF5252' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--text-secondary)] truncate">{pickup}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{drop}</p>
        </div>
        <div className="text-right flex-shrink-0">
          {distanceKm !== null ? (
            <>
              <p className="text-xs font-medium text-brand flex items-center gap-1">
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
      <div className="space-y-2 max-h-[40dvh] overflow-y-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}>
        {VEHICLES.map((v) => {
          const fare = getFare(v.ratePerKm);
          return (
            <button
              key={v.type}
              onClick={() => setSelected(v.type)}
              className="w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-200 active:scale-[0.99]"
              style={{
                background: selected === v.type ? 'rgba(108, 92, 231, 0.08)' : 'transparent',
                border: selected === v.type ? '1.5px solid rgba(108, 92, 231, 0.3)' : '1.5px solid transparent',
              }}
            >
              {/* Vehicle icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: selected === v.type ? 'rgba(108, 92, 231, 0.15)' : 'var(--surface-3)',
                }}>
                {v.icon}
              </div>

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[var(--text-primary)]">{v.label}</span>
                  {v.tag && (
                    <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md"
                      style={{
                        background: v.tag === 'POPULAR' ? 'rgba(108, 92, 231, 0.15)' :
                                    v.tag === 'PREMIUM' ? 'rgba(255, 145, 0, 0.12)' :
                                    v.tag === 'CHEAPEST' ? 'rgba(0, 230, 118, 0.12)' :
                                    'rgba(0, 210, 255, 0.12)',
                        color: v.tag === 'POPULAR' ? '#A29BFE' :
                               v.tag === 'PREMIUM' ? '#FF9100' :
                               v.tag === 'CHEAPEST' ? '#00E676' :
                               '#00D2FF',
                      }}>
                      {v.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{v.desc}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {v.eta} • {v.capacity} {v.capacity === 1 ? 'seat' : 'seats'} • ₹{v.ratePerKm}/km
                </p>
              </div>

              {/* Price */}
              <div className="text-right flex-shrink-0">
                {fare !== null ? (
                  <>
                    <p className="font-bold text-base text-[var(--text-primary)]">₹{fare}</p>
                    <p className="text-[10px] font-semibold tracking-wider" style={{ color: '#00E676' }}>
                      FIXED
                    </p>
                  </>
                ) : (
                  <div className="w-12 h-6 rounded shimmer" />
                )}
              </div>

              {/* Selection indicator */}
              {selected === v.type && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
                  <Check className="w-3 h-3 text-[var(--text-primary)]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Book button */}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => selectedFare !== null && onSelect(selectedVehicle.type, selectedFare)}
          disabled={selectedFare === null}
          className="btn-primary flex items-center justify-center gap-2 text-[15px]"
        >
          {selectedFare !== null ? (
            <>
              Book {selectedVehicle.label} • ₹{selectedFare}
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Calculating fare...
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-[var(--text-muted)] mt-2.5">
          ₹0 cancellation • 2× refund if we cancel • Fixed fare always
        </p>
      </div>
    </div>
  );
}
