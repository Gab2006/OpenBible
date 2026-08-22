import type { Verse } from './storage';
import { getBookById } from '../data/books';

import type { Translation } from '../types';

type BibleData = Record<string, Record<string, Array<{ verse: number; text: string; displayVerse?: string }>>>;

let cachedBibleData: Record<Translation, BibleData | null> = { cei: null, tilc: null };
let fetchPromise: Record<Translation, Promise<BibleData | null> | null> = { cei: null, tilc: null };

/**
 * Carica il file locale /bible_{translation}.json in memoria RAM una sola volta.
 */
async function loadBibleData(translation: Translation = 'cei'): Promise<BibleData | null> {
  if (cachedBibleData[translation]) return cachedBibleData[translation];
  if (fetchPromise[translation]) return fetchPromise[translation];

  fetchPromise[translation] = (async () => {
    try {
      const response = await fetch(`/bible_${translation}.json`);
      if (!response.ok) {
        throw new Error(`Impossibile caricare il file locale (${response.status})`);
      }
      const data: BibleData = await response.json();
      cachedBibleData[translation] = data;
      return data;
    } catch (err) {
      console.error('Errore nel caricamento della Bibbia locale:', err);
      return null;
    } finally {
      fetchPromise[translation] = null;
    }
  })();

  return fetchPromise[translation];
}

/**
 * Restituisce i versetti del capitolo richiesto dal file locale.
 */
export async function fetchChapter(bookId: string, chapter: number, translation: Translation = 'cei'): Promise<{ verses: Verse[], error: string | null }> {
  const bible = await loadBibleData(translation);
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
    displayVerse: item.displayVerse,
  }));

  return { verses, error: null };
}

/**
 * Recupera un singolo versetto dal file locale.
 */
export async function fetchSingleVerse(bookId: string, chapter: number, verseNum: number, translation: Translation = 'cei'): Promise<string | null> {
  const { verses } = await fetchChapter(bookId, chapter, translation);
  const found = verses.find(v => v.verse === verseNum);
  return found ? found.text : null;
}

/**
 * Non necessitiamo più di prefetch con ritardo poiché l'accesso al file locale in memoria è a 0ms.
 */
export async function prefetchNextChapter(_bookId: string, _chapter: number) {
  // Nessuna operazione necessaria
}
