import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Home } from 'lucide-react';
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
  onHome,
  onPositionChange,
}) => {
  const [currentBookId, setCurrentBookId] = useState(initialBookId);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [currentVerseNum, setCurrentVerseNum] = useState(initialVerse);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [direction, setDirection] = useState(0); // 1 = right (next), -1 = left (prev)

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
    <div className="relative h-full w-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden reader-container flex flex-col justify-center items-center">
      {/* Top bar with back button */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <button onClick={onHome} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          <Home className="w-6 h-6" />
        </button>
      </div>
      
      {/* Save Button */}
      <SaveButton isSaved={isSaved} onToggle={toggleSave} />

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
            <div className="opacity-50 text-sm">Caricamento...</div>
          ) : currentVerse ? (
            <>
              <p className="font-serif text-[clamp(24px,6vw,40px)] text-center leading-relaxed max-w-2xl select-none">
                {currentVerse.text}
              </p>
              <div className="mt-8 text-sm font-sans tracking-widest uppercase opacity-60 text-accent font-medium">
                {currentVerse.bookName} {currentVerse.chapter}:{currentVerse.verse}
              </div>
            </>
          ) : (
            <div className="opacity-50 text-sm">Verso non trovato.</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
