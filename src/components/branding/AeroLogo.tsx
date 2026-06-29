'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface AeroLogoProps {
  size?: number;
  showText?: boolean;
  animated?: boolean;
  variant?: 'icon' | 'full' | 'minimal' | 'white';
}

const bladeColors = ['#4F46E5', '#6366F1', '#818CF8', '#7C3AED', '#6D28D9', '#4F46E5'];

function Sparkles({ id }: { id: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        angle: (i * 45 + 15) * (Math.PI / 180),
        delay: i * 0.25,
        distance: 20 + (i % 3) * 5,
        size: 1 + (i % 2) * 1.2,
      })),
    []
  );

  return (
    <svg viewBox="0 0 64 64" className="absolute inset-0 w-full h-full pointer-events-none">
      {particles.map((p, i) => (
        <motion.circle
          key={i}
          cx={32}
          cy={32}
          r={p.size}
          fill="#818CF8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0], x: Math.cos(p.angle) * p.distance, y: Math.sin(p.angle) * p.distance }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: p.delay }}
        />
      ))}
    </svg>
  );
}

const f6 = (n: number) => n.toFixed(6);

function TurbineIcon({ size, animated }: { size: number; animated: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="outerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#7C3AED" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="50%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="innerRingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="hubGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hubGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer ambient glow */}
      {animated && (
        <motion.circle
          cx="32" cy="32" r="32"
          fill="url(#outerGlow)"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ originX: '32px', originY: '32px' }}
        />
      )}

      {/* Expanding pulse ring */}
      {animated && (
        <motion.circle
          cx="32" cy="32" r="29"
          stroke="#4F46E5"
          strokeWidth="1"
          fill="none"
          opacity={0}
          animate={{ r: [29, 33, 29], opacity: [0, 0.25, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
        />
      )}

      {/* Outer ring - turbine casing */}
      <circle cx="32" cy="32" r="29" stroke="#1E293B" strokeWidth="2.5" fill="none" />
      <circle cx="32" cy="32" r="29" stroke="url(#ringGrad)" strokeWidth="2.5" fill="none" opacity="0.9" />

      {/* Casing notches */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 32 + 28.5 * Math.cos(rad);
        const cy = 32 + 28.5 * Math.sin(rad);
        return (
          <motion.rect
            key={i}
            x={f6(cx - 1.5)} y={f6(cy - 1.5)}
            width="3" height="3" rx="0.5"
            fill="#4F46E5"
            animate={animated ? { opacity: [0.4, 0.8, 0.4] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            transform={`rotate(${deg + 45} ${f6(cx)} ${f6(cy)})`}
          />
        );
      })}

      {/* Inner ring accent */}
      <circle cx="32" cy="32" r="24" stroke="url(#innerRingGrad)" strokeWidth="1.5" fill="none" opacity={0.25} />

      {/* Turbine blades */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const innerR = 8;
        const outerR = 22;
        const bladeW = 5;
        const ax = 32 + innerR * Math.cos(rad) - bladeW * Math.sin(rad);
        const ay = 32 + innerR * Math.sin(rad) + bladeW * Math.cos(rad);
        const bx = 32 + outerR * Math.cos(rad) - bladeW * Math.sin(rad);
        const by = 32 + outerR * Math.sin(rad) + bladeW * Math.cos(rad);
        const cx = 32 + outerR * Math.cos(rad) + bladeW * Math.sin(rad);
        const cy = 32 + outerR * Math.sin(rad) - bladeW * Math.cos(rad);
        const dx = 32 + innerR * Math.cos(rad) + bladeW * Math.sin(rad);
        const dy = 32 + innerR * Math.sin(rad) - bladeW * Math.cos(rad);
        const midX = 32 + (innerR + outerR) * 0.65 * Math.cos(rad);
        const midY = 32 + (innerR + outerR) * 0.65 * Math.sin(rad);

        return (
          <motion.g
            key={i}
            animate={animated ? { rotate: [0, 360] } : {}}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            style={{ originX: '32px', originY: '32px' }}
          >
            <path d={`M ${f6(ax)} ${f6(ay)} L ${f6(bx)} ${f6(by)} Q ${f6(midX)} ${f6(midY)} ${f6(cx)} ${f6(cy)} L ${f6(dx)} ${f6(dy)} Z`}
              fill={bladeColors[i]} opacity={0.9} filter="url(#logoGlow)" />
            <path d={`M ${f6(ax)} ${f6(ay)} L ${f6(bx)} ${f6(by)}`} stroke="white" strokeWidth="0.4" opacity={0.2} />
            <path d={`M ${f6(dx)} ${f6(dy)} L ${f6(cx)} ${f6(cy)}`} stroke="white" strokeWidth="0.3" opacity={0.1} />
          </motion.g>
        );
      })}

      {/* Center hub - outer ring */}
      <circle cx="32" cy="32" r="9" fill="#0F172A" stroke="#334155" strokeWidth="1" />

      {/* Center hub - inner */}
      <circle cx="32" cy="32" r="6" fill="url(#hubGrad)" opacity={0.95} filter="url(#hubGlow)" />

      {/* Center dot */}
      <motion.circle
        cx="32" cy="32" r="2.5" fill="white"
        animate={animated ? { opacity: [0.5, 1, 0.5], r: [2.5, 3.2, 2.5] } : {}}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ring highlight segments */}
      {[0, 90, 180, 270].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.line
            key={deg}
            x1={f6(32 + 26 * Math.cos(rad))} y1={f6(32 + 26 * Math.sin(rad))}
            x2={f6(32 + 28 * Math.cos(rad))} y2={f6(32 + 28 * Math.sin(rad))}
            stroke="#A78BFA" strokeWidth="1.5"
            animate={animated ? { opacity: [0.3, 0.7, 0.3] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: deg * 0.002 }}
          />
        );
      })}

      {/* Orbital dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.circle
            key={`orbit-${i}`}
            cx={f6(32 + 27 * Math.cos(rad))} cy={f6(32 + 27 * Math.sin(rad))}
            r="1.2" fill="#A78BFA"
            animate={animated ? { opacity: [0.15, 0.9, 0.15], scale: [1, 1.4, 1] } : {}}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
            style={{ originX: `${f6(32 + 27 * Math.cos(rad))}px`, originY: `${f6(32 + 27 * Math.sin(rad))}px` }}
          />
        );
      })}

      {/* Outer ring glow segments */}
      {animated && [0, 60, 120, 180, 240, 300].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <motion.path
            key={`glow-seg-${i}`}
            d={`M ${f6(32 + 28.5 * Math.cos(rad - 0.15))} ${f6(32 + 28.5 * Math.sin(rad - 0.15))} A 28.5 28.5 0 0 1 ${f6(32 + 28.5 * Math.cos(rad + 0.15))} ${f6(32 + 28.5 * Math.sin(rad + 0.15))}`}
            stroke="#818CF8" strokeWidth="1" fill="none"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
          />
        );
      })}
    </svg>
  );
}

