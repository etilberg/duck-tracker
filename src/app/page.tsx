'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  ducks: number;
  sightings: number;
  locations: number;
}

function StatCard({ emoji, value, label }: { emoji: string; value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl">{emoji}</span>
      <span className="text-4xl font-bold text-gray-900">
        {value === null ? '…' : value.toLocaleString()}
      </span>
      <span className="text-sm text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    emoji: '🛒',
    title: 'Get a duck',
    body: 'Grab a bag of rubber ducks and register each one on QuackerTracks. You\'ll get a unique QR code to stick on or attach to your duck.',
  },
  {
    emoji: '🚙',
    title: 'Go ducking',
    body: 'Sneak your duck onto someone else\'s Jeep — hood, mirror, door handle, anywhere. This is the whole game. There are no other rules.',
  },
  {
    emoji: '📱',
    title: 'They find it',
    body: 'Your victim — er, recipient — finds the duck, scans the QR code, and logs where they found it. They can leave a message too.',
  },
  {
    emoji: '🗺️',
    title: 'Watch it travel',
    body: 'Each sighting shows up on the map. Watch your duck hopscotch across town, across the country, or across the world.',
  },
];

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json() as Promise<Stats>)
      .then(setStats)
      .catch(() => {/* silently fail — stats are a bonus */});
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50">

      {/* Nav */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦆</span>
            <span className="text-xl font-bold text-gray-800">QuackerTracks</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/browse"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse Map
            </Link>
            <Link
              href="/dashboard"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              My Ducks
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="text-7xl mb-6">🦆</div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Your Jeep left a duck<br className="hidden sm:block" /> somewhere.
          <br />
          <span className="text-yellow-500">Now it can be famous.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-3 max-w-2xl mx-auto">
          QuackerTracks is a free duck-tracking platform for the Jeep community.
          Register your rubber ducks, get QR codes, and watch them travel the world one Jeep at a time.
        </p>
        <p className="text-base text-gray-400 mb-10 italic">
          We track ducks. Not you. No cookies, no accounts required to browse, no funny business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/browse"
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-yellow-400 hover:bg-yellow-50 text-gray-800 font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-sm"
          >
            🗺️ Browse the Map
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-sm"
          >
            🦆 Register Your Duck
          </Link>
        </div>
      </section>

      {/* Live Stats */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            <StatCard emoji="🦆" value={stats?.ducks ?? null} label="Ducks Registered" />
            <StatCard emoji="📍" value={stats?.sightings ?? null} label="Sightings Logged" />
            <StatCard emoji="🗺️" value={stats?.locations ?? null} label="Unique Locations" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
              <span className="text-4xl">{step.emoji}</span>
              <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy callout */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-3">Certified Duck-Only Tracking™</h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-6">
            No login required to browse. No cookies stored on your device. No ad trackers lurking in the shadows.
            No user data collected — ever. We wrote this whole app just to track tiny rubber animals, and we are
            completely at peace with that decision.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-6">
            {['👤 No accounts to browse', '📊 No ad trackers', '🕵️ No funny business'].map(item => (
              <span key={item} className="bg-gray-800 px-4 py-2 rounded-full">{item}</span>
            ))}
          </div>
          <p className="text-gray-400 text-sm italic">
            🍪 The only cookies around here are{' '}
            <a
              href="https://www.amazon.com/dp/B0F2PD6K5X/?tag=et0df-20"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2"
            >
              these ones from Amazon
            </a>
            .
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-5xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to duck someone?</h2>
        <p className="text-gray-500 mb-8">Sign in with GitHub to register your ducks and get your QR codes. It takes about 30 seconds.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-10 py-4 rounded-xl text-lg transition-colors shadow-sm"
        >
          🦆 Get Started — It&apos;s Free
        </Link>
      </section>

    </div>
  );
}
