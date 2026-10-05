export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/session';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Check if already logged in
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('duck_session')?.value;
  if (sessionId) {
    const session = await getSession(sessionId);
    if (session && session.username === process.env.ADMIN_GITHUB_USERNAME) {
      redirect('/dashboard');
    }
  }

  const errorMessages: Record<string, string> = {
    unauthorized: 'Your GitHub account is not authorized to access this dashboard.',
    invalid_state: 'Login request expired or was tampered with. Please try again.',
    oauth_failed: 'GitHub login failed. Please try again.',
  };

  const errorMessage = searchParams.error ? errorMessages[searchParams.error] : null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-yellow-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Duck Tracker</h1>
        <p className="text-gray-500 mb-8">Owner dashboard — sign in with GitHub</p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
            {errorMessage}
          </div>
        )}

        <a
          href="/api/auth/login"
          className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </a>
      </div>
    </main>
  );
}
