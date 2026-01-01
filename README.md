# Forge

> Ship emotionally-resonant MVPs in 4 hours.

## Quick Start

```bash
# 1. Create new MVP from idea
node scripts/forge.mjs new ideas/my-idea.md

# 2. Implement (Claude Code assists)
# ... ~2-3 hours of work ...

# 3. Ship
node scripts/forge.mjs ship
```

## What's Different?

| Approach | Time | Quality | Emotional |
|----------|------|---------|-----------|
| Pipelineabuser | 30 min | Low | None |
| AI Factory | 14 hours | High | 96-100% |
| **Forge** | 4 hours | High | 96-100% |

Forge = Pipelineabuser speed + AI Factory quality.

## Core Principle

**Products succeed by how they make users FEEL.**

Every Forge MVP passes emotional validation before shipping.

## The 3 Gates

1. **Emotional** - Does it make users feel good?
2. **Security** - Is it safe (RLS, secrets, auth)?
3. **Independence** - Is it isolated from other MVPs?

## Stack

- Next.js + Supabase + Vercel
- Claude Code for development
- 3 quality gates (not 21)
- ~500 lines of config (not 28,500)

## Documentation

- [VISION.md](./VISION.md) - Philosophy
- [SPEC.md](./SPEC.md) - Architecture
- [CLAUDE.md](./CLAUDE.md) - Session context
- [TODO.md](./TODO.md) - Implementation backlog

## Status

**Phase: Initial Setup**

See [TODO.md](./TODO.md) for implementation progress.

---

*Forged with AI. Built to make users feel.*
