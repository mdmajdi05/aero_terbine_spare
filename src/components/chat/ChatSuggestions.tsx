'use client';

import { motion } from 'framer-motion';
import type { QuickReply } from '@/types/chat';

interface ChatSuggestionsProps {
  suggestions: QuickReply[];
  onSelect: (payload: string) => void;
}

export default function ChatSuggestions({ suggestions, onSelect }: ChatSuggestionsProps) {
  if (!suggestions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap gap-1.5"
    >
      {suggestions.map((s, i) => (
        <motion.button
          key={`${s.payload}-${i}`}
          initial={{ opacity: 0, scale: 0.85, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.05 * i, type: 'spring', damping: 20, stiffness: 250 }}
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(s.payload)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-900/50 dark:hover:to-purple-900/50 transition-colors border border-indigo-200/50 dark:border-indigo-700/30 shadow-sm"
        >
          {s.label}
        </motion.button>
      ))}
    </motion.div>
  );
}
