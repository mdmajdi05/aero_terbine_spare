'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const STATS = [
  { value: 250000, suffix: '+', label: 'Parts Available',     sub: 'NSN-cataloged inventory' },
  { value: 3200,   suffix: '+', label: 'Clients Worldwide',   sub: 'MROs, OEMs & contractors' },
  { value: 150,    suffix: '+', label: 'Countries Served',    sub: 'Global shipping network' },
  { value: 15,     suffix: '+', label: 'Years in Business',   sub: 'Aerospace procurement' },
];

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, target, duration]);
  return count;
}

function StatItem({ value, suffix, label, sub, start }: typeof STATS[0] & { start: boolean }) {
  const count = useCountUp(value, 1800, start);
  return (
    <div className="text-center">
      <div className="text-4xl lg:text-5xl font-bold text-white counter-target">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-silver font-semibold mt-1">{label}</div>
      <div className="text-silver/60 text-xs mt-0.5">{sub}</div>
    </div>
  );
}

export default function StatsCounter() {
  const ref  = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-navy py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white">Trusted by Industry Leaders</h2>
          <p className="text-silver/70 mt-2">Numbers that reflect our commitment to aerospace excellence</p>
        </div>
        <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-8')}>
          {STATS.map((s) => <StatItem key={s.label} {...s} start={started} />)}
        </div>
      </div>
    </div>
  );
}
