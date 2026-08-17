import React from 'react';
import { Home, Shuffle, Heart, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 bg-white/10 dark:bg-black/20 bg-gradient-to-b from-white/30 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-2xl backdrop-saturate-[1.8] rounded-full px-6 py-3 flex gap-8 items-center shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.6),inset_0_-1px_1px_rgba(255,255,255,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.15),inset_0_-1px_1px_rgba(255,255,255,0.02)] border border-white/40 dark:border-white/10 z-50">
      <button 
        onClick={onNavigateHome}
        aria-label="Home"
        className={`p-2 transition-colors [&>svg]:transition-opacity ${currentView === 'home' ? 'text-accent' : 'text-light-text dark:text-dark-text [&>svg]:opacity-60 hover:[&>svg]:opacity-100'}`}
      >
        <Home className="w-6 h-6" />
      </button>
      <button 
        onClick={onShuffle}
        aria-label="Verso Casuale"
        className="p-2 transition-colors [&>svg]:transition-opacity text-light-text dark:text-dark-text [&>svg]:opacity-60 hover:[&>svg]:opacity-100"
      >
        <Shuffle className="w-6 h-6" />
      </button>
      <button 
        onClick={onNavigateSaved}
        aria-label="Versi Salvati"
        className={`p-2 transition-colors [&>svg]:transition-opacity relative ${currentView === 'saved' ? 'text-accent' : 'text-light-text dark:text-dark-text [&>svg]:opacity-60 hover:[&>svg]:opacity-100'}`}
      >
        <Heart className="w-6 h-6" />
        <AnimatePresence>
          {savedVersesCount > 0 && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute top-0 right-0 min-w-[16px] h-4 px-1 w-auto bg-accent text-white rounded-full text-[10px] flex items-center justify-center font-medium overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={savedVersesCount}
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="block"
                >
                  {savedVersesCount}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      <button 
        onClick={onNavigateSettings}
        aria-label="Impostazioni"
        className={`p-2 transition-colors [&>svg]:transition-opacity ${currentView === 'settings' ? 'text-accent' : 'text-light-text dark:text-dark-text [&>svg]:opacity-60 hover:[&>svg]:opacity-100'}`}
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};
