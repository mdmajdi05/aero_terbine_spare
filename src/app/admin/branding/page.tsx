'use client';

import { useState, useEffect } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { Palette, Type, Image as ImageIcon, Save, RefreshCw, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Reusable slider row
function SliderRow({
  label, value, min, max, step = 1,
  onChange, unit = 'px',
}: {
  label: string; value: number; min: number; max: number;
  step?: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <label className="w-36 text-sm text-[#4A4A6A] shrink-0">{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-[#4F46E5]"
      />
      <span className="w-16 text-right text-sm font-mono text-[#0A1628]">
        {value}{unit}
      </span>
      <input
        type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 border border-[#E8EDF2] rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
      />
    </div>
  );
}

// Section card wrapper
function Section({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF2] p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8EDF2]">
        <Icon className="w-5 h-5 text-[#4F46E5]" />
        <h2 className="text-base font-semibold text-[#0A1628]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function BrandingPage() {
  const { config, loading, saving, save } = useSiteConfig();
  const [draft, setDraft] = useState(config);
  const [preview, setPreview] = useState(false);

  // Sync draft when config loads
  useEffect(() => { setDraft(config); }, [config]);

  function update<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    try {
      const res = await save(draft);
      if (res?.success) toast.success('Branding saved successfully');
      else toast.error('Failed to save');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Error saving');
    }
  }

  function handleReset() {
    setDraft(config);
    toast('Reset to last saved values', { icon: '↩' });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Branding & Hero</h1>
          <p className="text-sm text-[#4A4A6A] mt-1">
            Control logo sizing and hero section content. Changes are applied site-wide instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPreview((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
          >
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8EDF2] text-sm text-[#4A4A6A] hover:bg-[#F5F7FA] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold hover:bg-[#4338CA] transition-colors disabled:opacity-60"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Live Hero Preview */}
      {preview && (
        <div className="rounded-2xl overflow-hidden border border-[#E8EDF2] shadow-lg">
          <div
            className="relative px-10 py-14 text-white"
            style={{
              background: draft.heroBgType === 'solid'
                ? draft.heroBgValue
                : draft.heroBgType === 'image'
                ? `url(${draft.heroBgValue}) center/cover`
                : 'linear-gradient(135deg, #0A1628 0%, #1E1B4B 50%, #312E81 100%)',
            }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium mb-6">
              {draft.heroBadgeText}
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4 max-w-2xl">{draft.heroHeading}</h1>
            <p className="text-white/70 text-lg max-w-xl mb-8">{draft.heroSubheading}</p>
            <div className="flex gap-3">
              <span className="px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold">
                {draft.heroCta1Label}
              </span>
              <span className="px-5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold">
                {draft.heroCta2Label}
              </span>
            </div>

            {/* Logo preview */}
            <div
              className="absolute top-4 right-4 bg-white/10 rounded-xl flex items-center justify-center"
              style={{
                height: `${draft.logoHeight}px`,
                width: draft.logoWidth ? `${draft.logoWidth}px` : 'auto',
                padding: `${draft.logoPaddingY}px ${draft.logoPaddingX}px`,
                margin: `${draft.logoMarginY}px ${draft.logoMarginX}px`,
              }}
            >
              <span className="text-white font-bold text-sm">{draft.logoText}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Logo Controls ── */}
      <Section title="Logo Sizing & Spacing" icon={ImageIcon}>
        <div className="grid grid-cols-1 gap-1">
          <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A4A6A]">Dimensions</div>
          <SliderRow label="Logo Height" value={draft.logoHeight} min={24} max={120} onChange={(v) => update('logoHeight', v)} />
          <SliderRow label="Logo Width (0=auto)" value={draft.logoWidth} min={0} max={300} onChange={(v) => update('logoWidth', v)} />

          <div className="mt-4 mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A4A6A]">Padding</div>
          <SliderRow label="Padding X" value={draft.logoPaddingX} min={0} max={64} onChange={(v) => update('logoPaddingX', v)} />
          <SliderRow label="Padding Y" value={draft.logoPaddingY} min={0} max={32} onChange={(v) => update('logoPaddingY', v)} />

          <div className="mt-4 mb-1 text-xs font-semibold uppercase tracking-widest text-[#4A4A6A]">Margin</div>
          <SliderRow label="Margin X" value={draft.logoMarginX} min={0} max={64} onChange={(v) => update('logoMarginX', v)} />
          <SliderRow label="Margin Y" value={draft.logoMarginY} min={0} max={32} onChange={(v) => update('logoMarginY', v)} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-1">Logo Display Text</label>
            <input
              type="text" value={draft.logoText}
              onChange={(e) => update('logoText', e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-1">Logo Sub-text</label>
            <input
              type="text" value={draft.logoSubText}
              onChange={(e) => update('logoSubText', e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
        </div>
      </Section>

      {/* ── Hero Text Controls ── */}
      <Section title="Hero Section Content" icon={Type}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-1">Badge Text</label>
            <input
              type="text" value={draft.heroBadgeText}
              onChange={(e) => update('heroBadgeText', e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              placeholder="e.g. Trusted by 500+ Aviation Companies"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-1">Hero Heading</label>
            <input
              type="text" value={draft.heroHeading}
              onChange={(e) => update('heroHeading', e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-1">Hero Sub-heading</label>
            <textarea
              rows={3} value={draft.heroSubheading}
              onChange={(e) => update('heroSubheading', e.target.value)}
              className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#4A4A6A] mb-1">CTA 1 Label</label>
              <input
                type="text" value={draft.heroCta1Label}
                onChange={(e) => update('heroCta1Label', e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A4A6A] mb-1">CTA 1 Link</label>
              <input
                type="text" value={draft.heroCta1Href}
                onChange={(e) => update('heroCta1Href', e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A4A6A] mb-1">CTA 2 Label</label>
              <input
                type="text" value={draft.heroCta2Label}
                onChange={(e) => update('heroCta2Label', e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#4A4A6A] mb-1">CTA 2 Link</label>
              <input
                type="text" value={draft.heroCta2Href}
                onChange={(e) => update('heroCta2Href', e.target.value)}
                className="w-full border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Hero Background Controls ── */}
      <Section title="Hero Background" icon={Palette}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[#4A4A6A] mb-2">Background Type</label>
            <div className="flex gap-3">
              {(['gradient', 'solid', 'image'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('heroBgType', t)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    draft.heroBgType === t
                      ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                      : 'border-[#E8EDF2] text-[#4A4A6A] hover:border-[#4F46E5] hover:text-[#4F46E5]'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {draft.heroBgType !== 'gradient' && (
            <div>
              <label className="block text-sm text-[#4A4A6A] mb-1">
                {draft.heroBgType === 'solid' ? 'Background Color' : 'Image URL'}
              </label>
              <div className="flex gap-3 items-center">
                {draft.heroBgType === 'solid' && (
                  <input
                    type="color" value={draft.heroBgValue || '#0A1628'}
                    onChange={(e) => update('heroBgValue', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[#E8EDF2] cursor-pointer"
                  />
                )}
                <input
                  type="text" value={draft.heroBgValue}
                  onChange={(e) => update('heroBgValue', e.target.value)}
                  placeholder={draft.heroBgType === 'solid' ? '#0A1628' : 'https://...'}
                  className="flex-1 border border-[#E8EDF2] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                />
              </div>
              <p className="text-xs text-[#4A4A6A] mt-1">
                {draft.heroBgType === 'solid'
                  ? 'Pick a solid background color.'
                  : 'Provide a publicly accessible image URL.'}
              </p>
            </div>
          )}

          {(draft.heroBgType as string) === 'gradient' && (
            <div className="rounded-xl p-4 bg-gradient-to-r from-[#0A1628] via-[#1E1B4B] to-[#312E81] text-white/60 text-sm text-center">
              Using built-in Indigo gradient — no configuration needed
            </div>
          )}
        </div>
      </Section>

      {/* Last updated */}
      {config.updatedAt && (
        <p className="text-xs text-[#4A4A6A]">
          Last updated: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
        </p>
      )}
    </div>
  );
}
