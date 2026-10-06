export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSession } from '@/lib/session';
import { getDuckById, getSightings, deleteDuck, updateDuck } from '@/lib/db';

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const sessionId = request.cookies.get('duck_session')?.value;
  if (!sessionId) return false;
  const session = await getSession(sessionId);
  if (!session) return false;
  const { env } = getRequestContext();
  const adminUsername = env.ADMIN_GITHUB_USERNAME;
  return !!adminUsername && session.username === adminUsername;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const duck = await getDuckById(id);
    if (!duck) {
      return NextResponse.json({ error: 'Duck not found' }, { status: 404 });
    }
    const sightings = await getSightings(duck.id);
    return NextResponse.json({ duck, sightings });
  } catch (err) {
    console.error('GET /api/ducks/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch duck' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as { name?: string; notes?: string | null };
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const duck = await updateDuck(id, body.name.trim(), body.notes ?? null);
    return NextResponse.json({ duck });
  } catch (err) {
    console.error('PATCH /api/ducks/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update duck' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const duck = await getDuckById(id);
    if (!duck) {
      return NextResponse.json({ error: 'Duck not found' }, { status: 404 });
    }
    await deleteDuck(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/ducks/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete duck' }, { status: 500 });
  }
}
