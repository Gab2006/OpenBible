# Build a Mobile PWA: Verse-by-Verse Bible Reader

## Project Summary
Build a mobile-first **Progressive Web App (PWA)** — a single static web app, no backend/server required — designed to be added to a phone's home screen and used like a native app. Its purpose: read the Bible one verse at a time, full-screen, with swipe navigation, bookmarking, and automatic resume of reading position.

## Tech Stack
- **Framework**: React 18 + TypeScript, bundled with Vite
- **Styling**: Tailwind CSS
- **Gestures & animation**: Framer Motion (drag/swipe on x and y axes), or alternatively `@use-gesture/react` + `react-spring`
- **PWA tooling**: `vite-plugin-pwa` (Workbox) for service worker generation, manifest, and offline asset caching
- **Local persistence**: IndexedDB via the `idb` library for: current reading position, saved/bookmarked verses, and cached chapters (for offline reading). Use `localStorage` only for trivial settings like theme preference.
- **Routing**: simple state-based view switching is fine (the app only has 2–3 views: Home, Reader, Saved Verses) — React Router is optional, not required.
- **Bible text data**: fetch verses from the **Free Use Bible API** (https://bible.helloao.org/docs/) — free, open, no API key required, MIT-licensed, hundreds of languages/translations. Check which Italian translation(s) are available there. If no suitable public-domain Italian translation is available through that API, fall back to bundling a public-domain Italian translation (e.g. the 1607 Diodati) as static local JSON files (one file per book or per chapter), so the reading experience never fully depends on a live API.
- Fully static site — deployable to Vercel/Netlify/GitHub Pages/Cloudflare Pages over HTTPS (HTTPS is required for service workers and installability).

## Data Model
```ts
interface Verse {
  bookId: string;     // e.g. "JHN"
  bookName: string;   // e.g. "Giovanni"
  chapter: number;
  verse: number;
  text: string;
}
```
Also create a static `books.ts`/`books.json` metadata file (book id, name, testament, number of chapters, number of verses per chapter) so the app can compute "next verse" / "previous verse" across chapter and book boundaries locally, without waiting on a network call every time.

## Core Features (must implement)

### 1. Full-screen verse reader
- One verse at a time, centered both vertically and horizontally on screen, large and legible serif typography, responsive font size (roughly `clamp(24px, 6vw, 40px)`).
- A small, unobtrusive reference label (e.g. "Giovanni 3:16") shown above or below the verse text.
- **Swipe LEFT** → go to the next verse. When at the last verse of a chapter, automatically continue into the first verse of the next chapter (and next book, if needed). At the very last verse of the Bible (Revelation 22:21), do nothing but show a subtle bounce/resistance animation.
- **Swipe RIGHT** → go to the previous verse, with the same cross-chapter/cross-book logic in reverse. At Genesis 1:1, do nothing but show the same subtle bounce animation.
- Horizontal swipes animate like a card/slide transition (200–300ms ease-out).
- A small icon in a corner of the screen (e.g. top-left) returns to the Home screen.

### 2. Save / bookmark important verses
- A "Save" button (bookmark or heart icon) fixed in a corner of the Reader screen. Tapping it toggles saved/unsaved state for the verse currently on screen, with a clear visual difference between filled (saved) and outline (not saved), plus a brief scale/feedback animation on tap.
- **Swipe DOWN** on the verse performs the same toggle action as the Save button, with the same visual feedback.
- Saved verses persist locally (store book, chapter, verse, text, and a timestamp) and are listed in a "Saved Verses" screen accessible from Home. Tapping a saved verse in that list reopens the full-screen Reader positioned exactly on that verse.

### 3. Resume where the user left off
- After every verse navigation, persist the current position (book, chapter, verse) to local storage.
- Opening the Reader (e.g. via a "Continue Reading" action on Home) must resume exactly at the last verse the user read. On the very first launch (no saved position yet), default to Genesis 1:1.

### 4. Home menu — choose book/chapter
- From Home, let the user browse books, grouped by Old/New Testament (e.g. two tabs or a segmented control), select a book, then select a chapter from a grid of chapter numbers. Selecting a chapter opens the full-screen Reader starting at verse 1 of that chapter.

### 5. Random verse button
- A clearly visible "Random Verse" button on Home. Tapping it picks a random book, chapter, and verse from anywhere in the Bible and opens the full-screen Reader directly on that verse.

## Screens / Views
1. **Home** — a "Continue Reading" card at the top (shown only if a saved position exists), a prominent "Random Verse" button, a "Saved Verses" entry point (with a count badge), and the Book → Chapter picker below.
2. **Reader** — the full-screen, one-verse-at-a-time view described above.
3. **Saved Verses** — a scrollable list of bookmarked verses (reference + short preview of the text), each tappable to reopen in the Reader; allow removing a saved verse (swipe-to-delete or a small delete icon).

## Visual Design Direction
- Calm, editorial, distraction-free reading feel — this should feel like a beautifully typeset printed Bible page, not a typical app dashboard.
- Typography: a serif typeface for the verse text itself (e.g. Google Fonts "Lora", "Crimson Pro", or "Source Serif 4"); a clean sans-serif (e.g. "Inter") for UI chrome, buttons, and labels.
- Color palette:
  - Light mode: warm off-white/paper background (~#FAF6EF), warm dark ink text (~#2B2620), a single muted gold/amber accent (~#B8912F) for buttons, active states, and the "saved" icon fill.
  - Dark mode: deep charcoal background (~#1A1917), warm off-white text (~#EDE6D9), the same amber accent.
  - Support automatic switching based on `prefers-color-scheme`, plus a manual toggle.
- Generous whitespace; the Reader view should show only the verse text, its reference, the save icon, and a minimal back-to-home icon — nothing else.
- Keep motion subtle: page-slide on swipe, icon fill/scale on save — no heavy or distracting animation.

## Mobile / PWA / "Add to Home Screen" Requirements (important)
- Provide a complete `manifest.json` (name, short_name, icons at 192×192 and 512×512, `display: "standalone"`, `start_url`, `theme_color`, `background_color`).
- Add the iOS-specific meta tags in `index.html` (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`), since iOS Safari does not fully honor the web manifest for "Add to Home Screen".
- Use `100dvh` (dynamic viewport height) instead of `100vh` for full-screen layouts, to avoid the iOS Safari address-bar resize bug. Respect `env(safe-area-inset-*)` for notches and home indicators.
- Register a service worker (via `vite-plugin-pwa`) that caches the app shell plus every Bible chapter the user has already opened, so the app keeps working with no internet connection after first use.
- Disable default browser pull-to-refresh/overscroll bounce and text selection in the Reader view so swipe gestures feel native; use `touch-action` appropriately so gestures don't conflict with anything else.
- Test in installed/standalone mode (not just in a regular browser tab) on both iOS Safari and Android Chrome.

## Suggested File Structure
```
bible-verse-reader/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── data/                     # fallback local Bible JSON, if used
│       └── it/<book>.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ReaderScreen.tsx      # full-screen verse view + swipe handling
│   │   ├── SaveButton.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── BookPicker.tsx
│   │   ├── ChapterPicker.tsx
│   │   ├── RandomButton.tsx
│   │   ├── SavedVersesScreen.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useSwipeNavigation.ts
│   │   ├── useReadingProgress.ts
│   │   └── useBibleVerse.ts
│   ├── services/
│   │   ├── bibleApi.ts           # fetch + cache wrapper around the Bible API
│   │   └── storage.ts            # IndexedDB helpers (progress, saved verses, cache)
│   ├── data/
│   │   └── books.ts              # book/chapter/verse-count metadata
│   ├── types/
│   │   └── bible.ts
│   └── styles/
│       └── index.css             # Tailwind entry + font imports
├── index.html
├── vite.config.ts                # includes vite-plugin-pwa config
├── tailwind.config.js
└── package.json
```

## Acceptance Criteria
- The app installs cleanly to the home screen on both Android (Chrome) and iOS (Safari) and opens in standalone/full-screen mode with no browser UI.
- Swiping left/right in the Reader reliably moves to the next/previous verse, including across chapter and book boundaries, with no crashes at the very first (Genesis 1:1) or very last (Revelation 22:21) verse.
- Saving a verse (button or swipe-down) is instantly reflected in the Saved Verses list and survives an app restart.
- Closing and reopening the app (or tapping "Continue Reading") resumes exactly at the last verse read.
- The Random button opens a genuinely random verse from anywhere in the Bible every time it's tapped.
- After the app has been opened once with a connection, previously visited chapters remain readable with no internet connection.

If any requirement above is ambiguous or you need to make an assumption (exact Italian translation to use, exact icon set, etc.), pick a sensible default, note the assumption in your summary, and proceed — don't block on it.
