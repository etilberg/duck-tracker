import { getRequestContext } from '@cloudflare/next-on-pages';

export interface Session {
  username: string;
  created_at: string;
}

function getKV() {
  const { env } = getRequestContext();
  return env.SESSIONS as KVNamespace;
}

export async function createSession(username: string): Promise<string> {
  const kv = getKV();
  const sessionId = crypto.randomUUID();
  const session: Session = {
    username,
    created_at: new Date().toISOString(),
  };
  // 24 hour TTL
  await kv.put(`session:${sessionId}`, JSON.stringify(session), { expirationTtl: 86400 });
  return sessionId;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const kv = getKV();
  const raw = await kv.get(`session:${sessionId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const kv = getKV();
  await kv.delete(`session:${sessionId}`);
}
