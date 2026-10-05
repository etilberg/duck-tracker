import { getRequestContext } from '@cloudflare/next-on-pages';

export interface Duck {
  id: string;
  slug: string;
  name: string;
  notes: string | null;
  created_at: string;
}

export interface Sighting {
  id: string;
  duck_id: string;
  found_at: string;
  lat: number | null;
  lng: number | null;
  location_label: string | null;
  finder_name: string | null;
  message: string | null;
  email: string | null;
  created_at: string;
}

export function getDB() {
  const { env } = getRequestContext();
  return env.DB as D1Database;
}

export async function getDucks(): Promise<Duck[]> {
  const db = getDB();
  const result = await db.prepare(
    'SELECT * FROM ducks ORDER BY created_at DESC'
  ).all<Duck>();
  return result.results;
}

export async function getDuckBySlug(slug: string): Promise<Duck | null> {
  const db = getDB();
  const result = await db.prepare(
    'SELECT * FROM ducks WHERE slug = ?'
  ).bind(slug).first<Duck>();
  return result ?? null;
}

export async function getDuckById(id: string): Promise<Duck | null> {
  const db = getDB();
  const result = await db.prepare(
    'SELECT * FROM ducks WHERE id = ?'
  ).bind(id).first<Duck>();
  return result ?? null;
}

export async function createDuck(slug: string, name: string, notes?: string): Promise<Duck> {
  const db = getDB();
  const result = await db.prepare(
    `INSERT INTO ducks (id, slug, name, notes)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?)
     RETURNING *`
  ).bind(slug, name, notes ?? null).first<Duck>();
  if (!result) throw new Error('Failed to create duck');
  return result;
}

export async function deleteDuck(id: string): Promise<void> {
  const db = getDB();
  await db.prepare('DELETE FROM ducks WHERE id = ?').bind(id).run();
}

export async function getSightings(duckId: string): Promise<Sighting[]> {
  const db = getDB();
  const result = await db.prepare(
    'SELECT * FROM sightings WHERE duck_id = ? ORDER BY found_at DESC'
  ).bind(duckId).all<Sighting>();
  return result.results;
}

export async function createSighting(data: {
  duck_id: string;
  lat?: number | null;
  lng?: number | null;
  location_label?: string | null;
  finder_name?: string | null;
  message?: string | null;
  email?: string | null;
}): Promise<Sighting> {
  const db = getDB();
  const result = await db.prepare(
    `INSERT INTO sightings (id, duck_id, lat, lng, location_label, finder_name, message, email)
     VALUES (lower(hex(randomblob(16))), ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`
  ).bind(
    data.duck_id,
    data.lat ?? null,
    data.lng ?? null,
    data.location_label ?? null,
    data.finder_name ?? null,
    data.message ?? null,
    data.email ?? null
  ).first<Sighting>();
  if (!result) throw new Error('Failed to create sighting');
  return result;
}

export async function getPreviousFinderEmails(duckId: string, excludeSightingId: string): Promise<string[]> {
  const db = getDB();
  const result = await db.prepare(
    `SELECT DISTINCT email FROM sightings
     WHERE duck_id = ? AND email IS NOT NULL AND email != '' AND id != ?`
  ).bind(duckId, excludeSightingId).all<{ email: string }>();
  return result.results.map(r => r.email);
}
