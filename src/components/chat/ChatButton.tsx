'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ChatBotLogo from './ChatBotLogo';

interface ChatButtonProps {
  isOpen: boolean;
  unread?: number;
  onClick: () => void;
}

export default function ChatButton({ isOpen, unread = 0, onClick }: ChatButtonProps) {
  if (isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bot"
        initial={{ scale: 0.3, opacity: 0, rotate: -20 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.3, opacity: 0, rotate: 20 }}
        transition={{ duration: 0.25, type: 'spring', damping: 15 }}
        className="relative"
      >
        <ChatBotLogo size="md" animated showGlow onClick={onClick} />

        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 bg-gradient-to-br from-rose-500 to-pink-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xl shadow-rose-500/40 border-2 border-white z-20"
              style={{ width: 22, height: 22 }}
            >
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
