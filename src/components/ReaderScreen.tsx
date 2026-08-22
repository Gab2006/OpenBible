import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { isVerseSaved, saveVerse, removeSavedVerse, markChapterCompleted } from '../services/storage';
import type { Verse } from '../services/storage';
import { SaveButton } from './SaveButton';
import { ShareButton } from './ShareButton';
import { useTheme } from './ThemeProvider';
import { books } from '../data/books';
import { fetchChapter, prefetchNextChapter } from '../services/bibleApi';

interface ReaderScreenProps {
  initialBookId: string;
  initialChapter: number;
  initialVerse: number;
  source: 'reading' | 'saved' | 'random' | 'notification';
  onHome: () => void;
  onPositionChange: (bookId: string, chapter: number, verse: number) => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({
  initialBookId,
  initialChapter,
  initialVerse,
  source,
  onHome: _onHome,
  onPositionChange,
}) => {
  const [currentBookId, setCurrentBookId] = useState(initialBookId);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [currentVerseNum, setCurrentVerseNum] = useState(initialVerse);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showChapterComplete, setShowChapterComplete] = useState(false);
  const { translation, setTranslation } = useTheme();

  // Keep local state in sync with initial props when they change externally (e.g. hash routing)
  useEffect(() => {
    setCurrentBookId(initialBookId);
    setCurrentChapter(initialChapter);
    setCurrentVerseNum(initialVerse);
  }, [initialBookId, initialChapter, initialVerse]);

