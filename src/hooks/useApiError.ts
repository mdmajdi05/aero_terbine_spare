'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  field?: string;
}

export function useApiError() {
  const [errors, setErrors] = useState<ApiError[]>([]);

  const handleError = useCallback((err: unknown, options?: { silent?: boolean; fallback?: string }) => {
    const message = err instanceof Error ? err.message :
      typeof err === 'object' && err !== null && 'message' in err ? (err as any).message :
      options?.fallback || 'An unexpected error occurred';

    const field = typeof err === 'object' && err !== null && 'field' in err ? (err as any).field as string : undefined;

    if (field) {
      setErrors((prev) => [...prev.filter((e) => e.field !== field), { message, field }]);
    }

    if (!options?.silent) {
      toast.error(message);
    }

    return { message, field };
  }, []);

  const clearErrors = useCallback(() => setErrors([]), []);
  const clearFieldError = useCallback((field: string) => setErrors((prev) => prev.filter((e) => e.field !== field)), []);

  return { errors, handleError, clearErrors, clearFieldError };
}
