export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getDuckById, getSightings } from '@/lib/db';
import DuckDetailClient from './DuckDetailClient';

export default async function DuckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const duck = await getDuckById(id);
  if (!duck) notFound();

  const sightings = await getSightings(duck.id);

  return <DuckDetailClient duck={duck} initialSightings={sightings} />;
}
