import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { APP_THEMES } from '../types';

export const SettingsScreen: React.FC = () => {
  const { theme, themeId, setThemeId, isDarkMode, setIsDarkMode } = useTheme();

  return (
    <div className="h-full text-light-text dark:text-dark-text overflow-y-auto">
      <div className="p-6 md:p-12 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        <header className="mb-6 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <h1 className="font-serif text-2xl md:text-3xl font-medium mb-1">Impostazioni</h1>
        </header>

        <main className="max-w-2xl mx-auto space-y-8 mt-8">
          {/* Sezione Aspetto — Light/Dark toggle */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Aspetto</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-2 flex gap-2">
              <button
                onClick={() => setIsDarkMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${!isDarkMode ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
              >
                <Sun className="w-4 h-4" />
                <span className="font-medium">Chiaro</span>
              </button>
              <button
                onClick={() => setIsDarkMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${isDarkMode ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
              >
                <Moon className="w-4 h-4" />
                <span className="font-medium">Scuro</span>
              </button>
            </div>
          </section>

          {/* Sezione Tema */}
          <section>
            <h2 className="text-xs font-sans tracking-widest uppercase text-accent/70 font-medium mb-4">Tema</h2>
            <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-2xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {APP_THEMES.map((t) => {
                const isActive = t.id === themeId;

                return (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-sans text-sm ${isActive ? 'bg-white dark:bg-black/60 shadow-sm text-accent' : 'hover:bg-black/5 dark:hover:bg-white/5 text-light-text/60 dark:text-dark-text/60'}`}
                  >
                    <span className="text-base">{t.emoji}</span>
                    <span className="font-medium">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
