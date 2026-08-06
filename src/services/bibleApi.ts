import { cacheChapter, getCachedChapter } from './storage';
import type { Verse } from './storage';
import { getBookById } from '../data/books';

const TRANSLATION_ID = 'ita_dio'; // Giovanni Diodati

export async function fetchChapter(bookId: string, chapter: number): Promise<Verse[]> {
  const cached = await getCachedChapter(bookId, chapter);
  if (cached && cached.length > 0) {
    return cached;
  }

  const bookName = getBookById(bookId)?.name || bookId;

  try {
    const response = await fetch(`https://bible.helloao.org/api/${TRANSLATION_ID}/${bookId}/${chapter}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter ${bookId} ${chapter}`);
    }
    const data = await response.json();
    
    const verses: Verse[] = [];
    
    if (data.chapter && Array.isArray(data.chapter.content)) {
      for (const item of data.chapter.content) {
        if (item.type === 'verse') {
          // item.content is usually an array of strings and objects (for footnotes, etc)
          // We will extract just the raw text
          let text = '';
          if (Array.isArray(item.content)) {
            for (const c of item.content) {
              if (typeof c === 'string') {
                text += c;
              } else if (typeof c === 'object' && c !== null) {
                // If there's an object like a footnote or word-level data, try to extract 'text'
                // For Free Use Bible API, text is sometimes in c.text
                if (typeof c.text === 'string') text += c.text;
                else if (typeof c.content === 'string') text += c.content;
                else if (Array.isArray(c.content)) {
                  // Fallback for nested content
                  text += c.content.filter((x: any) => typeof x === 'string').join('');
                }
              }
            }
          } else if (typeof item.content === 'string') {
             text = item.content;
          }

          verses.push({
            bookId,
            bookName,
            chapter,
            verse: item.number,
            text: text.trim() || '...',
          });
        }
      }
    }

    if (verses.length > 0) {
      await cacheChapter(bookId, chapter, verses);
    }
    return verses;

  } catch (error) {
    console.error("Error fetching Bible verse:", error);
    return [];
  }
}
