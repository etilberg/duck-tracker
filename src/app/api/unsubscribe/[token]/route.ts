export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { clearSightingEmail } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://quackertracks.com';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    await clearSightingEmail(token);
  } catch (err) {
    console.error('Unsubscribe error:', err);
    // Still show success — if the sighting ID is wrong it just does nothing
  }

  // Redirect to a friendly confirmation page
  return NextResponse.redirect(`${APP_URL}/unsubscribed`);
}
