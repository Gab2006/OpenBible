import React from 'react';
import { Heart } from 'lucide-react';
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
      className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
      aria-label={isSaved ? "Rimuovi dai salvati" : "Salva verso"}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isSaved ? [1, 1.4, 1] : 1,
          color: isSaved ? '#B8912F' : 'currentColor',
        }}
        transition={{ 
          duration: 0.35, 
          ease: "easeOut",
          times: [0, 0.4, 1]
        }}
      >
        <Heart 
          className="w-6 h-6" 
          fill={isSaved ? 'currentColor' : 'none'} 
          strokeWidth={2}
        />
      </motion.div>
    </motion.button>
  );
};
