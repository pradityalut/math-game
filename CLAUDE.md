# CLAUDE.md
Behavioral guidelines for Claude Code in this project.
Bias toward caution over speed; for trivial tasks, use judgment.

<!-- ## Project Navigation
- Consult [SYSTEM_MAP.md](SYSTEM_MAP.md) first when exploring unfamiliar code — it's the navigation index.
- Update SYSTEM_MAP.md per its Section 6 checklist when structural changes warrant. -->

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

## Goal-Driven Execution
- Transform tasks into verifiable goals before starting:
  - "Fix the bug" → "Reproduce it, identify root cause, verify fix doesn't break adjacent flows"
  - "Refactor X" → "Ensure typecheck and build succeed before and after"
- For multi-step tasks, state a brief plan with a verify step for each item.
- Verify with appropriate checks (typecheck, build, or manual test) before declaring done.
- Don't stop until success criteria are met.
