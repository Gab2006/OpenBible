---
name: pwa-audit
description: Verifies that this Progressive Web App (Bible Verse Reader) is correctly configured for installability and offline use on a phone home screen — checks manifest.json, the iOS "Add to Home Screen" meta tags, the vite-plugin-pwa/service worker setup, forbidden 100vh usage, safe-area-inset handling, localStorage misuse, and accidental backend dependencies. Use this after the initial app scaffold is generated, after any change to index.html/manifest.json/vite.config, or whenever the user asks to check, verify, or audit the PWA setup.
---

# PWA Audit Skill

## Goal
Confirm that the app can be reliably installed to a phone's home screen and keeps working offline, and that it still follows the project rules defined in `GEMINI.md` (100dvh instead of 100vh, IndexedDB instead of localStorage for structured data, no backend).

## Instructions
1. Run the validation script from this skill's own directory:
   ```
   node scripts/pwa_audit.cjs <path-to-project-root>
   ```
   If you are already working inside the project root, you can omit the argument (it defaults to the current directory).
2. The script prints one line per check, prefixed with `[PASS]`, `[WARN]`, or `[FAIL]`, followed by a summary count and an exit code (`0` = no FAIL, `1` = at least one FAIL).
3. Report the results to the user grouped by status, in Italian, in a short readable summary (not the raw script output dump).
4. For every `[FAIL]` item:
   - These represent incomplete implementation of requirements already agreed in `GEMINI.md`/the project prompt (missing manifest fields, missing iOS meta tags, missing service worker config, `100vh` usage, a backend dependency that shouldn't exist, etc.).
   - Fix them directly in the codebase, then re-run the script to confirm the fix worked, without needing to ask for confirmation first — these are compliance fixes, not architecture changes.
5. For every `[WARN]` item (e.g. a `localStorage` call that might be storing something other than a simple theme preference, or missing `safe-area-inset` usage):
   - Do not change code automatically. Report it to the user with the specific file/line and a short explanation of why it might be an issue, and let them decide.

## Constraints
- Never modify `GEMINI.md` itself as part of a "fix."
- Do not add new dependencies to resolve a FAIL unless the missing piece specifically requires one (e.g. `vite-plugin-pwa` itself, if it's entirely absent).
- Do not weaken or delete a check in the script to make a FAIL disappear — fix the app code instead.
