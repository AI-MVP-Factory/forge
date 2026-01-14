# Forge

> Ship emotionally-resonant mobile apps that users love and pay for.

## Live Portfolio (7 MVPs)

| # | MVP | URL | Score |
|---|-----|-----|-------|
| 1 | Daily Affirmation | [daily-affirmation-alpha.vercel.app](https://daily-affirmation-alpha.vercel.app) | 100% |
| 2 | Recipe Genie | [recipe-genie-cyan.vercel.app](https://recipe-genie-cyan.vercel.app) | 96% |
| 3 | Focus Timer | [focus-timer-sigma-five.vercel.app](https://focus-timer-sigma-five.vercel.app) | 100% |
| 4 | Vibe Check | [vibe-check-neon-alpha.vercel.app](https://vibe-check-neon-alpha.vercel.app) | 100% |
| 5 | Gratitude Journal | [gratitude-journal-nu.vercel.app](https://gratitude-journal-nu.vercel.app) | 100% |
| 6 | Mood Check | [mood-check-dusky.vercel.app](https://mood-check-dusky.vercel.app) | 100% |
| 7 | Self-Care Checklist | [self-care-checklist.vercel.app](https://self-care-checklist.vercel.app) | 98% |

## Current Phase: Mobile-First Pivot

**Web demos are not real products.** Real success means:
- iPhone + Android apps (Expo)
- Clear monetization (RevenueCat)
- Beautiful design (animations, polish)
- Viral mechanics (sharing, streaks)

See [NEXT_STEPS.md](./NEXT_STEPS.md) for the roadmap.

## Quick Start

```bash
# Web MVP (original workflow)
node scripts/forge.mjs new ideas/my-idea.md
cd my-mvp && pnpm install && pnpm dev
node ../scripts/forge.mjs validate .
node ../scripts/forge.mjs ship .

# Mobile MVP (Expo - new workflow)
cd self-care-checklist-expo
pnpm install
npx expo start --ios    # or --android
```

## Core Principle

**Products succeed by how they make users FEEL.**

Every Forge MVP passes emotional validation (96%+ threshold) before shipping.

## The 3 Gates

1. **Emotional** - Does it make users feel celebrated, validated, encouraged?
2. **Security** - Is it safe (RLS, secrets, auth)?
3. **Independence** - Is it isolated from other MVPs?

## Stack

### Web (Current)
- Next.js 14 + Supabase + Vercel
- 3 quality gates
- ~2,100 lines of config

### Mobile (In Progress)
- Expo + React Native
- RevenueCat for payments
- EAS Build for App Store/Play Store

## Documentation

- [VISION.md](./VISION.md) - Philosophy and principles
- [SPEC.md](./SPEC.md) - Architecture and components
- [TODO.md](./TODO.md) - Implementation progress
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Roadmap to real products
- [SESSION_HANDOFF.md](./SESSION_HANDOFF.md) - Session continuity

## Stats

| Metric | Value |
|--------|-------|
| MVPs shipped | 7 |
| Average emotional score | 99% |
| Time to ship (web) | ~45 min |
| Lines of code | ~3,000 |
| vs AI Factory | 10x leaner |

---

*Forged with AI. Built to make users feel.*
