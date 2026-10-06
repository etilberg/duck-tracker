'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import type { SightingWithDuck } from '@/lib/db';

const BrowseMap = dynamic(() => import('@/components/BrowseMap'), { ssr: false });

export default function BrowseClient() {
  const [sightings, setSightings] = useState<SightingWithDuck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/browse')
      .then(r => r.json() as Promise<{ sightings?: SightingWithDuck[]; error?: string }>)
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSightings(data.sightings ?? []);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦆</span>
            <h1 className="text-xl font-bold text-gray-800">Duck Sightings Map</h1>
          </div>
          <Link
            href="/submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            + Submit a Duck
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center h-96 text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-3">🦆</div>
              <p>Loading sightings…</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && sightings.length === 0 && (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-lg">No sightings with locations yet.</p>
            <p className="mt-2 text-sm">Be the first to spot a duck!</p>
          </div>
        )}

        {!loading && !error && sightings.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
              <div className="h-[500px]">
                <BrowseMap sightings={sightings} />
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              {sightings.length} sighting{sightings.length !== 1 ? 's' : ''} across{' '}
              {new Set(sightings.map(s => s.duck_id)).size} duck{new Set(sightings.map(s => s.duck_id)).size !== 1 ? 's' : ''} — click any pin for details
            </p>
          </>
        )}
      </main>
    </div>
  );
}
