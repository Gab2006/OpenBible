import { cacheChapter, getCachedChapter } from './storage';
import type { Verse } from './storage';
import { getBookById } from '../data/books';

const BIBLE_VERSION = 'CEI2008';
const BIBLEGET_BASE_URL = 'https://query.bibleget.io/v3/index.php';

interface BibleGetResult {
  book: string;
  chapter: number;
  verse: string; // BibleGet restituisce il numero come stringa
  text: string;
  version: string;
  bookabbrev: string;
}

interface BibleGetResponse {
  results: BibleGetResult[];
  errors: string[];
}

export async function fetchChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const cached = await getCachedChapter(bookId, chapter);
  if (cached && cached.length > 0) {
    return cached;
  }

  const book = getBookById(bookId);
  const bookName = book?.name || bookId;

  try {
    // Senza specificare range di versetti, BibleGet restituisce l'intero capitolo
    const query = `${bookName}${chapter}`;
    const url = `${BIBLEGET_BASE_URL}?query=${encodeURIComponent(query)}&version=${BIBLE_VERSION}&return=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Errore nel recupero del capitolo ${bookName} ${chapter}`);
    }

    const data: BibleGetResponse = await response.json();

    if (data.errors && data.errors.length > 0) {
      console.error('Errori BibleGet:', data.errors);
    }

    const verses: Verse[] = [];

    if (data.results && Array.isArray(data.results)) {
      for (const item of data.results) {
        const verseNum = parseInt(item.verse, 10);
        if (!isNaN(verseNum) && item.text) {
          verses.push({
            bookId,
            bookName,
            chapter,
            verse: verseNum,
            text: item.text.trim() || '...',
          });
        }
      }
    }

    if (verses.length > 0) {
      await cacheChapter(bookId, chapter, verses);
    }
    return verses;

  } catch (error) {
    console.error("Errore nel recupero del versetto biblico:", error);
    return [];
  }
}

/**
 * Recupera un singolo versetto dalla nuova API.
 * Usato per la migrazione dei versetti salvati.
 */
export async function fetchSingleVerse(bookId: string, chapter: number, verse: number): Promise<string | null> {
  const book = getBookById(bookId);
  const bookName = book?.name || bookId;

  try {
    const query = `${bookName}${chapter},${verse}`;
    const url = `${BIBLEGET_BASE_URL}?query=${encodeURIComponent(query)}&version=${BIBLE_VERSION}&return=json`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data: BibleGetResponse = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].text.trim() || null;
    }
    return null;
  } catch {
    return null;
  }
}
