export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = getDB();
    const [ducks, sightings, locations] = await Promise.all([
      db.prepare('SELECT COUNT(*) as count FROM ducks').first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) as count FROM sightings').first<{ count: number }>(),
      db.prepare(
        "SELECT COUNT(DISTINCT location_label) as count FROM sightings WHERE location_label IS NOT NULL AND location_label != ''"
      ).first<{ count: number }>(),
    ]);
    return NextResponse.json({
      ducks: ducks?.count ?? 0,
      sightings: sightings?.count ?? 0,
      locations: locations?.count ?? 0,
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
