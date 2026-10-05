'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import type { Duck } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://duck-tracker.pages.dev';

interface Props {
  initialDucks: Duck[];
}

export default function DashboardClient({ initialDucks }: Props) {
  const [ducks, setDucks] = useState<Duck[]>(initialDucks);
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const qrWrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});

  async function createDuck() {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/ducks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), notes: newNotes.trim() || undefined }),
      });
      const data = await res.json() as { duck?: Duck; error?: string };
      if (!res.ok || !data.duck) throw new Error(data.error || 'Failed to create duck');
      setDucks(prev => [data.duck!, ...prev]);
      setNewName('');
      setNewNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  async function deleteDuck(id: string) {
    if (!confirm('Delete this duck and all its sightings?')) return;
    try {
      const res = await fetch(`/api/ducks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDucks(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to delete duck');
    }
  }

  function downloadQR(duck: Duck) {
    const wrapper = qrWrapperRefs.current[duck.id];
    const canvas = wrapper?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `duck-${duck.slug}.png`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🦆</span>
            <h1 className="text-xl font-bold text-gray-800">Duck Tracker Dashboard</h1>
          </div>
          <a
            href="/api/auth/logout"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Create duck form */}
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add a New Duck</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Duck name (e.g., Quackers)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onKeyDown={e => e.key === 'Enter' && createDuck()}
            />
            <input
              type="text"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Notes (optional)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onKeyDown={e => e.key === 'Enter' && createDuck()}
            />
            <button
              onClick={createDuck}
              disabled={creating || !newName.trim()}
              className="bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-medium px-6 py-2 rounded-lg transition-colors"
            >
              {creating ? 'Creating…' : 'Add Duck'}
            </button>
          </div>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </section>

        {/* Duck list */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Your Ducks ({ducks.length})
          </h2>

          {ducks.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
              <div className="text-5xl mb-4">🦆</div>
              <p>No ducks yet. Add one above to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ducks.map(duck => {
                const duckUrl = `${APP_URL}/duck/${duck.slug}`;
                return (
                  <div key={duck.id} className="bg-white rounded-xl shadow p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{duck.name}</h3>
                        {duck.notes && (
                          <p className="text-sm text-gray-500 mt-0.5">{duck.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 font-mono">{duck.slug}</p>
                      </div>
                      <button
                        onClick={() => deleteDuck(duck.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                        title="Delete duck"
                      >
                        ×
                      </button>
                    </div>

                    {/* QR canvas for download */}
                    <div
                      ref={el => { qrWrapperRefs.current[duck.id] = el; }}
                      className="flex justify-center mb-3"
                    >
                      <QRCodeCanvas
                        value={duckUrl}
                        size={160}
                        includeMargin
                      />
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/duck/${duck.id}`}
                        className="flex-1 text-center bg-yellow-50 hover:bg-yellow-100 text-yellow-800 text-sm font-medium py-1.5 rounded-lg transition-colors"
                      >
                        View History
                      </Link>
                      <button
                        onClick={() => downloadQR(duck)}
                        className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-1.5 rounded-lg transition-colors"
                      >
                        Download QR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
