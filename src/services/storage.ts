import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { HomeCardId, StatCardId } from '../types/homeLayoutTypes';

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
  reading_days: {
    key: string;
    value: { date: string; timestamp: number };
  };
  home_layout: {
    key: string;
    value: HomeCardId[];
  };
  stats_layout: {
    key: string;
    value: StatCardId[];
  };
}

let dbPromise: Promise<IDBPDatabase<BibleDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<BibleDB>('BibleReaderDB', 5, {
      upgrade(db, oldVersion, _newVersion, transaction) {
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
        if (!db.objectStoreNames.contains('reading_days')) {
          db.createObjectStore('reading_days', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('home_layout')) {
          db.createObjectStore('home_layout');
        }
        if (!db.objectStoreNames.contains('stats_layout')) {
          db.createObjectStore('stats_layout');
        }

        // Migrazione da v2 a v3: invalidare cache Diodati
        if (oldVersion <= 2 && oldVersion > 0) {
          if (db.objectStoreNames.contains('cached_chapters')) {
            transaction.objectStore('cached_chapters').clear();
          }
        }
      },
    });

    // Dopo aver aperto il DB, migra i testi dei versetti salvati in background
    dbPromise.then(() => migrateSavedVersesToCEI());
  }
  return dbPromise;
}

/**
 * Migra i versetti salvati dalla traduzione Diodati alla CEI2008.
 * Usa un flag in localStorage per evitare di ripetere la migrazione.
 */
async function migrateSavedVersesToCEI() {
  const MIGRATION_KEY = 'cei2008_migration_done';
  if (localStorage.getItem(MIGRATION_KEY)) return;

  try {
    // Import dinamico per evitare dipendenze circolari
    const { fetchSingleVerse } = await import('./bibleApi');
    const db = await dbPromise;
    const allVerses = await db.getAll('saved_verses');

    if (allVerses.length === 0) {
      localStorage.setItem(MIGRATION_KEY, '1');
      return;
    }

    for (const verse of allVerses) {
      const newText = await fetchSingleVerse(verse.bookId, verse.chapter, verse.verse);
      if (newText) {
        await db.put('saved_verses', { ...verse, text: newText });
      }
    }

    localStorage.setItem(MIGRATION_KEY, '1');
    window.dispatchEvent(new Event('verses-changed'));
  } catch (error) {
    console.error('Errore durante la migrazione dei versetti salvati:', error);
  }
}

export async function saveReadingPosition(position: ReadingPosition) {
  const db = await initDB();
  await db.put('reading_progress', position, 'current');
  const dateStr = new Date().toISOString().split('T')[0];
  await db.put('reading_days', { date: dateStr, timestamp: Date.now() });
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

export async function getSavedVersesCount(): Promise<number> {
  const db = await initDB();
  return db.count('saved_verses');
}

export async function getReadingStreak(): Promise<number> {
  const db = await initDB();
  const allDays = await db.getAll('reading_days');
  if (allDays.length === 0) return 0;
  
  allDays.sort((a, b) => b.date.localeCompare(a.date));
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let expectedDate = new Date(today);
  const firstDayStr = allDays[0].date;
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  let startIndex = 0;
  if (firstDayStr === todayStr) {
    streak = 1;
    expectedDate.setDate(expectedDate.getDate() - 1);
    startIndex = 1;
  } else if (firstDayStr === yesterdayStr) {
    streak = 1;
    expectedDate.setDate(expectedDate.getDate() - 2);
    startIndex = 1;
  } else {
    return 0;
  }
  
  for (let i = startIndex; i < allDays.length; i++) {
    const expectedStr = expectedDate.toISOString().split('T')[0];
    if (allDays[i].date === expectedStr) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export async function saveHomeLayout(order: HomeCardId[]) {
  const db = await initDB();
  await db.put('home_layout', order, 'current');
}

export async function getHomeLayout(): Promise<HomeCardId[] | undefined> {
  const db = await initDB();
  return db.get('home_layout', 'current');
}

export async function saveStatsLayout(order: StatCardId[]) {
  const db = await initDB();
  await db.put('stats_layout', order, 'current');
}

export async function getStatsLayout(): Promise<StatCardId[] | undefined> {
  const db = await initDB();
  return db.get('stats_layout', 'current');
}
