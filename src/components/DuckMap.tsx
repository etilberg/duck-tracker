'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { Sighting } from '@/lib/db';
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

interface Props {
  sightings: Sighting[];
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

export default function DuckMap({ sightings }: Props) {
  // Sort chronologically for the route polyline
  const sorted = [...sightings]
    .filter(s => s.lat !== null && s.lng !== null)
    .sort((a, b) => new Date(a.found_at).getTime() - new Date(b.found_at).getTime());

  const positions = sorted.map(s => [s.lat!, s.lng!] as [number, number]);
  const center = positions[0] ?? [39.8283, -98.5795];

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={positions} />
      {positions.length > 1 && (
        <Polyline positions={positions} color="#f59e0b" weight={2} dashArray="5,5" />
      )}
      {sorted.map((s, i) => (
        <Marker key={s.id} position={[s.lat!, s.lng!]}>
          <Popup>
            <div className="text-sm">
              <strong>#{i + 1}</strong>{' '}
              {s.finder_name || 'Anonymous'}
              <br />
              {s.location_label && <span>📍 {s.location_label}<br /></span>}
              {new Date(s.found_at).toLocaleDateString()}
              {s.message && <><br /><em>"{s.message}"</em></>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
