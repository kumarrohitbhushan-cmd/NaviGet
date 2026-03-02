'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Car,
  Star,
  Calendar,
  IndianRupee,
  Filter,
} from 'lucide-react';

type RideStatusFilter = 'all' | 'completed' | 'cancelled';

interface MockRide {
  id: string;
  date: string;
  time: string;
  pickup: string;
  drop: string;
  fare: number;
  status: 'completed' | 'cancelled' | 'refunded';
  vehicleType: string;
  driver: string;
  rating?: number;
}

const mockRides: MockRide[] = [
  {
    id: 'NVG-8472',
    date: '15 Jan 2025',
    time: '09:34 AM',
    pickup: 'Connaught Place, Delhi',
    drop: 'IGI Airport T3, Delhi',
    fare: 449,
    status: 'completed',
    vehicleType: 'Sedan',
    driver: 'Rajesh K.',
    rating: 5,
  },
  {
    id: 'NVG-8391',
    date: '14 Jan 2025',
    time: '06:20 PM',
    pickup: 'Hauz Khas, Delhi',
    drop: 'Saket Mall, Delhi',
    fare: 149,
    status: 'completed',
    vehicleType: 'Compact',
    driver: 'Suresh M.',
    rating: 4,
  },
  {
    id: 'NVG-8290',
    date: '13 Jan 2025',
    time: '11:15 PM',
    pickup: 'Nehru Place, Delhi',
    drop: 'Dwarka Sector 21, Delhi',
    fare: 349,
    status: 'refunded',
    vehicleType: 'SUV',
    driver: 'System',
  },
  {
    id: 'NVG-8188',
    date: '12 Jan 2025',
    time: '08:00 AM',
    pickup: 'Lajpat Nagar, Delhi',
    drop: 'Gurgaon Cyber Hub',
    fare: 229,
    status: 'cancelled',
    vehicleType: 'Sedan',
    driver: '-',
  },
  {
    id: 'NVG-8100',
    date: '10 Jan 2025',
    time: '02:45 PM',
    pickup: 'India Gate, Delhi',
    drop: 'Karol Bagh, Delhi',
    fare: 79,
    status: 'completed',
    vehicleType: 'Auto',
    driver: 'Vikas P.',
    rating: 5,
  },
];

export default function BookingsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<RideStatusFilter>('all');

  const filtered = filter === 'all'
    ? mockRides
    : mockRides.filter((r) => r.status === filter || (filter === 'cancelled' && r.status === 'refunded'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'rgba(0,230,118,0.08)', text: '#00E676' };
      case 'cancelled': return { bg: 'rgba(255,82,82,0.08)', text: '#FF5252' };
      case 'refunded': return { bg: 'rgba(255,145,0,0.08)', text: '#FF9100' };
      default: return { bg: 'rgba(255,255,255,0.05)', text: '#fff' };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(19, 17, 28, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          <ArrowLeft className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        <h1 className="text-base font-bold text-[var(--text-primary)] flex-1">My Bookings</h1>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[var(--text-muted)]"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <Calendar className="w-3 h-3" />
          {mockRides.length} rides
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        {(['all', 'completed', 'cancelled'] as RideStatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'var(--brand)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#fff' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${filter === f ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Rides list */}
      <div className="px-4 py-3 space-y-3">
        {filtered.map((ride) => {
          const sc = getStatusColor(ride.status);
          return (
            <div key={ride.id} className="card-glass rounded-2xl p-4 transition-all active:scale-[0.99]">
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-brand-light/50" />
                  <span className="text-xs text-[var(--text-muted)] font-mono">{ride.id}</span>
                  <span className="text-xs text-white/15">•</span>
                  <span className="text-xs text-[var(--text-muted)]">{ride.vehicleType}</span>
                </div>
                <div className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase"
                  style={{ background: sc.bg, color: sc.text }}>
                  {ride.status === 'refunded' ? '2× Refunded' : ride.status}
                </div>
              </div>

              {/* Route */}
              <div className="flex gap-3 mb-3">
                <div className="flex flex-col items-center gap-0.5 pt-1">
                  <div className="w-2 h-2 rounded-full bg-accent-green" />
                  <div className="w-px h-6 bg-white/10" />
                  <MapPin className="w-3 h-3 text-red-400" />
                </div>
                <div className="flex-1 space-y-2.5">
                  <p className="text-sm text-[var(--text-secondary)] leading-tight">{ride.pickup}</p>
                  <p className="text-sm text-[var(--text-secondary)] leading-tight">{ride.drop}</p>
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-2.5"
                style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-white/15" />
                    <span className="text-[11px] text-[var(--text-muted)]">{ride.date}, {ride.time}</span>
                  </div>
                  {ride.rating && (
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[11px] text-[var(--text-muted)]">{ride.rating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-[var(--text-muted)]" />
                  <span className="text-sm font-bold text-[var(--text-secondary)]">₹{ride.fare}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <Car className="w-12 h-12 text-[var(--text-muted)] mb-3" />
            <p className="text-sm text-[var(--text-muted)]">No rides found</p>
          </div>
        )}
      </div>
    </div>
  );
}
