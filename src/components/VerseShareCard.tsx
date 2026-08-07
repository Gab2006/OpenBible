import { forwardRef } from 'react';
import type { Verse } from '../services/storage';
import '@fontsource/crimson-pro/400.css';
import '@fontsource/crimson-pro/500.css';
import '@fontsource/crimson-pro/600.css';

interface VerseShareCardProps {
  verse: Verse;
  isDarkMode: boolean;
}

export const VerseShareCard = forwardRef<HTMLDivElement, VerseShareCardProps>(({ verse, isDarkMode }, ref) => {
  const textLength = verse.text.length;
  // Riduce la dimensione del font se il testo è lungo per evitare overflow
  const textSizeClass = textLength > 200 ? 'text-[36px]' : textLength > 120 ? 'text-[44px]' : 'text-[56px]';

  return (
    <div
      ref={ref}
      className={`w-[1080px] h-[1350px] flex flex-col items-center justify-center p-32 text-center ${
        isDarkMode ? 'bg-verse-bg-dark text-verse-text-dark' : 'bg-verse-bg-light text-verse-text-light'
      }`}
      style={{
        // Stili inline espliciti per garantire massima compatibilità con html-to-image
        backgroundColor: isDarkMode ? '#1A1917' : '#FAF6EF',
        color: isDarkMode ? '#EDE6D9' : '#2B2620',
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center max-w-[850px] w-full">
        {/* Elemento decorativo */}
        <div 
          className="w-16 h-[2px] mb-14 opacity-80" 
          style={{ backgroundColor: '#B8912F' }}
        />
        
        {/* Testo del verso */}
        <p 
          className={`font-font-voice font-medium leading-[1.6] ${textSizeClass}`}
          style={{ fontFamily: '"Crimson Pro", serif' }}
        >
          {verse.text}
        </p>
        
        {/* Riferimento biblico */}
        <div 
          className="mt-16 text-[22px] font-sans font-semibold uppercase tracking-[0.25em]"
          style={{ color: '#B8912F' }}
        >
          {verse.bookName} {verse.chapter}:{verse.verse}
        </div>
      </div>
    </div>
  );
});

VerseShareCard.displayName = 'VerseShareCard';
