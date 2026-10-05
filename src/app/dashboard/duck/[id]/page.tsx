export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { getDuckById, getSightings } from '@/lib/db';
import DuckDetailClient from './DuckDetailClient';

export default async function DuckDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();

  const duck = await getDuckById(params.id);
  if (!duck) notFound();

  const sightings = await getSightings(duck.id);

  return <DuckDetailClient duck={duck} initialSightings={sightings} />;
}
