# 🦆 Duck Tracker

A "Where's George" style tracker for Jeep rubber ducks. Put a QR code on a duck, hand it to someone, and watch it travel the world.

## Features

- Unique QR code per duck → links to its public tracking page
- Finders scan QR → see travel history on a map → click "I Found It!"
- Completely anonymous or optional name/message
- Optional email: get notified every time that duck is found again
- Owner dashboard: manage all ducks, view sightings, download QR codes

## Stack (100% free tier)

| Layer | Service |
|-------|---------|
| Hosting | Cloudflare Pages |
| Database | Cloudflare D1 (SQLite) |
| Sessions | Cloudflare KV |
| Auth | GitHub OAuth (single admin) |
| Email | Resend (3k/mo free) |
| Maps | Leaflet + OpenStreetMap |

## Setup

### 1. GitHub OAuth App

Go to [GitHub → Settings → Developer settings → OAuth Apps → New](https://github.com/settings/applications/new):

- **Application name:** Duck Tracker
- **Homepage URL:** `https://duck-tracker.pages.dev`
- **Authorization callback URL:** `https://duck-tracker.pages.dev/api/auth/callback`

Copy the **Client ID** and generate a **Client Secret**.

### 2. Resend API Key

Sign up at [resend.com](https://resend.com) and create an API key.

### 3. Cloudflare Pages Project

Create a new Pages project connected to this GitHub repo, or deploy manually:

```bash
npm run pages:deploy
```

Set these **environment variables** in Cloudflare Pages dashboard:

```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
ADMIN_GITHUB_USERNAME=your-github-username
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://duck-tracker.pages.dev
```

### 4. Bind D1 and KV

In Cloudflare Pages → Settings → Functions → Bindings:

- **D1 Database:** Variable name `DB` → `duck-tracker`
- **KV Namespace:** Variable name `SESSIONS` → `duck-tracker-sessions`

### 5. Local Development

```bash
cp .env.local.example .env.local
# Fill in your values

npm install
npm run pages:preview
```

### 6. GitHub Actions (CI/CD)

Add these secrets to your GitHub repo (Settings → Secrets → Actions):

- `CLOUDFLARE_API_TOKEN` — from Cloudflare dashboard → My Profile → API Tokens
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `ADMIN_GITHUB_USERNAME`
- `RESEND_API_KEY`

Push to `main` to deploy automatically.

## Usage

1. Go to `/dashboard` and sign in with GitHub
2. Add a duck with a name
3. Download its QR code (PNG)
4. Print and attach to a rubber duck
5. Place the duck somewhere on a Jeep!
6. Watch sightings roll in at `/dashboard/duck/[id]`
