'use client';

import { useState, useEffect, useCallback } from 'react';
import { request } from '@/lib/api-client';
import type { SiteConfig } from '@/types';

export const DEFAULT_CHAT_CONFIG = {
  chatbotEnabled: true,
  botName: 'AeroBot',
  greetingMessage: 'Hello! Welcome to AeroTurbineSpare. How can I help you today?',
  whatsappEnabled: true,
  whatsappMode: 'normal' as const,
  whatsappNumber: '+17138425500',
  whatsappBusinessPhoneId: '',
  whatsappBusinessAccountId: '',
  whatsappBusinessToken: '',
  whatsappVerifyToken: '',
  aiConfig: {
    enabled: false,
    provider: 'openai' as const,
    apiKey: '',
    model: 'gpt-4o-mini',
    customBaseUrl: '',
    customModel: '',
  },
  inboxNotifyEmail: '',
  humanHandoffEnabled: true,
};

export const DEFAULT_CONFIG: SiteConfig = {
  logoHeight:   40,
  logoWidth:    0,
  logoPaddingX: 16,
  logoPaddingY: 8,
  logoMarginX:  0,
  logoMarginY:  0,
  logoText:     'AeroTurbineSpare',
  logoSubText:  'Aerospace Parts Exchange',
  logoImageUrl: undefined,
  logoLink:     '/',
  heroHeading:    'Source Aerospace Parts with Confidence',
  heroSubheading: 'Global inventory of aviation, turbine, and defense components — NSN, CAGE, and part-number searchable in seconds.',
  heroBadgeText:  'Trusted by 500+ Aviation Companies',
  heroBgType:     'gradient',
  heroBgValue:    '#0A1628',
  heroCta1Label:  'Search Inventory',
  heroCta1Href:   '/catalog',
  heroCta2Label:  'Request a Quote',
  heroCta2Href:   '/rfq',
  chat: DEFAULT_CHAT_CONFIG,
  updatedAt: '',
  updatedBy: 'system',
};

// Save logo/branding fields to the local JSON file (works offline)
async function saveLocalBranding(cfg: Partial<SiteConfig>) {
  try {
    await fetch('/api/branding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logoImageUrl: cfg.logoImageUrl ?? null,
        logoLink:     cfg.logoLink     ?? '/',
        logoText:     cfg.logoText     ?? 'AeroTurbineSpare',
        logoSubText:  cfg.logoSubText  ?? 'Aerospace Parts Exchange',
        chat:         cfg.chat         ?? DEFAULT_CHAT_CONFIG,
      }),
    });
  } catch { /* non-critical */ }
}

export function useSiteConfig() {
  const [config, setConfig]   = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    // 1. Try to load local branding.json immediately (works offline)
    try {
      const localRes = await fetch('/data/branding.json', { cache: 'no-store' });
      if (localRes.ok) {
        const local = await localRes.json() as Partial<SiteConfig>;
        setConfig((prev) => ({
          ...prev,
          logoImageUrl: 'logoImageUrl' in local ? (local.logoImageUrl || undefined) : prev.logoImageUrl,
          logoLink:     local.logoLink    ?? prev.logoLink,
          logoText:     local.logoText    ?? prev.logoText,
          logoSubText:  local.logoSubText ?? prev.logoSubText,
          // Merge chat config if it exists in branding.json (for offline-first)
          chat: local.chat ? { ...DEFAULT_CHAT_CONFIG, ...prev.chat, ...local.chat } : prev.chat,
        }));
      }
    } catch { /* ignore */ }

    // 2. Try backend for full config (hero, spacing, etc.)
    try {
      const res = await request<{ success: boolean; data: SiteConfig }>('/site-config');
      if (res.success && res.data) {
        setConfig((prev) => ({
          ...prev,
          ...res.data,
          // Deep merge chat config so defaults are always present
          chat: {
            ...DEFAULT_CHAT_CONFIG,
            ...prev.chat,
            ...(res.data?.chat || {}),
          },
        }));
        // Keep local branding.json in sync
        await saveLocalBranding(res.data);
      }
    } catch {
      /* backend offline — local branding still loaded above */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = useCallback(async (updates: Partial<SiteConfig>) => {
    setSaving(true);
    try {
      const merged = { ...config, ...updates };
      // Explicitly null-ify cleared logo so JSON.stringify doesn't drop it
      const toSend = { ...merged, logoImageUrl: merged.logoImageUrl || null };
      const res = await request<{ success: boolean; data: SiteConfig; message?: string }>(
        '/site-config',
        { method: 'PUT', body: JSON.stringify(toSend) }
      );
      if (res.success && res.data) {
        setConfig(res.data);
        // Sync local JSON so logo shows even when backend is offline
        await saveLocalBranding(res.data);
      }
      return res;
    } finally {
      setSaving(false);
    }
  }, [config]);

  return { config, loading, saving, save, reload: load };
}
