'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';

export interface PlaceResult {
  address: string;
  lat: number;
  lng: number;
  placeId: string;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (place: PlaceResult) => void;
  placeholder: string;
  type: 'pickup' | 'drop';
  onFocus?: () => void;
  onBlur?: () => void;
}

export default function PlacesAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  type,
}: PlacesAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Nominatim search with debounce
  const searchPlaces = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleInputChange = (val: string) => {
    onChange(val);
    searchPlaces(val);
  };

  const handleSelect = (s: Suggestion) => {
    const shortName = s.display_name.split(',').slice(0, 3).join(', ');
    onChange(shortName);
    onSelect({
      address: shortName,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon),
      placeId: String(s.place_id),
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
        className="input-field text-[14px] pr-8 pl-9"
        autoComplete="off"
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {type === 'pickup' ? (
          <Navigation className="w-3.5 h-3.5 text-accent-green" />
        ) : (
          <MapPin className="w-3.5 h-3.5 text-red-400" />
        )}
      </div>
      {value && (
        <button
          onClick={() => { onChange(''); setSuggestions([]); setShowSuggestions(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-xl z-[2000]"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          {loading && (
            <div className="px-3 py-2 text-xs text-[var(--text-muted)]">Searching...</div>
          )}
          {suggestions.map((s) => {
            const parts = s.display_name.split(',');
            const main = parts.slice(0, 2).join(',');
            const sub = parts.slice(2, 4).join(',');
            return (
              <button
                key={s.place_id}
                onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-3)]"
              >
                <MapPin className="w-4 h-4 text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{main}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
