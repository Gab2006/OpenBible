import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, useDragControls } from 'framer-motion';
import { Trash2, BookOpen, Heart, Search, X } from 'lucide-react';
import { getAllSavedVerses, removeSavedVerse } from '../services/storage';
import type { SavedVerse } from '../services/storage';
import { books } from '../data/books';

interface SavedVersesScreenProps {
  onBack: () => void;
  onSelectVerse: (bookId: string, chapter: number, verse: number) => void;
}

/** Card con swipe-to-delete e pulsante elimina sempre visibile */
const SavedVerseCard: React.FC<{
  verse: SavedVerse;
  onSelect: () => void;
  onRemove: () => void;
}> = ({ verse, onSelect, onRemove }) => {
  const x = useMotionValue(0);
  const [isOpen, setIsOpen] = useState(false);
  const dragControls = useDragControls();

  const handleDragEnd = (_event: any, info: any) => {
    const offset = info.offset.x;
    
    if (isOpen) {
      if (offset < -20) {
        // Second swipe left -> remove
        onRemove();
      } else if (offset > 20) {
        // Swiped right -> close
        setIsOpen(false);
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      } else {
        // Snap back to open
        animate(x, -100, { type: 'spring', stiffness: 300, damping: 20 });
      }
    } else {
      if (offset < -40) {
        // First swipe left -> open
        setIsOpen(true);
        animate(x, -100, { type: 'spring', stiffness: 300, damping: 20 });
      } else {
        // Snap back to close
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isOpen) {
      e.stopPropagation();
      setIsOpen(false);
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 20 });
      return;
    }
    onSelect();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Layer rosso dietro la card (visibile con lo swipe) */}
      <div
        className="absolute inset-0 bg-red-500/10 dark:bg-red-500/20 rounded-2xl flex items-center justify-end pr-6 cursor-pointer touch-pan-y"
        onClick={onRemove}
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="flex flex-col items-center gap-1 text-red-500">
          <Trash2 className="w-6 h-6" />
          <span className="text-xs font-medium">Elimina</span>
        </div>
      </div>

      {/* Card principale swipabile */}
      <motion.div
        style={{ x }}
        drag="x"
        dragControls={dragControls}
        dragConstraints={isOpen ? { left: -200, right: 0 } : { left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className="group relative rounded-2xl border-l-4 border-accent/60 cursor-pointer overflow-hidden touch-pan-y"
      >
        {/* Layer solido per bloccare la visibilità del cestino sottostante */}
        <div className="absolute inset-0 bg-light-bg dark:bg-dark-bg pointer-events-none" />
        {/* Layer semi-trasparente per l'effetto visivo della card e l'active state */}
        <div className="absolute inset-0 bg-black/[0.03] dark:bg-white/[0.04] group-active:bg-black/[0.06] dark:group-active:bg-white/[0.07] transition-colors pointer-events-none" />
        
        <div className="relative p-5">
          <p className="font-serif text-base md:text-lg leading-relaxed mb-3">
            {verse.text}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium">
              {verse.bookName} {verse.chapter}:{verse.verse}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="p-2 text-red-400 [&>svg]:opacity-60 hover:[&>svg]:opacity-100 hover:text-red-500 active:text-red-600 transition-all rounded-full hover:bg-red-500/10"
              aria-label="Rimuovi"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const SavedVersesScreen: React.FC<SavedVersesScreenProps> = ({ onBack, onSelectVerse }) => {
  const [verses, setVerses] = useState<SavedVerse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'all' | 'OT' | 'NT'>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    const v = await getAllSavedVerses();
    setVerses(v);
  };

  const handleRemove = async (v: SavedVerse) => {
    await removeSavedVerse(v.bookId, v.chapter, v.verse);
    await loadVerses();
  };

  const filteredVerses = useMemo(() => {
    return verses.filter((v) => {
      const searchLower = searchTerm.toLowerCase();
      const referenceString = `${v.bookName.toLowerCase()} ${v.chapter}:${v.verse}`;
      
      const matchesSearch =
        v.text.toLowerCase().includes(searchLower) ||
        v.bookName.toLowerCase().includes(searchLower) ||
        referenceString.includes(searchLower);
      
      const bookInfo = books.find((b) => b.id === v.bookId);
      const testament = bookInfo?.testament;

      const matchesTestament = testamentFilter === 'all' || testament === testamentFilter;
      const matchesBook = bookFilter === 'all' || v.bookId === bookFilter;

      return matchesSearch && matchesTestament && matchesBook;
    });
  }, [verses, searchTerm, testamentFilter, bookFilter]);

  const availableBooks = useMemo(() => {
    if (testamentFilter === 'all') return [];
    
    const booksInTestament = verses.filter((v) => {
      const bookInfo = books.find((b) => b.id === v.bookId);
      return bookInfo?.testament === testamentFilter;
    });

    const uniqueBookIds = Array.from(new Set(booksInTestament.map((v) => v.bookId)));
    return uniqueBookIds.map((id) => {
      const bookInfo = books.find((b) => b.id === id);
      return { id, name: bookInfo?.name || id };
    });
  }, [verses, testamentFilter]);

  useEffect(() => {
    setBookFilter('all');
  }, [testamentFilter]);

  return (
    <div className="h-full text-light-text dark:text-dark-text overflow-y-auto">
      <div className="p-6 md:p-12 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <header className="mb-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h1 className="font-serif text-2xl md:text-3xl font-medium mb-1">Versi Salvati</h1>
          {verses.length > 0 && (
            <p className="text-sm font-sans text-light-text/40 dark:text-dark-text/40 mb-6">
              {verses.length} {verses.length === 1 ? 'verso' : 'versi'} nella tua collezione
            </p>
          )}

          {verses.length > 0 && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative flex items-center bg-black/5 dark:bg-white/5 rounded-xl backdrop-blur-sm focus-within:ring-2 focus-within:ring-accent/50 transition-all">
                <div className="pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-light-text dark:text-dark-text opacity-40" />
                </div>
                <input
                  type="text"
                  placeholder="Cerca versi o libri..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 w-full pl-2 pr-10 py-3 bg-transparent border-none text-light-text dark:text-dark-text placeholder-light-text/40 dark:placeholder-dark-text/40 focus:ring-0 focus:outline-none"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-0 pr-3 flex items-center text-light-text dark:text-dark-text [&>svg]:opacity-40 hover:[&>svg]:opacity-100 transition-opacity"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Testament Filters */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setTestamentFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    testamentFilter === 'all'
                      ? 'bg-accent text-white'
                      : 'bg-black/5 dark:bg-white/5 text-light-text/70 dark:text-dark-text/70 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  Tutti
                </button>
                <button
                  onClick={() => setTestamentFilter('OT')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    testamentFilter === 'OT'
                      ? 'bg-accent text-white'
                      : 'bg-black/5 dark:bg-white/5 text-light-text/70 dark:text-dark-text/70 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  Antico T.
                </button>
                <button
                  onClick={() => setTestamentFilter('NT')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    testamentFilter === 'NT'
                      ? 'bg-accent text-white'
                      : 'bg-black/5 dark:bg-white/5 text-light-text/70 dark:text-dark-text/70 hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  Nuovo T.
                </button>
              </div>

              {/* Book Filters */}
              <AnimatePresence>
                {testamentFilter !== 'all' && availableBooks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
                  >
                    <button
                      onClick={() => setBookFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        bookFilter === 'all'
                          ? 'bg-accent/20 text-accent dark:bg-accent/30 dark:text-accent/90'
                          : 'bg-black/5 dark:bg-white/5 text-light-text/60 dark:text-dark-text/60 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      Tutti i libri
                    </button>
                    {availableBooks.map((book) => (
                      <button
                        key={book.id}
                        onClick={() => setBookFilter(book.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                          bookFilter === book.id
                            ? 'bg-accent/20 text-accent dark:bg-accent/30 dark:text-accent/90'
                            : 'bg-black/5 dark:bg-white/5 text-light-text/60 dark:text-dark-text/60 hover:bg-black/10 dark:hover:bg-white/10'
                        }`}
                      >
                        {book.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </header>

        <main className="max-w-2xl mx-auto space-y-3">
          <AnimatePresence mode="popLayout">
            {verses.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                  <Heart className="w-10 h-10 text-accent opacity-40" />
                </div>
                <p className="font-serif text-lg mb-2 opacity-60">
                  Nessun verso salvato ancora
                </p>
                <p className="text-sm opacity-40 font-sans max-w-xs mb-6">
                  Inizia la tua collezione di parole sacre. Scorri i versi e premi il cuore per salvarli.
                </p>
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full font-sans text-sm font-medium hover:bg-accent/90 active:scale-95 transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  Inizia a leggere
                </button>
              </motion.div>
            ) : filteredVerses.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-center"
              >
                <p className="text-sm opacity-60 font-sans">
                  Nessun verso trovato per questa ricerca.
                </p>
              </motion.div>
            ) : (
              filteredVerses.map((v) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.2 } }}
                >
                  <SavedVerseCard
                    verse={v}
                    onSelect={() => onSelectVerse(v.bookId, v.chapter, v.verse)}
                    onRemove={() => handleRemove(v)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
