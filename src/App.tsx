import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReaderScreen } from './components/ReaderScreen';
import { SavedVersesScreen } from './components/SavedVersesScreen';
import { getReadingPosition, saveReadingPosition, getAllSavedVerses } from './services/storage';
import type { ReadingPosition } from './services/storage';
import { books } from './data/books';

type ViewState = 
  | { type: 'home' }
  | { type: 'reader', bookId: string, chapter: number, verse: number }
  | { type: 'saved' };

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [readingPosition, setReadingPosition] = useState<ReadingPosition | undefined>(undefined);
  const [savedCount, setSavedCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    getReadingPosition().then(setReadingPosition);
    getAllSavedVerses().then(verses => setSavedCount(verses.length));
  }, [view]); // Refresh when view changes

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handlePositionChange = (bookId: string, chapter: number, verse: number) => {
    saveReadingPosition({ bookId, chapter, verse });
    setReadingPosition({ bookId, chapter, verse });
  };

  const handleRandomVerse = () => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
    // We don't know the exact verse count, so we guess 1 or something small, or fetch it first.
    // For now, let's just go to verse 1 of a random chapter.
    // To make it truly random verse, we'd need chapter verses count, which we don't have without fetching.
    // Let's just pick verse 1 to be safe and responsive.
    setView({ type: 'reader', bookId: randomBook.id, chapter: randomChapter, verse: 1 });
  };

  return (
    <>
      {view.type === 'home' && (
        <HomeScreen 
          readingPosition={readingPosition}
          savedVersesCount={savedCount}
          onContinue={() => {
            if (readingPosition) {
              setView({ type: 'reader', ...readingPosition });
            } else {
              setView({ type: 'reader', bookId: 'GEN', chapter: 1, verse: 1 });
            }
          }}
          onRandomVerse={handleRandomVerse}
          onOpenSaved={() => setView({ type: 'saved' })}
          onSelectChapter={(bookId, chapter) => setView({ type: 'reader', bookId, chapter, verse: 1 })}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      )}
      
      {view.type === 'reader' && (
        <ReaderScreen 
          initialBookId={view.bookId}
          initialChapter={view.chapter}
          initialVerse={view.verse}
          onHome={() => setView({ type: 'home' })}
          onPositionChange={handlePositionChange}
        />
      )}

      {view.type === 'saved' && (
        <SavedVersesScreen 
          onBack={() => setView({ type: 'home' })}
          onSelectVerse={(bookId, chapter, verse) => setView({ type: 'reader', bookId, chapter, verse })}
        />
      )}
    </>
  );
}
