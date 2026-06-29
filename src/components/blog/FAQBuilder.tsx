'use client';

import type { FAQItem } from '@/types/blog';
import { Plus, X, GripVertical } from 'lucide-react';

interface Props {
  items: FAQItem[];
  onChange: (items: FAQItem[]) => void;
}

export default function FAQBuilder({ items, onChange }: Props) {
  function add() {
    onChange([...items, { question: '', answer: '' }]);
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i);
    onChange(next);
  }

  function update(i: number, field: 'question' | 'answer', value: string) {
    const next = items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#0A1628] uppercase tracking-wider">FAQ Items</span>
        <button type="button" onClick={add}
          className="flex items-center gap-1 text-xs font-medium text-[#4F46E5] hover:text-[#4338CA] transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add FAQ
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-[11px] text-[#C0C9D5]">No FAQ items yet. Click &quot;Add FAQ&quot; to create one.</p>
      )}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-[#F8FAFC] border border-[#E8EDF2] rounded-lg p-3 relative group">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-2 text-[#C0C9D5] cursor-grab">
                <GripVertical className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <input type="text" value={item.question} onChange={(e) => update(i, 'question', e.target.value)}
                  placeholder="Question"
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-1.5 text-sm text-[#0A1628] bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
                <textarea rows={2} value={item.answer} onChange={(e) => update(i, 'answer', e.target.value)}
                  placeholder="Answer"
                  className="w-full border border-[#E8EDF2] rounded-lg px-3 py-1.5 text-sm text-[#0A1628] bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/30" />
              </div>
              <button type="button" onClick={() => remove(i)}
                className="flex-shrink-0 mt-2 p-1 text-[#C0C9D5] hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
