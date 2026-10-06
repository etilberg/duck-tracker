export const runtime = 'edge';

import Link from 'next/link';

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="text-5xl mb-3">✌️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">You're unsubscribed</h1>
        <p className="text-gray-500 text-sm mb-6">
          No more duck updates for you — we won't hold it against the duck. 🦆
        </p>
        <Link
          href="/browse"
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium px-6 py-2.5 rounded-lg transition-colors inline-block"
        >
          Browse duck sightings anyway
        </Link>
      </div>
    </div>
  );
}
