'use client';

import { useState, useEffect, useCallback } from 'react';
import { request } from '@/lib/api-client';
import type { SiteConfig } from '@/types';

const DEFAULT_CONFIG: SiteConfig = {
  logoHeight:   40,
  logoWidth:    0,
  logoPaddingX: 16,
  logoPaddingY: 8,
  logoMarginX:  0,
  logoMarginY:  0,
  logoText:     'AeroTurbineSpare',
  logoSubText:  'Aerospace Parts Exchange',
  heroHeading:    'Source Aerospace Parts with Confidence',
  heroSubheading: 'Global inventory of aviation, turbine, and defense components — NSN, CAGE, and part-number searchable in seconds.',
  heroBadgeText:  'Trusted by 500+ Aviation Companies',
  heroBgType:     'gradient',
  heroBgValue:    '#0A1628',
  heroCta1Label:  'Search Inventory',
  heroCta1Href:   '/catalog',
  heroCta2Label:  'Request a Quote',
  heroCta2Href:   '/rfq',
  updatedAt: '',
  updatedBy: 'system',
};

export function useSiteConfig() {
  const [config, setConfig]   = useState<SiteConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await request<{ success: boolean; data: SiteConfig }>('/site-config');
      if (res.success && res.data) setConfig(res.data);
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (updates: Partial<SiteConfig>) => {
    setSaving(true);
    try {
      const res = await request<{ success: boolean; data: SiteConfig; message?: string }>(
        '/site-config',
        {
          method: 'PUT',
          body: JSON.stringify({ ...config, ...updates }),
        }
      );
      if (res.success && res.data) setConfig(res.data);
      return res;
    } finally {
      setSaving(false);
    }
  }, [config]);

  return { config, loading, saving, save, reload: load };
}
