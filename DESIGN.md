# Design System: MathDash
**Project:** MathDash — a browser-based math puzzle game (Countdown / Game-24 mechanic)

---

## 1. Visual Theme & Atmosphere

MathDash feels like a **modern board game on warm recycled paper** — playful, tactile, and clean. The aesthetic blends three sensibilities:

- **Tactile-Physical** — Every interactive element feels like a real object you can press. Tiles, buttons, and chips carry a chunky bottom-shadow that compresses on press, mimicking a mechanical keyboard key or a wooden Scrabble tile.
- **Warm Editorial** — The base canvas is a soft cream "paper" tone (`#FAF7F2`) with a barely-visible SVG noise grain, evoking a quality puzzle book rather than a cold UI.
- **Playful-Calm** — Rounded geometric typography (Fredoka) and pillowy 12px corners keep the mood friendly and approachable. Nothing is sharp; everything invites a tap.

**Density:** Airy and breathable. Generous padding around the play surface keeps focus on the 4 tiles. No dense data tables, no list-heavy screens.

**Motion personality:** Snappy and responsive (100–150ms). Three signature animations — `slideUp` for entries, `shake` for invalid moves, `popIn` for results. Motion is **rewarding, never decorative**.

---

## 2. Color Palette & Roles

> 💡 **Swatch column** renders as a small colored chip on GitHub via `img.shields.io` so you can see each color at a glance.

