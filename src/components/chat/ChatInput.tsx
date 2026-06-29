'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({ onSend, disabled, placeholder = 'Ask me anything...' }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 pt-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-100/60 dark:border-gray-800/60">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          {/* Focus glow */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-indigo-400/20 pointer-events-none"
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className="relative w-full bg-gray-100/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none ring-1 ring-gray-200/60 dark:ring-gray-700/60 focus:ring-2 focus:ring-indigo-400/50 transition-all placeholder:text-gray-400/70 dark:placeholder:text-gray-500/70 disabled:opacity-50"
          />

          {/* Input hint */}
          {!text && !isFocused && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-gray-300 dark:text-gray-600 font-medium pointer-events-none">
              Press Enter ↵
            </span>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={!text.trim() || disabled}
          whileHover={text.trim() ? { scale: 1.08 } : {}}
          whileTap={text.trim() ? { scale: 0.9 } : {}}
          className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-indigo-500/25 relative overflow-hidden"
          aria-label="Send"
        >
          {/* Shimmer on sendable */}
          {text.trim() && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          )}
          {text.trim() ? (
            <Send className="w-4 h-4 relative z-10" />
          ) : (
            <Sparkles className="w-4 h-4 opacity-50 relative z-10" />
          )}
        </motion.button>
      </div>
    </form>
  );
}
