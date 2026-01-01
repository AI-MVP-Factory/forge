# Forge Specification

## Architecture Overview

```
forge/
├── VISION.md              # Philosophy
├── SPEC.md                # This file
├── CLAUDE.md              # Session context
├── README.md              # Quick start
├── TODO.md                # Implementation backlog
├── NEXT_STEPS.md          # Roadmap to real products
├── SESSION_HANDOFF.md     # Session continuity
│
├── scripts/
│   ├── forge.mjs          # Main CLI entry point
│   └── new.mjs            # Scaffold new MVP
│
├── gates/
│   ├── emotional.mjs      # Emotional validation (MANDATORY, 96%+)
│   ├── security.mjs       # Security checks (RLS, secrets)
│   └── independence.mjs   # Portfolio isolation
│
├── templates/
│   ├── idea.md            # Idea intake template
│   └── next-app/          # Web scaffold (Next.js)
│
├── ideas/                 # MVP idea files
│
├── [mvp-name]/            # Web MVPs (Next.js)
│
└── [mvp-name]-expo/       # Mobile MVPs (Expo) ← NEW
```

## Web Stack (Current)

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Supabase (Postgres + Auth + RLS) |
| Hosting | Vercel |
| AI | Claude via OpenRouter |
| Analytics | PostHog |
| Errors | Sentry |

## Mobile Stack (In Progress)

| Layer | Technology |
|-------|------------|
| Framework | Expo + React Native |
| Navigation | Expo Router (file-based) |
| Animations | React Native Reanimated |
| Haptics | expo-haptics |
| Payments | RevenueCat |
| Build | EAS Build |
| Distribution | App Store + Play Store |

## Expo Project Structure

```
[mvp-name]-expo/
├── app/
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Main screen
│
├── components/            # Reusable UI
│   ├── ChecklistItem.tsx  # Animated item
│   ├── CelebrationCard.tsx # Success display
│   └── ProgressBadge.tsx  # Progress indicator
│
├── design/
│   └── tokens.ts          # Colors, spacing, typography
│
├── lib/
│   ├── haptics.ts         # Native haptic feedback
│   ├── celebrate.ts       # AI celebration API
│   └── payments.ts        # RevenueCat (TODO)
│
├── assets/                # Icons, splash screens
│
├── app.json               # Expo config
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Gates (3 Essential + 3 Planned)

### Current Gates

| Gate | Purpose | Threshold |
|------|---------|-----------|
| **emotional.mjs** | Warmth, empathy, celebration, validation, encouragement | 96%+ |
| **security.mjs** | RLS, secrets, auth patterns | No blockers |
| **independence.mjs** | Portfolio isolation | No blockers |

### Planned Gates (Forge V2)

| Gate | Purpose | Threshold |
|------|---------|-----------|
| **monetization.mjs** | Payment flow exists | Paywall present |
| **beauty.mjs** | Design tokens, animations, polish | 80%+ |
| **virality.mjs** | Share mechanics, deep links | Share button exists |

## CLI Commands

```bash
# Web workflow
forge new <idea.md>        # Scaffold web MVP
forge validate             # Run all gates
forge ship                 # Validate + deploy to Vercel
forge status               # Check MVP health

# Mobile workflow (planned)
forge new --expo <idea.md> # Scaffold Expo MVP
forge build --ios          # EAS Build for iOS
forge build --android      # EAS Build for Android
forge submit               # Submit to stores
```

## Idea Template

```markdown
# [MVP Name]

## Problem
[What pain point does this solve?]

## Solution
[How does the product solve it?]

## Emotional Hook
[How should users FEEL when using this?]

## Target User
[Who is this for?]

## Monetization (NEW)
- Free tier: [what's free]
- Premium ($X/mo): [what's paid]
- Why they'll pay: [emotional reason]

## Viral Loop (NEW)
- Share trigger: [when they share]
- Share content: [what they share]
- Referral reward: [what referrer gets]
```

## Design Tokens

```typescript
// design/tokens.ts
export const colors = {
  primary: { 50: '#FFF1F2', 500: '#F43F5E', 900: '#881337' },
  neutral: { 50: '#FAFAF9', 500: '#78716C', 900: '#1C1917' },
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32,
};

export const typography = {
  size: { sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24 },
  weight: { normal: '400', medium: '500', bold: '700' },
};
```

## Monetization Model

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Basic features, limited items |
| Premium | $4.99/mo | All features, history, no limits |
| Yearly | $29.99/yr | Same as premium, 50% savings |

## Constraints

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| Total config lines | <5,000 | Prevents bloat |
| Gates | 6 max | Only what runs |
| Time to ship (web) | 4 hours | Verified |
| Time to ship (mobile) | 1 week | Realistic |
| Emotional score | 96%+ | Non-negotiable |

## Success Definition

A Forge MVP is **successful** when:
1. ✅ Live on App Store + Play Store
2. ✅ Has paying subscribers
3. ✅ Beautiful (screenshot-worthy)
4. ✅ Viral potential (share mechanics)
5. ✅ 96%+ emotional score
