import React from 'react';
import { Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
}

export const SaveButton: React.FC<SaveButtonProps> = ({ isSaved, onToggle }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onToggle}
      className="absolute top-0 right-0 p-4 z-10 pt-[max(1rem,env(safe-area-inset-top))] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
      aria-label={isSaved ? "Rimuovi dai salvati" : "Salva verso"}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isSaved ? [1, 1.2, 1] : 1,
          color: isSaved ? '#B8912F' : 'currentColor',
        }}
        transition={{ duration: 0.3 }}
      >
        <Bookmark 
          className="w-6 h-6" 
          fill={isSaved ? 'currentColor' : 'none'} 
          strokeWidth={2}
        />
      </motion.div>
    </motion.button>
  );
};
