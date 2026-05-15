# MathDash

## 1. Problem & Target User

Casual mobile-web players (the Wordle/NYT Games audience) want short, satisfying brain teasers playable instantly during 1-3 minute downtime windows — commute, queue, coffee break — without installing an app, creating an account, or sitting through tutorials. Existing math puzzle games either require app installs, hide content behind paywalls, or feel like edutainment for kids rather than a quick mental jolt for adults.

MathDash is a zero-friction, link-shareable browser puzzle. Each round gives the player a target number and 4 number tiles; the player must combine **all** tiles using +, −, ×, ÷ to reduce them to a single tile equal to the target before the timer runs out (Countdown / Numble-style mechanic). Faster solves earn more stars; a Game-24 mode and shareable result cards turn solo play into casual social competition. Now is the right moment because the daily-puzzle category (Wordle, Connections, Strands) has trained a mass audience to expect this exact format on the web.

## 2. Core User Flow

- User opens link → lands on `/` showing tier selector (Easy / Medium / Hard / 24 Mode) with no signup
- User picks tier → routed to `/play/:tier/:level`, sees target number, 4 available number tiles, operator buttons, and countdown timer
- User taps a tile, an operator, then a second tile → the two tiles merge into one new tile holding the result; timer starts on first interaction
- Player repeats the combine step until exactly one tile remains; if that tile's value equals the target, the round is solved (all 4 numbers must be consumed)
- On exact match → timer stops, stars awarded (3/2/1 based on remaining time), level marked complete in localStorage
- Result modal appears with "Share" button generating a result card image (`/share/:resultId`) and "Next Level" button
- User shares card to social or returns to map; progress persists across sessions via localStorage

## 3. Must-Have Features (v1)

Status legend: `[ ]` unfinish · `[~]` on going · `[x]` finish

- [x] Tier + level selector screen (`/`) reading completion state from localStorage; all levels unlocked (no lock mechanic)
- [x] Puzzle gameplay screen (`/play/:tier/:level`) with random target + numbers, operator buttons, undo, reset, and per-tier countdown
- [x] Expression engine: combines any two tiles with one operator into a new tile (no parentheses, no precedence ambiguity); enforces integer-only division during play; round solved iff exactly one tile remains AND its value equals the target (forces all 4 numbers to be used)
- [x] 40 random levels (10 per tier × 4 tiers): Easy 90s · Medium 60s · Hard 60s · Game 24 90s; target + numbers randomized on each access
- [x] Star scoring (3 stars > 66% time left, 2 > 33%, 1 if solved); session cumulative score per tier (remaining seconds × 1 per level, resets on page close)
- [ ] Shareable result card: client-side canvas-rendered PNG with target, time, stars, tier; "Copy image" + "Copy link" actions
- [x] Local daily challenge: one shared puzzle per UTC date, seeded from date string (Easy difficulty: numbers 1–13, target ≤ 100, 90s); streak counter in localStorage

## 4. Data Model

Client-only state (localStorage, JSON-serialized). No backend in v1.

```
LevelSlot                 // static JSON shipped with app (levels.json)
  id: string             // e.g. "easy-7", "24-3", "daily-2026-05-09"
  tier: "easy" | "medium" | "hard" | "24"
  index: number          // 1-10 within tier (0 for daily)
  timeLimitSec: number   // Easy: 90s · Medium: 60s · Hard: 60s · 24: 90s

Level extends LevelSlot   // generated at runtime per access
  target: number         // randomized; Easy/Medium ≤100, Hard ≤999, 24 = always 24
  numbers: number[]      // Easy/Medium/Hard: 4 from 1–13; 24: 4 from 1–9
  allowedOps: Op[]       // all four ops for all tiers

Tier puzzle rules
  easy   — numbers 1–13, target 6–50,  time 90s
  medium — numbers 1–13, target 6–100, time 60s
  hard   — numbers 1–13, target 6–100, time 45s
  24     — numbers 1–9,  target = 24 (fixed), time 90s
  daily  — Easy rules (numbers 1–13, target 6–100), seeded by UTC date, time 90s (drops to 60s once dailyStreak.count ≥ 10)

PlayerProgress           // single object keyed "mathdash:progress"
  levels: Record<levelId, LevelResult>
  dailyStreak: { lastPlayedDate: string, count: number }
  settings: { soundOn: boolean, theme: string }

LevelResult
  solved: boolean
  stars: 0 | 1 | 2 | 3
  solvedAt: ISOString

SessionScore             // ephemeral — in-memory Zustand, resets on page close
  tierScores: Partial<Record<Tier, number>>
  score per level = Math.round(timeLimitSec − elapsed)

DailyPuzzle              // derived, not stored
  date: string           // YYYY-MM-DD UTC
  seed: number           // hash(date)
  level: Level           // generated deterministically from seed using Easy rules

ShareCard                // ephemeral, generated on solve
  levelId, tier, timeSec, stars, expression: string
```

