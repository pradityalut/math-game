# Audio Layer — Implementation Plan

**Source of truth:** [audio-layer-design.md](audio-layer-design.md). Refer to it for rationale and decision log; this file is execution-only.

Order is bottom-up: leaf module first, integration last. Each task has an explicit verify step. Do not start task N+1 until task N verify passes.

---

## Task 1 — Create `src/lib/audio.ts`

**Goal:** Singleton `AudioContext` + 7 public functions (`resumeContext`, `playTick`, `playTickAccent`, `playWin`, `playTimeUp`, `startBgm`, `stopBgm`) per design §3.2.

**Subtasks:**
- Lazy `getCtx()` with WebKit fallback wrapped in try/catch.
- Internal `blip(freq, durMs, gain, type?)` helper.
- `playWin` chains 3 blips via `setTimeout` (or scheduled `start()` offsets).
- `playTimeUp` uses `exponentialRampToValueAtTime` on `oscillator.frequency`.
- `startBgm`: 3 sine osc (C3 130.8 / E3 164.8 / G3 196 Hz), each `detune.value = ±5`, through one `GainNode` (target 0.08, 1 s fade-in). Store nodes in module-scoped `bgmNodes`.
- `stopBgm`: 0.5 s linear fade-out, then `osc.stop()` + `disconnect()`. Idempotent.

**Verify:**
- `npm run build` passes.
- Open browser devtools, run `import('./src/lib/audio.ts').then(m => { m.resumeContext(); m.playWin(); })` from a temp `<button onClick>` — confirm sound.
- No console errors.

---

## Task 2 — Update `src/engine/types.ts`

**Goal:** Replace `settings.soundOn` with `settings.sfxOn` and `settings.bgmOn`.

**Subtasks:**
- In `PlayerProgress.settings`, delete `soundOn`, add `sfxOn: boolean` and `bgmOn: boolean`.

**Verify:**
- `npm run build` will fail at every site that reads `settings.soundOn`. Confirm those sites are only `store/progress.ts` (initial state) — nothing else, per SYSTEM_MAP. If anything outside `progress.ts` references `soundOn`, stop and reassess.

---

## Task 3 — Update `src/store/progress.ts`

**Goal:** Default state, two new actions, persist migrator v1 → v2.

**Subtasks:**
- Default state: `settings: { sfxOn: true, bgmOn: false, theme: 'light' }`.
- Add action `toggleSfx`: flip `settings.sfxOn`, no side effect.
- Add action `toggleBgm`: flip `settings.bgmOn`; if new value true → `audio.startBgm()`, else `audio.stopBgm()`.
- `import * as audio from '../lib/audio'`.
- Bump persist `version: 1 → 2`. Add `migrate(persisted, version)` that, for `version < 2`, maps `soundOn` → `sfxOn` and sets `bgmOn: false`. Strip `soundOn` from the object.

**Verify:**
- `npm run build` passes (after tasks 2+3 together).
- In devtools, set `localStorage["mathdash:progress"]` to a v1-shaped object with `soundOn: false`, reload, inspect store state → `sfxOn: false, bgmOn: false`. Repeat with `soundOn: true` → `sfxOn: true, bgmOn: false`.

---

## Task 4 — Create `src/components/SoundToggles.tsx`

**Goal:** Two icon buttons bound to store actions per design §3.4.

**Subtasks:**
- Read `sfxOn`, `bgmOn`, `toggleSfx`, `toggleBgm` from `useProgress` via individual selectors.
- Emoji placeholders: 🔊 / 🔇 for SFX; 🎵 / 🎶 for BGM.
- `aria-label` reflects current state (`'Mute SFX'` / `'Unmute SFX'`, etc).
- Container `<div className="flex gap-2">`.

**Verify:**
- Component renders in isolation (temporarily drop into Home before Task 6). Click both icons — store state updates in devtools.

---

## Task 5 — Wire `src/App.tsx`

**Goal:** First-gesture listener that resumes context and conditionally bootstraps BGM.

**Subtasks:**
- `useEffect(..., [])` registers `pointerdown` once-listener on `window`.
- Handler: `audio.resumeContext()`; if `useProgress.getState().settings.bgmOn`, `audio.startBgm()`.
- Cleanup removes the listener on unmount (defensive, though App is root).

