# GEMINI.md — Project Rules

This file contains the permanent rules to follow for **all** work on this project (Bible Verse Reader PWA). They apply even when not explicitly repeated in a request.

## 1. Language
- Always communicate in **Italian**: explanations, summaries, commit messages, code comments.
- All text visible inside the app (UI, labels, buttons, error messages) must be in **Italian**, even though code itself (variable/function/component names) follows standard English naming conventions.

## 2. Project structure
- Always keep the folder/file structure defined at project start (`components/`, `hooks/`, `services/`, `data/`, `types/`, `styles/`).
- Do not move, rename, or reorganize existing folders/files without a clear technical reason; if you do, explain why in the summary.
- One component = one file. Data/persistence logic always lives in `services/`, never inside components.

## 3. Tech stack — do not change without an explicit reason
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- Framer Motion (or `@use-gesture/react`) for gestures/animations
- IndexedDB (via `idb`) for local persistence (reading position, saved verses, cached chapters)
- `vite-plugin-pwa` for manifest and service worker
- No backend/server: the app stays **100% static**

## 4. Palette and design — always respect
- **Light mode**: background `#FAF6EF`, text `#2B2620`, accent `#B8912F`
- **Dark mode**: background `#1A1917`, text `#EDE6D9`, same accent `#B8912F`
- Verse font: elegant serif (Lora / Crimson Pro / Source Serif 4)
- UI font: sans-serif (Inter)
- "Editorial" style: generous whitespace, no superfluous elements in the reading screen, animations always light and never intrusive
- Do not introduce new colors, fonts, or styles without asking explicitly first

## 5. Responsiveness — mobile is the top priority
- Primary target: smartphones, roughly 320–430px wide. Desktop is secondary (a simple centered/width-limited version is fine).
- Use relative units (`rem`, `%`, `clamp()`) instead of fixed `px` where it makes sense, especially for the verse text.
- Use `100dvh` instead of `100vh` for full-screen layouts (iOS Safari address-bar resize bug).
- Always respect `env(safe-area-inset-*)` for notches and home indicators.
- Every new screen/component should be mentally checked (or verified) both in regular browser mode and in installed/standalone PWA mode.

## 6. Code conventions
- TypeScript in strict mode.
- Functional components with hooks only, no classes.
- Naming: `PascalCase` for components, `camelCase` for functions/variables/hooks.
- Comment only non-obvious logic (e.g. computing the next/previous verse across chapter/book boundaries), not the obvious.

## 7. Never do this
- Do not add a backend/server or a remote database.
- Do not use `localStorage` for complex structured data (saved verses, cached chapters) — that's IndexedDB's job. `localStorage` is fine only for simple preferences (e.g. light/dark theme).
- Do not add heavy or unnecessary dependencies without justifying it.
- Do not change the palette, fonts, or data architecture defined above without asking first.
- Do not break existing persistence (reading position, saved verses) when adding new features.

## 8. Handling ambiguity
- If a request is ambiguous or missing minor details, pick the most sensible option consistent with the rules above, briefly flag it in the summary, and proceed without blocking for confirmation.
- For decisions that change architecture, palette, or stack, however, ask for confirmation before proceeding.

## 9. Chat behavior
- Never paste code in the chat — neither the full application code nor a snippet/diff of just the modified part. All code changes must be applied directly to the project files; the chat response only describes what was done, in words, never in code.
- Keep chat responses short and to the point. Do not over-explain, do not restate the reasoning at length — a brief summary of what was changed (and of any check results, if relevant) is enough.
- Always address me by name: **Gabriele**.
