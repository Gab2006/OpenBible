import type { Verse } from './storage';
import { getBookById } from '../data/books';

type BibleData = Record<string, Record<string, Array<{ verse: number; text: string }>>>;

let cachedBibleData: BibleData | null = null;
let fetchPromise: Promise<BibleData | null> | null = null;

/**
 * Carica il file locale /bible.json in memoria RAM una sola volta.
 */
async function loadBibleData(): Promise<BibleData | null> {
  if (cachedBibleData) return cachedBibleData;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const response = await fetch('/bible.json');
      if (!response.ok) {
        throw new Error(`Impossibile caricare il file locale (${response.status})`);
      }
      const data: BibleData = await response.json();
      cachedBibleData = data;
      return data;
    } catch (err) {
      console.error('Errore nel caricamento della Bibbia locale:', err);
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Restituisce i versetti del capitolo richiesto dal file locale.
 */
export async function fetchChapter(bookId: string, chapter: number): Promise<{ verses: Verse[], error: string | null }> {
  const bible = await loadBibleData();
  if (!bible) {
    return { verses: [], error: 'Scaricamento della Bibbia CEI in corso... Attendi un istante e riprova.' };
  }

  const bookMeta = getBookById(bookId);
  const bookName = bookMeta?.name || bookId;

  const chapterData = bible[bookId]?.[String(chapter)];
  if (!chapterData || chapterData.length === 0) {
    return { verses: [], error: 'Capitolo non trovato.' };
  }

  const verses: Verse[] = chapterData.map(item => ({
    bookId,
    bookName,
    chapter,
    verse: item.verse,
    text: item.text,
  }));

  return { verses, error: null };
}

/**
 * Recupera un singolo versetto dal file locale.
 */
export async function fetchSingleVerse(bookId: string, chapter: number, verseNum: number): Promise<string | null> {
  const { verses } = await fetchChapter(bookId, chapter);
  const found = verses.find(v => v.verse === verseNum);
  return found ? found.text : null;
}

/**
 * Non necessitiamo più di prefetch con ritardo poiché l'accesso al file locale in memoria è a 0ms.
 */
export async function prefetchNextChapter(_bookId: string, _chapter: number) {
  // Nessuna operazione necessaria
}
