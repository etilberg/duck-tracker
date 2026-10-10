# 🦆 QuackerTracks

A "Where's George" style tracker for Jeep rubber ducks. Register a duck, attach a QR code sticker, place it on someone's Jeep, and watch it travel the world one scan at a time.

Live at **[quackertracks.com](https://quackertracks.com)**

## Features

- **Duck registration** — name your duck, get a unique URL + QR code (PNG download)
- **Public finder page** — `/duck/[slug]` shows the duck's name-tag hero, travel history map, and sighting log
- **Sighting flow** — finder scans QR → optional GPS location share → optional name/message/email
- **Email notifications** — opt-in: get notified every time that duck is found again; one-click unsubscribe
- **Browse map** — world map of all sightings with GPS coordinates
- **Admin dashboard** — manage all ducks, view full sighting history (including emails), download QR codes
- **No accounts for finders** — completely anonymous or optional name/message; no login required to browse
- **Privacy-first** — no ad trackers, no cookies for public visitors, no user data collected

## Stack (100% free tier)

| Layer | Service |
|-------|---------|
| Hosting + CDN | Cloudflare Pages |
| Edge Runtime | Next.js 15 (`@cloudflare/next-on-pages`) |
| Database | Cloudflare D1 (SQLite) |
| Sessions | Cloudflare KV |
| Auth | GitHub OAuth (single admin) |
| Email | Resend (3k/mo free) |
| Maps | Leaflet + OpenStreetMap |

## Database Schema

```sql
CREATE TABLE ducks (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,   -- 8-char random, used in public URL + QR
  name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE sightings (
  id TEXT PRIMARY KEY,          -- UUID; doubles as unsubscribe token
  duck_id TEXT NOT NULL REFERENCES ducks(id),
  lat REAL,
  lng REAL,
  location_label TEXT,
  finder_name TEXT,
  message TEXT,                 -- 'Duck released here! 🦆' = origin sentinel (excluded from public stats)
  email TEXT,                   -- NULLed on unsubscribe
  found_at TEXT DEFAULT (datetime('now'))
);
```

## Setup

### 1. GitHub OAuth App

Go to [GitHub → Settings → Developer settings → OAuth Apps → New](https://github.com/settings/applications/new):

- **Application name:** QuackerTracks
- **Homepage URL:** `https://quackertracks.com`
- **Authorization callback URL:** `https://quackertracks.com/api/auth/callback`

Copy the **Client ID** and generate a **Client Secret**.

### 2. Resend

Sign up at [resend.com](https://resend.com), verify your domain, and create an API key. Emails are sent from `noreply@quackertracks.com`.

### 3. Cloudflare Pages Project

Create a new Pages project connected to this GitHub repo. Set these **environment variables** in the Cloudflare Pages dashboard:

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
ADMIN_GITHUB_USERNAME=your-github-username
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://quackertracks.com
```

### 4. Bind D1 and KV

In Cloudflare Pages → Settings → Functions → Bindings:

- **D1 Database:** Variable name `DB` → select or create `duck-tracker`
- **KV Namespace:** Variable name `SESSIONS` → select or create `duck-tracker-sessions`

Then create the tables by running the SQL in `schema.sql` against your D1 database via the Cloudflare dashboard or Wrangler CLI.

### 5. Local Development

```bash
cp .env.local.example .env.local
# Fill in your values

npm install
npm run pages:preview
```

### 6. CI/CD (GitHub Actions)

Add these secrets to your GitHub repo (Settings → Secrets → Actions):

- `CLOUDFLARE_API_TOKEN` — Cloudflare dashboard → My Profile → API Tokens
- `CLOUDFLARE_ACCOUNT_ID`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ADMIN_GITHUB_USERNAME`
- `RESEND_API_KEY`

Push to `main` to deploy automatically via the included workflow.

## Usage

1. Go to `/submit` and register a duck with a name
2. Download the QR code PNG from the confirmation page
3. Print it and attach to a rubber duck (DYMO label works great)
4. Place the duck on someone's Jeep
5. When found, the finder scans the QR → lands on `/duck/[slug]` → logs the sighting
6. Watch sightings roll in at `/dashboard/duck/[id]`

## Key Design Decisions

- **Origin sightings** — When a duck is registered with originator info, a sighting is created with `message = 'Duck released here! 🦆'`. This sentinel is excluded from public stats and the browse map so only real finds are counted.
- **Email unsubscribe** — The sighting's `id` is the unsubscribe token. Clicking the link NULLs the `email` field in that row — no separate unsubscribe table needed.
- **Edge runtime** — All API routes use `export const runtime = 'edge'` and run on Cloudflare Workers. No Node.js APIs, no cold starts.
- **Client-side maps** — Leaflet maps are dynamically imported with `ssr: false` to avoid server-side rendering issues with `window`.
