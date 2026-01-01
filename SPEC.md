# Forge Specification

## Architecture Overview

```
forge/
├── VISION.md          # Philosophy (you are here → ../VISION.md)
├── SPEC.md            # This file
├── CLAUDE.md          # Session context for Forge projects
├── README.md          # Quick start
├── TODO.md            # Implementation backlog
├── scripts/
│   ├── forge.mjs      # Main CLI entry point
│   ├── new.mjs        # Scaffold new MVP
│   ├── ship.mjs       # Validate + deploy
│   └── validate.mjs   # Run gates only
├── gates/
│   ├── emotional.mjs  # Emotional value validation (MANDATORY)
│   ├── security.mjs   # Security checks
│   └── independence.mjs # Portfolio isolation
├── templates/
│   ├── idea.md        # Idea intake template
│   ├── next-app/      # Next.js scaffold
│   └── supabase/      # Database migrations template
└── .claude/
    └── settings.json  # Minimal MCP config
```

## Core Components

### 1. CLI (`scripts/forge.mjs`)

```bash
forge new <idea.md>      # Scaffold new MVP from idea
forge validate           # Run all gates
forge ship               # Validate + deploy to Vercel
forge status             # Check MVP health
```

### 2. Gates (3 Essential)

| Gate | Purpose | Blocker |
|------|---------|---------|
| **emotional.mjs** | Validate emotional resonance in prompts/UI | YES |
| **security.mjs** | Check RLS, secrets, auth patterns | YES |
| **independence.mjs** | Verify portfolio isolation | YES |

### 3. Templates

**idea.md** - Minimal intake format:
```markdown
# [MVP Name]
## Problem
## Solution
## Emotional Hook (How should users FEEL?)
## Target User
```

**next-app/** - Pre-configured Next.js with:
- Supabase auth
- Tailwind CSS
- Vercel-ready
- PostHog analytics stub
- Sentry error tracking stub

**supabase/** - Database templates:
- User profiles migration
- RLS policy templates
- Basic schema

## Constraints

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| Total config lines | <500 | Prevents bloat |
| Gates | 3 | Only what runs |
| External dependencies | 0 | Self-contained |
| Time to ship | 4 hours | Verified target |
| Emotional score | 96%+ | Non-negotiable |

## Integration with AI Factory

Forge is a **sibling** to AI Factory, not a replacement:

```
/Users/P/dev/
├── AI-factory/     # Full factory (specs, gates, portfolio management)
└── forge/          # Lean MVP generator (this project)
```

Forge-created MVPs can later be "promoted" to AI Factory for:
- Full gate validation (21 gates)
- Portfolio dashboard integration
- Advanced monitoring

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel |
| AI | Claude via AI Gateway pattern |
| Analytics | PostHog |
| Errors | Sentry |

## Workflow

```
1. forge new ideas/my-idea.md
   → Reads idea
   → Scaffolds Next.js app
   → Creates Supabase project stub
   → Generates initial prompts

2. [Developer implements features]
   → Claude Code assists
   → ~2-3 hours of work

3. forge ship
   → Runs emotional gate (blocks if <96%)
   → Runs security gate (blocks if vulnerabilities)
   → Runs independence gate (blocks if cross-contamination)
   → Deploys to Vercel
   → Outputs live URL

Total: ~4 hours from idea to production
```

## Environment Variables

Required per MVP:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=  # Server-only
PRODUCT_ID=
```

Optional:
```
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```
