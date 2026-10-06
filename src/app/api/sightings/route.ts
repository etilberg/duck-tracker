export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getDuckBySlug, createSighting, getPreviousFinderEmailsWithIds } from '@/lib/db';
import { notifyPreviousFinders } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      slug: string;
      lat?: number | null;
      lng?: number | null;
      location_label?: string | null;
      finder_name?: string | null;
      message?: string | null;
      email?: string | null;
    };

    if (!body.slug) {
      return NextResponse.json({ error: 'Duck slug is required' }, { status: 400 });
    }

    const duck = await getDuckBySlug(body.slug);
    if (!duck) {
      return NextResponse.json({ error: 'Duck not found' }, { status: 404 });
    }

    const sighting = await createSighting({
      duck_id: duck.id,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      location_label: body.location_label ?? null,
      finder_name: body.finder_name ?? null,
      message: body.message ?? null,
      email: body.email ?? null,
    });

    // Send email notifications — await so they can't be cut off before the worker exits
    try {
      const finders = await getPreviousFinderEmailsWithIds(duck.id, sighting.id);
      await notifyPreviousFinders(finders, duck, sighting);
    } catch (err) {
      console.error('Email notification error:', err);
    }

    return NextResponse.json({ sighting }, { status: 201 });
  } catch (err) {
    console.error('POST /api/sightings error:', err);
    return NextResponse.json({ error: 'Failed to log sighting' }, { status: 500 });
  }
}
