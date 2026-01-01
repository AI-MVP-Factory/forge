# CLAUDE.md - Forge Session Context

> **Load this file at session start when working on Forge or Forge-created MVPs.**

## What is Forge?

Forge is a lean MVP generator. It ships emotionally-resonant products in 4 hours.

**Core thesis:** Products succeed by how they make users FEEL.

## Quick Commands

```bash
# Create new MVP
node scripts/forge.mjs new ideas/my-idea.md

# Validate (run gates)
node scripts/forge.mjs validate

# Ship (validate + deploy)
node scripts/forge.mjs ship
```

## The 3 Gates

Every MVP must pass before shipping:

1. **Emotional Gate** - Does the product make users feel something positive?
2. **Security Gate** - RLS enabled? Secrets hidden? Auth secure?
3. **Independence Gate** - Isolated from other MVPs? Own domain/analytics?

## Stack

- Next.js 14+ (App Router)
- Supabase (DB + Auth + RLS)
- Vercel (Deploy)
- Claude (AI via gateway pattern)

## Emotional Surfaces

Every MVP should have emotional moments at:
- First load (welcome, not cold)
- Success states (celebration, not just confirmation)
- Empty states (encouraging, not blank)
- Error states (empathetic, not robotic)

## Non-Negotiables

1. **Emotional score 96%+** - No shipping without emotional validation
2. **RLS on all user tables** - Security is not optional
3. **Independence** - Each MVP is isolated (domain, analytics, support)
4. **4-hour target** - If it's taking longer, simplify scope

## When Stuck

Ask: "How should the user FEEL at this moment?"

The answer guides the implementation.

---

*Forge: Speed + Quality + Emotion*
