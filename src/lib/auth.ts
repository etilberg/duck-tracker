import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getSession } from './session';

export async function requireAdmin(): Promise<string> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('duck_session')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const session = await getSession(sessionId);
  if (!session) {
    redirect('/login');
  }

  const { env } = getRequestContext();
  const adminUsername = env.ADMIN_GITHUB_USERNAME;
  if (!adminUsername || session.username !== adminUsername) {
    redirect('/login');
  }

  return session.username;
}

export async function getAdminSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('duck_session')?.value;
    if (!sessionId) return null;

    const session = await getSession(sessionId);
    if (!session) return null;

    const { env } = getRequestContext();
    const adminUsername = env.ADMIN_GITHUB_USERNAME;
    if (!adminUsername || session.username !== adminUsername) return null;

    return session.username;
  } catch {
    return null;
  }
}
