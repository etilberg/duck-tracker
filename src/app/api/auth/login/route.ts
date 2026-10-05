export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export async function GET() {
  const { env } = getRequestContext();
  const clientId = env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'read:user',
    state,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
  });

  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );

  // Store state in cookie for CSRF protection (5 min TTL)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 300,
    path: '/',
  });

  return response;
}
