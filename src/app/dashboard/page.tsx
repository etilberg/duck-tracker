export const runtime = 'edge';

import { requireAdmin } from '@/lib/auth';
import { getDucks } from '@/lib/db';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  await requireAdmin();
  const ducks = await getDucks();
  return <DashboardClient initialDucks={ducks} />;
}
