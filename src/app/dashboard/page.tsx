export const runtime = 'edge';

import { requireAdmin } from '@/lib/auth';
import { getDucksWithSightingCount } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  await requireAdmin();
  const ducks = await getDucksWithSightingCount();
  return <DashboardClient initialDucks={ducks} />;
}
