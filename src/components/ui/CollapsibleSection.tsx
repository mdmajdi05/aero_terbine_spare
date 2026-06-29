'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  count?: ReactNode;
  className?: string;
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-[#C0C9D5] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function CollapsibleSection({ id, title, children, defaultOpen = true, count, className = '' }: Props) {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return defaultOpen;
    const stored = localStorage.getItem(`collapsible:${id}`);
    if (stored !== null) return stored === 'true';
    return defaultOpen;
  });

  useEffect(() => {
    localStorage.setItem(`collapsible:${id}`, String(open));
  }, [id, open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return (
    <div className={`bg-white border border-[#E8EDF2] rounded-xl overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider truncate">{title}</span>
          {count !== undefined && (
            <span className="text-[10px] font-medium text-[#C0C9D5] bg-[#F0F4F8] px-1.5 py-0.5 rounded-full flex-shrink-0">
              {count}
            </span>
          )}
        </div>
        <Chevron open={open} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
