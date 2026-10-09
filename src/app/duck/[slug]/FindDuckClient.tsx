'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { Duck, Sighting } from '@/lib/db';

const DuckMap = dynamic(() => import('@/components/DuckMap'), { ssr: false });

interface Props {
  duck: Duck;
  initialSightings: Sighting[];
}

type Step = 'history' | 'found' | 'locating' | 'form' | 'done';

export default function FindDuckClient({ duck, initialSightings }: Props) {
  const [step, setStep] = useState<Step>('history');
  const [sightings, setSightings] = useState<Sighting[]>(initialSightings);
  const [finderName, setFinderName] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function tryGetLocation() {
    setStep('locating');
    setLocating(true);

    if (!navigator.geolocation) {
      setLocating(false);
      setStep('form');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
        setStep('form');
      },
      () => {
        setLocating(false);
        setStep('form');
      },
      { timeout: 10000 }
    );
  }

  async function submitSighting() {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/sightings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: duck.slug,
          lat,
          lng,
          location_label: locationLabel || null,
          finder_name: finderName || null,
          message: message || null,
          email: email || null,
        }),
      });

      const data = await res.json() as { sighting?: Sighting; error?: string };
      if (!res.ok || !data.sighting) throw new Error(data.error || 'Failed to log sighting');

      setSightings(prev => [data.sighting!, ...prev]);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const sightingsWithCoords = sightings.filter(s => s.lat !== null && s.lng !== null);

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <div className="text-4xl mb-1">🦆</div>
          <h1 className="text-2xl font-bold text-gray-800">{duck.name}</h1>
          <p className="text-gray-500 text-sm">A travelling Jeep duck</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 flex-1">
        {/* Map */}
        {sightingsWithCoords.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="font-semibold text-gray-700 mb-3">
              Travel History ({sightings.length} sighting{sightings.length !== 1 ? 's' : ''})
            </h2>
            <div className="h-56 rounded-lg overflow-hidden">
              <DuckMap sightings={sightingsWithCoords} />
            </div>
          </div>
        )}

        {/* Found it button / flow */}
        {step === 'history' && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-600 mb-2">
              {sightings.length === 0
                ? 'This duck is just starting its journey!'
                : `This duck has been found ${sightings.length} time${sightings.length !== 1 ? 's' : ''}!`}
            </p>
            {duck.notes && <p className="text-sm text-gray-500 italic mb-4">"{duck.notes}"</p>}
            <button
              onClick={() => setStep('found')}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold text-lg px-8 py-3 rounded-xl transition-colors shadow"
            >
              🦆 I Found It!
            </button>
          </div>
        )}

        {step === 'found' && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">You found {duck.name}!</h2>
            <p className="text-gray-600 mb-2">
              Want to share your location? It helps track this duck's journey across the map.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              📍 Location is only used to pin the duck on the map — we're not tracking you, we promise.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={tryGetLocation}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                📍 Share My Location
              </button>
              <button
                onClick={() => setStep('form')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Skip Location
              </button>
            </div>
          </div>
        )}

        {step === 'locating' && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-4xl mb-3 animate-bounce">📍</div>
            <p className="text-gray-600">Getting your location…</p>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Leave a note (all optional)</h2>

            {lat && lng && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-2 rounded-lg mb-4">
                ✓ Location captured ({lat.toFixed(4)}, {lng.toFixed(4)})
              </div>
            )}

            <div className="space-y-4">
              <input
                type="text"
                value={locationLabel}
                onChange={e => setLocationLabel(e.target.value)}
                placeholder="Where did you find it? (city, landmark…)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <input
                type="text"
                value={finderName}
                onChange={e => setFinderName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Leave a message (optional)"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email for future updates (optional)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  ✉️ We'll ping you next time this duck gets spotted. No spam, no newsletters, no shenanigans —
                  just duck updates. Every email includes an unsubscribe link.
                </p>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <button
              onClick={submitSighting}
              disabled={submitting}
              className="mt-5 w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-bold py-3 rounded-xl transition-colors"
            >
              {submitting ? 'Saving…' : '🦆 Log This Find!'}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-5xl mb-3">🦆✨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thanks for the update!</h2>
            <p className="text-gray-600 mb-1">
              {duck.name} has now been found {sightings.length} time{sightings.length !== 1 ? 's' : ''}.
            </p>
            {email && (
              <p className="text-sm text-gray-500 mt-2">
                We'll email {email} next time this duck turns up.
                Every message has an unsubscribe link — no hard feelings if you bail. 🤝
              </p>
            )}
            <button
              onClick={() => setStep('history')}
              className="mt-6 text-yellow-600 hover:text-yellow-800 text-sm underline"
            >
              See full history
            </button>
          </div>
        )}

        {/* Sightings list */}
        {sightings.length > 0 && step !== 'form' && step !== 'locating' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Sighting Log</h2>
            <div className="space-y-4">
              {sightings.map((s, i) => (
                <div key={s.id} className="border-l-4 border-yellow-400 pl-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {s.finder_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{sightings.length - i} · {new Date(s.found_at).toLocaleDateString('en-US', { timeZone: 'America/Chicago' })}
                    </span>
                  </div>
                  {s.location_label && (
                    <p className="text-sm text-gray-600 mt-0.5">📍 {s.location_label}</p>
                  )}
                  {s.message && (
                    <p className="text-sm text-gray-700 mt-1 italic">"{s.message}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer links */}
      <footer className="max-w-2xl mx-auto w-full px-4 py-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Have a duck of your own?</p>
        <div className="flex justify-center gap-4 text-sm">
          <Link
            href="/browse"
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            🗺️ Browse all sightings
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/submit"
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            🦆 Submit your own duck
          </Link>
        </div>
      </footer>
    </div>
  );
}
