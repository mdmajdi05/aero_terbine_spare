import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddings = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

export default function Card({ children, className, hover, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-silver shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-orange/30 hover:-translate-y-0.5 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
