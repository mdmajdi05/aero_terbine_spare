'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Bot } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useChatBot } from '@/hooks/useChatBot';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSuggestions from './ChatSuggestions';
import ChatBotLogo from './ChatBotLogo';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatWidgetProps {
  botName: string;
  greetingMessage: string;
  humanHandoffEnabled: boolean;
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-2xl">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{ left: `${20 + i * 30}%`, top: `${30 + i * 20}%` }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
        />
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 30, rotateX: 5 },
  visible: {
    opacity: 1, scale: 1, y: 0, rotateX: 0,
    transition: { type: 'spring' as const, damping: 20, stiffness: 260, mass: 0.7 },
  },
  exit: {
    opacity: 0, scale: 0.92, y: 15,
    transition: { duration: 0.18, ease: 'easeIn' as const },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.04, type: 'spring' as const, damping: 22, stiffness: 280 },
  }),
};

export default function ChatWidget({ botName }: ChatWidgetProps) {
  const { isOpen, messages, isTyping, addMessage, toggle } = useChat();
  const { processUserMessage, sendWelcomeMessage } = useChatBot();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeSentRef = useRef(false);

  useEffect(() => {
    if (isOpen && !welcomeSentRef.current && messages.length === 0) {
      sendWelcomeMessage();
      welcomeSentRef.current = true;
    }
  }, [isOpen, messages.length, sendWelcomeMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageType = {
      id: `user-${Date.now()}`,
      conversationId: 'pending',
      sender: 'user',
      type: 'text',
      text,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMsg);
    const pageUrl = typeof window !== 'undefined' ? window.location.pathname : '';
    const pageTitle = typeof window !== 'undefined' ? document.title : '';
    await processUserMessage(text, pageUrl, pageTitle);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="chat-widget"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[390px] max-w-[calc(100vw-2rem)] origin-bottom-right"
          style={{ maxHeight: 'calc(100vh - 8rem)' }}
        >
          {/* Outer glow */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 blur-2xl pointer-events-none" />

          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl p-[1.5px] pointer-events-none">
            <motion.div
              className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-500 via-rose-400 to-indigo-500"
              animate={{ opacity: [0.4, 0.6, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ backgroundSize: '200% 200%' }}
            />
          </div>

          {/* Main glassmorphism container */}
          <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl flex flex-col h-full max-h-[calc(100vh-8rem)] shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
            {/* Animated header gradient */}
            <div className="relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              />
              <FloatingParticles />

              {/* Header content */}
              <div className="relative px-4 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChatBotLogo size="sm" showGlow={false} />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        {botName}
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      </div>
                      <div className="text-[10px] text-indigo-200 flex items-center gap-1.5 font-medium">
                        <motion.span
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        Online · AI Assistant
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggle}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4 text-white" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              className="overflow-y-auto flex-1 py-3 space-y-1 scroll-smooth bg-gradient-to-b from-indigo-50/30 to-transparent dark:from-indigo-950/10"
              style={{ maxHeight: '350px' }}
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    layout
                    variants={messageVariants}
                    custom={messages.length - i}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
                  >
                    <ChatMessage message={msg} />
                    {msg.quickReplies && msg.sender === 'bot' && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.3 }}
                        className="pl-12 pr-3 pt-1"
                      >
                        <ChatSuggestions
                          suggestions={msg.quickReplies}
                          onSelect={handleSend}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-2.5 px-3 py-1"
                  >
                    <ChatBotLogo size="sm" animated={false} showGlow={false} />
                    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700/50">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500"
                            animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <div className="px-4 py-1.5 border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/30 dark:bg-gray-900/30">
              <div className="text-center text-[9px] text-gray-400 dark:text-gray-500 tracking-wider font-medium flex items-center justify-center gap-1">
                <Zap className="w-2.5 h-2.5 text-indigo-400" />
                Powered by <span className="font-bold text-indigo-500">{botName}</span>
              </div>
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={isTyping} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
