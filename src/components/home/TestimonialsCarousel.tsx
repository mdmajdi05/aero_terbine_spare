'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import type { Testimonial } from '@/types';
import { cn } from '@/lib/utils';

export default function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [idx, setIdx] = useState(0);

  const prev = () => setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIdx((i) => (i + 1) % testimonials.length);

  const t = testimonials[idx];
  if (!t) return null;

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-orange text-sm font-semibold uppercase tracking-wider mb-3">
            <span className="w-6 h-px bg-orange" /> Client Reviews <span className="w-6 h-px bg-orange" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-text">Trusted Worldwide</h2>
        </div>

        <div className="max-w-3xl mx-auto relative">
          <div className="bg-white rounded-3xl p-8 lg:p-12 border border-silver shadow-sm relative overflow-hidden">
            {/* Decorative quote */}
            <Quote className="absolute top-6 right-6 w-24 h-24 text-silver/30" />

            <div className="flex gap-1 mb-5">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-orange text-orange" />
              ))}
            </div>

            <blockquote className="text-lg text-text leading-relaxed mb-8 relative z-10">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white font-bold text-lg">
                {t.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-text">{t.name}</div>
                <div className="text-sm text-text-muted">{t.title} — {t.company}</div>
                <div className="text-xs text-text-muted/70 mt-0.5">{t.country}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-silver-dark flex items-center justify-center text-text-muted hover:border-orange hover:text-orange transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    i === idx ? 'bg-orange w-6' : 'bg-silver-dark'
                  )}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-silver-dark flex items-center justify-center text-text-muted hover:border-orange hover:text-orange transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
