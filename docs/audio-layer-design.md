# Audio Layer — Design Document

**Status:** Design finalized via `/brainstorming` session on 2026-05-15.
**Author:** Praditya L (facilitated by Claude).
**Implementation:** not started.

---

## 1. Understanding Summary

- **What:** Add an audio layer to MathDash — 3 synthesized SFX (countdown tick, win, time-up) + 1 synthesized BGM (ambient C-major pad), with two independent toggles surfaced as icons on the Home screen.
- **Why:** Provide aural feedback at critical moments (countdown tension, success, failure) and an optional ambient mood. Activates the dormant `soundOn` setting that has existed in types but was never wired up.
- **Who:** Existing MathDash players. SFX defaults ON (gameplay feedback); BGM defaults OFF (opt-in mood).
- **Key constraint:** No external audio assets. All sound is synthesized at runtime via Web Audio API (oscillator + gain). Client-only, no backend.
- **Non-goals:**
  - Tap-chip / operator / backspace SFX.
  - Per-tier BGM variants.
  - Volume slider.
  - Dedicated settings page or route.
  - Haptic feedback.
  - Fixing unrelated SYSTEM_MAP risks (daily mislabel, chained unlock).

## 2. Assumptions

1. BGM is active across the whole app (Home and Play), not just during gameplay.
2. The countdown tick applies to every tier, including hard tiers whose time limit may be ≤ 10s — in which case the tick activates from the start.
3. The `win` sound fires synchronously with `ResultModal` appearing, not at the end of any animation.
4. Migration of existing players: `soundOn: true` → `sfxOn: true, bgmOn: false`; `soundOn: false` → `sfxOn: false, bgmOn: false`.
5. Default synth character (revisable during implementation):
   - Tick: sine 880 Hz, 60 ms, gain 0.15.
   - Tick accent (sec 3/2/1): sine 1320 Hz, 80 ms, gain 0.2.
   - Win: arpeggio C5 → E5 → G5, 100 ms each, sine.
   - Time-up: saw sweep 440 → 220 Hz over 400 ms.
   - BGM: 3 detuned sine oscillators (C3, E3, G3, ±5 cent), single gain 0.08, 1 s fade-in / 0.5 s fade-out.

## 3. Final Design

### 3.1 Architecture

```
audio.ts (Web Audio API singleton)
  ↑
  ├── store/progress.ts        (toggleBgm side-effect → audio.startBgm / stopBgm)
  ├── routes/Play.tsx          (gameplay events → audio.play* gated by settings.sfxOn)
  ├── App.tsx                  (first-gesture resumeContext + bootstrap BGM)
  └── components/SoundToggles  (UI → store actions)
```

**New files:**
- `src/lib/audio.ts` — singleton `AudioContext` + public functions.
- `src/components/SoundToggles.tsx` — two icon buttons.

**Modified files:**
- `src/engine/types.ts` — `settings.soundOn` removed; `sfxOn`, `bgmOn` added.
- `src/store/progress.ts` — default settings, new `toggleSfx` / `toggleBgm` actions, persist `version: 2` migrator.
- `src/App.tsx` — first-gesture effect resumes context and conditionally starts BGM.
- `src/routes/Home.tsx` — render `<SoundToggles />` in header area.
- `src/routes/Play.tsx` — tick boundary detection, win/time-up hooks.

### 3.2 `audio.ts` Public API

```ts
resumeContext(): void
playTick(): void
playTickAccent(): void
playWin(): void
playTimeUp(): void
startBgm(): void
stopBgm(): void
```

- Single lazy `AudioContext` (with WebKit fallback). Wrapped in try/catch so unsupported browsers no-op without crashing.
- SFX functions do **not** read settings — caller is responsible for `sfxOn` check. This keeps call sites explicit.
- `startBgm` / `stopBgm` are idempotent via internal `bgmNodes` state.

### 3.3 Settings & Persistence

```ts
settings: {
  sfxOn: boolean;   // default true
  bgmOn: boolean;   // default false
  theme: 'light' | 'dark';
}
```

Persist key remains `mathdash:progress`. `version: 1 → 2` migrator translates legacy `soundOn` into `sfxOn`, sets `bgmOn: false`. Removes the dormant `[MED]` SYSTEM_MAP risk about a missing migrator (for this field only).

### 3.4 Component Integration

