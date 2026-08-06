import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, X } from 'lucide-react';
import { books } from '../data/books';
import { getDailyVerse } from '../data/dailyVerses';
import { isVerseSaved, saveVerse, removeSavedVerse } from '../services/storage';
import type { ReadingPosition } from '../services/storage';
import { SaveButton } from './SaveButton';

interface HomeScreenProps {
  readingPosition: ReadingPosition | undefined;
  onContinue: () => void;
  onSelectChapter: (bookId: string, chapter: number) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buongiorno';
  if (hour < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  readingPosition,
  onContinue,
  onSelectChapter
}) => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [openTestament, setOpenTestament] = useState<'OT' | 'NT' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDailyVerseSaved, setIsDailyVerseSaved] = useState(false);
  const chapterGridRef = useRef<HTMLDivElement>(null);

  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');
  const dailyVerse = getDailyVerse();

  useEffect(() => {
    isVerseSaved(dailyVerse.bookId, dailyVerse.chapter, dailyVerse.verse).then(setIsDailyVerseSaved);
  }, [dailyVerse]);

  const toggleDailyVerseSave = async () => {
    if (isDailyVerseSaved) {
      await removeSavedVerse(dailyVerse.bookId, dailyVerse.chapter, dailyVerse.verse);
      setIsDailyVerseSaved(false);
    } else {
      await saveVerse({
        bookId: dailyVerse.bookId,
        bookName: dailyVerse.bookName,
        chapter: dailyVerse.chapter,
        verse: dailyVerse.verse,
        text: dailyVerse.text
      });
      setIsDailyVerseSaved(true);
    }
  };

  // Scroll automatico verso la griglia capitoli quando si seleziona un libro
  useEffect(() => {
    if (selectedBook && chapterGridRef.current) {
      chapterGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedBook]);

  const renderBookList = (list: typeof books) => (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.03 } },
      }}
    >
      {list.map(book => (
        <React.Fragment key={book.id}>
          <motion.button
            variants={{
              hidden: { opacity: 0, y: 8 },
              visible: { opacity: 1, y: 0 },
            }}
            onClick={() => setSelectedBook(book.id === selectedBook ? null : book.id)}
            className={`p-3 text-left rounded-xl transition-all duration-200 border flex items-center justify-between
              ${selectedBook === book.id
                ? 'bg-accent/10 border-accent/40 text-accent font-medium shadow-sm'
                : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 hover:border-accent/20'}`}
          >
            <span className="truncate">{book.name}</span>
            {selectedBook === book.id && (
              <ChevronRight className="w-4 h-4 shrink-0 text-accent" />
            )}
          </motion.button>
          <AnimatePresence>
            {selectedBook === book.id && renderChapterGrid(book.id)}
          </AnimatePresence>
        </React.Fragment>
      ))}
    </motion.div>
  );

  const renderChapterGrid = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return null;

    return (
      <motion.div
        ref={chapterGridRef}
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="col-span-2 md:col-span-3 origin-top overflow-hidden"
      >
        <div className="my-2 p-4 bg-accent/5 dark:bg-accent/10 rounded-2xl border border-accent/10">
          <h3 className="font-medium mb-3 text-sm uppercase tracking-wider text-accent/70">
            Capitoli di {book.name}
          </h3>
          <motion.div
            className="grid grid-cols-5 sm:grid-cols-8 gap-2"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.015 } },
            }}
          >
            {Array.from({ length: book.chapters }).map((_, i) => (
              <motion.button
                key={i}
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1 },
                }}
                onClick={() => onSelectChapter(book.id, i + 1)}
                className="aspect-square flex items-center justify-center rounded-xl bg-light-bg dark:bg-dark-bg text-sm font-medium border border-black/5 dark:border-white/5 hover:border-accent hover:text-accent hover:bg-accent/5 active:scale-95 transition-all duration-150"
              >
                {i + 1}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const handleTestamentClick = (testament: 'OT' | 'NT') => {
    if (openTestament === testament) {
      setOpenTestament(null);
      setSelectedBook(null);
      setIsFullscreen(false);
    } else {
      setOpenTestament(testament);
      setSelectedBook(null);
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-y-auto relative">
      {/* Immagine di sfondo decorativa */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03] bg-[url('/nobg-icon.png')] bg-no-repeat bg-center bg-[length:150%] md:bg-[length:80%]" />
      
      <div className="p-6 md:p-12 pb-28 relative z-10">
        {/* Saluto dinamico */}
        <header className="mb-8 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <p className="text-sm font-sans tracking-wider uppercase text-light-text/50 dark:text-dark-text/50 mb-1">
            {getGreeting()}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight leading-tight">
            Cosa leggerai<br />oggi?
          </h1>
        </header>

        <main className="max-w-2xl mx-auto space-y-6">

          {/* Hero Card — Continua a Leggere */}
          <motion.button
            onClick={onContinue}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-br from-accent via-[#C9A23E] to-[#A07A20] text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-left relative overflow-hidden group"
          >
            {/* Decorazione di sfondo */}
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute right-6 top-6 w-16 h-16 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-widest font-sans mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                {readingPosition ? 'Continua a leggere' : 'Inizia a leggere'}
              </div>
              <div className="font-serif text-2xl md:text-3xl font-medium mb-1">
                {readingPosition
                  ? `${books.find(b => b.id === readingPosition.bookId)?.name || '...'}`
                  : 'Genesi'}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-sans">
                  {readingPosition
                    ? `Capitolo ${readingPosition.chapter}, verso ${readingPosition.verse}`
                    : 'Capitolo 1, verso 1'}
                </span>
                <ChevronRight className="w-5 h-5 text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.button>

          {/* Verso del Giorno */}
          <div className="p-5 rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.05] dark:from-white/[0.02] dark:to-white/[0.05] relative overflow-hidden group">
            <div className="absolute -left-2 -top-3 text-6xl font-serif text-accent/10 select-none leading-none">
              &ldquo;
            </div>
            
            <div className="absolute bottom-2 right-2 z-20">
              <SaveButton isSaved={isDailyVerseSaved} onToggle={toggleDailyVerseSave} />
            </div>

            <div className="relative z-10 pr-8">
              <p className="text-xs uppercase tracking-widest text-accent font-sans font-medium mb-3">
                Verso del Giorno
              </p>
              <p className="font-serif text-base md:text-lg leading-relaxed mb-3 italic">
                {dailyVerse.text}
              </p>
              <p className="text-sm font-sans tracking-wider text-accent/70">
                — {dailyVerse.reference}
              </p>
            </div>
          </div>

          {/* Card Testamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestamentClick('OT')}
              className="p-5 rounded-2xl text-left border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06] hover:border-accent/30 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">📜</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl font-medium text-accent mb-0.5">Antico Testamento</h2>
                  <p className="text-sm opacity-50">39 libri · Da Genesi a Malachia</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTestamentClick('NT')}
              className="p-5 rounded-2xl text-left border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06] hover:border-accent/30 hover:shadow-sm transition-all duration-300 group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">✝️</span>
                <div className="flex-1 min-w-0">
                  <h2 className="font-serif text-xl font-medium text-accent mb-0.5">Nuovo Testamento</h2>
                  <p className="text-sm opacity-50">27 libri · Da Matteo ad Apocalisse</p>
                </div>
                <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
              </div>
            </motion.button>
          </div>
        </main>
      </div>

      {/* Bottom sheet dei libri */}
      <AnimatePresence>
        {openTestament && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => { setOpenTestament(null); setSelectedBook(null); setIsFullscreen(false); }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%', height: '85dvh', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              animate={{ 
                y: 0, 
                height: isFullscreen ? '100dvh' : '85dvh',
                borderTopLeftRadius: isFullscreen ? 0 : 24,
                borderTopRightRadius: isFullscreen ? 0 : 24
              }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-light-bg dark:bg-dark-bg w-full shadow-2xl flex flex-col"
            >
              {/* Drag handle */}
              <motion.div 
                className="flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing touch-none"
                onPanEnd={(_event, info) => {
                  if (info.offset.y < -30) {
                    setIsFullscreen(true);
                  } else if (info.offset.y > 30) {
                    if (isFullscreen) {
                      setIsFullscreen(false);
                    } else {
                      setOpenTestament(null);
                      setSelectedBook(null);
                      setIsFullscreen(false);
                    }
                  }
                }}
              >
                <div className="w-10 h-1 rounded-full bg-black/10 dark:bg-white/10" />
              </motion.div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 pb-4 border-b border-black/5 dark:border-white/5 shrink-0">
                <h2 className="font-serif text-2xl font-medium text-accent">
                  {openTestament === 'OT' ? 'Antico Testamento' : 'Nuovo Testamento'}
                </h2>
                <button
                  onClick={() => { setOpenTestament(null); setSelectedBook(null); setIsFullscreen(false); }}
                  className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5 opacity-50" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 overflow-y-auto overscroll-contain">
                {openTestament === 'OT' ? renderBookList(otBooks) : renderBookList(ntBooks)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
