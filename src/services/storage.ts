import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Verse {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface SavedVerse extends Verse {
  id?: string;
  timestamp: number;
}

export interface ReadingPosition {
  bookId: string;
  chapter: number;
  verse: number;
}

interface BibleDB extends DBSchema {
  reading_progress: {
    key: string;
    value: ReadingPosition;
  };
  saved_verses: {
    key: string; 
    value: SavedVerse;
    indexes: { 'by-timestamp': number };
  };
  cached_chapters: {
    key: string;
    value: { id: string; verses: Verse[] };
  };
  completed_chapters: {
    key: string;
    value: { bookId: string; chapter: number; completedAt: number };
  };
}

let dbPromise: Promise<IDBPDatabase<BibleDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<BibleDB>('BibleReaderDB', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('reading_progress')) {
          db.createObjectStore('reading_progress');
        }
        if (!db.objectStoreNames.contains('saved_verses')) {
          const store = db.createObjectStore('saved_verses', { keyPath: 'id' });
          store.createIndex('by-timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('cached_chapters')) {
          db.createObjectStore('cached_chapters', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('completed_chapters')) {
          db.createObjectStore('completed_chapters');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveReadingPosition(position: ReadingPosition) {
  const db = await initDB();
  await db.put('reading_progress', position, 'current');
}

export async function getReadingPosition(): Promise<ReadingPosition | undefined> {
  const db = await initDB();
  return db.get('reading_progress', 'current');
}

export async function saveVerse(verse: Verse) {
  const db = await initDB();
  const id = `${verse.bookId}-${verse.chapter}-${verse.verse}`;
  const savedVerse: SavedVerse = {
    ...verse,
    id,
    timestamp: Date.now(),
  };
  await db.put('saved_verses', savedVerse);
  window.dispatchEvent(new Event('verses-changed'));
}

export async function removeSavedVerse(bookId: string, chapter: number, verse: number) {
  const db = await initDB();
  const id = `${bookId}-${chapter}-${verse}`;
  // @ts-ignore - id is keyPath
  await db.delete('saved_verses', id);
  window.dispatchEvent(new Event('verses-changed'));
}

export async function isVerseSaved(bookId: string, chapter: number, verse: number): Promise<boolean> {
  const db = await initDB();
  const id = `${bookId}-${chapter}-${verse}`;
  // @ts-ignore
  const v = await db.get('saved_verses', id);
  return !!v;
}

export async function getAllSavedVerses(): Promise<SavedVerse[]> {
  const db = await initDB();
  const tx = db.transaction('saved_verses', 'readonly');
  const index = tx.store.index('by-timestamp');
  const verses = await index.getAll();
  return verses.sort((a, b) => b.timestamp - a.timestamp);
}

export async function cacheChapter(bookId: string, chapter: number, verses: Verse[]) {
  const db = await initDB();
  const id = `${bookId}-${chapter}`;
  await db.put('cached_chapters', { id, verses });
}

export async function getCachedChapter(bookId: string, chapter: number): Promise<Verse[] | undefined> {
  const db = await initDB();
  const id = `${bookId}-${chapter}`;
  const cached = await db.get('cached_chapters', id);
  return cached?.verses;
}

export async function markChapterCompleted(bookId: string, chapter: number) {
  const db = await initDB();
  const key = `${bookId}-${chapter}`;
  await db.put('completed_chapters', { bookId, chapter, completedAt: Date.now() }, key);
  window.dispatchEvent(new Event('progress-changed'));
}

export async function getCompletedChapters(): Promise<Set<string>> {
  const db = await initDB();
  const keys = await db.getAllKeys('completed_chapters');
  return new Set(keys);
}
