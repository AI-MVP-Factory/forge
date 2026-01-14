# Forge Next Steps

> **Goal:** Transform Self-Care Checklist from web demo to revenue-generating mobile app.

## The Problem

We have 7 web MVPs with 96%+ emotional scores. But:
- No mobile apps (where users live)
- No monetization (no business)
- No viral mechanics (no growth)

**Web demos are not real products.**

---

## Phase 8: Mobile Foundation (CURRENT)

### 8.1 Validate Expo Build ← NEXT ACTION
```bash
cd /Users/P/dev/forge/self-care-checklist-expo
npx expo start --ios
```

**Success criteria:**
- [ ] App runs on iOS Simulator
- [ ] App runs on Android Emulator
- [ ] Haptic feedback works
- [ ] Animations are smooth (60fps)
- [ ] Celebrations feel delightful

### 8.2 Add RevenueCat
```bash
npx expo install react-native-purchases
```

**Implementation:**
1. Create RevenueCat account at https://app.revenuecat.com
2. Set up product: "Self-Care Premium"
   - Monthly: $4.99/mo
   - Yearly: $29.99/yr (50% savings)
3. Create paywall screen
4. Gate premium features:
   - Free: Items 1-3 (water, movement, rest)
   - Premium: All 7 items + history + streaks

### 8.3 Polish the UI
- [ ] Confetti animation on 7/7 completion
- [ ] Custom app icon (rose heart)
- [ ] Proper splash screen (not placeholder)
- [ ] Dark mode support
- [ ] Streak counter badge

### 8.4 App Store Submission
1. Apple Developer Program ($99/yr)
2. Google Play Console ($25 one-time)
3. EAS Build configuration
4. Screenshots (6.7", 6.5", 5.5" sizes)
5. App description with emotional copy
6. Submit to TestFlight
7. Submit to Play Store internal testing

---

## Phase 9: Viral Mechanics

### Share Achievements
```typescript
// Share card when completing self-care
const shareAchievement = async () => {
  await Share.share({
    message: "I completed 7 self-care items today! 💖",
    url: "https://selfcare.app/download"
  });
};
```

### Streak Tracking
- Track consecutive days of self-care
- Show streak badge on home screen
- Celebrate streak milestones (7, 30, 100 days)
- "Don't break the streak" notification

### Deep Linking
```
selfcare://checklist
selfcare://achievement/7-items
selfcare://invite/USER_CODE
```

### Referral System
- Invite friend → Both get 1 week premium
- Track referral codes
- Show referral leaderboard

---

## Phase 10: Extract Expo Template

After Self-Care Checklist is successful, generalize:

```
templates/expo-app/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── paywall.tsx        # RevenueCat paywall
├── components/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Confetti.tsx
├── design/
│   └── tokens.ts
├── lib/
│   ├── haptics.ts
│   ├── payments.ts        # RevenueCat
│   ├── analytics.ts       # PostHog
│   └── share.ts           # Social sharing
└── assets/
```

### New Gates
```javascript
// gates/monetization.mjs
// Validates RevenueCat is configured and paywall exists

// gates/beauty.mjs
// Validates design tokens, animations, dark mode

// gates/virality.mjs
// Validates share button, deep links, referral tracking
```

---

## Phase 11: Scale the Portfolio

### Port Remaining MVPs
| Priority | MVP | Why |
|----------|-----|-----|
| 1 | Daily Affirmation | Daily habit, subscription-worthy |
| 2 | Gratitude Journal | Daily habit, history value |
| 3 | Focus Timer | Utility app, premium features |
| 4 | Mood Check | Health tracking, premium insights |

### Launch Strategy
1. TestFlight beta with 100 users
2. Gather feedback, iterate
3. Soft launch (limited countries)
4. Product Hunt launch
5. Reddit/Twitter organic
6. Paid ads if CAC < LTV

---

## Success Metrics

| Milestone | Target | Timeline |
|-----------|--------|----------|
| iOS app running | - | Day 1 |
| RevenueCat integrated | - | Day 2 |
| TestFlight live | - | Day 3 |
| App Store live | - | Week 1 |
| First paying user | $4.99 | Week 2 |
| 10 paying users | $50 MRR | Month 1 |
| 100 paying users | $500 MRR | Month 3 |
| Portfolio MRR | $1,000 | Month 6 |

---

## Quick Reference

### Commands
```bash
# Expo development
cd /Users/P/dev/forge/self-care-checklist-expo
pnpm install
npx expo start --ios

# Build for stores
npx eas build --platform ios
npx eas build --platform android

# Submit to stores
npx eas submit --platform ios
npx eas submit --platform android
```

### Key Files
| File | Purpose |
|------|---------|
| `app/index.tsx` | Main checklist screen |
| `components/ChecklistItem.tsx` | Animated item |
| `design/tokens.ts` | Colors, spacing |
| `lib/haptics.ts` | Native feedback |
| `lib/celebrate.ts` | AI celebration |

### Resources
- [Expo Documentation](https://docs.expo.dev)
- [RevenueCat Documentation](https://docs.revenuecat.com)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Remember:** Products succeed by how they make users FEEL. Every feature should reinforce warmth, celebration, and validation.
