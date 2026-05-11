# SYSTEM_MAP.md

Primary navigation document for MathDash. Reverse-engineered from source.

## 1. Project Summary

- **Purpose**: MathDash — a zero-friction browser puzzle where players combine 4 number tiles with +, −, ×, ÷ to hit a target before a per-tier timer expires (Countdown / Game-24 mechanic). See [PRD.md](PRD.md).
- **Stack**: TypeScript + React 18 + Vite 6 + react-router-dom v6 + Zustand (with `persist` to localStorage for progress; in-memory for session score) + Tailwind v4 (`@tailwindcss/vite`). Tests via Vitest + jsdom + Testing Library. No backend, no database.
- **Architecture**: Client-only SPA. Layered: `routes/` (pages) → `components/` (presentational) + `store/` (state) → `engine/` (pure game logic) + `lib/` (utilities). Levels are **slot metadata only** (id/tier/index/timeLimit) — actual puzzles (numbers + target) are generated at runtime by [engine/puzzle.ts](src/engine/puzzle.ts). Daily puzzles are derived deterministically from a date-seeded PRNG.

## 2. Core Logic Flow

```
Boot
  index.html → src/main.tsx[createRoot] → src/App.tsx[App/BrowserRouter]

Route: GET /
  App → routes/Home[Home]
        → useProgress.isUnlocked / getLevelResult
        → useSession.getTierScore
        → components/LevelCard
        → navigate(/play/:tier/:level)

Route: GET /play/:tier/:level
  App → routes/Play[Play]
       → loads slot from data/levels.json (id/tier/index/timeLimit)
       → engine/puzzle[generatePuzzle(tier)] (uses engine/solver.allAchievable)
       → useProgress.markVisited (on mount; unlocks card for re-entry)
       → user input → engine/expression[evaluate, isWellFormed, isComplete, calcStars]
       → on solve → useProgress.recordSolve (persists to localStorage "mathdash:progress")
       → useSession.addScore(tier, pts) (in-memory only)
       → components/ResultModal → lib/canvas-share[renderShareCard] → PNG Blob

Route: GET /play/24/daily
  App → routes/DailyPlay → lib/prng[todayUTC]
       → engine/daily[getDailyPuzzle] → lib/prng[hashDateString, mulberry32]
       → engine/solver[allAchievable]
       → renders <Play levelOverride={...} onSolve={recordDailyPlay}/>

Route: GET /share/:resultId
  App → routes/Share (placeholder; resultId not persisted server-side)
```

## 3. Clean Tree

```
Game24/
├── index.html                  # Vite entry, loads /src/main.tsx
├── package.json                # scripts: dev/build/preview/test
├── vite.config.ts              # react + tailwind plugins; vitest jsdom config
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── PRD.md                      # product spec
├── CLAUDE.md                   # contributor guidelines
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                # createRoot → <App/>
    ├── App.tsx                 # BrowserRouter + 4 routes
    ├── index.css               # Tailwind v4 entry
    ├── data/
    │   └── levels.json         # 32 level slots (8 per tier × 4 tiers) — metadata only
    ├── routes/
    │   ├── Home.tsx            # tier tabs + level grid + daily entry
    │   ├── Play.tsx            # main gameplay screen (430 LoC)
    │   ├── DailyPlay.tsx       # daily-puzzle wrapper around Play
    │   └── Share.tsx           # share landing (stub)
    ├── components/
    │   ├── LevelCard.tsx
    │   ├── NumberChip.tsx
    │   ├── Tile.tsx
    │   ├── OperatorBar.tsx
    │   ├── ExpressionField.tsx
    │   ├── TimerBar.tsx
    │   ├── StarRow.tsx
    │   └── ResultModal.tsx
    ├── engine/
    │   ├── types.ts            # Op, Paren, Token, Tier, LevelSlot, Level, LevelResult, PlayerProgress, ShareCardData
    │   ├── expression.ts       # tokens → eval, validation, star calc
    │   ├── solver.ts           # exhaustive search; solve / hasSolution / allAchievable
    │   ├── puzzle.ts           # runtime per-tier puzzle generator
    │   ├── daily.ts            # date-seeded puzzle generator
    │   ├── expression.test.ts
    │   └── solver.test.ts
    ├── lib/
    │   ├── prng.ts             # mulberry32, hashDateString, todayUTC
    │   ├── canvas-share.ts     # client-side PNG share-card render
    │   └── cn.ts               # clsx + tailwind-merge helper
    ├── store/
    │   ├── progress.ts         # Zustand + persist — persisted player progress
    │   └── session.ts          # Zustand (no persist) — per-session tier scores
    └── test/
        └── setup.ts            # @testing-library/jest-dom setup
```

