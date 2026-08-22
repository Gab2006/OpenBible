import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen, X, Check, RotateCcw } from 'lucide-react';
import { books } from '../data/books';
import { getDailyVerse } from '../data/dailyVerses';
import { isVerseSaved, saveVerse, removeSavedVerse, getCompletedChapters, getSavedVersesCount, getReadingStreak } from '../services/storage';
import { fetchChapter } from '../services/bibleApi';
import type { ReadingPosition } from '../services/storage';
import { SaveButton } from './SaveButton';
import { useTheme } from './ThemeProvider';
import { useHomeLayout } from '../hooks/useHomeLayout';
import { ReorderableHome } from './ReorderableHome';
import { ReorderableStats } from './ReorderableStats';

import type { HomeCardId, StatCardId } from '../types/homeLayoutTypes';

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
  const { theme } = useTheme();
  const {
    isLoaded,
    isReordering,
    enterReorderMode,
    exitReorderMode,
    resetOrder,
    homeOrder,
    setHomeOrder,
    statsOrder,
    setStatsOrder
  } = useHomeLayout();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [openTestament, setOpenTestament] = useState<'OT' | 'NT' | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDailyVerseSaved, setIsDailyVerseSaved] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [savedVersesCount, setSavedVersesCount] = useState<number>(0);
  const [readingStreak, setReadingStreak] = useState<number>(0);
  const [chapterVerseCount, setChapterVerseCount] = useState<number>(0);
  const chapterGridRef = useRef<HTMLDivElement>(null);
  const [resetRotation, setResetRotation] = useState(0);

  const handleReset = () => {
    setResetRotation(r => r - 360);
    resetOrder();
  };

  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');
  const dailyVerse = getDailyVerse();

  // Carica i capitoli completati e le statistiche
  const loadProgress = useCallback(() => {
    getCompletedChapters().then(setCompletedChapters);
    getSavedVersesCount().then(setSavedVersesCount);
    getReadingStreak().then(setReadingStreak);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    window.addEventListener('progress-changed', loadProgress);
    window.addEventListener('verses-changed', loadProgress);
    return () => {
      window.removeEventListener('progress-changed', loadProgress);
      window.removeEventListener('verses-changed', loadProgress);
    };
  }, [loadProgress]);

  useEffect(() => {
    if (readingPosition) {
      fetchChapter(readingPosition.bookId, readingPosition.chapter).then(res => {
        if (!res.error && res.verses) {
          setChapterVerseCount(res.verses.length);
        }
      });
    }
  }, [readingPosition]);

  const progressPercentage = readingPosition && chapterVerseCount > 0
    ? Math.min(100, Math.round((readingPosition.verse / chapterVerseCount) * 100))
    : 0;

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

  // Gestione avanzata dello scroll su iOS durante il reordering
  useEffect(() => {
    if (!isReordering) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      // Se stiamo toccando una card riordinabile, preveniamo lo scroll nativo
      if ((e.target as HTMLElement).closest('[data-reorderable="true"]')) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };
    
    // capture: true garantisce che l'evento venga intercettato prima che Safari lo usi per scorrere
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    return () => document.removeEventListener('touchmove', handleTouchMove, { capture: true } as any);
  }, [isReordering]);

  const OT_SECTIONS = [
    { title: 'Pentateuco', start: 0, end: 5 },
    { title: 'Libri Storici', start: 5, end: 17 },
    { title: 'Libri Sapienziali', start: 17, end: 22 },
    { title: 'Profeti Maggiori', start: 22, end: 27 },
    { title: 'Profeti Minori', start: 27, end: 39 },
  ];

  const NT_SECTIONS = [
    { title: 'Vangeli & Atti', start: 0, end: 5 },
    { title: 'Lettere di Paolo', start: 5, end: 18 },
    { title: 'Lettere Cattoliche', start: 18, end: 26 },
    { title: 'Apocalisse', start: 26, end: 27 },
  ];

  const renderBookList = (list: typeof books) => {
    if (list.length === 0) return null;
    const testament = list[0].testament;
    const sections = testament === 'OT' ? OT_SECTIONS : NT_SECTIONS;

    return (
      <div className="space-y-6 pb-4">
        {sections.map(section => {
          const sectionBooks = list.slice(section.start, section.end);
          if (sectionBooks.length === 0) return null;
          
          return (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium px-1">
                {section.title}
              </h3>
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 gap-2"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.03 } },
                }}
              >
                {sectionBooks.map(book => {
                  let readChapters = 0;
                  for (let ch = 1; ch <= book.chapters; ch++) {
                    if (completedChapters.has(`${book.id}-${ch}`)) readChapters++;
                  }
                  const bookDone = readChapters === book.chapters;
                  const isStarted = readChapters > 0;
                  const progressPercentage = Math.round((readChapters / book.chapters) * 100);

                  return (
                    <React.Fragment key={book.id}>
                      <motion.button
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        onClick={() => setSelectedBook(book.id === selectedBook ? null : book.id)}
                        className={`relative p-3 ${isStarted ? 'pb-7' : ''} text-left rounded-xl transition-all duration-200 border flex flex-col justify-center
                          ${selectedBook === book.id
                            ? 'bg-accent/10 border-accent/40 text-accent shadow-sm'
                            : bookDone
                              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15'
                              : 'border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 hover:border-accent/20'}`}
                      >
                        <div className="w-full flex items-center justify-between">
                          <span className={`truncate flex items-center gap-1.5 ${selectedBook === book.id ? 'font-medium' : ''}`}>
                            {book.name}
                          </span>
                          {selectedBook === book.id && (
                            <ChevronRight className="w-4 h-4 shrink-0 text-accent" />
                          )}
                        </div>
                        {isStarted && (
                          <div className={`absolute bottom-1.5 right-1.5 text-[9px] font-sans font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1
                            ${bookDone 
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-accent/20 text-accent'}`}
                          >
                            {bookDone ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <span>{progressPercentage}%</span>
                            )}
                          </div>
                        )}
                        {isStarted && !bookDone && (
                          <div className="absolute bottom-1.5 left-3 text-[9px] font-sans uppercase tracking-wider opacity-50">
                            {readChapters}/{book.chapters} cap
                          </div>
                        )}
                      </motion.button>
                      <AnimatePresence>
                        {selectedBook === book.id && renderChapterGrid(book.id)}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </motion.div>
            </div>
          );
        })}
      </div>
    );
  };

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
            {Array.from({ length: book.chapters }).map((_, i) => {
              const chapterDone = completedChapters.has(`${book.id}-${i + 1}`);
              return (
                <motion.button
                  key={i}
                  variants={{
                    hidden: { opacity: 0, scale: 0.8 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  onClick={() => onSelectChapter(book.id, i + 1)}
                  className={`aspect-square flex items-center justify-center rounded-xl text-sm font-medium border active:scale-95 transition-all duration-150
                    ${chapterDone
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : 'bg-light-bg dark:bg-dark-bg border-black/5 dark:border-white/5 hover:border-accent hover:text-accent hover:bg-accent/5'}`}
                >
                  {i + 1}
                </motion.button>
              );
            })}
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

  if (!isLoaded) return null;

  const renderStatCard = (id: StatCardId) => {
    switch (id) {
      case 'chapters':
        return (
          <motion.div
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.04] flex flex-col items-center justify-center text-center h-full w-full"
          >
            <div className="text-2xl mb-1">📖</div>
            <div className="font-serif text-2xl font-medium text-accent leading-none mb-1">{completedChapters.size}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">Capitoli letti</div>
          </motion.div>
        );
      case 'saved':
        return (
          <motion.div
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.04] flex flex-col items-center justify-center text-center h-full w-full"
          >
            <div className="text-2xl mb-1">❤️</div>
            <div className="font-serif text-2xl font-medium text-accent leading-none mb-1">{savedVersesCount}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">Versi salvati</div>
          </motion.div>
        );
      case 'streak':
        return (
          <motion.div
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            className="p-4 rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.01] to-black/[0.04] dark:from-white/[0.01] dark:to-white/[0.04] flex flex-col items-center justify-center text-center h-full w-full"
          >
            <div className="text-2xl mb-1">🔥</div>
            <div className="font-serif text-2xl font-medium text-accent leading-none mb-1">{readingStreak}</div>
            <div className="text-[10px] uppercase tracking-wider opacity-60">Giorni di fila</div>
          </motion.div>
        );
    }
  };

  const renderHomeCard = (id: HomeCardId) => {
    switch (id) {
      case 'continue-reading':
        return (
          <motion.button
            onClick={isReordering ? undefined : onContinue}
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            className="w-full bg-gradient-to-br from-accent via-[#C9A23E] to-[#A07A20] text-white p-6 rounded-3xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-left relative overflow-hidden group"
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          >
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
            
            {readingPosition ? (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    className="text-white/30"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-white"
                    strokeWidth="3"
                    strokeDasharray={`${progressPercentage}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${progressPercentage}, 100` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white font-sans text-xs font-bold tracking-tighter">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/5 rounded-full" />
            )}

            <div className="relative z-10 pr-20">
              <div className="flex items-center gap-2 text-white opacity-70 text-xs uppercase tracking-widest font-sans mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                {readingPosition ? 'Continua a leggere' : 'Inizia a leggere'}
              </div>
              <div className="font-serif text-2xl md:text-3xl font-medium mb-1 truncate">
                {readingPosition
                  ? `${books.find(b => b.id === readingPosition.bookId)?.name || '...'}`
                  : 'Genesi'}
              </div>
              <div>
                <span className="text-white/60 text-sm font-sans block truncate">
                  {readingPosition
                    ? `Capitolo ${readingPosition.chapter}, verso ${readingPosition.verse}`
                    : 'Capitolo 1, verso 1'}
                </span>
              </div>
            </div>
          </motion.button>
        );
      case 'daily-verse':
        return (
          <motion.div 
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            className="p-5 rounded-3xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.05] dark:from-white/[0.02] dark:to-white/[0.05] relative overflow-hidden group"
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
          >
            <div className="absolute -left-2 -top-3 text-6xl font-serif text-accent/10 select-none leading-none">
              &ldquo;
            </div>
            
            <div className="absolute bottom-2 right-2 z-20" onClick={isReordering ? (e) => e.stopPropagation() : undefined}>
              <SaveButton isSaved={isDailyVerseSaved} onToggle={isReordering ? () => {} : toggleDailyVerseSave} />
            </div>

            <div className="relative z-10 pr-8 pointer-events-none">
              <p className="text-xs uppercase tracking-widest text-accent font-sans font-medium mb-3">
                Ispirazione Giornaliera
              </p>
              <p className="font-serif text-base md:text-lg leading-relaxed mb-3 italic">
                {dailyVerse.text}
              </p>
              <p className="text-sm font-sans tracking-wider text-accent/70">
                — {dailyVerse.reference}
              </p>
            </div>
          </motion.div>
        );
      case 'stats':
        return (
          <ReorderableStats
            order={statsOrder}
            setOrder={setStatsOrder}
            isReordering={isReordering}
            onEnterReorderMode={enterReorderMode}
            renderCard={renderStatCard}
          />
        );
      case 'testament-ot': {
        const otStats = (() => {
          let total = 0;
          let read = 0;
          otBooks.forEach(b => {
            total += b.chapters;
            for (let ch = 1; ch <= b.chapters; ch++) {
              if (completedChapters.has(`${b.id}-${ch}`)) read++;
            }
          });
          return { total, read, percentage: total > 0 ? Math.round((read / total) * 100) : 0 };
        })();
        return (
          <motion.button
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            onClick={isReordering ? undefined : () => handleTestamentClick('OT')}
            className="w-full p-5 rounded-2xl text-left border-l-4 border-l-accent border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06] hover:border-accent/30 hover:shadow-sm transition-all duration-300 group relative overflow-hidden"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform text-accent/20" viewBox="0 0 36 36">
                  <path
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-accent"
                    strokeWidth="3"
                    strokeDasharray={`${otStats.percentage}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${otStats.percentage}, 100` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold font-sans text-accent">{otStats.percentage}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="font-serif text-xl font-medium text-accent mb-0.5">Antico Testamento</h2>
                <p className="text-sm opacity-60">39 libri · Da Genesi a Malachia</p>
                <p className="text-xs opacity-40 mt-0.5">{otStats.read} di {otStats.total} capitoli letti</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all mt-3 shrink-0" />
            </div>
            {/* Pill Progress Bar Sottile */}
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${otStats.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.button>
        );
      }
      case 'testament-nt': {
        const ntStats = (() => {
          let total = 0;
          let read = 0;
          ntBooks.forEach(b => {
            total += b.chapters;
            for (let ch = 1; ch <= b.chapters; ch++) {
              if (completedChapters.has(`${b.id}-${ch}`)) read++;
            }
          });
          return { total, read, percentage: total > 0 ? Math.round((read / total) * 100) : 0 };
        })();
        return (
          <motion.button
            animate={{ scale: isReordering ? 1.02 : 1 }}
            whileHover={!isReordering ? { scale: 1.02 } : undefined}
            whileTap={!isReordering ? { scale: 0.98 } : undefined}
            onClick={isReordering ? undefined : () => handleTestamentClick('NT')}
            className="w-full p-5 rounded-2xl text-left border-l-4 border-l-accent border border-black/5 dark:border-white/5 bg-gradient-to-br from-black/[0.02] to-black/[0.06] dark:from-white/[0.02] dark:to-white/[0.06] hover:border-accent/30 hover:shadow-sm transition-all duration-300 group relative overflow-hidden"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90 transform text-accent/20" viewBox="0 0 36 36">
                  <path
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-accent"
                    strokeWidth="3"
                    strokeDasharray={`${ntStats.percentage}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${ntStats.percentage}, 100` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold font-sans text-accent">{ntStats.percentage}%</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="font-serif text-xl font-medium text-accent mb-0.5">Nuovo Testamento</h2>
                <p className="text-sm opacity-60">27 libri · Da Matteo ad Apocalisse</p>
                <p className="text-xs opacity-40 mt-0.5">{ntStats.read} di {ntStats.total} capitoli letti</p>
              </div>
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-60 group-hover:translate-x-0.5 transition-all mt-3 shrink-0" />
            </div>
            {/* Pill Progress Bar Sottile */}
            <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${ntStats.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </motion.button>
        );
      }
    }
  };

  return (
    <div className="h-full text-light-text dark:text-dark-text relative overflow-hidden">
      {/* Immagine di sfondo decorativa (solo per il tema classico) */}
      {theme.id === 'classic' && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.03] bg-[url('/nobg-icon.png')] bg-no-repeat bg-center bg-[length:150%] md:bg-[length:80%]" />
      )}
      
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
        <div className="p-6 md:p-12 pb-[calc(7rem+env(safe-area-inset-bottom))] relative z-10">
        {/* Saluto dinamico e Header */}
        <header className="mb-8 pt-[max(0.5rem,env(safe-area-inset-top))] flex justify-between items-start">
          <div>
            <p className="text-sm font-sans tracking-wider uppercase text-light-text/50 dark:text-dark-text/50 mb-1 select-none">
              {getGreeting()}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight leading-tight select-none">
              Cosa leggerai<br />oggi?
            </h1>
          </div>
          <AnimatePresence>
            {isReordering && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-row gap-3 items-center mt-2"
              >
                <motion.button 
                  onClick={handleReset} 
                  animate={{ rotate: resetRotation }}
                  transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
                  title="Ripristina layout predefinito"
                  className="p-2 text-accent [&>svg]:opacity-70 hover:[&>svg]:opacity-100 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full z-50 transition-colors [&>svg]:transition-opacity"
                >
                  <RotateCcw size={18} strokeWidth={2.5} />
                </motion.button>
                <button onClick={exitReorderMode} className="bg-accent text-white px-5 py-2 rounded-full font-medium text-sm shadow-md active:scale-95 transition-transform hover:shadow-lg z-50 select-none">
                  Fatto
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <main className="max-w-2xl mx-auto">
          <ReorderableHome 
            order={homeOrder} 
            setOrder={setHomeOrder} 
            isReordering={isReordering} 
            onEnterReorderMode={enterReorderMode}
            renderCard={renderHomeCard}
          />
        </main>
      </div>
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