Cardinality: one `PlayerProgress` per browser; one `LevelResult` per `Level` per player.

## 5. Nice-to-Have (Post-v1)

- Global leaderboard (requires backend + anonymous auth)
- Server-synced daily challenge with global solve stats ("12% solved today")
- $2.99 "Remove Ads" IAP via Stripe + cosmetic number themes store
- User accounts for cross-device sync
- Procedurally generated levels beyond level 10 per tier
- Hint system (cost: 1 star)
- Expression history log on the play screen showing each combine step (e.g. `8 + 4 = 12`, `12 × 3 = 36`) for clearer feedback and richer share cards
- Sound effects and haptic feedback
- PWA install prompt + offline mode
- Animations on tile combination (Framer Motion)
- Analytics dashboard for level difficulty tuning

## 6. Non-Functional Requirements

- **Auth**: none in v1 — anonymous play only
- **Payment**: none in v1 — ads and IAP deferred
- **Persistence**: localStorage only; no backend, no database
- **Performance**: p95 first-paint < 1.5s on 4G mobile; bundle < 200KB gzipped; 60fps interactions
- **Hosting**: static deploy (Vercel/Netlify/Cloudflare Pages); single-region CDN sufficient
- **Browsers**: latest 2 versions of Chrome, Safari, Firefox, Edge; mobile Safari and Chrome Android primary targets
- **Accessibility**: keyboard-navigable tile selection; ARIA labels on operators; respects `prefers-reduced-motion`
- **Share card**: rendered client-side via Canvas API; no server image generation
- **Analytics**: lightweight (Plausible or Umami) — page views + level completions only, no PII

## 7. Out of Scope

- Backend, database, or any server-side state
- User accounts, login, password reset, email
- Global leaderboard or any cross-user data
- In-app purchases, ads, payment processing
- Native mobile apps (iOS/Android)
- Internationalization — English UI only (numbers are universal)
- Admin panel or level editor UI
- Multiplayer or real-time features
- Push notifications
- Tutorial/onboarding flow beyond a single static hint on first launch
- Social login or share-to-platform deep integrations beyond image copy + URL

## 8. Assumptions & Risks

**Assumptions:**
- 30 hand-authored levels + a daily puzzle is enough content to drive 1k DAU retention for the first 90 days
- Casual players will accept localStorage-only progress (no cross-device sync) in v1
- A deterministic daily seed produces puzzles of acceptable quality without human curation

**Risks:**
- Without a global leaderboard, the "I solved Hard 7 in 12s" share card may lack social proof and underperform Wordle-style virality — mitigates DAU goal directly
- Procedural daily puzzles can generate trivially easy or unsolvable boards; needs a solver-based difficulty filter at generation time
- 30 levels is finite content; high-engagement players will exhaust it in days and churn before procedural generation ships in v2

## 9. Success Criteria

- **1,000 DAU sustained over a rolling 7-day window within 90 days of launch**, measured via Plausible/Umami unique daily visitors who complete at least one level
- **Day-7 retention ≥ 20%** (industry benchmark for casual web puzzles), measured via returning-visitor cohort on the daily challenge