## 4. Module Map

- [src/main.tsx](src/main.tsx) — `createRoot` mount — boots React into `#root`.
  - Depends on: `App`, `index.css`
  - Depended on by: `index.html`

- [src/App.tsx](src/App.tsx) — `App` — declares 4 routes (`/`, `/play/:tier/:level`, `/play/24/daily`, `/share/:resultId`).
  - Depends on: `react-router-dom`, all `routes/*`
  - Depended on by: `main.tsx`

- [src/routes/Home.tsx](src/routes/Home.tsx) — `Home` — tier tabs + level grid; reads progress to lock/unlock; surfaces daily streak and session score; navigates to play screens.
  - Depends on: `store/progress`, `store/session`, `components/LevelCard`, `data/levels.json`, `engine/types`, `lib/cn`
  - Depended on by: `App`

- [src/routes/Play.tsx](src/routes/Play.tsx) — `Play` (default export, accepts `levelOverride` + `onSolve`) — full gameplay loop: generates puzzle on mount via `generatePuzzle`, marks slot visited, token entry, live evaluation, timer, win detection, scoring, result modal.
  - Depends on: `store/progress`, `store/session`, `engine/puzzle`, `engine/expression`, `engine/types`, `components/{NumberChip,ExpressionField,TimerBar,ResultModal}`, `data/levels.json`, `lib/cn`
  - Depended on by: `App`, `routes/DailyPlay`

- [src/routes/DailyPlay.tsx](src/routes/DailyPlay.tsx) — `DailyPlay` — derives today's puzzle via `getDailyPuzzle(todayUTC())` and renders `<Play levelOverride>` with daily-streak side effect.
  - Depends on: `routes/Play`, `engine/daily`, `lib/prng`, `store/progress`
  - Depended on by: `App`

- [src/routes/Share.tsx](src/routes/Share.tsx) — `Share` — share landing route; placeholder (no server-side resultId store).
  - Depends on: `react-router-dom`
  - Depended on by: `App`

- [src/store/progress.ts](src/store/progress.ts) — `useProgress` — Zustand store with `persist` middleware (key `mathdash:progress`); actions: `recordSolve`, `recordDailyPlay`, `markVisited`, `isUnlocked` (true if `visited || solved`), `getLevelResult`, `resetAll`.
  - Depends on: `zustand`, `engine/types`
  - Depended on by: `routes/Home`, `routes/Play`, `routes/DailyPlay`

- [src/store/session.ts](src/store/session.ts) — `useSession` — Zustand store (NOT persisted) tracking per-tier `tierScores`; actions: `addScore`, `resetTier`, `getTierScore`. Scores reset on page reload by design.
  - Depends on: `zustand`, `engine/types`
  - Depended on by: `routes/Home`, `routes/Play`

- [src/engine/types.ts](src/engine/types.ts) — shared types — `Op | Paren | Token | Tier | LevelSlot | Level | LevelResult | PlayerProgress | ShareCardData`. `LevelSlot` (id, tier, index, timeLimitSec) is what's stored in `levels.json`; `Level` extends it with runtime-generated `target`, `numbers`, `allowedOps`. `LevelResult` carries `solved`, `visited`, `stars`, `solvedAt`.
  - Depends on: —
  - Depended on by: nearly everything

- [src/engine/expression.ts](src/engine/expression.ts) — `tokensToString`, `evaluate`, `isWellFormed`, `isComplete`, `usedChipIndices`, `calcStars`, `makeNumToken`, `makeOpToken`, `makeParenToken` — pure expression engine over the `Token[]` model.
  - Depends on: `engine/types`
  - Depended on by: `routes/Play`, `engine/expression.test`

- [src/engine/solver.ts](src/engine/solver.ts) — `solve`, `hasSolution`, `allAchievable` — exhaustive operator-permutation search; `allAchievable` returns the set of integer values reachable from the 4 inputs, used by both puzzle generators to guarantee solvability.
  - Depends on: `engine/types`
  - Depended on by: `engine/puzzle`, `engine/daily`, `engine/solver.test`

