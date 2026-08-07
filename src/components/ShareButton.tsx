import React, { useState, useRef, useEffect } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { VerseShareCard } from './VerseShareCard';
import type { Verse } from '../services/storage';

interface ShareButtonProps {
  verse: Verse;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ verse }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Aggiorna lo stato del tema all'avvio
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const handleShare = async () => {
    if (!cardRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      
      // Assicuriamoci che il tema sia aggiornato
      const currentDark = document.documentElement.classList.contains('dark');
      if (currentDark !== isDarkMode) {
        setIsDarkMode(currentDark);
        // Aspettiamo che React renderizzi il nuovo tema sulla card
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Cattura reale
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, // alta risoluzione
        cacheBust: true,
      });

      const slug = `${verse.bookId.toLowerCase()}-${verse.chapter}-${verse.verse}`;
      const fileName = `${slug}.png`;

      // Converti dataUrl in Blob e File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: 'image/png' });

      let shared = false;
      // Prova la condivisione nativa se disponibile (mobile/PWA)
      if (navigator.share) {
        try {
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
              files: [file]
            });
            shared = true;
          } else {
             // Fallback per browser che supportano share ma non file
             await navigator.share({
               title: `${verse.bookName} ${verse.chapter}:${verse.verse}`,
               text: `Leggi questo verso: ${verse.bookName} ${verse.chapter}:${verse.verse}\n\n${verse.text}`,
             });
             shared = true;
          }
        } catch (shareError) {
          console.log('Condivisione nativa annullata o fallita', shareError);
          if (shareError instanceof Error && shareError.name !== 'AbortError') {
             shared = false;
          } else {
             shared = true; // Annullata dall'utente, non facciamo fallback
          }
        }
      }

      // Fallback: scarica direttamente l'immagine
      if (!shared) {
        // Usiamo Object URL invece di Data URL perché Safari iOS gestisce molto meglio
        // i download tramite Object URL rispetto ai Data URL nativi.
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = objectUrl;
        link.target = '_blank'; // Utile su iOS per evitare di perdere lo stato se apre in tab
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
    } catch (error) {
      console.error('Errore durante la generazione dell\'immagine:', error);
      alert('Si è verificato un errore durante la condivisione. Riprova.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isGenerating}
        className="p-3 rounded-full bg-black/5 dark:bg-white/5 active:bg-black/10 dark:active:bg-white/10 transition-colors disabled:opacity-50"
        aria-label="Condividi verso"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin opacity-70" />
        ) : (
          <Share2 className="w-5 h-5 opacity-70" />
        )}
      </button>

      {/* Nodo temporaneo off-screen per html-to-image (senza opacity-0 per compatibilità Safari) */}
      <div className="absolute left-[-9999px] top-[-9999px]">
        <VerseShareCard ref={cardRef} verse={verse} isDarkMode={isDarkMode} />
      </div>
    </>
  );
};
