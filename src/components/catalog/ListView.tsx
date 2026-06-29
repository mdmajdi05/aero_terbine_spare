'use client';

import { useState, useMemo } from 'react';
import { Search, X, ArrowUpDown, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListViewItem {
  id: string;
  data: Record<string, unknown>;
  cardConfig?: Record<string, unknown>;
}

interface ListViewProps {
  items: ListViewItem[];
  cardConfig?: Record<string, unknown>;
}

type SortDir = 'asc' | 'desc';

export default function ListView({ items, cardConfig }: ListViewProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const fields = (cardConfig?.fields as string[]) || [];

  const allKeys = useMemo(() => {
    const order = items[0]?.data?._columnOrder as string[] | undefined;
    if (fields.length > 0) return fields;
    if (order && order.length > 0) return order;
    const keySet = new Set<string>();
    for (const item of items) {
      if (item.data && typeof item.data === 'object') {
        for (const k of Object.keys(item.data)) {
          if (k !== '_columnOrder') keySet.add(k);
        }
      }
    }
    return Array.from(keySet);
  }, [items, fields]);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => {
      if (item.data && typeof item.data === 'object') {
        for (const [k, val] of Object.entries(item.data)) {
          if (k === '_columnOrder') continue;
          if (String(val).toLowerCase().includes(q)) return true;
        }
      }
      return false;
    });
  }, [items, search]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = String(a.data?.[sortKey] ?? '');
      const bVal = String(b.data?.[sortKey] ?? '');
      const cmp = aVal.localeCompare(bVal);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortKey !== colKey) return <ChevronsUpDown className="w-3.5 h-3.5 text-text-muted/40 group-hover:text-text-muted/70 transition-colors" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-orange" />
      : <ArrowDown className="w-3.5 h-3.5 text-orange" />;
  };

  const cellValue = (item: ListViewItem, key: string): string => {
    if (item.data?.[key] === undefined || item.data?.[key] === null) return '—';
    return String(item.data[key]);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-silver/50 to-silver/20 flex items-center justify-center mb-4 ring-1 ring-silver/40">
          <Search className="w-6 h-6 text-text-muted/50" />
        </div>
        <p className="text-text-muted text-sm">No items to display</p>
      </div>
    );
  }

  const firstKey = allKeys[0] || '';

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-silver/70 bg-white shadow-sm">
        {/* Table toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-silver/50 bg-bg/50">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted/50" />
            <input
              type="text"
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-silver/60 rounded-lg bg-white text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-1 focus:ring-orange/30 focus:border-orange/50 transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted/40 hover:text-text-muted transition-colors">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-[11px] font-medium text-text-muted/60">
            {sorted.length} / {items.length} items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-navy/5 to-navy/[0.02] border-b border-silver/60">
                {allKeys.map((key, i) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className={cn(
                      'group px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest cursor-pointer select-none transition-colors',
                      sortKey === key ? 'text-navy' : 'text-text-muted/70 hover:text-text-muted',
                      i === 0 && 'pl-5',
                      i === allKeys.length - 1 && 'pr-5',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <SortIcon colKey={key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-silver/30">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={allKeys.length} className="px-4 py-12 text-center text-sm text-text-muted">
                    No matches found
                  </td>
                </tr>
              ) : (
                sorted.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'transition-colors',
                      idx % 2 === 0 ? 'bg-white' : 'bg-bg/30',
                      'hover:bg-orange/[0.03]',
                    )}
                  >
                    {allKeys.map((key, i) => (
                      <td
                        key={key}
                        className={cn(
                          'px-4 py-2.5 text-xs',
                          i === 0 && 'pl-5 font-semibold text-navy',
                          i !== 0 && 'text-text-muted',
                          i === allKeys.length - 1 && 'pr-5',
                        )}
                      >
                        <span className={cn(
                          'inline-block max-w-[250px] truncate',
                          i === 0 && 'font-semibold text-navy',
                        )} title={cellValue(item, key)}>
                          {cellValue(item, key)}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {/* Mobile search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/50" />
          <input
            type="text"
            placeholder="Filter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm border border-silver/70 rounded-xl bg-white text-text placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange/50 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted/50 hover:text-text-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Mobile count */}
        <p className="text-[11px] font-medium text-text-muted/60 px-1">
          {sorted.length} / {items.length} items
        </p>

        {sorted.length === 0 ? (
          <div className="text-center py-12 text-sm text-text-muted bg-white rounded-xl border border-silver/70">
            No matches found
          </div>
        ) : (
          sorted.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-silver/70 rounded-xl overflow-hidden hover:border-orange/30 hover:shadow-sm transition-all"
            >
              {/* First field as card header */}
              {firstKey && item.data?.[firstKey] !== undefined && item.data?.[firstKey] !== null && (
                <div className="px-4 pt-3.5 pb-2 border-b border-silver/30">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted/50 block mb-0.5">
                    {firstKey.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-semibold text-navy">{String(item.data[firstKey])}</span>
                </div>
              )}
              {/* Remaining fields in grid */}
              <div className="px-4 py-3">
                {allKeys.slice(1).length > 0 && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {allKeys.slice(1).map((key) => (
                      <div key={key} className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted/50 block">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-xs text-text truncate block" title={cellValue(item, key)}>
                          {cellValue(item, key)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {allKeys.slice(1).length === 0 && firstKey && (
                  <div className="text-xs text-text-muted">
                    {allKeys.length === 1 ? 'Only one field available' : ''}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
