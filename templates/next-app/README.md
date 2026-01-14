# {{MVP_NAME}}

> {{EMOTIONAL_HOOK}}

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Auth + RLS)
- **Styling:** Tailwind CSS
- **Analytics:** PostHog
- **Errors:** Sentry
- **Hosting:** Vercel

## Project Structure

```
app/
├── layout.tsx      # Root layout with providers
├── page.tsx        # Home page
├── globals.css     # Tailwind styles
└── api/
    └── health/     # Health check endpoint

lib/
├── supabase/       # Supabase clients
├── posthog.tsx     # Analytics provider
└── sentry.ts       # Error tracking helpers

components/
└── ui/             # Reusable UI components
```

## Deploy

```bash
# Using Forge (recommended)
forge ship

# Or directly with Vercel
vercel --prod
```

---

Built with [Forge](https://github.com/P/forge) - Ship MVPs in 4 hours.