- [src/engine/puzzle.ts](src/engine/puzzle.ts) — `generatePuzzle(tier)` — runtime puzzle generator. For `'24'`: 4 numbers from 1–9, target fixed at 24, validated via `hasSolution`. For other tiers: 4 numbers from 1–13, target picked from `allAchievable` filtered by tier cap (`hard` ≤ 999, else ≤ 100) and `> 5` and not equal to any input number. Falls back to a hard-coded puzzle if attempt budget exhausts.
  - Depends on: `engine/solver`, `engine/types`
  - Depended on by: `routes/Play`

- [src/engine/daily.ts](src/engine/daily.ts) — `getDailyPuzzle(date)` — date-seeded variant of the puzzle generator. Despite `tier: '24'`, currently uses **easy-style** targets (6–100, achievable from 1–13 pool), not literal "make 24". See risks.
  - Depends on: `lib/prng`, `engine/solver`, `engine/types`
  - Depended on by: `routes/DailyPlay`

- [src/lib/prng.ts](src/lib/prng.ts) — `mulberry32`, `hashDateString`, `todayUTC` — deterministic PRNG + date helpers.
  - Depends on: —
  - Depended on by: `engine/daily`, `routes/DailyPlay`

- [src/lib/canvas-share.ts](src/lib/canvas-share.ts) — `renderShareCard(data) → Blob` — draws the result card to an offscreen canvas and exports PNG.
  - Depends on: `engine/types`
  - Depended on by: `components/ResultModal`

- [src/lib/cn.ts](src/lib/cn.ts) — `cn(...inputs)` — class-name merge helper.
  - Depends on: `clsx`, `tailwind-merge`
  - Depended on by: most components + routes

- [src/components/LevelCard.tsx](src/components/LevelCard.tsx) — `LevelCard` — clickable card showing stars + lock state; navigates to play.
  - Depends on: `react-router-dom`, `StarRow`, `engine/types`, `lib/cn`
  - Depended on by: `routes/Home`

- [src/components/NumberChip.tsx](src/components/NumberChip.tsx), [Tile.tsx](src/components/Tile.tsx), [OperatorBar.tsx](src/components/OperatorBar.tsx), [ExpressionField.tsx](src/components/ExpressionField.tsx), [TimerBar.tsx](src/components/TimerBar.tsx), [StarRow.tsx](src/components/StarRow.tsx) — presentational gameplay widgets.
  - Depended on by: `routes/Play`, `components/ResultModal`

- [src/components/ResultModal.tsx](src/components/ResultModal.tsx) — `ResultModal` — post-solve overlay; calls `renderShareCard` and copies image/link.
  - Depends on: `react-router-dom`, `StarRow`, `lib/canvas-share`, `engine/types`
  - Depended on by: `routes/Play`

## 5. Data & Config

- **Env / config**:
  - `.env`, `.env.local` — gitignored, currently absent. No env vars referenced in source.
  - Build/runtime config: [vite.config.ts](vite.config.ts), [tsconfig.app.json](tsconfig.app.json).
- **Core data schema** (TypeScript-defined in [src/engine/types.ts](src/engine/types.ts)):
  - `LevelSlot { id, tier, index, timeLimitSec }` — what ships in [src/data/levels.json](src/data/levels.json) (32 entries, 8 per tier).
  - `Level extends LevelSlot { target, numbers[4], allowedOps[] }` — runtime-only; produced by `generatePuzzle` / `getDailyPuzzle`. Never persisted.
  - `LevelResult { solved, visited, stars: 0|1|2|3, solvedAt }` — keyed by level id within `PlayerProgress`. `visited` is set when Play mounts; `solved` is set on win. `bestTimeSec` no longer tracked.
  - `PlayerProgress { version, levels, dailyStreak: { lastPlayedDate, count }, settings: { soundOn, theme } }` — persisted to localStorage at `mathdash:progress`.
  - `tierScores: Partial<Record<Tier, number>>` — in-memory session state in `useSession`, not persisted.
  - `Token = { kind:'num', value, chipIdx } | { kind:'op', value:Op } | { kind:'paren', value:Paren }` — in-memory expression model.
  - `ShareCardData` — ephemeral, generated per solve.
  - Unlock relation: `LevelCard` is unlocked when `index === 1` OR `useProgress.isUnlocked(id)` is true (i.e. `visited || solved`). Visiting any unlocked level seeds its `visited` flag, which gates re-entry but does NOT cascade to subsequent levels — progression beyond index 1 currently depends on user-initiated navigation, not chained unlocks.