**Verify:**
- Manual: load app; before any click, `audioContext.state` (via devtools) is `suspended`. After first click anywhere, becomes `running`.
- With localStorage `bgmOn: true` seeded, first click triggers fade-in audibly.

---

## Task 6 — Wire `src/routes/Home.tsx`

**Goal:** Render `<SoundToggles />` in Home header area.

**Subtasks:**
- Import + place near existing session-score / tier-tabs area. Keep diff to ≤ 3 lines.

**Verify:**
- Toggles visible on Home. No visual regression on level grid / daily button.

---

## Task 7 — Wire `src/routes/Play.tsx`

**Goal:** Trigger tick / accent / win / time-up at the right moments.

**Subtasks:**
- Add `const lastTickedSec = useRef<number | null>(null);` near other refs.
- Inside the timer effect (whichever already reads `remainingMs`), add a derived `sec = Math.ceil(remainingMs / 1000)`. Guard: `useProgress.getState().settings.sfxOn`. If `sec` in `[1,10]` and `sec !== lastTickedSec.current`, set ref and call `playTickAccent()` when `sec <= 3` else `playTick()`.
- In the existing solve branch (where `ResultModal` is opened), before opening modal: `if (useProgress.getState().settings.sfxOn) audio.playWin();`.
- In the existing expired branch: `if (useProgress.getState().settings.sfxOn) audio.playTimeUp();`.
- Reset `lastTickedSec.current = null` when level changes (in the same effect that re-generates puzzle).

**Verify:**
- Manual: play easy-1, wait until 10 s remaining — tick fires every second; 3-2-1 sound distinct.
- Solve a puzzle → win sound at modal open.
- Let timer expire → time-up sound fires once.
- Toggle SFX off → silence on next event.

---

## Task 8 — Add `src/store/progress.test.ts`

**Goal:** Cover the two new actions + v1 → v2 migrator.

**Subtasks:**
- `vi.mock('../lib/audio', () => ({ startBgm: vi.fn(), stopBgm: vi.fn() }))` (only the functions called from store).
- Test: initial `sfxOn === true`, `bgmOn === false`.
- Test: `toggleSfx()` flips state; no audio call.
- Test: `toggleBgm()` to true → `startBgm` called once; toggle back → `stopBgm` called once.
- Test: migrator with `{ version: 1, state: { settings: { soundOn: false, theme: 'light' }, ... } }` produces `sfxOn: false, bgmOn: false`, no leftover `soundOn`.
- Test: same with `soundOn: true` → `sfxOn: true, bgmOn: false`.

**Verify:**
- `npm run test` passes including new file.

---

## Task 9 — Final build + manual verification

**Goal:** Full checklist from design §3.6 step 9 + items 1–8.

**Subtasks:**
- `npm run build` clean.
- `npm run test` clean.
- Run through manual checklist 1–8 in Chromium.
- Spot-check on iOS Safari (real device or Responsive mode with `Touch` simulation) — verify first-gesture resume.

**Verify:**
- All 9 manual items pass. Document any deviation back into design doc before declaring done.

---

## Task 10 — Update `SYSTEM_MAP.md` per its §6 checklist

**Goal:** Reflect structural changes.

**Subtasks:**
- Add `src/lib/audio.ts` and `src/components/SoundToggles.tsx` to the clean tree and Module Map.
- Update `PlayerProgress` shape in §5 (Data & Config) — replace `soundOn` with `sfxOn`, `bgmOn`.
- Remove the `[MED]` risk entry about `version: 1` lacking a migrator (now version 2, migrator exists for this field).
- Note that all other risks remain unchanged.

**Verify:**
- Re-read SYSTEM_MAP. Every modified/created file from tasks 1–8 is reflected. Risk list is accurate.

---

## Rollback plan

If Task 7 (Play.tsx wiring) causes timer regression, revert Play.tsx only — audio module stays inert (no callers from gameplay) and toggles continue to function in Home. Migrator is forward-only: if rolled back to old code, users keep `sfxOn`/`bgmOn` in localStorage harmlessly because old code ignored unknown fields.

## Out of scope (do not touch)

- `routes/DailyPlay.tsx`, `routes/Share.tsx`, `engine/*`, `lib/canvas-share.ts`, `lib/prng.ts`, `lib/cn.ts`, `store/session.ts`.
- Any unrelated SYSTEM_MAP `[HIGH]`/`[MED]` risk.
- Visual redesign of Home header.