- **`App.tsx`** registers a `pointerdown` listener with `{ once: true }` that calls `audio.resumeContext()` and, if `settings.bgmOn` is true, `audio.startBgm()`. This handles mobile autoplay policy in one place.
- **`SoundToggles.tsx`** is a stateless pair of `<button>` elements bound to `toggleSfx` / `toggleBgm`. Emoji placeholders (🔊 / 🔇, 🎵 / 🎶), trivially swappable to SVG later.
- **`Play.tsx`** uses a `lastTickedSec` ref to fire `playTick` / `playTickAccent` exactly once per integer second boundary in the last 10 s. `sfxOn` is read with `useProgress.getState()` to avoid re-render churn. Win / time-up branches gain a guarded `audio.playWin()` / `audio.playTimeUp()` call.

### 3.5 Edge Cases

| Scenario | Handling |
|---|---|
| No prior gesture; tick fires | Context is `suspended` → silent, no crash. Next tick after first tap is audible. |
| Navigation Home ↔ Play with BGM on | `App` mounts once; BGM persists. |
| Reload with BGM on | First gesture triggers auto-start. |
| Toggle BGM off mid-game | `stopBgm` fades out; SFX unaffected. |
| Hard tier ≤ 10 s timer | Tick active from start; win/time-up still fire once each. |
| Browser without Web Audio | All audio functions no-op via try/catch. |
| Tab backgrounded | Browser-level auto-suspend; resume on tab focus is browser default. |
| Legacy `soundOn: false` user | Migrator → silent until manual toggle. |

### 3.6 Testing Strategy

- **No unit tests for `audio.ts`** — jsdom lacks `AudioContext`; mocking yields near-zero coverage value.
- **New: `store/progress.test.ts`** — covers `toggleSfx`, `toggleBgm` state transitions and the v1 → v2 migrator (`lib/audio` mocked via `vi.mock`).
- **Manual verification checklist** (mandatory before declaring done):
  1. Fresh localStorage shows both icons; SFX on, BGM off.
  2. Tick audible in last 10 s; accent distinct at 3/2/1.
  3. Win sound plays when `ResultModal` appears.
  4. Time-up sound plays on timer expiry.
  5. BGM toggle fades in/out and persists across Home ↔ Play.
  6. SFX toggle silences gameplay sounds without affecting BGM.
  7. Simulated legacy `soundOn: false` reload → `sfxOn: false` after migrator.
  8. Mobile Safari (or simulated): first tap resumes context; subsequent ticks audible.
  9. `npm run build` and `npm run test` pass.

## 4. Decision Log

| # | Decision | Alternatives considered | Rationale |
|---|---|---|---|
| 1 | Scope = audio layer only | Bundle with daily-fix + hint system | User chose focused single feature. |
| 2 | 3 SFX events (tick, win, time-up) | Add tap chip / button SFX | Avoid noise; focus on critical moments. |
| 3 | Tick flat 10–4 + accent 3–2–1 | Flat; accelerating; single warning | Progressive tension without annoyance. |
| 4 | BGM included, default OFF | No BGM; default ON | Opt-in mood; respect public-play context. |
| 5 | Synth-only (SFX & BGM) | mp3/ogg files; hybrid | Zero asset, zero network, smallest bundle. |
| 6 | Two icons on Home | Settings modal; `/settings` route | Smallest surgical change. |
| 7 | SFX default ON, BGM default OFF | Both ON; both OFF | SFX = gameplay feedback; BGM = taste. |
| 8 | Replace `soundOn` with `sfxOn` + `bgmOn` | Reuse `soundOn`; nested object | Clear semantics; simple migration. |
| 9 | Singleton module + store action | Custom `useAudio` hook; event emitter | Lowest indirection; matches codebase style. |
| 10 | `audio.ts` does not gate `sfxOn` | Internal gate | Explicit at call sites. |
| 11 | First-gesture resume in `App.tsx` | Per-component handlers | One central point; auto-cleanup. |
| 12 | Persist migrator v1 → v2 | Reset settings | Honor legacy preference; closes SYSTEM_MAP risk. |
| 13 | No `audio.ts` unit tests | Full AudioContext mock | Low ROI in jsdom. |
| 14 | Drop daily-fix (#1) and hint system (#6) | Bundle all three | User refocused to audio. |

## 5. Open Questions

None blocking. Synth parameters (Assumption 5) may be tuned during implementation playtest.

## 6. Risks Acknowledged

- Mobile autoplay policy is mitigated but cannot be fully tested in CI; relies on manual mobile check.
- No automated test for actual sound playback — regression risk on `audio.ts` is caught only by manual verification.
- `AudioContext` creation can be expensive on first use; lazy init keeps cold start fast.
