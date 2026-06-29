'use client';

import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/types/chat';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  conversation: Conversation | null;
  isTyping: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;
  addMessage: (msg: ChatMessage) => void;
  setMessages: (msgs: ChatMessage[]) => void;
  setConversation: (conv: Conversation | null) => void;
  setTyping: (typing: boolean) => void;
  reset: () => void;
}

export const useChat = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  conversation: null,
  isTyping: false,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMessages: (msgs) => set({ messages: msgs }),
  setConversation: (conv) => set({ conversation: conv }),
  setTyping: (typing) => set({ isTyping: typing }),
  reset: () => set({ messages: [], conversation: null, isTyping: false }),
}));
