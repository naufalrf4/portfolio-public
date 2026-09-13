import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion, AnimatePresence } from 'framer-motion';
import type { AboutData } from '@/types';
import { cn } from '@/lib/utils';

interface HeroFlipCardProps {
  about: AboutData;
}

export function HeroFlipCard({ about }: HeroFlipCardProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const tiltEnabled = !reduceMotion && !isTouch;

  const [flipped, setFlipped] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springCfg = { stiffness: 180, damping: 18, mass: 0.6 };
  const rxs = useSpring(rx, springCfg);
  const rys = useSpring(ry, springCfg);

  const fullName = about.fullName?.trim() || 'NaufalRF';
const role = about.roles?.[0] ?? 'System & Automation Engineer';

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!tiltEnabled || !ref.current || !flipped) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 24);
    rx.set((0.5 - py) * 24);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  function toggleFlip() {
    setFlipped((f) => !f);
    if (flipped) {
      rx.set(0);
      ry.set(0);
    }
  }

  const cmdWhoami = 'whoami';
  const outWhoami = 'visitor';
  const cmdCat = 'cat ~/identity.txt';
  const cmdFeh = 'feh ~/photo.jpg';
  const [booted, setBooted] = useState(false);
  const [line1Cmd, setLine1Cmd] = useState('');
  const [line1Out, setLine1Out] = useState(false);
  const [line2Cmd, setLine2Cmd] = useState('');
  const [identityLines, setIdentityLines] = useState<string[]>([]);
  const [line3Cmd, setLine3Cmd] = useState('');

  useEffect(() => {
    if (reduceMotion) {
      setBooted(true);
      setLine1Cmd(cmdWhoami);
      setLine1Out(true);
      setLine2Cmd(cmdCat);
      setIdentityLines([fullName, role]);
      setLine3Cmd(cmdFeh);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    function typeCmd(cmd: string, set: (s: string) => void, done: () => void, speed = 95) {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        set(cmd.slice(0, i));
        if (i >= cmd.length) {
          clearInterval(iv);
          done();
        }
      }, speed);
      intervals.push(iv);
    }

    timers.push(setTimeout(() => setBooted(true), 350));

    timers.push(
      setTimeout(() => {
        typeCmd(cmdWhoami, setLine1Cmd, () => {
          timers.push(
            setTimeout(() => {
              setLine1Out(true);
              timers.push(
                setTimeout(() => {
                  typeCmd(cmdCat, setLine2Cmd, () => {
                    [fullName, role].forEach((line, li) => {
                      timers.push(
                        setTimeout(() => {
                          setIdentityLines((prev) => [...prev, line]);
                          if (li === 1) {
                            timers.push(
                              setTimeout(() => {
                                typeCmd(cmdFeh, setLine3Cmd, () => {
                                  timers.push(setTimeout(() => setFlipped(true), 700));
                                }, 75);
                              }, 700)
                            );
                          }
                        }, 380 + li * 300)
                      );
                    });
                  }, 95);
                }, 500)
              );
            }, 400)
          );
        });
      }, 950)
    );

    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [reduceMotion, fullName, role]);

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      onClick={toggleFlip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFlip();
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative mx-auto w-full max-w-[360px] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg [perspective:1400px]"
      aria-label="Flip card to reveal photo or terminal"
    >
      <motion.div
        className="relative aspect-[3/4] w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: [0.34, 1.3, 0.64, 1] }}
      >
        {}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl border border-line bg-bg shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {}
          <div className="flex h-9 shrink-0 items-center gap-1.5 border-b border-line/60 bg-bg-elevated/50 px-3">
            <div className="h-2 w-2 rounded-full bg-[#ff5f57]" />
            <div className="h-2 w-2 rounded-full bg-[#febc2e]" />
            <div className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 truncate font-mono text-[9px] text-text-tertiary">nopal: ~</span>
          </div>

          {}
          <div className="p-4 font-mono text-[11px] leading-[1.8] text-text-secondary sm:p-5 sm:text-xs">
            <AnimatePresence>
              {booted && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0.6, transformOrigin: 'top' }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {}
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-teal">nopal:~$</span>
                    <span className="text-text-primary">
                      {line1Cmd}
                      {line1Cmd.length < cmdWhoami.length && (
                        <span className="ml-1 inline-block h-3 w-[7px] animate-pulse bg-text-primary align-middle" />
                      )}
                    </span>
                  </div>
                  {line1Out && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-text-primary">
                      {outWhoami}
                    </motion.div>
                  )}

                  {}
                  {(line1Out) && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="shrink-0 text-teal">nopal:~$</span>
                      <span className="text-text-primary">
                        {line2Cmd}
                        {line2Cmd.length < cmdCat.length && line2Cmd !== '' && (
                          <span className="ml-1 inline-block h-3 w-[7px] animate-pulse bg-text-primary align-middle" />
                        )}
                      </span>
                    </div>
                  )}
                  {identityLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={i === 0 ? 'font-semibold text-teal' : 'text-text-secondary'}
                    >
                      {line}
                    </motion.div>
                  ))}

                  {}
                  {identityLines.length === 2 && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="shrink-0 text-teal">nopal:~$</span>
                      <span className="text-text-primary">
                        {line3Cmd}
                        {line3Cmd.length < cmdFeh.length && (
                          <span className="ml-1 inline-block h-3 w-[7px] animate-pulse bg-text-primary align-middle" />
                        )}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/*
          iOS Safari drops `backface-visibility: hidden` for a face whose subtree
          spawns its own compositing layer, which is how the photo caption used to
          bleed through the terminal side. So the back face keeps a 3D context only
          when the tilt actually needs one - tilt is off for touch, which is exactly
          where the bleed showed up. The caption itself stays flat: no translateZ,
          no backdrop-filter.
        */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            transformStyle: tiltEnabled ? 'preserve-3d' : 'flat',
          }}
        >
          <motion.div
            className="relative h-full w-full overflow-hidden rounded-2xl border border-line bg-bg-card shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]"
            style={tiltEnabled && flipped ? { rotateX: rxs, rotateY: rys, transformStyle: 'flat' } : { transformStyle: 'flat' }}
          >
            {}
            <div className="absolute inset-y-0 left-0 z-20 w-1 bg-gradient-to-b from-teal via-teal/40 to-transparent" />

            {}
            <div className="absolute inset-0">
              {about.avatarUrl ? (
                <img
                  src={about.avatarUrl}
                  alt={fullName}
                  loading="eager"
                  fetchPriority="high"
                  decoding="sync"
                  className="h-full w-full object-cover opacity-90 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-bg-elevated">
                  <span className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-teal">
                    {fullName.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-bg/95 via-bg/40 to-transparent" />
            </div>

            {}
            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-line/60 bg-bg/90 px-5 py-4">
              <p className="font-display text-lg font-bold leading-tight text-text-primary">
                {fullName}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-teal">
                {role}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
