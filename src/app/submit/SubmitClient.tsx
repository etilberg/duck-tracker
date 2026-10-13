'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import type { Duck } from '@/lib/db';

const APP_URL = typeof window !== 'undefined' ? window.location.origin : 'https://quackertracks.com';

export default function SubmitClient() {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [originatorName, setOriginatorName] = useState('');
  const [originatorLocation, setOriginatorLocation] = useState('');
  const [originatorEmail, setOriginatorEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdDuck, setCreatedDuck] = useState<Duck | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/ducks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          notes: notes.trim() || undefined,
          originator_name: originatorName.trim() || undefined,
          originator_location: originatorLocation.trim() || undefined,
          originator_email: originatorEmail.trim() || undefined,
        }),
      });
      const data = await res.json() as { duck?: Duck; error?: string };
      if (!res.ok || !data.duck) throw new Error(data.error || 'Failed to create duck');
      setCreatedDuck(data.duck);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  function downloadQR(duckName: string) {
    const qrCanvas = document.querySelector<HTMLCanvasElement>('#qr-canvas canvas');
    if (!qrCanvas) return;

    const scale = Math.max(1, Math.ceil(600 / qrCanvas.width));
    const outW = qrCanvas.width * scale;
    const outH = qrCanvas.height * scale;

    // Measure fonts for name (top) and tagline (bottom)
    const sidePad = Math.round(outW * 0.04);
    const maxTextW = outW - sidePad * 2;

    const testCtx = document.createElement('canvas').getContext('2d')!;

    // Duck name — as large as fits
    let nameFontSize = 10;
    for (let size = 10; size <= outW; size += 2) {
      testCtx.font = `bold ${size}px sans-serif`;
      if (testCtx.measureText(duckName).width > maxTextW) break;
      nameFontSize = size;
    }

    // "Track this duck!" tagline — auto-sized to fit, same logic as name
    let tagFontSize = 10;
    for (let size = 10; size <= outW; size += 2) {
      testCtx.font = `${size}px sans-serif`;
      if (testCtx.measureText('Track this duck!').width > maxTextW) break;
      tagFontSize = size;
    }

    const nameH = Math.round(nameFontSize * 1.3);
    const tagH = Math.round(tagFontSize * 1.3);
    const gap = Math.round(outW * 0.03);

    const composite = document.createElement('canvas');
    composite.width = outW;
    composite.height = nameH + gap + outH + gap + tagH;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, composite.width, composite.height);
    ctx.imageSmoothingEnabled = false;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Duck name at top
    ctx.fillStyle = '#111111';
    ctx.font = `bold ${nameFontSize}px sans-serif`;
    ctx.fillText(duckName, outW / 2, 0);

    // QR code
    ctx.drawImage(qrCanvas, 0, nameH + gap, outW, outH);

    // "Track this duck!" tagline at bottom
    ctx.fillStyle = '#555555';
    ctx.font = `${tagFontSize}px sans-serif`;
    ctx.fillText('Track this duck!', outW / 2, nameH + gap + outH + gap);

    const a = document.createElement('a');
    a.href = composite.toDataURL('image/png');
    a.download = `${duckName.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    a.click();
  }

  if (createdDuck) {
    const duckUrl = `${APP_URL}/duck/${createdDuck.slug}`;
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-3">🦆</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Duck created!</h2>
          <p className="text-gray-500 mb-6">
            <span className="font-semibold text-gray-700">{createdDuck.name}</span> is now live.
            Print this QR code and attach it to your duck!
          </p>

          <div id="qr-canvas" className="flex flex-col items-center gap-2 mb-4">
            <QRCodeCanvas value={duckUrl} size={200} includeMargin />
            <p className="text-xs text-yellow-700 font-semibold tracking-wide uppercase">
              🦆 Track this duck! Scan to log a sighting
            </p>
          </div>

          <button
            onClick={() => downloadQR(createdDuck.name)}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-2 rounded-lg transition-colors mb-4 text-sm"
          >
            ⬇️ Download QR Code (PNG)
          </button>

          <p className="text-xs text-gray-400 mb-2 italic">
            💡 Print on a{' '}
            <a
              href="https://www.amazon.com/dp/B000067SXG/?tag=et0df-20"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-600 hover:text-yellow-800 underline underline-offset-2"
            >
              DYMO ½″ × 1″ label
            </a>
            {' '}and stick it right on the duck.
          </p>

          <p className="text-xs text-gray-400 break-all font-mono bg-gray-50 p-2 rounded mb-4">
            {duckUrl}
          </p>

          {originatorEmail && (
            <p className="text-xs text-gray-400 mb-4">
              ✉️ We'll email you at <span className="font-medium">{originatorEmail}</span> each time it's found.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <a
              href={duckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-lg transition-colors text-sm"
            >
              View duck page
            </a>
            <button
              onClick={() => {
                setCreatedDuck(null);
                setName('');
                setNotes('');
                setOriginatorName('');
                setOriginatorLocation('');
                setOriginatorEmail('');
              }}
              className="text-sm text-gray-400 hover:text-gray-700 transition-colors py-1"
            >
              Submit another duck
            </button>
          </div>
        </div>

        <Link href="/browse" className="mt-6 text-sm text-yellow-600 hover:text-yellow-800">
          ← Browse all duck sightings
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🦆</div>
          <h1 className="text-2xl font-bold text-gray-800">Submit a Duck</h1>
          <p className="text-gray-500 text-sm mt-1">
            Give your rubber duck a name and set it free into the world!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Duck info */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">About the Duck</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Duck name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Quackers, Sir Duckington…"
                maxLength={80}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Duck's story <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Where did this duck come from? Any fun facts?"
                maxLength={500}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
            </div>
          </div>

          {/* Originator info */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">About You <span className="font-normal normal-case">(all optional)</span></h2>
            <input
              type="text"
              value={originatorName}
              onChange={e => setOriginatorName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="text"
              value={originatorLocation}
              onChange={e => setOriginatorLocation(e.target.value)}
              placeholder="Where are you releasing it? (city, event…)"
              maxLength={200}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <div>
              <input
                type="email"
                value={originatorEmail}
                onChange={e => setOriginatorEmail(e.target.value)}
                placeholder="Email for sighting updates"
                maxLength={200}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                ✉️ Get notified each time your duck is spotted. No spam ever — every email has an unsubscribe link.
              </p>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? 'Creating duck…' : 'Create Duck & Get QR Code'}
          </button>
        </form>
      </div>

      <div className="mt-6 flex gap-4 text-sm text-gray-400">
        <Link href="/browse" className="hover:text-yellow-700">Browse sightings</Link>
        <span>·</span>
        <Link href="/dashboard" className="hover:text-yellow-700">Admin</Link>
      </div>
    </div>
  );
}
