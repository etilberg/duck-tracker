export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getDucks, createDuck } from '@/lib/db';
import { generateSlug } from '@/lib/qr';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const sessionId = request.cookies.get('duck_session')?.value;
  if (!sessionId) return false;
  const session = await getSession(sessionId);
  if (!session) return false;
  const adminUsername = process.env.ADMIN_GITHUB_USERNAME;
  return !!adminUsername && session.username === adminUsername;
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ducks = await getDucks();
    return NextResponse.json({ ducks });
  } catch (err) {
    console.error('GET /api/ducks error:', err);
    return NextResponse.json({ error: 'Failed to fetch ducks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json() as { name?: string; notes?: string };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = generateSlug();
    const duck = await createDuck(slug, body.name.trim(), body.notes?.trim());
    return NextResponse.json({ duck }, { status: 201 });
  } catch (err) {
    console.error('POST /api/ducks error:', err);
    return NextResponse.json({ error: 'Failed to create duck' }, { status: 500 });
  }
}
