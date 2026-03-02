'use client';

import { useState } from 'react';
import { Check, ChevronRight, Zap, Shield } from 'lucide-react';

interface VehicleSelectorProps {
  pickup: string;
  drop: string;
  onSelect: (vehicleType: string, fare: number) => void;
  onClose: () => void;
}

const VEHICLES = [
  {
    type: 'COMPACT',
    label: 'Compact',
    icon: '🚗',
    desc: 'Budget-friendly, 4 seater',
    eta: '3 min',
    fare: 149,
    capacity: 4,
    tag: null,
  },
  {
    type: 'SEDAN',
    label: 'Sedan',
    icon: '🚙',
    desc: 'Comfortable, 4 seater',
    eta: '5 min',
    fare: 229,
    capacity: 4,
    tag: 'POPULAR',
  },
  {
    type: 'SUV',
    label: 'SUV',
    icon: '🚐',
    desc: 'Spacious, 6 seater',
    eta: '7 min',
    fare: 349,
    capacity: 6,
    tag: null,
  },
  {
    type: 'BLACK',
    label: 'Black',
    icon: '🖤',
    desc: 'Premium luxury sedan',
    eta: '8 min',
    fare: 449,
    capacity: 4,
    tag: 'PREMIUM',
  },
  {
    type: 'AUTO',
    label: 'Auto',
    icon: '🛺',
    desc: 'Quick for short trips',
    eta: '2 min',
    fare: 79,
    capacity: 3,
    tag: null,
  },
  {
    type: 'BIKE',
    label: 'Bike',
    icon: '🏍️',
    desc: 'Fastest, single rider',
    eta: '2 min',
    fare: 49,
    capacity: 1,
    tag: 'FASTEST',
  },
];

export default function VehicleSelector({ pickup, drop, onSelect, onClose }: VehicleSelectorProps) {
  const [selected, setSelected] = useState('SEDAN');

  const selectedVehicle = VEHICLES.find((v) => v.type === selected)!;

  return (
    <div className="bottom-sheet z-50" style={{ maxHeight: '75dvh' }}>
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
          <p className="text-xs text-[var(--text-muted)]">Est. 8.2 km</p>
          <p className="text-xs text-[var(--text-muted)]">~25 min</p>
        </div>
      </div>

      {/* Vehicles list */}
      <div className="space-y-2 max-h-[38dvh] overflow-y-auto pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none' }}>
        {VEHICLES.map((v) => (
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
                                  'rgba(0, 210, 255, 0.12)',
                      color: v.tag === 'POPULAR' ? '#A29BFE' : 
                             v.tag === 'PREMIUM' ? '#FF9100' : 
                             '#00D2FF',
                    }}>
                    {v.tag}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{v.desc}</p>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> {v.eta} • {v.capacity} seats
              </p>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base text-[var(--text-primary)]">₹{v.fare}</p>
              <p className="text-[10px] font-semibold tracking-wider" style={{ color: '#00E676' }}>
                FIXED
              </p>
            </div>

            {/* Selection indicator */}
            {selected === v.type && (
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}>
                <Check className="w-3 h-3 text-[var(--text-primary)]" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Book button */}
      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => onSelect(selectedVehicle.type, selectedVehicle.fare)}
          className="btn-primary flex items-center justify-center gap-2 text-[15px]"
        >
          Book {selectedVehicle.label} • ₹{selectedVehicle.fare}
          <ChevronRight className="w-4 h-4" />
        </button>
        <p className="text-center text-[11px] text-[var(--text-muted)] mt-2.5">
          ₹0 cancellation • 2× refund if we cancel • Fixed fare always
        </p>
      </div>
    </div>
  );
}
