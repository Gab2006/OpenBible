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

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/reader/')) {
        const parts = hash.split('/');
        if (parts.length >= 5) {
          const bookId = parts[2];
          const chapter = parseInt(parts[3], 10);
          const verse = parseInt(parts[4], 10);
          if (bookId && !isNaN(chapter) && !isNaN(verse)) {
            setView({ type: 'reader', bookId, chapter, verse });
            return;
          }
        }
      } else if (hash === '#/saved') {
        setView({ type: 'saved' });
        return;
      }
      setView({ type: 'home' });
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when view changes (unless it's already in sync)
  useEffect(() => {
    const hash = window.location.hash;
    if (view.type === 'home' && hash !== '#/' && hash !== '') {
      window.location.hash = '/';
    } else if (view.type === 'saved' && hash !== '#/saved') {
      window.location.hash = '/saved';
    } else if (view.type === 'reader') {
      const expectedHash = `#/reader/${view.bookId}/${view.chapter}/${view.verse}`;
      if (hash !== expectedHash) {
        window.location.hash = `/reader/${view.bookId}/${view.chapter}/${view.verse}`;
      }
    }
  }, [view]);

  useEffect(() => {
    getReadingPosition().then(setReadingPosition);
    getAllSavedVerses().then(verses => setSavedCount(verses.length));
  }, [view]);

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
    // Update view state to keep it in sync with the current verse read
    setView({ type: 'reader', bookId, chapter, verse });
  };

  const handleRandomVerse = () => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
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
