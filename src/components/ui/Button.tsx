'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'orange' | 'blue' | 'brand';
type Size    = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  as?: 'button' | 'a';
  href?: string;
}

const variants: Record<Variant, string> = {
  primary:   'bg-navy text-white hover:bg-navy-dark active:bg-navy-dark',
  /* orange → brand blue (same variable name, new value in CSS) */
  orange:    'bg-orange text-white hover:bg-orange-light active:bg-orange-light shadow-lg shadow-orange/25',
  blue:      'bg-[#4F46E5] text-white hover:bg-[#4338CA] active:bg-[#3730A3] shadow-lg shadow-indigo-500/25',
  brand:     'bg-[#4F46E5] text-white hover:bg-[#4338CA] active:bg-[#3730A3] shadow-lg shadow-indigo-500/25',
  secondary: 'bg-silver text-navy hover:bg-silver-dark',
  outline:   'border border-navy text-navy hover:bg-navy hover:text-white',
  ghost:     'text-navy hover:bg-navy/8',
  danger:    'bg-red-600 text-white hover:bg-red-700',
};

const sizes: Record<Size, string> = {
  sm:  'h-8  px-3 text-sm  rounded-md gap-1.5',
  md:  'h-10 px-4 text-sm  rounded-lg gap-2',
  lg:  'h-12 px-6 text-base rounded-lg gap-2',
  xl:  'h-14 px-8 text-lg  rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
