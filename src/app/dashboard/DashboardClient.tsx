'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { DUCK_IMAGE_SETTINGS } from '@/lib/duck-qr';
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

  // Edit modal state
  const [editingDuck, setEditingDuck] = useState<Duck | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

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
    } catch {
      alert('Failed to delete duck');
    }
  }

  function openEdit(duck: Duck) {
    setEditingDuck(duck);
    setEditName(duck.name);
    setEditNotes(duck.notes ?? '');
    setEditError('');
  }

  function closeEdit() {
    setEditingDuck(null);
    setEditError('');
  }

  async function saveEdit() {
    if (!editingDuck || !editName.trim()) return;
    setSaving(true);
    setEditError('');
    try {
      const res = await fetch(`/api/ducks/${editingDuck.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim(), notes: editNotes.trim() || null }),
      });
      const data = await res.json() as { duck?: Duck; error?: string };
      if (!res.ok || !data.duck) throw new Error(data.error || 'Failed to save');
      setDucks(prev => prev.map(d => d.id === data.duck!.id ? data.duck! : d));
      closeEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  function downloadQR(duck: Duck) {
    const wrapper = qrWrapperRefs.current[duck.id];
    const qrCanvas = wrapper?.querySelector('canvas');
    if (!qrCanvas) return;

    const lineHeight = 15;
    const textLines = ['🦆 Track this duck!', 'Scan to log a sighting'];
    const gapAboveText = 6;
    const paddingBelow = 8;
    const textAreaHeight = textLines.length * lineHeight + gapAboveText + paddingBelow;

    const composite = document.createElement('canvas');
    composite.width = qrCanvas.width;
    composite.height = qrCanvas.height + textAreaHeight;

    const ctx = composite.getContext('2d');
    if (!ctx) return;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, composite.width, composite.height);

    // QR code flush to top
    ctx.drawImage(qrCanvas, 0, 0);

    // Two-line callout text, centered within QR width
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const textX = composite.width / 2;
    textLines.forEach((line, i) => {
      ctx.fillText(line, textX, qrCanvas.height + gapAboveText + i * lineHeight);
    });

    const a = document.createElement('a');
    a.href = composite.toDataURL('image/png');
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
          <div className="flex items-center gap-4">
            <Link
              href="/browse"
              className="text-sm text-yellow-600 hover:text-yellow-800 transition-colors"
            >
              Browse map
            </Link>
            <a
              href="/api/auth/logout"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Sign out
            </a>
          </div>
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
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">{duck.name}</h3>
                        {duck.notes && (
                          <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{duck.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 font-mono">{duck.slug}</p>
                      </div>
                      <div className="flex gap-1 ml-2 shrink-0">
                        <button
                          onClick={() => openEdit(duck)}
                          className="text-gray-300 hover:text-blue-500 transition-colors text-sm px-1"
                          title="Edit duck"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteDuck(duck.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                          title="Delete duck"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* QR code with callout text */}
                    <div
                      ref={el => { qrWrapperRefs.current[duck.id] = el; }}
                      className="flex flex-col items-center mb-3"
                    >
                      <QRCodeCanvas
                        value={duckUrl}
                        size={160}
                        includeMargin
                        imageSettings={DUCK_IMAGE_SETTINGS}
                      />
                      <p className="text-xs text-yellow-700 font-semibold tracking-wide text-center mt-1">
                        🦆 Track this duck! Scan to log a sighting
                      </p>
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

      {/* Edit modal */}
      {editingDuck && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={e => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Duck</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  maxLength={80}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                />
              </div>
              {editError && <p className="text-red-600 text-sm">{editError}</p>}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={closeEdit}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={saving || !editName.trim()}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 text-gray-900 font-medium py-2 rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
