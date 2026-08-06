import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { isVerseSaved, saveVerse, removeSavedVerse } from '../services/storage';
import type { Verse } from '../services/storage';
import { SaveButton } from './SaveButton';
import { books } from '../data/books';
import { fetchChapter } from '../services/bibleApi';

interface ReaderScreenProps {
  initialBookId: string;
  initialChapter: number;
  initialVerse: number;
  onHome: () => void;
  onPositionChange: (bookId: string, chapter: number, verse: number) => void;
}

export const ReaderScreen: React.FC<ReaderScreenProps> = ({
  initialBookId,
  initialChapter,
  initialVerse,
  onHome: _onHome,
  onPositionChange,
}) => {
  const [currentBookId, setCurrentBookId] = useState(initialBookId);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [currentVerseNum, setCurrentVerseNum] = useState(initialVerse);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);

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
      const chapterVerses = await fetchChapter(currentBookId, currentChapter);
      if (active) {
        setVerses(chapterVerses);
        setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentBookId, currentChapter]);

  // Check if current verse is saved
  useEffect(() => {
    isVerseSaved(currentBookId, currentChapter, currentVerseNum).then(setIsSaved);
    // Report position change to parent to persist it
    onPositionChange(currentBookId, currentChapter, currentVerseNum);
  }, [currentBookId, currentChapter, currentVerseNum, onPositionChange]);

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
      // Feedback visivo al salvataggio
      setShowSaveConfirm(true);
      setTimeout(() => setShowSaveConfirm(false), 1200);
    }
  };

  const navigateTo = (dir: 1 | -1) => {
    if (!bookMeta) return;
    setHasSwipedOnce(true);

    if (dir === 1) { // Next
      const isLastVerse = currentVerseNum === verses.length;
      if (!isLastVerse && verses.length > 0) {
        setDirection(1);
        setCurrentVerseNum(currentVerseNum + 1);
      } else if (isLastVerse) {
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
      }
    } else { // Prev
      if (currentVerseNum > 1) {
        setDirection(-1);
        setCurrentVerseNum(currentVerseNum - 1);
      } else {
        if (currentChapter > 1) {
          setDirection(-1);
          const prevChapter = currentChapter - 1;
          setCurrentChapter(prevChapter);
          // We don't know the exact verse count of prev chapter without fetching it,
          // but we can assume it's fetched or we set it to 999 and fetch will correct it,
          // or we fetch it first. For simplicity, let's fetch it first then set.
          fetchChapter(currentBookId, prevChapter).then(prevVerses => {
             const lastVerse = prevVerses.length > 0 ? prevVerses[prevVerses.length - 1].verse : 1;
             setCurrentVerseNum(lastVerse);
          });
        } else {
          const bookIndex = books.findIndex(b => b.id === currentBookId);
          if (bookIndex > 0) {
            setDirection(-1);
            const prevBook = books[bookIndex - 1];
            setCurrentBookId(prevBook.id);
            setCurrentChapter(prevBook.chapters);
            fetchChapter(prevBook.id, prevBook.chapters).then(prevVerses => {
              const lastVerse = prevVerses.length > 0 ? prevVerses[prevVerses.length - 1].verse : 1;
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
    } else if (info.offset.y > swipeThreshold) {
      toggleSave(); // Swipe down -> Save
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? window.innerWidth : -window.innerWidth,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? window.innerWidth : -window.innerWidth,
      opacity: 0,
    }),
  };

  return (
    <div className="relative h-full w-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden reader-container flex flex-col">
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
        <div className="text-xs font-sans tracking-widest uppercase text-light-text/40 dark:text-dark-text/40">
          {bookMeta?.name} · Capitolo {currentChapter}
        </div>
        <div className="text-xs font-sans text-light-text/30 dark:text-dark-text/30">
          {currentVerseNum}/{verses.length || '…'}
        </div>
      </div>

      {/* Save Button */}
      <div className="absolute right-3 top-10 z-20">
        <SaveButton isSaved={isSaved} onToggle={toggleSave} />
      </div>

      {/* Feedback salvataggio */}
      <AnimatePresence>
        {showSaveConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 right-0 bottom-[calc(1.5rem+3.5rem+2rem)] z-[60] flex justify-center pointer-events-none"
          >
            <div className="bg-accent/90 text-white rounded-2xl px-6 py-4 shadow-xl flex items-center gap-3">
              <Bookmark className="w-6 h-6" fill="white" />
              <span className="font-sans font-medium text-sm">Salvato!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenuto verso — area principale */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Indicatori swipe laterali (scompaiono dopo il primo swipe) */}
        {!hasSwipedOnce && !isLoading && verses.length > 0 && (
          <>
            <motion.div
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute left-3 z-10 p-2 rounded-full bg-black/5 dark:bg-white/5"
            >
              <ChevronLeft className="w-5 h-5 opacity-50" />
            </motion.div>
            <motion.div
              animate={{ opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute right-3 z-10 p-2 rounded-full bg-black/5 dark:bg-white/5"
            >
              <ChevronRight className="w-5 h-5 opacity-50" />
            </motion.div>
          </>
        )}

        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${currentBookId}-${currentChapter}-${currentVerseNum}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
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
            ) : currentVerse ? (
              <>
                <p className="font-serif text-[clamp(22px,5.5vw,38px)] text-center leading-relaxed max-w-2xl select-none">
                  {currentVerse.text}
                </p>
                <div className="mt-8 text-sm font-sans tracking-widest uppercase opacity-50 text-accent font-medium">
                  {currentVerse.bookName} {currentVerse.chapter}:{currentVerse.verse}
                </div>
              </>
            ) : (
              <div className="opacity-50 text-sm font-sans">Verso non trovato.</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
