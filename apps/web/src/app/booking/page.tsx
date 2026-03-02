'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showVehicles, setShowVehicles] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
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
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                             text-[var(--text-primary)] bg-[#F6F6F6] transition-all active:scale-[0.98]">
              <Clock className="w-4 h-4" />
              Schedule
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                             text-[var(--text-primary)] bg-[#F6F6F6] transition-all active:scale-[0.98]">
              <Users className="w-4 h-4" />
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

          {/* ===== USP SECTION ===== */}
          {!showVehicles && !showRadar && (
            <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Why NaviGet?</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: '💰', text: 'Fixed Fare', sub: '24×7' },
                  { icon: '🚫', text: 'No Surge', sub: 'Ever' },
                  { icon: '💸', text: '2× Refund', sub: 'Guaranteed' },
                  { icon: '👥', text: 'Shared', sub: 'from ₹399' },
                  { icon: '⏰', text: 'Schedule', sub: '2h ahead' },
                  { icon: '✅', text: '₹0 Cancel', sub: 'Always' },
                ].map((usp) => (
                  <div key={usp.text} className="flex flex-col items-center p-3 rounded-xl bg-[#F6F6F6]">
                    <span className="text-lg mb-1">{usp.icon}</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">{usp.text}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{usp.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