### Surface & Ground
| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-FAF7F2-FAF7F2?style=flat-square) | **Warm Paper Cream** | `#FAF7F2` | App background — the "page" everything sits on; carries subtle fractal-noise grain |
| ![](https://img.shields.io/badge/-FFFFFF-FFFFFF?style=flat-square) | **Crisp Surface White** | `#FFFFFF` | Elevated card surface; result modals and stat cards |
| ![](https://img.shields.io/badge/-E8E0D5-E8E0D5?style=flat-square) | **Stone Border** | `#E8E0D5` | Soft 1px hairline around cards; never harsh |

### Tiles (the game's hero element)
| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-F0EBE3-F0EBE3?style=flat-square) | **Sun-bleached Linen** | `#F0EBE3` | Default tile face — feels like a chunky wooden chip |
| ![](https://img.shields.io/badge/-C8B8A2-C8B8A2?style=flat-square) | **Driftwood Tan** | `#C8B8A2` | Tile bottom-edge shadow (4px chunky border-bottom); the "depth" |
| ![](https://img.shields.io/badge/-1A1A2E-1A1A2E?style=flat-square) | **Midnight Navy** | `#1A1A2E` | Selected tile face — high contrast spotlight on the player's choice |
| ![](https://img.shields.io/badge/-0A0A1A-0A0A1A?style=flat-square) | **Deep Indigo Shadow** | `#0A0A1A` | Selected tile's bottom-shadow (matches Navy) |

### Action & Status
| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-C84B31-C84B31?style=flat-square) | **Brick Red** | `#C84B31` | The **Target** number — also Hard-tier accent and focus rings; reserved for "this is what matters" |
| ![](https://img.shields.io/badge/-2D6A4F-2D6A4F?style=flat-square) | **Forest Pine** | `#2D6A4F` | Primary CTA, Easy tier, success states ("Solved!") |
| ![](https://img.shields.io/badge/-1D4A37-1D4A37?style=flat-square) | **Forest Pine Shadow** | `#1D4A37` | Primary button bottom-edge |
| ![](https://img.shields.io/badge/-D97706-D97706?style=flat-square) | **Amber Spice** | `#D97706` | Medium tier accent; secondary highlight |
| ![](https://img.shields.io/badge/-5B21B6-5B21B6?style=flat-square) | **Royal Plum** | `#5B21B6` | Game 24 tier accent — distinguishes the headliner mode |

### Operators & Type
| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-4A5568-4A5568?style=flat-square) | **Slate Steel** | `#4A5568` | Default operator buttons (+, −, ×, ÷) |
| ![](https://img.shields.io/badge/-1A1A2E-1A1A2E?style=flat-square) | **Midnight Navy** | `#1A1A2E` | Selected operator (matches selected tile) |
| ![](https://img.shields.io/badge/-1C1917-1C1917?style=flat-square) | **Ink Charcoal** | `#1C1917` | Primary text — softer than pure black |
| ![](https://img.shields.io/badge/-78716C-78716C?style=flat-square) | **River Stone** | `#78716C` | Secondary text, captions, helper copy |

### Accent Tints (cards & feedback)
| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-E8F5EE-E8F5EE?style=flat-square) | **Mint Wash** | `#E8F5EE` | Success card background |
| ![](https://img.shields.io/badge/-B7DFC9-B7DFC9?style=flat-square) | **Sage Edge** | `#B7DFC9` | Success card border |
| ![](https://img.shields.io/badge/-EDE7DF-EDE7DF?style=flat-square) | **Oat Beige** | `#EDE7DF` | Muted card background |
| ![](https://img.shields.io/badge/-D4C8BA-D4C8BA?style=flat-square) | **Sand Edge** | `#D4C8BA` | Muted card border |
| ![](https://img.shields.io/badge/-FEE2E2-FEE2E2?style=flat-square) | **Rose Mist** | `#FEE2E2` | Donate / support icon halo |

### Modern Pop Accents (selective use — Resumin-inspired)
These are **high-energy accents** borrowed from contemporary Y2K-brutalist palettes. Use **sparingly** to add modern punch without breaking the earthy foundation. **Never** use them as primary brand colors or replace any tier accent — they are *spotlight* colors only.

| Swatch | Name | Hex | Role |
|---|---|---|---|
| ![](https://img.shields.io/badge/-C9FF3D-C9FF3D?style=flat-square) | **Win Lime** | `#C9FF3D` | Reward spotlight — 3-star celebrations, share-card highlight stripe, confetti accent. **Reserved for moments of triumph.** |
| ![](https://img.shields.io/badge/-7CC6FF-7CC6FF?style=flat-square) | **Sky Info** | `#7CC6FF` | The single cool color in the system. Use for **timer bar fill**, info modals, hint states, and "calm" informational UI. Balances the warm-heavy palette. |
| ![](https://img.shields.io/badge/-FF6A3D-FF6A3D?style=flat-square) | **Live Coral** | `#FF6A3D` | A brighter, more energetic alternative to Brick Red. Optional for **share-card target callouts** where extra vibrancy helps social virality. Do **not** replace Brick Red in core UI (target number, focus rings) — Coral is for marketing surfaces only. |

> **Rule of thumb:** If a screen uses **two or more** of these pop accents, it's overdone. Pick one per surface. The earthy base does the heavy lifting; these are the gold leaf.

> **Palette philosophy:** Earth-tones for surfaces (paper, linen, driftwood) + bold confident accents for actions (brick, pine, plum) + **rare modern pops** (lime, sky, coral) for moments that deserve to stand out. Nothing pastel for its own sake; nothing neon as default — every color feels picked, not generated.

---

## 3. Typography Rules

### Font Families
- **`'Fredoka', sans-serif`** — *Display font.* A rounded geometric sans with a friendly, slightly bubbly character. Used for tile numbers, button labels, headings, and anywhere a number needs to feel "tap-worthy."
- **`'Nunito', sans-serif`** — *Body font.* A balanced humanist sans-serif. Used for paragraphs, captions, helper copy, and microcopy. Sets the default on `<html>`.

### Hierarchy
| Element | Font | Weight | Size guidance |
|---|---|---|---|
| Tile number | Fredoka | 600 (semibold) | 1.6rem (~26px) |
| Page title / Target | Fredoka | 700 (bold) | Generous — 2–3rem on mobile |
| Button label | Fredoka | 600 | 0.9rem (sm) → 1.05rem (lg) |
| Body paragraph | Nunito | 400 | 0.875–1rem |
| Caption / helper | Nunito | 400–600 | 0.75rem |

### Letter-spacing & character
- **Tight, not condensed.** Default tracking; Fredoka's natural roundness already provides breathing room.
- **No all-caps.** Sentence case throughout — keeps the playful tone.
- **Numbers are the heroes.** Whenever a number appears (tile, target, score), give it Fredoka and visual weight.

---

## 4. Component Stylings

### Buttons (`<Button>`)
The signature tactile element. Four variants, all sharing one trait: a **chunky bottom border that simulates depth**, compressing on press.

- **Shape:** `rounded-xl` (12px) — pillowy, not pill, not square
- **Depth mechanic:** `border-bottom: 4px solid <shadowColor>` at rest. On `mouseDown`, the button translates 3px down and the border-bottom collapses to 1px — a satisfying "push" feedback in <150ms
- **Variants:**
  - **Primary** — Forest Pine (`#2D6A4F`) with `#1D4A37` shadow. White text. The "do the thing" button
  - **Dark** — Midnight Navy (`#1A1A2E`) with `#0A0A1A` shadow. White text. For high-emphasis modal actions
  - **Secondary** — Paper Cream surface with Driftwood Tan shadow + 1px Stone border. Ink text. For "Skip" or "Next" style affordances
  - **Ghost** — Transparent, no depth, no shadow. For tertiary actions only
- **Focus ring:** `ring-2 ring-[#C84B31]` (Brick Red) — never blue, never default
- **Disabled:** `opacity: 0.5`, cursor `not-allowed`. Depth still rendered but inert.

### Tiles (`<Tile>`)
- **Shape:** `rounded-xl` (12px) square, 64×64px on mobile, scaling to 80×80px on `sm:` breakpoint
- **Default state:** Sun-bleached Linen face, 4px Driftwood Tan bottom-edge
- **Hover (desktop):** `translateY(-2px)`, border-bottom grows to 5px — the tile "lifts"
- **Active (press):** `translateY(4px)`, border-bottom collapses to 1px — the tile "sinks"
- **Selected:** Midnight Navy face, white digit, scale 1.05 — visually pops above the row
- **Consumed (used):** Fades to `opacity: 0`, scales to 0.75, `pointer-events: none` — leaves the play surface elegantly

### Cards (`<Card>`)
- **Shape:** `rounded-xl` (12px) always
- **Tones:**
  - `surface` — White on Stone border (default; for elevated content)
  - `paper` — Paper Cream on Stone border (blends with background; for embedded sections)
  - `success` — Mint Wash on Sage Edge (for solved confirmations)
  - `muted` — Oat Beige on Sand Edge (for de-emphasized content)
- **Shadow:** **Flat by default.** No drop-shadow on cards — depth comes from the border + tonal contrast against the noisy paper background. This keeps the UI clean despite the tactile buttons.

### Tabs (Tier selector on Home)
- Horizontal pill row, each tab carries its **tier accent color** when active:
  - Easy → Forest Pine
  - Medium → Amber Spice
  - Hard → Brick Red
  - Game 24 → Royal Plum
- Active tab has a 3px bottom border in the tier's deeper shade. Inactive tabs are transparent on the paper ground.

### Result Modal & Star Row
- Modal: full-bleed overlay; content card uses `popIn` animation (scale 0.8 → 1.08 → 1 with fade)
- Stars: filled ⭐ in Amber Spice, empty in Driftwood Tan — same chunky aesthetic as tiles
- **3-star perfect solve:** add a thin **Win Lime** (`#C9FF3D`) underline stripe or glow behind the star row — celebrates triumph without changing core colors

### Timer Bar
- Uses **Sky Info** (`#7CC6FF`) for the fill at ≥66% remaining (calm informational state)
- Transitions to **Amber Spice** (`#D97706`) at 33–66% (warning)
- Transitions to **Brick Red** (`#C84B31`) below 33% (urgent)
- This gives the game a single cool color in the system and a clear three-stage urgency cue

### Share Card (`canvas-share`)
- Marketing surface — gentler design constraints than the in-app UI
- May use **Live Coral** (`#FF6A3D`) for the target number callout (instead of Brick) for extra social-feed vibrancy
- May use **Win Lime** (`#C9FF3D`) as an accent stripe or "PERFECT" badge background on 3-star results
- Never use both Coral and Lime on the same card — pick one hero accent

### Inputs / Expression Field
- Read-only display chip showing the in-progress expression
- Same `rounded-xl` + Paper background + Stone border family
- Numbers in Fredoka, operators in Slate Steel

### Support / Donate Card
- Paper-tone card with a Rose Mist halo behind a Brick Red heart icon
- Single Secondary button labeled "Support creator" — never aggressive, always dismissible

---

## 5. Layout Principles

### Mobile-First Foundation
MathDash is designed for the **390×844 viewport (iPhone 14)** as the canonical reference. Everything must work in one thumb's reach.

- **Page padding:** `px-4` (16px) on mobile, scaling to `px-8` (32px) on `md:` and up
- **Vertical rhythm:** `py-8` page padding; `gap-4` between major sections
- **Tile grid:** 2×2 on mobile (centered), can stay 2×2 or expand to 4-in-a-row on tablet+
- **Touch targets:** Minimum 64×64px for any tappable element — never smaller than a thumb pad

### Desktop & Tablet
- **Strategy:** Don't stretch — center. The play surface stays at a comfortable max-width (~480–560px); the canvas around it becomes generous breathing room
- **No multi-column layouts on the play screen.** Math puzzles want focus; never split attention into sidebars
- **Tablet (`md:`)** uses larger tiles (80×80) and slightly bigger type; **desktop (`lg:`)** keeps the same vertical layout with more whitespace

### Whitespace Strategy
- **Air over decoration.** Empty paper is part of the design — it's where the puzzle "lives"
- **Group, don't divide.** Use spacing (`gap-3`, `gap-4`) to group related controls rather than dividers or boxes
- **Edges breathe.** Cards never touch screen edges on mobile (always `px-4` minimum)

### Background Texture
The `body` carries an inline-SVG fractal-noise overlay at `opacity: 0.03` — invisible at a glance, but it removes the "flat digital" feel and adds warmth. Cards sit on top of this without their own shadows, letting the texture do the work.

### Accessibility Notes
- `prefers-reduced-motion` respected — all `slideUp`, `shake`, `popIn` animations should suppress to opacity-only fades
- Focus rings always use Brick Red (`#C84B31`) for unmistakable visibility on the warm palette
- Tile and operator buttons have `aria-pressed` reflecting selection state
- Color is never the only signal — selected states also scale, shake states also vibrate, success states also use ⭐ count

---

## 6. Quick-Reference Tokens

```css
/* Surfaces */
--paper:        #FAF7F2;
--surface:      #FFFFFF;
--border:       #E8E0D5;

/* Tiles */
--tile:         #F0EBE3;
--tile-border:  #C8B8A2;
--tile-sel:     #1A1A2E;

/* Actions */
--target:       #C84B31;  /* brick — focus/target */
--accent:       #2D6A4F;  /* forest — primary CTA, easy tier */
--amber:        #D97706;  /* medium tier */
--plum:         #5B21B6;  /* game 24 tier */

/* Type */
--text:         #1C1917;
--muted:        #78716C;

/* Operators */
--op:           #4A5568;
--op-sel:       #1A1A2E;

/* Modern pop accents — selective use only */
--win-lime:     #C9FF3D;  /* 3-star celebration, share-card highlight */
--sky-info:     #7CC6FF;  /* timer ≥66%, info/hint states */
--live-coral:   #FF6A3D;  /* share-card target callout (marketing only) */

/* Fonts */
--font-display: 'Fredoka', sans-serif;
--font-body:    'Nunito', sans-serif;

/* Geometry */
--radius-card:  12px;  /* rounded-xl — applies to cards, tiles, buttons */
--depth-button: 4px;   /* chunky bottom-border on buttons */
--depth-tile:   4px;   /* chunky bottom-border on tiles */
```

---

## 7. Prompting Heuristics (for AI-assisted screen generation)

When generating new MathDash screens, lean on these phrasings:

- "On a **warm paper cream canvas with subtle noise grain**…"
- "Using **chunky tactile buttons with a 4px bottom-shadow that compresses on press**…"
- "**Pillowy 12px rounded corners** throughout — no sharp edges, no fully-round pills…"
- "**Fredoka for numbers and buttons**, **Nunito for body**, sentence-case only…"
- "**Brick red** for focus and targets, **forest pine** for primary actions, **midnight navy** for selected states…"
- "**Flat cards on a textured ground** — depth comes from buttons, not card shadows…"
- "**Mobile-first 390px viewport**, centered on tablet/desktop with breathing room rather than stretched layouts…"
- "**Sparingly** sprinkle a Y2K-brutalist pop — **Win Lime** for triumph moments, **Sky Info** for timer/calm UI, **Live Coral** for share-card energy — but never as a primary brand color…"
