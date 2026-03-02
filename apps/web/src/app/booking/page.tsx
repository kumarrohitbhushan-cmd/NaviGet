'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NaviGetLogo from '@/components/icons/NaviGetLogo';
import ProfileDrawer from '@/components/profile/ProfileDrawer';
import RadarSearchOverlay from '@/components/booking/RadarSearchOverlay';
import PlacesAutocomplete, { PlaceResult } from '@/components/map/PlacesAutocomplete';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });
import {
  Clock,
  Users,
  Search,
  LocateFixed,
  Sparkles,
} from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showRadar, setShowRadar] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
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
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18`)
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
    // Save booking data for tracking page
    sessionStorage.setItem('booking_data', JSON.stringify({
      pickup,
      drop,
      pickupCoords,
      dropCoords,
      vehicleType: 'SEDAN',
      fare: 229,
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
        // Reverse geocode using Nominatim (free)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18`)
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
      () => {
        setLocatingMe(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: 'var(--surface)' }}>
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 backdrop-blur-xl px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(19, 17, 28, 0.88)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Profile Avatar */}
        <button
          onClick={() => setShowProfileDrawer(true)}
          className="w-10 h-10 rounded-full flex items-center justify-center
                     transition-all duration-200 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)',
            boxShadow: '0 2px 12px rgba(108, 92, 231, 0.3)',
          }}
        >
          <span className="text-sm font-bold text-[var(--text-primary)]">{userName}</span>
        </button>

        <NaviGetLogo size="sm" />

        <button className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: 'var(--surface-3)' }}>
          <Sparkles className="w-4 h-4 text-brand-400" />
        </button>
      </header>

      {/* ===== MAP VIEW ===== */}
      <div className="relative">
        <MapView pickupCoords={pickupCoords} dropCoords={dropCoords} height="14rem" />
        
        {/* Locate me button */}
        <button
          onClick={handleLocateMe}
          disabled={locatingMe}
          className="absolute bottom-4 right-4 w-11 h-11 rounded-full flex items-center justify-center
                         shadow-lg transition-all active:scale-95 z-10"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {locatingMe ? (
            <div className="w-5 h-5 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          ) : (
            <LocateFixed className="w-5 h-5 text-brand-400" />
          )}
        </button>
      </div>

      {/* ===== BOOKING CARD ===== */}
      <div className="relative -mt-6 z-10 px-4 flex-1 flex flex-col">
        <div className="card-glass p-5 space-y-4">
          {/* Route Inputs */}
          <div className="flex gap-3">
            {/* Route dots */}
            <div className="flex flex-col items-center pt-3.5 gap-0.5">
              <div className="w-3 h-3 rounded-full" style={{ background: '#00E676', boxShadow: '0 0 8px rgba(0,230,118,0.4)' }} />
              <div className="flex flex-col gap-0.5 py-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-0.5 h-1.5 rounded-full bg-white/10" />
                ))}
              </div>
              <div className="w-3 h-3 rounded-sm rotate-45" style={{ background: '#FF5252', boxShadow: '0 0 8px rgba(255,82,82,0.4)' }} />
            </div>

            {/* Autocomplete Input fields */}
            <div className="flex-1 space-y-2.5">
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
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium
                             text-[var(--text-secondary)] transition-all active:scale-[0.98]"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <Clock className="w-3.5 h-3.5" />
              Schedule
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium
                             text-[var(--text-secondary)] transition-all active:scale-[0.98]"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}>
              <Users className="w-3.5 h-3.5" />
              Share Ride
            </button>
          </div>

          {/* Find rides button */}
          <button
            onClick={handleFindRides}
            disabled={!pickupCoords || !dropCoords}
            className="btn-primary flex items-center justify-center gap-2 text-[15px]"
          >
            <Search className="w-4 h-4" />
            Find rides
          </button>
        </div>

        {/* ===== USP FOOTER ===== */}
        {!showRadar && (
          <div className="mt-4 mb-6">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex gap-2 min-w-max pb-2">
                {[
                  { icon: '💰', text: 'Fixed Fare 24×7' },
                  { icon: '🚫', text: 'No Surge' },
                  { icon: '💸', text: '2× Refund' },
                  { icon: '👥', text: 'Share from ₹399' },
                  { icon: '⏰', text: 'Schedule 2h Ahead' },
                  { icon: '✅', text: '₹0 Cancel' },
                ].map((usp) => (
                  <span key={usp.text} className="usp-pill text-xs">
                    <span>{usp.icon}</span> {usp.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== RADAR SEARCH OVERLAY ===== */}
      {showRadar && (
        <RadarSearchOverlay
          pickup={pickup}
          drop={drop}
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
