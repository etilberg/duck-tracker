'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { DUCK_IMAGE_SETTINGS } from '@/lib/duck-qr';
import type { Duck } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://duck-tracker.pages.dev';

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

          <div className="flex flex-col items-center gap-2 mb-6">
            <QRCodeCanvas value={duckUrl} size={200} includeMargin imageSettings={DUCK_IMAGE_SETTINGS} />
            <p className="text-xs text-yellow-700 font-semibold tracking-wide uppercase">
              🦆 Track this duck! Scan to log a sighting
            </p>
          </div>

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
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 rounded-lg transition-colors"
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
