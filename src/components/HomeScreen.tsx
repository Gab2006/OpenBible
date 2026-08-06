import React, { useState } from 'react';
import { books } from '../data/books';
import type { ReadingPosition } from '../services/storage';
import { Shuffle, Bookmark, Sun, Moon } from 'lucide-react';

interface HomeScreenProps {
  readingPosition: ReadingPosition | undefined;
  savedVersesCount: number;
  onContinue: () => void;
  onRandomVerse: () => void;
  onOpenSaved: () => void;
  onSelectChapter: (bookId: string, chapter: number) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  readingPosition,
  savedVersesCount,
  onContinue,
  onRandomVerse,
  onOpenSaved,
  onSelectChapter,
  isDarkMode,
  onToggleTheme
}) => {
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  
  const otBooks = books.filter(b => b.testament === 'OT');
  const ntBooks = books.filter(b => b.testament === 'NT');

  const renderBookList = (list: typeof books) => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
      {list.map(book => (
        <button
          key={book.id}
          onClick={() => setSelectedBook(book.id === selectedBook ? null : book.id)}
          className={`p-3 text-left rounded-lg transition-colors border border-black/5 dark:border-white/5
            ${selectedBook === book.id 
              ? 'bg-accent/10 border-accent/30 text-accent font-medium' 
              : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
        >
          {book.name}
        </button>
      ))}
    </div>
  );

  const renderChapterGrid = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return null;
    
    return (
      <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl">
        <h3 className="font-medium mb-3 text-sm uppercase tracking-wider opacity-60">
          Scegli un capitolo di {book.name}
        </h3>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {Array.from({ length: book.chapters }).map((_, i) => (
            <button
              key={i}
              onClick={() => onSelectChapter(book.id, i + 1)}
              className="aspect-square flex items-center justify-center rounded-lg bg-light-bg dark:bg-dark-bg border border-black/5 dark:border-white/5 hover:border-accent hover:text-accent transition-colors"
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text p-6 md:p-12 pb-24 overflow-y-auto">
      <header className="flex justify-between items-center mb-12">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Lettore Biblico</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Cambia tema"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button 
            onClick={onOpenSaved}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
            aria-label="Versi salvati"
          >
            <Bookmark className="w-5 h-5" />
            {savedVersesCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-medium">
                {savedVersesCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {readingPosition && (
            <button 
              onClick={onContinue}
              className="flex-1 bg-light-text dark:bg-dark-text text-light-bg dark:text-dark-bg p-4 rounded-2xl font-medium shadow-sm hover:opacity-90 transition-opacity text-left"
            >
              <div className="text-xs uppercase tracking-wider opacity-70 mb-1">Continua a leggere</div>
              <div className="font-serif text-lg">
                {books.find(b => b.id === readingPosition.bookId)?.name || '...'} {readingPosition.chapter}:{readingPosition.verse}
              </div>
            </button>
          )}
          
          <button 
            onClick={onRandomVerse}
            className="flex-1 bg-accent text-white p-4 rounded-2xl font-medium shadow-sm hover:bg-accent/90 transition-colors flex items-center justify-between group"
          >
            <span className="font-serif text-lg">Verso Casuale</span>
            <Shuffle className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>

        {/* Bible Browser */}
        <div className="space-y-12 pt-8">
          <section>
            <h2 className="font-serif text-xl mb-6 flex items-center gap-4">
              <span>Antico Testamento</span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
            </h2>
            {renderBookList(otBooks)}
            {selectedBook && books.find(b => b.id === selectedBook)?.testament === 'OT' && renderChapterGrid(selectedBook)}
          </section>
          
          <section>
            <h2 className="font-serif text-xl mb-6 flex items-center gap-4">
              <span>Nuovo Testamento</span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
            </h2>
            {renderBookList(ntBooks)}
            {selectedBook && books.find(b => b.id === selectedBook)?.testament === 'NT' && renderChapterGrid(selectedBook)}
          </section>
        </div>

      </main>
    </div>
  );
};
