import React from 'react';
import { Home, Shuffle, Heart, Settings } from 'lucide-react';

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
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 bg-white/20 dark:bg-[#1A1917]/30 bg-gradient-to-b from-white/40 to-white/10 dark:from-white/5 dark:to-transparent backdrop-blur-lg backdrop-saturate-150 rounded-full px-6 py-3 flex gap-8 items-center shadow-[0_4px_20px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/30 dark:border-white/10 z-50">
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
        <Heart className="w-6 h-6" />
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
