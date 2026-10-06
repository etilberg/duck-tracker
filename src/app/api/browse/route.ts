export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getAllSightingsWithDuck } from '@/lib/db';

export async function GET() {
  try {
    const sightings = await getAllSightingsWithDuck();
    return NextResponse.json({ sightings });
  } catch (err) {
    console.error('GET /api/browse error:', err);
    return NextResponse.json({ error: 'Failed to fetch sightings' }, { status: 500 });
  }
}
