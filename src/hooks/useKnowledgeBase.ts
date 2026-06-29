'use client';

import { useState, useCallback, useEffect } from 'react';
import type { KnowledgeBaseItem, KBCategory } from '@/types/chat';
import { getKnowledgeBase, saveKnowledgeBase } from '@/lib/chat-knowledge';

export function useKnowledgeBase() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(getKnowledgeBase());
    setLoading(false);
  }, []);

  const addItem = useCallback((item: Omit<KnowledgeBaseItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: KnowledgeBaseItem = {
      ...item,
      id: `kb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveKnowledgeBase(updated);
    return newItem;
  }, [items]);

  const updateItem = useCallback((id: string, updates: Partial<KnowledgeBaseItem>) => {
    const updated = items.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item,
    );
    setItems(updated);
    saveKnowledgeBase(updated);
  }, [items]);

  const deleteItem = useCallback((id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveKnowledgeBase(updated);
  }, [items]);

  const getItem = useCallback((id: string) => {
    return items.find((item) => item.id === id) || null;
  }, [items]);

  const searchItems = useCallback((query: string, category?: KBCategory) => {
    let filtered = items;
    if (category) filtered = filtered.filter((i) => i.category === category);
    if (query) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.question.toLowerCase().includes(lower) ||
          i.answer.toLowerCase().includes(lower) ||
          i.keywords.some((k) => k.toLowerCase().includes(lower)),
      );
    }
    return filtered.sort((a, b) => b.priority - a.priority);
  }, [items]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    getItem,
    searchItems,
  };
}
