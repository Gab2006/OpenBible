# Task: "Share" button with verse image card

I'm working on a React + Vite + Tailwind CSS app for sharing Bible verses. I want to add a "Share" button that generates an image of the current verse (centered verse, editorial typesetting) and shares or downloads it, respecting the active light/dark theme in the app.

## Step 0 — Inspect the codebase before writing code

Before implementing, analyze the repo and report back to me:
1. How the light/dark theme is managed (context, hook, library like `next-themes`, class on `<html>`, etc.) and how to read the current theme in a component.
2. How the components displaying a verse are structured (props, where text and reference are located, e.g. `verse.text`, `verse.reference`).
3. How Tailwind is configured (`tailwind.config.js`) to understand where to add custom font-family and colors.

Use this information to adapt the implementation below — do not invent a parallel structure if a ThemeContext or similar already exists.

## Color palette (already defined, to be reused, do not modify)

- **Light mode**: background `#FAF6EF`, text `#2B2620`, accent `#B8912F`
- **Dark mode**: background `#1A1917`, text `#EDE6D9`, accent `#B8912F`
  (same accent in both themes)

Add these colors to `tailwind.config.js` as semantic tokens, e.g.:
```js
colors: {
  'verse-bg': { light: '#FAF6EF', dark: '#1A1917' },
  'verse-text': { light: '#2B2620', dark: '#EDE6D9' },
  'verse-accent': '#B8912F',
}
```

## Font

Use **Crimson Pro**. Install it via `@fontsource/crimson-pro` (npm) instead of Google Fonts CDN — it is more reliable for offline/export image generation (no network dependency at capture time).
Import weights 400, 500, 600. Register `font-voice` (or a name of your choice) in `tailwind.config.js` as custom `fontFamily.serif`.

## `VerseShareCard` Component

Create a component that renders ONLY the card to be exported (it's not the normal app UI — it is the element that will be captured as an image):

- Fixed dimensions designed for social sharing: 1080×1350px (vertical format, good for Instagram post/story). Use this proportion even if displayed smaller on screen (scale with CSS transform, do not change the actual dimensions of the DOM node).
- Layout: verse centered vertically and horizontally, Crimson Pro font weight 500, generous size (e.g., 44–56px) with `line-height` 1.5–1.6. Reference (e.g., "Psalm 23:1") below the text, weight 600, uppercase, letter-spacing, accent color, smaller size (~20px). A small decorative element above the text (e.g., a symbol or a thin line in accent color) is a plus but optional.
- **Colors applied explicitly based on the current theme**, not only with Tailwind `dark:` classes. The component must receive or read the active theme and set the colors as inline styles or resolved classes, because the image capture must accurately reflect the theme the user is currently seeing, including if export happens in an off-screen rendered node.
- Handle verses of variable length: if the text exceeds a character threshold (e.g., 180), reduce the font size proportionally or switch to a second smaller size, to avoid overflow or text clipping outside the card. Text must never be cut off.

## "Share" Button

Add a button (share icon, consistent style with the rest of the UI) in the screen where the verse is displayed. On click:

1. Render `VerseShareCard` in a temporary node (can be positioned off-screen with `position: absolute; left: -9999px`, not `display: none`, otherwise some capture libraries cannot measure it).
2. Use `html-to-image` (preferable over `html2canvas`: more faithful output with custom fonts and lighter) to capture the node at `pixelRatio: 2` or `3`, producing a high-resolution PNG.
3. If `navigator.share` and `navigator.canShare({ files })` are available (mobile/PWA), convert the PNG to a `File` and use `navigator.share()` to open the native share sheet.
4. Otherwise, fallback to a direct PNG download (create an `<a>` with `download` and `href` as a data URL or object URL).
5. Dynamic downloaded file name, e.g. `psalm-23-1.png` (slug generated from verse reference).
6. Show a loading state on the button during image generation (it may take a few hundred ms).

## Files to create/modify (adapt to actual project paths)

- `src/components/VerseShareCard.tsx` (or `.jsx`) — the card component
- `src/components/ShareButton.tsx` — the button with export logic
- `tailwind.config.js` — addition of colors and fonts
- Existing component where verse is displayed — button integration

## Constraints

- Do not introduce new global states if a context already exists for current verse and theme — reuse those.
- TypeScript if project is in TS, otherwise JS consistent with existing style.
- No heavy unnecessary dependencies: only `html-to-image` as new dependency (plus `@fontsource/crimson-pro` if needed).

Before proceeding with the full implementation, show me a brief summary of how you plan to integrate with the existing ThemeContext/hook found in Step 0.
