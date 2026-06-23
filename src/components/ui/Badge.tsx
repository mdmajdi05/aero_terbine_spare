import { cn } from '@/lib/utils';

type StockStatus = 'In Stock' | 'On Order' | 'Obsolete' | 'Limited';
type Condition   = 'New' | 'Used' | 'Refurbished' | 'Overhauled';
type Urgency     = 'Standard' | 'Urgent' | 'Critical';

const stockColors: Record<StockStatus, string> = {
  'In Stock':  'badge-in-stock',
  'On Order':  'badge-on-order',
  'Obsolete':  'badge-obsolete',
  'Limited':   'badge-limited',
};

const conditionColors: Record<Condition, string> = {
  'New':        'bg-blue-50  text-blue-700',
  'Overhauled': 'bg-purple-50 text-purple-700',
  'Refurbished':'bg-teal-50  text-teal-700',
  'Used':       'bg-gray-100 text-gray-600',
};

const urgencyColors: Record<Urgency, string> = {
  'Standard': 'bg-slate-100 text-slate-700',
  'Urgent':   'badge-urgent',
  'Critical': 'badge-critical',
};

interface BadgeProps {
  label: string;
  type?: 'stock' | 'condition' | 'urgency' | 'neutral';
  className?: string;
}

export default function Badge({ label, type = 'neutral', className }: BadgeProps) {
  let colorClass = 'bg-slate-100 text-slate-600';
  if (type === 'stock')     colorClass = stockColors[label as StockStatus]     || 'bg-slate-100 text-slate-600';
  if (type === 'condition') colorClass = conditionColors[label as Condition]   || 'bg-slate-100 text-slate-600';
  if (type === 'urgency')   colorClass = urgencyColors[label as Urgency]       || 'bg-slate-100 text-slate-600';

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', colorClass, className)}>
      {type === 'stock' && label === 'In Stock' && (
        <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
      )}
      {label}
    </span>
  );
}
