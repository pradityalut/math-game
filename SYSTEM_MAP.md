# SYSTEM_MAP.md

Primary navigation document for MathDash. Reverse-engineered from source.

## 1. Project Summary

- **Purpose**: MathDash — a zero-friction browser puzzle where players combine 4 number tiles with +, −, ×, ÷ to hit a target before a per-tier timer expires (Countdown / Game-24 mechanic). See [PRD.md](PRD.md).
- **Stack**: TypeScript + React 18 + Vite 6 + react-router-dom v6 + Zustand (with `persist` to localStorage) + Tailwind v4 (`@tailwindcss/vite`). Tests via Vitest + jsdom + Testing Library. No backend, no database.
- **Architecture**: Client-only SPA. Layered: `routes/` (pages) → `components/` (presentational) + `store/` (state) → `engine/` (pure game logic) + `lib/` (utilities). Levels are static JSON shipped with the bundle. Daily puzzles are derived deterministically from a date-seeded PRNG.

## 2. Core Logic Flow

```
Boot
  index.html → src/main.tsx[createRoot] → src/App.tsx[App/BrowserRouter]

Route: GET /
  App → routes/Home[Home] → useProgress.isUnlocked / getLevelResult
       → components/LevelCard → navigate(/play/:tier/:level)

Route: GET /play/:tier/:level
  App → routes/Play[Play] → loads level from data/levels.json
       → user input → engine/expression[evaluate, isWellFormed, isComplete, calcStars]
       → on solve → useProgress.recordSolve (persists to localStorage "mathdash:progress")
       → components/ResultModal → lib/canvas-share[renderShareCard] → PNG Blob

Route: GET /play/24/daily
  App → routes/DailyPlay → lib/prng[todayUTC]
       → engine/daily[getDailyPuzzle] → lib/prng[hashDateString, mulberry32]
                                       → engine/solver[hasSolution] (rejection-sample)
       → renders <Play levelOverride={...} onSolve={recordDailyPlay}/>

Route: GET /share/:resultId
  App → routes/Share (placeholder; resultId not persisted server-side)
```

## 3. Clean Tree

