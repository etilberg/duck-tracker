export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { getDuckBySlug, getSightings } from '@/lib/db';
import FindDuckClient from './FindDuckClient';

export default async function DuckPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const duck = await getDuckBySlug(slug);
  if (!duck) notFound();

  const sightings = await getSightings(duck.id);

  return <FindDuckClient duck={duck} initialSightings={sightings} />;
}
