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

    // Send email notifications in the background (fire and forget)
    const emailsPromise = getPreviousFinderEmailsWithIds(duck.id, sighting.id)
      .then(finders => notifyPreviousFinders(finders, duck, sighting))
      .catch(err => console.error('Email notification error:', err));

    // Use waitUntil if available (Cloudflare edge)
    try {
      const ctx = (globalThis as unknown as { __cf_ctx?: { waitUntil: (p: Promise<unknown>) => void } }).__cf_ctx;
      ctx?.waitUntil(emailsPromise);
    } catch { /* best-effort */ }

    return NextResponse.json({ sighting }, { status: 201 });
  } catch (err) {
    console.error('POST /api/sightings error:', err);
    return NextResponse.json({ error: 'Failed to log sighting' }, { status: 500 });
  }
}
