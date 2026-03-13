# InternSurf — Setup Guide

## Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Vercel](https://vercel.com) account (free)
- A [Adzuna](https://developer.adzuna.com) account for the job API (free tier)

---

## 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `internsurf`, set a strong database password, choose a region
3. Once created, go to **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`
4. Go to **Storage** → Create a new bucket called `resumes`, set it to **public**
5. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Adzuna API (Optional — for more job listings)

1. Register at [developer.adzuna.com](https://developer.adzuna.com)
2. Create an app to get your `App ID` and `API Key`
3. Add them as `ADZUNA_APP_ID` and `ADZUNA_API_KEY` env vars

> Note: The cron job works without Adzuna — it pulls from Remotive and The Muse by default (both free, no key required).

---

## 3. Local Development

```bash
# Copy env example
cp .env.local.example .env.local
# Fill in your values from step 1 above

# Install dependencies (already done if you ran npm install)
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).

**Add environment variables in Vercel dashboard:**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET          ← any random string, e.g. openssl rand -hex 32
ADZUNA_APP_ID        ← optional
ADZUNA_API_KEY       ← optional
```

The `vercel.json` cron is already configured to sync external listings every 6 hours automatically.

---

## 5. Point internsurf.com to Vercel

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `internsurf.com` and `www.internsurf.com`
3. Vercel will show you the DNS records to add
4. In your domain registrar's DNS settings, update:
   - `A` record for `@` → Vercel's IP (shown in dashboard)
   - `CNAME` record for `www` → `cname.vercel-dns.com`
5. DNS propagation takes ~10-30 minutes

---

## Project Structure

```
internsurf-app/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── (auth)/login + signup     # Auth pages
│   ├── internships/              # Browse + detail + apply
│   ├── student/                  # Student dashboard + profile
│   ├── org/                      # Org HRM dashboard
│   └── api/cron/sync-listings    # External job sync
├── components/                   # Shared UI components
├── lib/supabase/                 # Supabase clients
├── lib/types.ts                  # TypeScript types
├── proxy.ts                      # Auth + role-based routing
├── supabase/migrations/          # SQL schema
└── vercel.json                   # Cron schedule
```

## Key Features

- **Students**: Browse internships (internal + auto-synced external), apply, track application status in real-time
- **Organizations**: Post listings, review applications in a Kanban pipeline, approve/reject with private notes
- **Real-time**: Students see status updates instantly when orgs act on applications (Supabase Realtime)
- **External sync**: Cron job fetches internships from Remotive + The Muse every 6 hours
