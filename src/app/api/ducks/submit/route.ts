export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { createDuck } from '@/lib/db';
import { generateSlug } from '@/lib/qr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name?: string; notes?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Duck name is required' }, { status: 400 });
    }

    // Basic length limits
    const name = body.name.trim().slice(0, 80);
    const notes = body.notes?.trim().slice(0, 500) || undefined;

    const slug = generateSlug();
    const duck = await createDuck(slug, name, notes);
    return NextResponse.json({ duck }, { status: 201 });
  } catch (err) {
    console.error('POST /api/ducks/submit error:', err);
    return NextResponse.json({ error: 'Failed to create duck' }, { status: 500 });
  }
}