  // Load chapter verses
  useEffect(() => {
    let active = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      const { verses: chapterVerses, error: fetchError } = await fetchChapter(currentBookId, currentChapter, translation);
      if (active) {
        setVerses(chapterVerses);
        setError(fetchError);
        setIsLoading(false);

        // Se abbiamo caricato con successo il capitolo corrente, scateniamo il prefetch di quello successivo
        if (!fetchError && chapterVerses.length > 0) {
          // prefetchNextChapter non necessita di translation ma è safe da chiamare
          prefetchNextChapter(currentBookId, currentChapter);
        }
      }
    };
    load();
    return () => { active = false; };
  }, [currentBookId, currentChapter, translation]);

  // Check if current verse is saved + persist position only in reading mode
  useEffect(() => {
    isVerseSaved(currentBookId, currentChapter, currentVerseNum).then(setIsSaved);
    if (source === 'reading') {
      onPositionChange(currentBookId, currentChapter, currentVerseNum);
    }
  }, [currentBookId, currentChapter, currentVerseNum, onPositionChange, source]);

  const currentVerse = verses.find(v => v.verse === currentVerseNum);
  const bookMeta = books.find(b => b.id === currentBookId);

  const progress = verses.length > 0 ? currentVerseNum / verses.length : 0;

  const toggleSave = async () => {
    if (!currentVerse) return;
    if (isSaved) {
      await removeSavedVerse(currentBookId, currentChapter, currentVerseNum);
      setIsSaved(false);
    } else {
      await saveVerse(currentVerse);
      setIsSaved(true);
    }
  };

  const navigateTo = (dir: 1 | -1) => {
    if (!bookMeta) return;

    if (dir === 1) { // Next
      const nextVerseIndex = verses.findIndex(v => v.verse > currentVerseNum && v.text.trim() !== "");
      const isLastVerse = nextVerseIndex === -1;

      if (!isLastVerse && verses.length > 0) {
        setDirection(1);
        setCurrentVerseNum(verses[nextVerseIndex].verse);
      } else if (isLastVerse) {
        // Capitolo completato: segna il progresso
        markChapterCompleted(currentBookId, currentChapter);
        
        setShowChapterComplete(true);
        setTimeout(() => {
          setShowChapterComplete(false);
          const isLastChapter = currentChapter === bookMeta.chapters;
          if (!isLastChapter) {
            setDirection(1);
            setCurrentChapter(currentChapter + 1);
            setCurrentVerseNum(1);
          } else {
            const bookIndex = books.findIndex(b => b.id === currentBookId);
            if (bookIndex < books.length - 1) {
              setDirection(1);
              setCurrentBookId(books[bookIndex + 1].id);
              setCurrentChapter(1);
              setCurrentVerseNum(1);
            }
          }
        }, 1500);
      }
    } else { // Prev
      const prevVersesCurrentChapter = verses.filter(v => v.verse < currentVerseNum && v.text.trim() !== "");
      if (prevVersesCurrentChapter.length > 0) {
        setDirection(-1);
        setCurrentVerseNum(prevVersesCurrentChapter[prevVersesCurrentChapter.length - 1].verse);
      } else {
        if (currentChapter > 1) {
          const prevChapter = currentChapter - 1;
          fetchChapter(currentBookId, prevChapter, translation).then(({ verses: prevVerses }) => {
             const validVerses = prevVerses.filter(v => v.text.trim() !== "");
             const lastVerse = validVerses.length > 0 ? validVerses[validVerses.length - 1].verse : 1;
             setDirection(-1);
             setCurrentChapter(prevChapter);
             setCurrentVerseNum(lastVerse);
          });
        } else {
          const bookIndex = books.findIndex(b => b.id === currentBookId);
          if (bookIndex > 0) {
            const prevBook = books[bookIndex - 1];
            fetchChapter(prevBook.id, prevBook.chapters, translation).then(({ verses: prevVerses }) => {
              const validVerses = prevVerses.filter(v => v.text.trim() !== "");
              const lastVerse = validVerses.length > 0 ? validVerses[validVerses.length - 1].verse : 1;
              setDirection(-1);
              setCurrentBookId(prevBook.id);
              setCurrentChapter(prevBook.chapters);
              setCurrentVerseNum(lastVerse);
            });
          }
        }
      }
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      navigateTo(1); // Swipe left -> Next
    } else if (info.offset.x > swipeThreshold) {
      navigateTo(-1); // Swipe right -> Prev
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction === 0 ? 0 : (direction > 0 ? window.innerWidth : -window.innerWidth),
      opacity: 0,
      filter: direction === 0 ? 'blur(8px)' : 'blur(0px)',
      zIndex: 1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      filter: 'blur(0px)',
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction === 0 ? 0 : (direction < 0 ? window.innerWidth : -window.innerWidth),
      opacity: 0,
      filter: direction === 0 ? 'blur(8px)' : 'blur(0px)',
    }),
  };

  return (
    <div className="relative h-full w-full text-light-text dark:text-dark-text overflow-hidden reader-container flex flex-col">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[3px] bg-black/5 dark:bg-white/5">
        <motion.div
          className="h-full bg-accent rounded-r-full"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Header informativo */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <div className="text-xs font-sans tracking-widest uppercase text-light-text/40 dark:text-dark-text/40 w-1/3">
          {bookMeta?.name} · Capitolo {currentChapter}
        </div>
        
        <button 
          onClick={() => {
            setDirection(0);
            setTranslation(translation === 'cei' ? 'tilc' : 'cei');
          }}
          className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-xs font-sans font-medium text-light-text/60 dark:text-dark-text/60 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          {translation === 'cei' ? 'CEI 2008' : 'TILC'}
        </button>

        <div className="text-xs font-sans text-light-text/30 dark:text-dark-text/30 w-1/3 text-right">
          {currentVerseNum}/{verses.length || '…'}
        </div>
      </div>

      {/* Azioni laterali (Save, Share) */}
      <div className="absolute right-3 top-10 z-20 flex flex-col gap-3">
        <SaveButton isSaved={isSaved} onToggle={toggleSave} />
        {currentVerse && <ShareButton verse={currentVerse} />}
      </div>

      {/* Contenuto verso — area principale */}
      <div className="flex-1 relative flex items-center justify-center">

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={`${currentBookId}-${currentChapter}-${currentVerseNum}-${translation}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: direction === 0 ? 0.7 : 0.2 },
              filter: { duration: direction === 0 ? 0.7 : 0.2 },
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onDoubleClick={toggleSave}
            className="absolute inset-0 flex flex-col items-center justify-center p-8 cursor-grab active:cursor-grabbing"
          >
            {isLoading && verses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="text-sm opacity-40 font-sans">Caricamento…</span>
              </motion.div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 text-center px-4">
                <p className="opacity-70 text-base font-sans">{error}</p>
                <button 
                  onClick={() => {
                    setIsLoading(true);
                    setError(null);
                    fetchChapter(currentBookId, currentChapter, translation).then(({verses: v, error: e}) => {
                      setVerses(v);
                      setError(e);
                      setIsLoading(false);
                    });
                  }}
                  className="px-5 py-2 mt-2 bg-accent/20 text-accent rounded-full text-sm font-medium font-sans active:scale-95 transition-transform"
                >
                  Riprova
                </button>
              </div>
            ) : currentVerse ? (
              <>
                <p 
                  className="font-serif text-center leading-relaxed max-w-2xl select-text"
                  style={{ fontSize: 'var(--verse-font-size)' }}
                >
                  {currentVerse.text}
                </p>
                <div className="mt-8 text-sm font-sans tracking-widest uppercase opacity-50 text-accent font-medium">
                  {currentVerse.bookName} {currentVerse.chapter}:{currentVerse.displayVerse || currentVerse.verse}
                </div>
              </>
            ) : (
              <div className="opacity-50 text-sm font-sans">Verso non trovato.</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlay Capitolo Completato */}
      <AnimatePresence>
        {showChapterComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex flex-col items-center gap-4 text-accent"
            >
              <CheckCircle2 size={64} strokeWidth={1.5} />
              <h2 className="text-2xl font-serif text-light-text dark:text-dark-text">
                Capitolo {currentChapter} completato
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
