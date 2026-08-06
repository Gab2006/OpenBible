import React from 'react';
import { Home, Shuffle, Bookmark, Settings } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'reader' | 'saved' | 'settings';
  onNavigateHome: () => void;
  onShuffle: () => void;
  onNavigateSaved: () => void;
  onNavigateSettings: () => void;
  savedVersesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onNavigateHome,
  onShuffle,
  onNavigateSaved,
  onNavigateSettings,
  savedVersesCount
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/70 dark:bg-black/70 backdrop-blur-xl backdrop-saturate-150 rounded-full px-6 py-3 flex gap-8 items-center shadow-lg border border-black/5 dark:border-white/10 z-50">
      <button 
        onClick={onNavigateHome}
        aria-label="Home"
        className={`p-2 transition-colors ${currentView === 'home' ? 'text-accent' : 'text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text'}`}
      >
        <Home className="w-6 h-6" />
      </button>
      <button 
        onClick={onShuffle}
        aria-label="Verso Casuale"
        className="p-2 transition-colors text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text"
      >
        <Shuffle className="w-6 h-6" />
      </button>
      <button 
        onClick={onNavigateSaved}
        aria-label="Versi Salvati"
        className={`p-2 transition-colors relative ${currentView === 'saved' ? 'text-accent' : 'text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text'}`}
      >
        <Bookmark className="w-6 h-6" />
        {savedVersesCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-medium">
            {savedVersesCount}
          </span>
        )}
      </button>
      <button 
        onClick={onNavigateSettings}
        aria-label="Impostazioni"
        className={`p-2 transition-colors ${currentView === 'settings' ? 'text-accent' : 'text-light-text/60 dark:text-dark-text/60 hover:text-light-text dark:hover:text-dark-text'}`}
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};
