export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createDuck, createSighting } from '@/lib/db';
import { generateSlug } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      name?: string;
      notes?: string;
      originator_name?: string;
      originator_location?: string;
      originator_email?: string;
    };

    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Duck name is required' }, { status: 400 });
    }

    const name = body.name.trim().slice(0, 80);
    const notes = body.notes?.trim().slice(0, 500) || undefined;
    const originatorName = body.originator_name?.trim().slice(0, 80) || null;
    const originatorLocation = body.originator_location?.trim().slice(0, 200) || null;
    const originatorEmail = body.originator_email?.trim().slice(0, 200) || null;

    const slug = generateSlug();
    const duck = await createDuck(slug, name, notes);

    // If the submitter left any info, create an origin sighting so their
    // details appear in the travel history and they get future update emails
    if (originatorName || originatorLocation || originatorEmail) {
      await createSighting({
        duck_id: duck.id,
        lat: null,
        lng: null,
        location_label: originatorLocation,
        finder_name: originatorName,
        message: 'Duck released here! 🦆',
        email: originatorEmail,
      });
    }

    return NextResponse.json({ duck }, { status: 201 });
  } catch (err) {
    console.error('POST /api/ducks/submit error:', err);
    return NextResponse.json({ error: 'Failed to create duck' }, { status: 500 });
  }
}
