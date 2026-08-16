import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { APP_THEMES } from '../types';
import type { AppTheme } from '../types';

interface ThemeContextValue {
  theme: AppTheme;
  themeId: string;
  setThemeId: (id: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme deve essere usato dentro ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<string>(() =>
    localStorage.getItem('themeId') || 'classic'
  );
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [fontSize, setFontSizeState] = useState<number>(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved, 10) : 100;
  });

  const theme = APP_THEMES.find(t => t.id === themeId) || APP_THEMES[0];

  const setThemeId = (id: string) => {
    setThemeIdState(id);
    localStorage.setItem('themeId', id);
  };

  const setFontSize = (size: number) => {
    setFontSizeState(size);
    localStorage.setItem('fontSize', size.toString());
  };

  // Applica le CSS custom properties per i colori e grandezza font
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-light-bg', theme.light.bg);
    root.style.setProperty('--color-light-text', theme.light.text);
    root.style.setProperty('--color-dark-bg', theme.dark.bg);
    root.style.setProperty('--color-dark-text', theme.dark.text);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--verse-font-size', `calc(clamp(22px, 5.5vw, 38px) * ${fontSize / 100})`);
  }, [theme, fontSize]);

  // Applica la classe dark sul <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Applica pattern + texture sullo sfondo del body
  useEffect(() => {
    const colors = isDarkMode ? theme.dark : theme.light;
    const bgLayers: string[] = [];

    // Layer overlay per sfumare l'immagine sottostante
    if (theme.backgroundImage) {
      const opacity = isDarkMode ? theme.patternOpacity.dark : theme.patternOpacity.light;
      const overlayAlpha = 1 - opacity;
      const rgbComma = colors.bg.split(' ').join(',');
      bgLayers.push(`linear-gradient(rgba(${rgbComma}, ${overlayAlpha}), rgba(${rgbComma}, ${overlayAlpha}))`);
    }

    // Layer texture (sopra l'immagine)
    if (theme.texture) {
      bgLayers.push(isDarkMode ? theme.texture.dark : theme.texture.light);
    }

    // Layer immagine di base
    if (theme.backgroundImage) {
      const bgImage = isDarkMode ? theme.backgroundImage.dark : theme.backgroundImage.light;
      bgLayers.push(`url("${bgImage}")`);
    }

    if (bgLayers.length > 0) {
      document.body.style.backgroundImage = bgLayers.join(', ');
      
      document.body.style.backgroundSize = bgLayers.map((layer) => {
        if (layer.startsWith('url')) {
          if (theme.backgroundSize) {
            return isDarkMode ? theme.backgroundSize.dark : theme.backgroundSize.light;
          }
          return '150%';
        }
        return 'cover';
      }).join(', ');
      
      document.body.style.backgroundRepeat = bgLayers.map((layer) => {
        if (layer.startsWith('url')) return 'no-repeat';
        return 'no-repeat';
      }).join(', ');

      document.body.style.backgroundPosition = bgLayers.map((layer) => {
        if (layer.startsWith('url')) return 'center';
        return 'center';
      }).join(', ');
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
    }

    return () => {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundRepeat = '';
    };
  }, [theme, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setThemeId, isDarkMode, setIsDarkMode, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
}