- **Migrations / seed**: none. `levels.json` is the seed; `persist` middleware tags state with `version: 1` for future migrations (no migrator wired yet).
- **Output / runtime artifacts**: `dist/` (Vite build output, gitignored); `*.tsbuildinfo` (gitignored); browser localStorage at key `mathdash:progress`.

## 6. External Integrations & Risks

### Integrations

| Vendor | Purpose | Entry file | Auth |
|---|---|---|---|
| Google Fonts (Fredoka, Nunito) | Typography | [index.html](index.html) | None (public CDN) |
| Browser Canvas API | Share-card PNG render | [src/lib/canvas-share.ts](src/lib/canvas-share.ts) | None |
| Browser localStorage | Progress persistence | [src/store/progress.ts](src/store/progress.ts) | None |

No backend, analytics, payment, or auth integrations exist (all deferred per [PRD.md §6-§7](PRD.md)).

### Risks / Blind Spots

- [HIGH] `Share` route is a stub — `/share/:resultId` cannot resolve a real result because no result store exists; share UX relies entirely on `ResultModal` copy-image / copy-link in-page. See [src/routes/Share.tsx](src/routes/Share.tsx).
- [HIGH] Daily puzzle is mislabeled. [src/engine/daily.ts](src/engine/daily.ts) tags the level with `tier: '24'` but generates an **easy-tier-style** puzzle (numbers 1–13, target 6–100). Home UI advertises "Make 24" on the daily button, and players reach the daily expecting target=24. Either the generator or the UI copy is wrong.
- [HIGH] Level progression has no chained unlock. [src/store/progress.ts](src/store/progress.ts) `isUnlocked` returns true only if a level was visited or solved; nothing in `recordSolve` marks the *next* level visited. Combined with `LevelCard` only force-unlocking `index === 1`, players can solve `easy-1` and find `easy-2` still locked unless `markVisited` is somehow triggered for it. Confirm whether this matches design intent.
- [MED] No automated solvability check for shipped slots — but the static `levels.json` no longer carries puzzles, so this risk has shifted: it now lives in the two runtime generators ([engine/puzzle.ts](src/engine/puzzle.ts), [engine/daily.ts](src/engine/daily.ts)), each of which falls back to a hard-coded puzzle (`[3,8,3,8]` target 24 / `[3,7,8,12]` target 24) after a bounded attempt loop. Fallbacks are reachable but untested.
- [MED] No difficulty calibration. `generatePuzzle('easy')` and `generatePuzzle('medium')` use the same number pool and target range — the only knob that differs across non-hard tiers is `timeLimitSec` from `levels.json`. Tier label and actual difficulty can diverge.
- [MED] [src/routes/Play.tsx](src/routes/Play.tsx) is 430 LoC and concentrates puzzle generation, input handling, timer, evaluation, scoring, and persistence — largest file, highest change-amplification risk; ripe for extraction into hooks.
- [MED] `useProgress` `persist` declares `version: 1` but no migration function — and the `LevelResult` shape recently gained `visited` / dropped `bestTimeSec`. Existing localStorage records from earlier builds will load with `visited: undefined`, which silently flows through `isUnlocked` as `false` — meaning returning players may see previously-unlocked levels relocked unless they had `solved: true`.
- [MED] [src/lib/canvas-share.ts](src/lib/canvas-share.ts) has no test coverage; PNG output relies on Canvas behavior that varies across browsers (especially mobile Safari).
- [LOW] `useSession` is in-memory only by design (scores reset per page load). If this is intentional it should be documented in `Home.tsx`; otherwise add `persist`.
- [LOW] No tests for routes, components, stores, puzzle generator, daily generator, or PRNG — only `engine/expression` and `engine/solver` are covered.
- [LOW] `dailyStreak.count` increment in `recordDailyPlay` ([src/store/progress.ts](src/store/progress.ts)) compares against `yesterday` computed from local clock at save time — across DST or device timezone changes the streak can desync from the UTC date used to seed the puzzle.
- [LOW] No input boundary validation on `useParams()` in `Play` — a hand-crafted URL like `/play/foo/999` flows directly into a `levels.find` lookup; behavior on miss should be confirmed.
- [LOW] The `totalSolved` denominator in [src/routes/Home.tsx](src/routes/Home.tsx) is hard-coded to `32` instead of `levels.length`; a change to `levels.json` size will leave the UI out of sync.
