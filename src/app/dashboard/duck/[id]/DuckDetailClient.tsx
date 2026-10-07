'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import dynamic from 'next/dynamic';
import type { Duck, Sighting } from '@/lib/db';

const DuckMap = dynamic(() => import('@/components/DuckMap'), { ssr: false });

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://quackertracks.com';

interface Props {
  duck: Duck;
  initialSightings: Sighting[];
}

export default function DuckDetailClient({ duck, initialSightings }: Props) {
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);
  const duckUrl = `${APP_URL}/duck/${duck.slug}`;

  function downloadQR() {
    const qrCanvas = qrWrapperRef.current?.querySelector('canvas');
    if (!qrCanvas) return;

    const scale = Math.max(1, Math.ceil(600 / qrCanvas.width));
    const outW = qrCanvas.width * scale;
    const outH = qrCanvas.height * scale;

    const lines = ['Track', 'this', 'duck!'];
    const gapAboveText = Math.round(outW * 0.03);
    const paddingBelow = Math.round(outW * 0.03);

    // Largest font where the widest word still fits the QR width
    const sidePad = Math.round(outW * 0.02);
    const maxTextW = outW - sidePad * 2;
    const widest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
    let fontSize = 10;
    for (let size = 10; size <= outW; size += 2) {
      const testCtx = document.createElement('canvas').getContext('2d')!;
      testCtx.font = `bold ${size}px sans-serif`;
      if (testCtx.measureText(widest).width > maxTextW) break;
      fontSize = size;
    }

    const lineH = Math.round(fontSize * 1.15);
    const textAreaHeight = lines.length * lineH + gapAboveText + paddingBelow;

    const composite = document.createElement('canvas');
    composite.width = outW;
    composite.height = outH + textAreaHeight;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, composite.width, composite.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrCanvas, 0, 0, outW, outH);

    ctx.fillStyle = '#000000';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, outW / 2, outH + gapAboveText + i * lineH);
    });

    const a = document.createElement('a');
    a.href = composite.toDataURL('image/png');
    a.download = `duck-${duck.slug}.png`;
    a.click();
  }

  const sightingsWithCoords = initialSightings.filter(
    s => s.lat !== null && s.lng !== null
  );

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            🦆 {duck.name}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Duck info */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Duck Info</h2>
            <p className="text-sm text-gray-500 font-mono mb-1">{duck.slug}</p>
            {duck.notes && <p className="text-sm text-gray-600 mb-3">{duck.notes}</p>}
            <p className="text-xs text-gray-400">
              Created {new Date(duck.created_at).toLocaleDateString()}
            </p>
            <p className="text-lg font-bold text-gray-800 mt-3">
              {initialSightings.length} sighting{initialSightings.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* QR code */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
            <h2 className="font-semibold text-gray-700 mb-3">QR Code</h2>
            <div ref={qrWrapperRef}>
              <QRCodeCanvas
                value={duckUrl}
                size={140}
                includeMargin
              />
            </div>
            <button
              onClick={downloadQR}
              className="mt-3 text-sm bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Download PNG
            </button>
          </div>

          {/* Duck URL */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-2">Public URL</h2>
            <p className="text-xs text-gray-500 break-all font-mono bg-gray-50 p-2 rounded">
              {duckUrl}
            </p>
            <a
              href={duckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-yellow-600 hover:text-yellow-800"
            >
              Open public page →
            </a>
          </div>
        </div>

        {/* Map */}
        {sightingsWithCoords.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mb-8">
            <h2 className="font-semibold text-gray-700 mb-3">Travel Map</h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <DuckMap sightings={sightingsWithCoords} />
            </div>
          </div>
        )}

        {/* Sightings list */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Sighting History</h2>

          {initialSightings.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No sightings yet. Place the duck and share its QR code!
            </p>
          ) : (
            <div className="space-y-4">
              {initialSightings.map((s, i) => (
                <div key={s.id} className="border-l-4 border-yellow-400 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {s.finder_name || 'Anonymous finder'}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{initialSightings.length - i} · {new Date(s.found_at).toLocaleString()}
                    </span>
                  </div>
                  {s.location_label && (
                    <p className="text-sm text-gray-600 mt-0.5">📍 {s.location_label}</p>
                  )}
                  {s.lat && s.lng && (
                    <p className="text-xs text-gray-400 font-mono">
                      {s.lat.toFixed(5)}, {s.lng.toFixed(5)}
                    </p>
                  )}
                  {s.message && (
                    <p className="text-sm text-gray-700 mt-1 italic">"{s.message}"</p>
                  )}
                  {s.email && (
                    <p className="text-xs text-gray-400 mt-0.5">✉ {s.email}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
