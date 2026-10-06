'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { SightingWithDuck } from '@/lib/db';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's broken default icon URLs in webpack/Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://duck-tracker.pages.dev';

interface Props {
  sightings: SightingWithDuck[];
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 10);
    } else {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [map, positions]);
  return null;
}

export default function BrowseMap({ sightings }: Props) {
  const positions = sightings.map(s => [s.lat!, s.lng!] as [number, number]);
  const center = positions[0] ?? [39.8283, -98.5795];

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
      {sightings.map(s => (
        <Marker key={s.id} position={[s.lat!, s.lng!]}>
          <Popup>
            <div className="text-sm min-w-[160px]">
              <a
                href={`${APP_URL}/duck/${s.duck_slug}`}
                className="font-semibold text-yellow-700 hover:text-yellow-900"
              >
                🦆 {s.duck_name}
              </a>
              <br />
              {s.location_label && (
                <span>📍 {s.location_label}<br /></span>
              )}
              <span className="text-gray-500">
                Spotted by {s.finder_name || 'Anonymous'}
              </span>
              <br />
              <span className="text-gray-400 text-xs">
                {new Date(s.found_at).toLocaleDateString()}
              </span>
              {s.message && (
                <><br /><em className="text-gray-600">"{s.message}"</em></>
              )}
              <br />
              <a
                href={`${APP_URL}/duck/${s.duck_slug}`}
                className="text-xs text-yellow-600 hover:underline mt-1 inline-block"
              >
                View duck's full history →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
