'use client';

import { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key:     string;
  label:   string;
  type:    'select' | 'radio' | 'range' | 'checkbox';
  options: FilterOption[];
  min?:    number;
  max?:    number;
}

export interface FilterValues {
  [key: string]: string | string[] | [number, number];
}

interface FilterPanelProps {
  groups:   FilterGroup[];
  values:   FilterValues;
  onChange: (key: string, value: string | string[] | [number, number]) => void;
  onReset:  () => void;
  className?: string;
}

function Accordion({ label, children, defaultOpen = true }: { label: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8EDF2] last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#0A1628] hover:bg-[#F5F7FA] transition-colors"
      >
        {label}
        <ChevronDown className={cn('w-4 h-4 text-[#4A4A6A] transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <div className={cn('overflow-hidden transition-all duration-200', open ? 'max-h-80' : 'max-h-0')}>
        <div className="px-4 pb-4">{children}</div>
      </div>
    </div>
  );
}

export default function FilterPanel({ groups, values, onChange, onReset, className }: FilterPanelProps) {
  const activeCount = Object.entries(values).filter(([, v]) =>
    Array.isArray(v) ? v.length > 0 : v !== '' && v !== 'all'
  ).length;

  return (
    <aside className={cn('bg-white rounded-2xl border border-[#E8EDF2] shadow-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F7FA] border-b border-[#E8EDF2]">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0A1628]">
          <Filter className="w-4 h-4 text-[#4F46E5]" />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#4F46E5] text-white text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear all
          </button>
        )}
      </div>

      {/* Filter groups */}
      {groups.map((group) => (
        <Accordion key={group.key} label={group.label}>
          {group.type === 'radio' && (
            <div className="space-y-1.5">
              {group.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name={group.key}
                    value={opt.value}
                    checked={(values[group.key] as string) === opt.value}
                    onChange={() => onChange(group.key, opt.value)}
                    className="accent-[#4F46E5] w-3.5 h-3.5"
                  />
                  <span className="text-sm text-[#4A4A6A] group-hover:text-[#0A1628] transition-colors flex-1">
                    {opt.label}
                  </span>
                  {opt.count !== undefined && (
                    <span className="text-xs text-[#4A4A6A]/60">{opt.count}</span>
                  )}
                </label>
              ))}
            </div>
          )}

          {group.type === 'checkbox' && (
            <div className="space-y-1.5">
              {group.options.map((opt) => {
                const checked = (values[group.key] as string[] || []).includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const current = (values[group.key] as string[]) || [];
                        const next = checked
                          ? current.filter((v) => v !== opt.value)
                          : [...current, opt.value];
                        onChange(group.key, next);
                      }}
                      className="accent-[#4F46E5] w-3.5 h-3.5 rounded"
                    />
                    <span className="text-sm text-[#4A4A6A] group-hover:text-[#0A1628] transition-colors flex-1">
                      {opt.label}
                    </span>
                    {opt.count !== undefined && (
                      <span className="text-xs text-[#4A4A6A]/60">{opt.count}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {group.type === 'select' && (
            <select
              value={(values[group.key] as string) || ''}
              onChange={(e) => onChange(group.key, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#C0C9D5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30"
            >
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {group.type === 'range' && group.min !== undefined && group.max !== undefined && (
            <div className="space-y-2">
              <input
                type="range"
                min={group.min}
                max={group.max}
                value={((values[group.key] as [number, number])?.[1]) ?? group.max}
                onChange={(e) =>
                  onChange(group.key, [group.min!, Number(e.target.value)])
                }
                className="w-full accent-[#4F46E5]"
              />
              <div className="flex justify-between text-xs text-[#4A4A6A]">
                <span>${group.min?.toLocaleString()}</span>
                <span>${((values[group.key] as [number, number])?.[1] ?? group.max)?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </Accordion>
      ))}
    </aside>
  );
}
