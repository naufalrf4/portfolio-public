import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useReducedMotion,
} from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}

interface CardItemProps {
  children: React.ReactNode;
  className?: string;
  translateZ?: number;
}

export function ThreeDCard({ children, className, maxTilt = 12, glare = true }: ThreeDCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const isTouch =
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const tiltEnabled = !reduceMotion && !isTouch;

  const ref = useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const springCfg = { stiffness: 180, damping: 18, mass: 0.6 };
  const rxs = useSpring(rx, springCfg);
  const rys = useSpring(ry, springCfg);
  const glareXs = useSpring(glareX, springCfg);
  const glareYs = useSpring(glareY, springCfg);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareXs}% ${glareYs}%, rgba(255,255,255,0.14), transparent 55%)`;

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tiltEnabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * maxTilt * 2);
    rx.set((0.5 - py) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
    glareX.set(50);
    glareY.set(50);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn('group relative [perspective:1200px]', className)}
    >
      <motion.div
        style={tiltEnabled ? { rotateX: rxs, rotateY: rys, transformStyle: 'preserve-3d' } : undefined}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {children}
        {glare && tiltEnabled && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}

export function CardItem({ children, className, translateZ = 0 }: CardItemProps) {
  return (
    <div className={cn('[transform-style:preserve-3d]', className)} style={{ transform: `translateZ(${translateZ}px)` }}>
      {children}
    </div>
  );
}
