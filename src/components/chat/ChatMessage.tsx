'use client';

import { motion } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ChatBotLogo from './ChatBotLogo';

interface ChatMessageProps {
  message: ChatMessageType;
}

const msgVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring' as const, damping: 20, stiffness: 260, mass: 0.5 },
  },
};

function UserAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ring-1 ring-white/20">
      <User className="w-3.5 h-3.5 text-white" />
    </div>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  const isAdmin = message.sender === 'admin';
  const isUser = message.sender === 'user';

  return (
    <motion.div
      variants={msgVariants}
      initial="hidden"
      animate="visible"
      className={cn('flex gap-2.5 px-3 py-0.5', isBot ? 'justify-start' : 'justify-end')}
    >
      {isBot && <ChatBotLogo size="sm" animated={false} showGlow={false} />}
      {isAdmin && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-emerald-500/20 ring-1 ring-white/20">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={cn(
        'max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
        isBot && 'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100/80 dark:border-gray-700/40',
        isAdmin && 'bg-emerald-50/90 dark:bg-emerald-900/30 backdrop-blur-sm text-gray-900 dark:text-gray-100 rounded-tl-sm border border-emerald-200/60 dark:border-emerald-800/40 shadow-sm',
        isUser && 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-indigo-500/25',
      )}>
        <div className="prose prose-sm max-w-none dark:prose-invert prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-p:my-0.5 leading-relaxed">
          {message.text.split('\n').map((line, i) => (
            <p key={i} className="my-0.5">{line}</p>
          ))}
        </div>
        <div className={cn(
          'flex items-center gap-1 mt-1.5',
          isUser ? 'justify-end' : 'justify-start',
        )}>
          <span className={cn(
            'text-[9px] font-medium tracking-wide',
            isUser ? 'text-indigo-200/70' : 'text-gray-400 dark:text-gray-500',
          )}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {isUser && <UserAvatar />}
    </motion.div>
  );
}
