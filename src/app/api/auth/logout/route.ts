export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('duck_session')?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const response = NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/login`
  );

  response.cookies.delete('duck_session');
  return response;
}