const textGradId = 'textGrad';

function LogoText({ logoText, logoSubText, variant }: { logoText?: string; logoSubText?: string; variant?: 'default' | 'white' }) {
  const isWhite = variant === 'white';

  return (
    <div className="flex flex-col">
      <span className={`font-extrabold text-[20px] leading-tight tracking-[-0.03em] ${isWhite ? 'text-white' : 'text-[#0A1628]'}`}>
        {logoText || 'AeroTurbine'}
        <span className={`${isWhite ? 'text-[#A78BFA]' : 'text-[#4F46E5]'}`}>Spare</span>
      </span>
      <span className={`text-[9px] leading-tight tracking-[0.2em] uppercase font-semibold ${isWhite ? 'text-white/60' : 'text-[#6B7280]'}`}>
        {logoSubText || 'Precision Aerospace Sourcing'}
      </span>
    </div>
  );
}

export default function AeroLogo({
  size = 40,
  showText = true,
  animated = true,
  variant = 'full',
}: AeroLogoProps) {
  if (variant === 'icon') {
    return (
      <div className="relative">
        {/* Sparkle particles */}
        {animated && <Sparkles id="icon" />}
        <TurbineIcon size={size} animated={animated} />
      </div>
    );
  }

  if (variant === 'white') {
    return (
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          {animated && <Sparkles id="white" />}
          <TurbineIcon size={size} animated={animated} />
        </div>
        {showText && <LogoText variant="white" />}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          {animated && <Sparkles id="minimal" />}
          <TurbineIcon size={size} animated={animated} />
        </div>
        {showText && (
          <span className="text-[#0A1628] font-bold text-base tracking-tight">
            AeroTurbineSpare
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className="flex items-center gap-3 select-none"
      whileHover="hover"
      initial="rest"
    >
      <motion.div
        className="relative flex-shrink-0"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.08 },
        }}
      >
        {/* Glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 70%)' }}
          variants={{
            rest: { opacity: 0, scale: 0.6 },
            hover: { opacity: 1, scale: 1.5 },
          }}
          transition={{ duration: 0.4 }}
        />
        {/* Sparkle particles on hover */}
        {animated && <Sparkles id="full" />}
        <TurbineIcon size={size} animated={animated} />
      </motion.div>

      {showText && (
        <motion.div
          variants={{
            rest: { x: 0 },
            hover: { x: 3 },
          }}
          transition={{ duration: 0.2 }}
        >
          <LogoText />
        </motion.div>
      )}
    </motion.div>
  );
}
