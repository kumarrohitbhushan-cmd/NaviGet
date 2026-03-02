'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LatLng {
  lat: number;
  lng: number;
}

interface MapViewProps {
  pickupCoords?: LatLng | null;
  dropCoords?: LatLng | null;
  driverCoords?: LatLng | null;
  showRoute?: boolean;
  height?: string;
}

// Custom marker icons using inline SVG data URIs
const pickupIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#00E676;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,230,118,0.5);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const dropIcon = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;border-radius:4px;background:#FF5252;border:3px solid #fff;box-shadow:0 2px 6px rgba(255,82,82,0.5);transform:rotate(45deg);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const driverIcon = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50%;background:#6C5CE7;border:3px solid #fff;box-shadow:0 2px 8px rgba(108,92,231,0.5);display:flex;align-items:center;justify-content:center;">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Default center: Delhi
const defaultCenter: LatLng = { lat: 28.6139, lng: 77.209 };

export default function MapView({
  pickupCoords,
  dropCoords,
  driverCoords,
  showRoute = true,
  height = '14rem',
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const dropMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultCenter.lat, defaultCenter.lng],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // OpenStreetMap tile layer with a clean style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Update markers and route
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const map = mapRef.current;

    // Clear existing markers
    if (pickupMarkerRef.current) { pickupMarkerRef.current.remove(); pickupMarkerRef.current = null; }
    if (dropMarkerRef.current) { dropMarkerRef.current.remove(); dropMarkerRef.current = null; }
    if (routeLineRef.current) { routeLineRef.current.remove(); routeLineRef.current = null; }

    // Add pickup marker
    if (pickupCoords) {
      pickupMarkerRef.current = L.marker([pickupCoords.lat, pickupCoords.lng], { icon: pickupIcon }).addTo(map);
    }

    // Add drop marker
    if (dropCoords) {
      dropMarkerRef.current = L.marker([dropCoords.lat, dropCoords.lng], { icon: dropIcon }).addTo(map);
    }

    // Draw route line (straight line between points — no API needed)
    if (pickupCoords && dropCoords && showRoute) {
      // Fetch route from OSRM (free, no API key)
      fetch(`https://router.project-osrm.org/route/v1/driving/${pickupCoords.lng},${pickupCoords.lat};${dropCoords.lng},${dropCoords.lat}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.routes?.[0]?.geometry) {
            const coords = data.routes[0].geometry.coordinates.map(
              (c: [number, number]) => [c[1], c[0]] as L.LatLngTuple
            );
            routeLineRef.current = L.polyline(coords, {
              color: '#6C5CE7',
              weight: 4,
              opacity: 0.85,
              dashArray: '8, 6',
            }).addTo(map);
            map.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
          }
        })
        .catch(() => {
          // Fallback: straight line
          routeLineRef.current = L.polyline(
            [[pickupCoords.lat, pickupCoords.lng], [dropCoords.lat, dropCoords.lng]],
            { color: '#6C5CE7', weight: 4, opacity: 0.85, dashArray: '8, 6' }
          ).addTo(map);
          map.fitBounds(routeLineRef.current.getBounds(), { padding: [40, 40] });
        });
    }

    // Fit bounds
    const bounds = L.latLngBounds([]);
    if (pickupCoords) bounds.extend([pickupCoords.lat, pickupCoords.lng]);
    if (dropCoords) bounds.extend([dropCoords.lat, dropCoords.lng]);
    if (bounds.isValid() && !showRoute) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (pickupCoords && !dropCoords) {
      map.setView([pickupCoords.lat, pickupCoords.lng], 14);
    } else if (!pickupCoords && dropCoords) {
      map.setView([dropCoords.lat, dropCoords.lng], 14);
    }
  }, [pickupCoords, dropCoords, showRoute, mapReady]);

  // Update driver marker
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (driverMarkerRef.current) { driverMarkerRef.current.remove(); driverMarkerRef.current = null; }

    if (driverCoords) {
      driverMarkerRef.current = L.marker([driverCoords.lat, driverCoords.lng], { icon: driverIcon }).addTo(mapRef.current);
    }
  }, [driverCoords, mapReady]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-[1000]"
        style={{ background: 'linear-gradient(transparent, var(--surface))' }} />

      {/* Empty state */}
      {!pickupCoords && !dropCoords && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3">
            <p className="text-[var(--text-muted)] text-sm font-medium">
              Enter locations to see route
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
