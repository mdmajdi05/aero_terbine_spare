'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Conversation, ChatMessage, ConversationStatus } from '@/types/chat';

const CONV_STORAGE = 'ats_chat_conversations';
const MSG_STORAGE_PREFIX = 'ats_chat_messages_';

function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const d = localStorage.getItem(CONV_STORAGE);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CONV_STORAGE, JSON.stringify(convs)); } catch { /* */ }
}

function loadMessages(convId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const d = localStorage.getItem(`${MSG_STORAGE_PREFIX}${convId}`);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveMessages(convId: string, msgs: ChatMessage[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(`${MSG_STORAGE_PREFIX}${convId}`, JSON.stringify(msgs)); } catch { /* */ }
}

export function useChatInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setConversations(loadConversations());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (activeConvId) {
      setMessages(loadMessages(activeConvId));
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  const selectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isUnread: false } : c)),
    );
  }, []);

  const updateStatus = useCallback((id: string, status: ConversationStatus) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
    const updated = loadConversations().map((c) =>
      c.id === id ? { ...c, status } : c,
    );
    saveConversations(updated);
  }, []);

  const sendAdminMessage = useCallback((text: string) => {
    if (!activeConvId) return;
    const msg: ChatMessage = {
      id: `admin-${Date.now()}`,
      conversationId: activeConvId,
      sender: 'admin',
      type: 'text',
      text,
      createdAt: new Date().toISOString(),
    };
    const updated = [...messages, msg];
    setMessages(updated);
    saveMessages(activeConvId, updated);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: text, lastMessageAt: msg.createdAt, messageCount: c.messageCount + 1 }
          : c,
      ),
    );
    const convs = loadConversations().map((c) =>
      c.id === activeConvId
        ? { ...c, lastMessage: text, lastMessageAt: msg.createdAt, messageCount: c.messageCount + 1 }
        : c,
    );
    saveConversations(convs);
  }, [activeConvId, messages]);

  const unreadCount = conversations.filter((c) => c.isUnread).length;

  return {
    conversations,
    activeConvId,
    messages,
    loading,
    unreadCount,
    selectConversation,
    updateStatus,
    sendAdminMessage,
    refresh,
  };
}
