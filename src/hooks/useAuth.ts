'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SessionUser, AuthResponse, UserRole } from '@/types';
import { login as loginService, logout as logoutService, register as registerService } from '@/services/authService';
import type { LoginPayload, RegisterPayload } from '@/services/authService';

const SESSION_KEY = 'ats_session';

function getSession(): AuthResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const session = getSession();
    if (session?.user) setUser({ ...session.user, token: session.token });
    setLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginService(payload);
    setUser({ ...res.user, token: res.token });
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await registerService(payload);
    const session = getSession();
    if (session?.user) setUser({ ...session.user, token: session.token });
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
  }, []);

  const hasRole = useCallback((...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  const isAdmin   = useCallback(() => hasRole('Admin', 'SuperAdmin'), [hasRole]);
  const isSuperAdmin = useCallback(() => hasRole('SuperAdmin'), [hasRole]);
  const isTrader  = useCallback(() => hasRole('Trader', 'Admin', 'SuperAdmin'), [hasRole]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isSuperAdmin,
    isTrader,
  };
}