```
Game24/
├── index.html                  # Vite entry, loads /src/main.tsx
├── package.json                # scripts: dev/build/preview/test/verify-levels
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
    │   └── levels.json         # 30 hand-authored levels
    ├── routes/
    │   ├── Home.tsx            # tier/level selector
    │   ├── Play.tsx            # main gameplay screen (largest file, 429 LoC)
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
    │   ├── types.ts            # Op, Paren, Token, Tier, Level, LevelResult, PlayerProgress, ShareCardData
    │   ├── expression.ts       # tokens → eval, validation, star calc
    │   ├── solver.ts           # exhaustive search; hasSolution / solve
    │   ├── daily.ts            # date-seeded puzzle generator
    │   ├── expression.test.ts
    │   └── solver.test.ts
    ├── lib/
    │   ├── prng.ts             # mulberry32, hashDateString, todayUTC
    │   ├── canvas-share.ts     # client-side PNG share-card render
    │   └── cn.ts               # clsx + tailwind-merge helper
    ├── store/
    │   └── progress.ts         # Zustand + persist — single source of player state
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

- [src/routes/Home.tsx](src/routes/Home.tsx) — `Home` — tier picker + level grid; reads progress to lock/unlock; navigates to play screens.
  - Depends on: `store/progress`, `components/LevelCard`, `data/levels.json`, `engine/types`, `lib/cn`
  - Depended on by: `App`

- [src/routes/Play.tsx](src/routes/Play.tsx) — `Play` (default export, accepts `levelOverride` + `onSolve`) — full gameplay loop: token entry, live evaluation, timer, win detection, result modal.
  - Depends on: `store/progress`, `components/{NumberChip,ExpressionField,TimerBar,ResultModal}`, `engine/expression`, `engine/types`, `data/levels.json`, `lib/cn`
  - Depended on by: `App`, `routes/DailyPlay`

- [src/routes/DailyPlay.tsx](src/routes/DailyPlay.tsx) — `DailyPlay` — derives today's level via `getDailyPuzzle(todayUTC())` and renders `<Play levelOverride>` with daily-streak side effect.
  - Depends on: `routes/Play`, `engine/daily`, `lib/prng`, `store/progress`
  - Depended on by: `App`

- [src/routes/Share.tsx](src/routes/Share.tsx) — `Share` — share landing route; placeholder (no server-side resultId store).
  - Depends on: `react-router-dom`
  - Depended on by: `App`

- [src/store/progress.ts](src/store/progress.ts) — `useProgress` — Zustand store with `persist` middleware (key `mathdash:progress`); actions: `recordSolve`, `recordDailyPlay`, `isUnlocked`, `getLevelResult`, `resetAll`.
  - Depends on: `zustand`, `engine/types`, `data/levels.json`
  - Depended on by: `routes/Home`, `routes/Play`, `routes/DailyPlay`

- [src/engine/types.ts](src/engine/types.ts) — shared types — `Op | Paren | Token | Tier | Level | LevelResult | PlayerProgress | ShareCardData`.
  - Depends on: —
  - Depended on by: nearly everything

- [src/engine/expression.ts](src/engine/expression.ts) — `tokensToString`, `evaluate`, `isWellFormed`, `isComplete`, `usedChipIndices`, `calcStars`, `makeNumToken`, `makeOpToken`, `makeParenToken` — pure expression engine over the `Token[]` model.
  - Depends on: `engine/types`
  - Depended on by: `routes/Play`, `engine/expression.test`

- [src/engine/solver.ts](src/engine/solver.ts) — `solve`, `hasSolution` — exhaustive operator-permutation search used to validate generated puzzles.
  - Depends on: `engine/types`
  - Depended on by: `engine/daily`, `engine/solver.test`

- [src/engine/daily.ts](src/engine/daily.ts) — `getDailyPuzzle(date)` — picks a candidate number pool by date hash, rejection-samples until `hasSolution` succeeds.
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
- **Core data schema** (TypeScript-defined in [src/engine/types.ts](src/engine/types.ts); persisted to `localStorage`):
  - `Level { id, tier: 'easy'|'medium'|'hard'|'24', index, target, numbers[4], allowedOps[], timeLimitSec }` — static, shipped in [src/data/levels.json](src/data/levels.json).
  - `LevelResult { solved, bestTimeSec, stars: 0|1|2|3, solvedAt }` — keyed by level id within `PlayerProgress`.
  - `PlayerProgress { version, levels: Record<id,LevelResult>, dailyStreak: { lastPlayedDate, count }, settings: { soundOn, theme } }` — single object stored at localStorage key `mathdash:progress`.
  - `Token = { kind:'num', value, chipIdx } | { kind:'op', value:Op } | { kind:'paren', value:Paren }` — in-memory expression model.
  - `ShareCardData` — ephemeral, generated per solve.
  - Relation: one `PlayerProgress` per browser; one `LevelResult` per `Level.id`; daily puzzles are derived (not stored).
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
- [HIGH] `scripts/verify-levels.ts` is referenced by `package.json` script `verify-levels` but the `scripts/` directory does not exist — running the script will fail, so the 30 hand-authored levels in [src/data/levels.json](src/data/levels.json) have no automated solvability check. Risk: an unsolvable shipped level.
- [MED] Daily-puzzle generator [src/engine/daily.ts](src/engine/daily.ts) uses rejection sampling against `hasSolution` but has no difficulty filter — daily puzzle could be trivially easy (matches PRD risk note).
- [MED] [src/routes/Play.tsx](src/routes/Play.tsx) is 429 LoC and concentrates input handling, timer, evaluation, and persistence — largest file, highest change-amplification risk; ripe for extraction into hooks.
- [MED] `useProgress` `persist` declares `version: 1` but no migration function — a future schema bump will silently load stale data or throw. See [src/store/progress.ts](src/store/progress.ts).
- [MED] [src/lib/canvas-share.ts](src/lib/canvas-share.ts) has no test coverage; PNG output relies on Canvas behavior that varies across browsers (especially mobile Safari).
- [LOW] `levels.json` is imported as a static module — works for 30 entries but precludes lazy-loading if level count grows.
- [LOW] No tests for routes, components, store, daily generator, or PRNG — only `engine/expression` and `engine/solver` are covered.
- [LOW] `dailyStreak.count` increment in `recordDailyPlay` ([src/store/progress.ts](src/store/progress.ts)) compares against `yesterday` computed from local clock at save time — across DST or device timezone changes the streak can desync from the UTC date used to seed the puzzle.
- [LOW] No input boundary validation on `useParams()` in `Play` — a hand-crafted URL like `/play/foo/999` flows directly into a `levels.find` lookup; behavior on miss should be confirmed.
