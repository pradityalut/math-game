# CLAUDE.md
Behavioral guidelines for Claude Code in this project.
Bias toward caution over speed; for trivial tasks, use judgment.

## Project Navigation
- Consult [SYSTEM_MAP.md](SYSTEM_MAP.md) first when exploring unfamiliar code — it's the navigation index.
- Update SYSTEM_MAP.md per its Section 6 checklist when structural changes warrant.

## Think Before Coding
- State assumptions explicitly before implementing.
- If multiple interpretations exist, present them — don't pick silently.
- If something is unclear, stop and ask. Don't hide confusion.

## Simplicity First
- Write the minimum code that solves the problem. Nothing speculative.
- No features, abstractions, flexibility, or error handling beyond what was asked.
- If the diff is twice the size it needs to be, rewrite shorter.
- Self-check: would a senior engineer call this overcomplicated?

## Surgical Changes
- Don't improve adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- Mention unrelated dead code — don't delete it.
- Remove only imports/variables/functions that YOUR changes made unused.
- Test: every changed line should trace directly to the user's request.

## Documentation & Comments
- Write a header doc (JSDoc) above a function when ANY apply:
  - Body is ≥ ~20 lines.
  - Has more than one logical phase (e.g. validate → transform → side-effect).
  - Exported and used across files (public module API).
- Header doc must contain: one-line description of what it does, parameter meanings (not types — TS handles that), return meaning (not type).
- Skip header doc for: small event handlers, inline callbacks, trivial getters/setters, functions < 10 lines with a self-explanatory name.
  - `function handleBackspace() { ... }` → no doc needed.
  - `export function solve(numbers, target, ops)` → doc needed (exported, 30 lines, multi-step recursion).
- Inline comments inside a function: ONLY when the WHY isn't visible from the code — bug workaround, hidden invariant, why algorithm A over B, non-obvious edge case.
  - `// stop timer immediately so the 600ms delay doesn't inflate elapsed time` → keep (non-obvious WHY).
  - `// increment counter` → delete (restates the code).
  - `// added for task X / fix for PR #123` → never write (rots).

## Goal-Driven Execution
- Transform tasks into verifiable goals before starting:
  - "Fix the bug" → "Reproduce it, identify root cause, verify fix doesn't break adjacent flows"
  - "Refactor X" → "Ensure typecheck and build succeed before and after"
- For multi-step tasks, state a brief plan with a verify step for each item.
- Verify with appropriate checks (typecheck, build, or manual test) before declaring done.
- Don't stop until success criteria are met.
