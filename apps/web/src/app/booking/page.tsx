'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import ProfileDrawer from '@/components/profile/ProfileDrawer';
import VehicleSelector from '@/components/booking/VehicleSelector';
import RadarSearchOverlay from '@/components/booking/RadarSearchOverlay';
import PlacesAutocomplete, { PlaceResult } from '@/components/map/PlacesAutocomplete';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });
import {
  Clock,
  Users,
  Search,
  LocateFixed,
  Menu,
  Bell,
  X,
  CalendarDays,
  Share2,
  CheckCircle2,
} from 'lucide-react';

// USP items for the animated marquee ribbon
const USP_ITEMS = [
  '💰 Fixed Fare 24×7',
  '🚫 No Surge Ever',
  '💸 2× Refund Guaranteed',
  '👥 Shared from ₹399',
  '⏰ Schedule 2h Ahead',
  '✅ ₹0 Cancellation Always',
];

// Schedule modal: next 7 days + 12 hourly time slots
function ScheduleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (date: string, time: string) => void }) {
  const days = useMemo(() => {
    const d: { label: string; dateStr: string; dayName: string }[] = [];
    for (let i = 0; i < 7; i++) {
      const dt = new Date(); dt.setDate(dt.getDate() + i);
      d.push({
        label: dt.getDate().toString(),
        dateStr: dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dt.toLocaleDateString('en-IN', { weekday: 'short' }),
      });
    }
    return d;
  }, []);

  const times = useMemo(() => {
    const t: string[] = [];
    for (let h = 6; h <= 22; h++) {
      const hr = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      t.push(`${hr}:00 ${ampm}`);
    }
    return t;
  }, []);

  const [selDay, setSelDay] = useState(0);
  const [selTime, setSelTime] = useState(0);

  return (
    <div className="schedule-overlay" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Schedule Ride</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F6F6F6] flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date picker */}
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Select Date</p>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {days.map((d, i) => (
            <button key={i} onClick={() => setSelDay(i)}
              className={`flex flex-col items-center px-4 py-2.5 rounded-xl min-w-[64px] border transition-all ${
                selDay === i ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-[#F6F6F6] text-[var(--text-primary)] border-transparent'
              }`}>
              <span className="text-[10px] font-medium opacity-70">{d.dayName}</span>
              <span className="text-base font-bold">{d.label}</span>
              <span className="text-[10px]">{d.dateStr.split(' ')[1]}</span>
            </button>
          ))}
        </div>

        {/* Time picker */}
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Select Time</p>
        <div className="grid grid-cols-4 gap-2 mb-5 max-h-40 overflow-y-auto">
          {times.map((t, i) => (
            <button key={i} onClick={() => setSelTime(i)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                selTime === i ? 'bg-[var(--brand)] text-white border-[var(--brand)]' : 'bg-[#F6F6F6] text-[var(--text-primary)] border-transparent'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <button onClick={() => onConfirm(days[selDay].dateStr, times[selTime])}
          className="btn-primary flex items-center justify-center gap-2">
          <CalendarDays className="w-4 h-4" />
          Confirm Schedule
        </button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduledInfo, setScheduledInfo] = useState<{ date: string; time: string } | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<{ type: string; fare: number } | null>(null);
  const [userName, setUserName] = useState('U');
  const [locatingMe, setLocatingMe] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem('navigate_auth');
      if (!auth) {
        router.push('/login');
        return;
      }
      const parsed = JSON.parse(auth);
      if (parsed?.name) setUserName(parsed.name[0]?.toUpperCase() || 'U');
    } catch {
      router.push('/login');
    }
  }, [router]);

  // Auto-detect pickup location using device GPS on page load
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPickupCoords(coords);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18`, {
          headers: { 'User-Agent': 'NaviGet-App/1.0 (naviget-app)' },
        })
          .then(res => res.json())
          .then(data => {
            if (data?.display_name) {
              setPickup(data.display_name.split(',').slice(0, 3).join(', '));
            } else {
              setPickup(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            }
            setLocatingMe(false);
          })
          .catch(() => {
            setPickup(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            setLocatingMe(false);
          });
      },
      () => { setLocatingMe(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleFindRides = () => {
    if (!pickup || !drop || !pickupCoords || !dropCoords) return;
    setShowVehicles(true);
  };

  const handleVehicleSelect = (vehicleType: string, fare: number) => {
    setSelectedVehicle({ type: vehicleType, fare });
    setShowVehicles(false);
    sessionStorage.setItem('booking_data', JSON.stringify({
      pickup, drop, pickupCoords, dropCoords, vehicleType, fare,
    }));
    setShowRadar(true);
  };

  const handlePickupSelect = useCallback((place: PlaceResult) => {
    setPickup(place.address);
    setPickupCoords({ lat: place.lat, lng: place.lng });
  }, []);

  const handleDropSelect = useCallback((place: PlaceResult) => {
    setDrop(place.address);
    setDropCoords({ lat: place.lat, lng: place.lng });
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocatingMe(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPickupCoords(coords);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18`, {
          headers: { 'User-Agent': 'NaviGet-App/1.0 (naviget-app)' },
        })
          .then(res => res.json())
          .then(data => {
            if (data?.display_name) {
              setPickup(data.display_name.split(',').slice(0, 3).join(', '));
            } else {
              setPickup(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            }
            setLocatingMe(false);
          })
          .catch(() => {
            setPickup(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            setLocatingMe(false);
          });
      },
      () => { setLocatingMe(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleShareRide = async () => {
    const text = `Hey! I'm booking a NaviGet ride from ${pickup.split(',')[0]} to ${drop.split(',')[0]}. Join me or track my trip! 🚗`;
    if (navigator.share) {
      try { await navigator.share({ title: 'NaviGet Ride', text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Ride details copied to clipboard!');
    }
  };

  const handleScheduleConfirm = (date: string, time: string) => {
    setScheduledInfo({ date, time });
    setShowSchedule(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowProfileDrawer(true)}
          className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center
                     transition-all duration-200 active:scale-95"
        >
          <Menu className="w-5 h-5 text-[var(--text-primary)]" />
        </button>

        <NaviGetLogo size="sm" />

        <button className="w-10 h-10 rounded-full bg-[#F6F6F6] flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-[var(--text-primary)]" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[var(--brand)]" />
        </button>
      </header>

      {/* ===== MAP VIEW ===== */}
      <div className="relative">
        <MapView pickupCoords={pickupCoords} dropCoords={dropCoords} height="38dvh" />
        
        {/* Locate me FAB */}
        <button
          onClick={handleLocateMe}
          disabled={locatingMe}
          className="absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center
                     shadow-lg transition-all active:scale-95 z-10 bg-white"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        >
          {locatingMe ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5 text-[var(--text-primary)]" />
          )}
        </button>
      </div>

      {/* ===== BOOKING CARD ===== */}
      <div className="relative -mt-5 z-10 flex-1 flex flex-col">
        <div className="bg-white rounded-t-2xl px-5 pt-5 pb-4 flex-1 flex flex-col" style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          {/* Greeting */}
          <h2 className="text-[22px] font-bold text-[var(--text-primary)] mb-4">Where to?</h2>

          {/* Scheduled indicator */}
          {scheduledInfo && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F3F0FF] mb-3 border border-[rgba(108,92,231,0.15)]">
              <CalendarDays className="w-4 h-4 text-[var(--brand)]" />
              <span className="flex-1 text-xs font-semibold text-[var(--brand)]">
                Scheduled: {scheduledInfo.date} at {scheduledInfo.time}
              </span>
              <button onClick={() => setScheduledInfo(null)} className="text-[var(--text-muted)]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Route Inputs */}
          <div className="flex gap-3 mb-4">
            {/* Route timeline */}
            <div className="flex flex-col items-center pt-3 gap-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)]" />
              <div className="w-0.5 flex-1 my-1 bg-[#E0E0E0]" />
              <div className="w-2.5 h-2.5 rounded-sm rotate-45 bg-[var(--brand)]" />
            </div>

            {/* Input fields */}
            <div className="flex-1 space-y-2">
              <PlacesAutocomplete
                value={pickup}
                onChange={(v) => { setPickup(v); if (!v) setPickupCoords(null); }}
                onSelect={handlePickupSelect}
                placeholder="Pickup location"
                type="pickup"
              />
              <PlacesAutocomplete
                value={drop}
                onChange={(v) => { setDrop(v); if (!v) setDropCoords(null); }}
                onSelect={handleDropSelect}
                placeholder="Where are you going?"
                type="drop"
              />
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setShowSchedule(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                             text-[var(--text-primary)] bg-[#F6F6F6] transition-all active:scale-[0.98]">
              <Clock className="w-4 h-4" />
              Schedule
            </button>
            <button onClick={handleShareRide}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                             text-[var(--text-primary)] bg-[#F6F6F6] transition-all active:scale-[0.98]">
              <Share2 className="w-4 h-4" />
              Share Ride
            </button>
          </div>

          {/* Find rides button */}
          <button
            onClick={handleFindRides}
            disabled={!pickupCoords || !dropCoords}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Search className="w-4.5 h-4.5" />
            Find rides
          </button>

          {/* ===== ANIMATED USP RIBBON (matching mobile marquee) ===== */}
          {!showVehicles && !showRadar && (
            <div className="mt-5 pt-4 overflow-hidden" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Why NaviGet?</p>
              <div className="overflow-hidden">
                <div className="usp-marquee-track">
                  {/* Duplicate the items for seamless loop */}
                  {[...USP_ITEMS, ...USP_ITEMS].map((usp, i) => (
                    <span key={i} className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold text-[var(--brand)] bg-[#F3F0FF] border border-[rgba(108,92,231,0.12)] whitespace-nowrap mr-2">
                      {usp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== SCHEDULE MODAL ===== */}
      {showSchedule && (
        <ScheduleModal onClose={() => setShowSchedule(false)} onConfirm={handleScheduleConfirm} />
      )}

      {/* ===== VEHICLE SELECTION BOTTOM SHEET ===== */}
      {showVehicles && pickupCoords && dropCoords && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[5000] animate-fade-in" onClick={() => setShowVehicles(false)} />
          <VehicleSelector
            pickup={pickup}
            drop={drop}
            pickupCoords={pickupCoords}
            dropCoords={dropCoords}
            onSelect={handleVehicleSelect}
            onClose={() => setShowVehicles(false)}
          />
        </>
      )}

      {/* ===== RADAR SEARCH OVERLAY ===== */}
      {showRadar && selectedVehicle && (
        <RadarSearchOverlay
          pickup={pickup}
          drop={drop}
          fare={selectedVehicle.fare}
          vehicleType={selectedVehicle.type}
          pickupCoords={pickupCoords}
          dropCoords={dropCoords}
          onClose={() => setShowRadar(false)}
        />
      )}

      {/* ===== PROFILE DRAWER ===== */}
      {showProfileDrawer && (
        <ProfileDrawer onClose={() => setShowProfileDrawer(false)} />
      )}
    </div>
  );
}
