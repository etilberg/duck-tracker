// Cloudflare Workers environment bindings
interface CloudflareEnv {
  DB: D1Database;
  SESSIONS: KVNamespace;
  NEXT_PUBLIC_APP_URL: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  ADMIN_GITHUB_USERNAME: string;
  RESEND_API_KEY: string;
}
