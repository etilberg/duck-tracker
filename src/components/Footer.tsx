import Link from 'next/link';

const AMAZON_TAG = 'et0df-20';

const DUCK_PRODUCTS = [
  {
    asin: 'B0DG4M8ZBQ',
    label: '20pc Jeep Duck + Mini Car Set',
  },
  {
    asin: 'B0CPT86SSN',
    label: '"You\'ve Been Ducked" Car Magnets (4-pack)',
  },
  {
    asin: 'B09LTZGPSS',
    label: '50-Pack Assorted Jeep Ducking Ducks',
  },
  {
    asin: 'B0DY7QK515',
    label: 'Paracord Duck Holder (holds 36 ducks!)',
  },
  {
    asin: 'B07WRN5QXS',
    label: 'Chunky Chocolate Cookies (the only cookies here) 🍪',
  },
  {
    asin: 'B000067SXG',
    label: 'DYMO ½″×1″ Labels — perfect for duck QR codes',
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Support the Site
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Enjoy QuackerTracks? Help keep the ducks swimming!
            </p>
            <a
              href="https://ko-fi.com/quackertracks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🦆 Buy me a duck!
            </a>
          </div>

          {/* Amazon */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              Stock Up on Ducks
            </h3>
            <ul className="space-y-2">
              {DUCK_PRODUCTS.map((p) => (
                <li key={p.asin}>
                  <a
                    href={`https://www.amazon.com/dp/${p.asin}/?tag=${AMAZON_TAG}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 hover:text-yellow-400 transition-colors flex items-start gap-2"
                  >
                    <span className="mt-0.5 shrink-0">🛒</span>
                    <span>{p.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Nav */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
              QuackerTracks
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse" className="text-gray-400 hover:text-yellow-400 transition-colors">
                  Browse Duck Sightings
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>© {year} QuackerTracks · All rights reserved.</p>
          <p>As an Amazon Associate, we earn from qualifying purchases.</p>
        </div>
      </div>
    </footer>
  );
}
