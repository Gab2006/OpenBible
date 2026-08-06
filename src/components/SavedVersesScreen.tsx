import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { getAllSavedVerses, removeSavedVerse } from '../services/storage';
import type { SavedVerse } from '../services/storage';

interface SavedVersesScreenProps {
  onBack: () => void;
  onSelectVerse: (bookId: string, chapter: number, verse: number) => void;
}

export const SavedVersesScreen: React.FC<SavedVersesScreenProps> = ({ onBack, onSelectVerse }) => {
  const [verses, setVerses] = useState<SavedVerse[]>([]);

  useEffect(() => {
    loadVerses();
  }, []);

  const loadVerses = async () => {
    const v = await getAllSavedVerses();
    setVerses(v);
  };

  const handleRemove = async (e: React.MouseEvent, v: SavedVerse) => {
    e.stopPropagation();
    await removeSavedVerse(v.bookId, v.chapter, v.verse);
    await loadVerses();
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text p-6 md:p-12 pb-24">
      <header className="flex items-center gap-4 mb-8 pt-[max(1rem,env(safe-area-inset-top))]">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-serif text-2xl font-medium">Versi Salvati</h1>
      </header>

      <main className="max-w-2xl mx-auto space-y-4">
        {verses.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            Nessun verso salvato.
          </div>
        ) : (
          verses.map((v) => (
            <div 
              key={v.id} 
              onClick={() => onSelectVerse(v.bookId, v.chapter, v.verse)}
              className="p-6 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden flex flex-col"
            >
              <p className="font-serif text-lg leading-relaxed mb-4 flex-1">
                {v.text}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-sans tracking-widest uppercase opacity-60 text-accent font-medium">
                  {v.bookName} {v.chapter}:{v.verse}
                </span>
                <button 
                  onClick={(e) => handleRemove(e, v)}
                  className="p-2 text-red-500/70 hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Rimuovi"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};
