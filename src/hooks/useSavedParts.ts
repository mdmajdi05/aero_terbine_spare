'use client';

import { useState, useEffect } from 'react';
import { savePart, unsavePart } from '@/services/dashboardService';

const SAVED_KEY = 'ats_saved';

function getRaw(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); }
  catch { return []; }
}

export function useSavedParts() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => { setSavedIds(getRaw()); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggle = async (productId: string) => {
    const isSaved = savedIds.includes(productId);
    if (isSaved) {
      await unsavePart(productId);
      setSavedIds((p) => p.filter((id) => id !== productId));
    } else {
      await savePart(productId);
      setSavedIds((p) => [...p, productId]);
    }
  };

  return { savedIds, toggle, isSaved: (id: string) => savedIds.includes(id) };
}
