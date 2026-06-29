'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './ChatbotLogo.module.css';

interface ChatBotLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showGlow?: boolean;
  onClick?: () => void;
}

const sizeScales = {
  xl: 0.5,
  lg: 0.4,
  md: 0.3,
  sm: 0.15,
};

const BASE_W = 220;
const BASE_H = 260;

export default function ChatBotLogo({
  size = 'md',
  animated = true,
  showGlow = true,
  onClick,
}: ChatBotLogoProps) {
  const scale = sizeScales[size];
  const containerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const visualW = BASE_W * scale;
  const visualH = BASE_H * scale;

  useEffect(() => {
    const container = containerRef.current;
    const head = headRef.current;
    const scan = scanRef.current;
    const ball = ballRef.current;
    const group = groupRef.current;

    if (!container || !head || !scan || !ball || !group) return;

    const handleClick = () => {
      if (onClick) onClick();

      group.style.animationDuration = '1.2s';
      head.style.animationDuration = '1.2s';

      scan.style.transition = 'box-shadow 0.3s ease, background 0.3s ease';
      scan.style.boxShadow = '0 0 60px rgba(100, 255, 218, 0.9), 0 0 120px rgba(100, 255, 218, 0.4)';

      ball.style.transition = 'box-shadow 0.3s ease';
      ball.style.boxShadow = '0 0 70px rgba(100, 255, 218, 0.9), 0 0 140px rgba(100, 255, 218, 0.3)';

      head.style.transition = 'transform 0.12s cubic-bezier(0.4, 0, 0.2, 1)';
      head.style.transform = 'translateZ(20px) scale(0.88)';

      setTimeout(() => {
        head.style.transform = 'translateZ(20px) scale(1)';
      }, 150);

      setTimeout(() => {
        group.style.animationDuration = '5s';
        head.style.animationDuration = '5s';
        scan.style.boxShadow = '0 0 25px rgba(100, 255, 218, 0.5), 0 0 60px rgba(100, 255, 218, 0.15)';
        ball.style.boxShadow = '0 0 40px rgba(100, 255, 218, 0.4), 0 0 80px rgba(100, 255, 218, 0.15)';
      }, 600);
    };

    const handleMouseEnter = () => {
      if (!animated) return;
      group.style.animationPlayState = 'paused';
      head.style.animationPlayState = 'paused';
      container.style.transition = 'transform 0.4s ease';
      container.style.transform = 'rotateY(6deg) rotateX(2deg)';
    };

    const handleMouseLeave = () => {
      if (!animated) return;
      group.style.animationPlayState = 'running';
      head.style.animationPlayState = 'running';
      container.style.transform = '';
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [animated, onClick]);

  return (
    <div
      className={styles.wrapper}
      style={{ width: visualW, height: visualH }}
    >
      {/* Glow rings - use base dimensions so percentages work correctly */}
      {showGlow && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: BASE_W,
            height: BASE_H,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <motion.div
            className={styles.glowRing}
            animate={animated ? { scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className={styles.glowRingOuter}
            animate={animated ? { scale: [1, 1.4, 1], opacity: [0.25, 0, 0.25] } : {}}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      )}

      {/* Scaled 3D Robot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
          width: BASE_W,
          height: BASE_H,
        }}
      >
        <div className={styles.scene}>
          <div className={styles.cubeContainer} ref={containerRef}>
            <div className={styles.platform} />

            <div className={styles.robotWrapper}>
              <div className={styles.robotGroup} ref={groupRef}>
                <div className={styles.antennaGroup}>
                  <div className={styles.antennaStem} />
                  <div className={styles.antennaBall} ref={ballRef} />
                </div>

                <div className={styles.head} ref={headRef}>
                  <div className={styles.earLeft} />
                  <div className={styles.earRight} />
                  <div className={styles.visor}>
                    <div className={styles.scanLine} ref={scanRef} />
                  </div>
                  <div className={styles.mouth}>
                    <span /><span /><span /><span /><span />
                  </div>
                </div>

                <div className={styles.body}>
                  <span className={styles.chestLight} />
                  <span className={styles.chestLight} />
                </div>

                <div className={styles.armLeft} />
                <div className={styles.armRight} />

                <div className={styles.floatBubble}>
                  <span>AI</span>
                  <div className={styles.loader}>
                    <i /><i /><i />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
