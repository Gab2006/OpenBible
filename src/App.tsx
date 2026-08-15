import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeScreen } from './components/HomeScreen';
import { ReaderScreen } from './components/ReaderScreen';
import { SavedVersesScreen } from './components/SavedVersesScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { ThemeProvider } from './components/ThemeProvider';
import { getReadingPosition, saveReadingPosition, getAllSavedVerses, initDB } from './services/storage';
import type { ReadingPosition } from './services/storage';
import { fetchChapter } from './services/bibleApi';
import { books } from './data/books';

type ViewState = 
  | { type: 'home' }
  | { type: 'reader', bookId: string, chapter: number, verse: number, source: 'reading' | 'saved' | 'random' | 'notification' }
  | { type: 'saved' }
  | { type: 'settings' };

export default function App() {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [readingPosition, setReadingPosition] = useState<ReadingPosition | undefined>(undefined);
  const [savedCount, setSavedCount] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  // Hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/reader/')) {
        const [pathPart, queryPart] = hash.split('?');
        const parts = pathPart.split('/');
        const isNotification = queryPart === 'source=notification';
        
        if (parts.length >= 5) {
          const bookId = parts[2];
          const chapter = parseInt(parts[3], 10);
          const verse = parseInt(parts[4], 10);
          if (bookId && !isNaN(chapter) && !isNaN(verse)) {
            setView(prev => {
              if (prev.type === 'reader' && prev.bookId === bookId && prev.chapter === chapter && prev.verse === verse) return prev;
              const source = isNotification ? 'notification' : (prev.type === 'reader' ? prev.source : 'reading');
              return { type: 'reader', bookId, chapter, verse, source };
            });
            return;
          }
        }
      } else if (hash === '#/saved') {
        setView(prev => prev.type === 'saved' ? prev : { type: 'saved' });
        return;
      } else if (hash === '#/settings') {
        setView(prev => prev.type === 'settings' ? prev : { type: 'settings' });
        return;
      }
      setView(prev => prev.type === 'home' ? prev : { type: 'home' });
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
    } else if (view.type === 'settings' && hash !== '#/settings') {
      window.location.hash = '/settings';
    } else if (view.type === 'reader') {
      const expectedHash = `#/reader/${view.bookId}/${view.chapter}/${view.verse}`;
      // Remove query parameters from the hash for comparison
      const currentHashPath = hash.split('?')[0];
      if (currentHashPath !== expectedHash) {
        window.location.hash = `/reader/${view.bookId}/${view.chapter}/${view.verse}`;
      }
    }
  }, [view]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initDB();
        const pos = await getReadingPosition();
        if (pos) {
          setReadingPosition(pos);
          await fetchChapter(pos.bookId, pos.chapter);
        } else {
          await fetchChapter('GEN', 1);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        const preloader = document.getElementById('global-preloader');
        if (preloader) {
          preloader.classList.add('hidden');
          setTimeout(() => {
            preloader.remove();
            document.body.style.overflow = '';
          }, 400);
        }
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      getReadingPosition().then(setReadingPosition);
    }
  }, [view, isInitializing]);

  useEffect(() => {
    const updateSavedCount = () => {
      getAllSavedVerses().then(verses => setSavedCount(verses.length));
    };
    
    updateSavedCount();
    window.addEventListener('verses-changed', updateSavedCount);
    return () => window.removeEventListener('verses-changed', updateSavedCount);
  }, []);

  const handlePositionChange = useCallback((bookId: string, chapter: number, verse: number) => {
    saveReadingPosition({ bookId, chapter, verse });
    setReadingPosition({ bookId, chapter, verse });
    // Mantieni il view state sincronizzato con il verso letto
    setView(prev => {
      if (prev.type === 'reader' && prev.bookId === bookId && prev.chapter === chapter && prev.verse === verse) {
        return prev;
      }
      return { type: 'reader', bookId, chapter, verse, source: prev.type === 'reader' ? prev.source : 'reading' };
    });
  }, []);

  const handleRandomVerse = async () => {
    const randomBook = books[Math.floor(Math.random() * books.length)];
    const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
    
    const { verses } = await fetchChapter(randomBook.id, randomChapter);
    const randomVerse = verses.length > 0 
      ? verses[Math.floor(Math.random() * verses.length)].verse 
      : 1;

    setView({ type: 'reader', bookId: randomBook.id, chapter: randomChapter, verse: randomVerse, source: 'random' });
  };

  if (isInitializing) {
    return null;
  }

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {view.type === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            <HomeScreen 
              readingPosition={readingPosition}
              onContinue={() => {
                if (readingPosition) {
                  setView({ type: 'reader', ...readingPosition, source: 'reading' });
                } else {
                  setView({ type: 'reader', bookId: 'GEN', chapter: 1, verse: 1, source: 'reading' });
                }
              }}
              onSelectChapter={(bookId, chapter) => setView({ type: 'reader', bookId, chapter, verse: 1, source: 'reading' })}
            />
          </motion.div>
        )}
        
        {view.type === 'reader' && (
          <motion.div 
            key="reader"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            <ReaderScreen 
              initialBookId={view.bookId}
              initialChapter={view.chapter}
              initialVerse={view.verse}
              source={view.source}
              onHome={() => setView({ type: 'home' })}
              onPositionChange={handlePositionChange}
            />
          </motion.div>
        )}

        {view.type === 'saved' && (
          <motion.div 
            key="saved"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            <SavedVersesScreen 
              onBack={() => setView({ type: 'home' })}
              onSelectVerse={(bookId, chapter, verse) => setView({ type: 'reader', bookId, chapter, verse, source: 'saved' })}
            />
          </motion.div>
        )}

        {view.type === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full"
          >
            <SettingsScreen />
          </motion.div>
        )}
      </AnimatePresence>
      
      <BottomNav
        currentView={view.type}
        onNavigateHome={() => setView({ type: 'home' })}
        onShuffle={handleRandomVerse}
        onNavigateSaved={() => setView({ type: 'saved' })}
        onNavigateSettings={() => setView({ type: 'settings' })}
        savedVersesCount={savedCount}
      />
    </ThemeProvider>
  );
}
