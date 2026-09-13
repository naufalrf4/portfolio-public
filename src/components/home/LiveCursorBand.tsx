import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLiveCursorPresence } from './useLiveCursorPresence';
import { useAstroPathname } from '@/lib/useAstroPathname';

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

interface LiveCursorBandProps {
  currentPath: string;
  socketUrl: string;
}

export function LiveCursorBand({ currentPath, socketUrl }: LiveCursorBandProps) {
  const pathname = useAstroPathname(currentPath);
  const reduceMotion = useReducedMotion();
  const { identity, status, self, others, overviewParticipants, totalParticipants, sendMove } =
    useLiveCursorPresence(pathname, socketUrl);
  const [isListOpen, setIsListOpen] = useState(false);
  const [documentMetrics, setDocumentMetrics] = useState({
    width: 0,
    height: 0,
    scrollX: 0,
    scrollY: 0,
  });

  const participants = useMemo(() => (self ? [self, ...others] : others), [others, self]);
  const lastPositions = useRef(new Map());
  const participantList = useMemo(
    () =>
      overviewParticipants
        .slice()
        .sort((a, b) => a.pageLabel.localeCompare(b.pageLabel) || a.name.localeCompare(b.name)),
    [overviewParticipants]
  );

  useEffect(() => {
    function updateMetrics() {
      const doc = document.documentElement;
      const body = document.body;
      const width = Math.max(doc.scrollWidth, body?.scrollWidth || 0, window.innerWidth);
      const height = Math.max(doc.scrollHeight, body?.scrollHeight || 0, window.innerHeight);
      setDocumentMetrics({
        width,
        height,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      });
    }

    updateMetrics();
    window.addEventListener('resize', updateMetrics, { passive: true });
    window.addEventListener('scroll', updateMetrics, { passive: true });

    return () => {
      window.removeEventListener('resize', updateMetrics);
      window.removeEventListener('scroll', updateMetrics);
    };
  }, []);

  function resolveSection(clientY: number) {
    if (typeof document === 'undefined') {
      return { id: null, label: null };
    }

    const pageY = clientY + window.scrollY;
    const sectionNodes = Array.from(
      document.querySelectorAll<HTMLElement>(
        'main [data-live-section-label], main section, main article, main [id]'
      )
    );

    const sections = sectionNodes
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const height = Math.max(rect.height, 1);
        const bottom = top + height;
        const label =
          node.dataset.liveSectionLabel?.trim() ||
          node.querySelector('h1, h2, h3')?.textContent?.trim() ||
          node.getAttribute('aria-label')?.trim() ||
          node.id ||
          null;

        return {
          id: node.id || label,
          label,
          top,
          bottom,
        };
      })
      .filter((section) => section.label);

    const active = sections.find((section) => pageY >= section.top && pageY <= section.bottom);
    if (active) {
      return { id: active.id || null, label: active.label || null };
    }

    const fallback = sections.reduce<{
      id: string | null;
      label: string | null;
      distance: number;
    } | null>((best, section) => {
      const distance = Math.min(Math.abs(pageY - section.top), Math.abs(pageY - section.bottom));
      if (!best || distance < best.distance) {
        return { id: section.id || null, label: section.label || null, distance };
      }
      return best;
    }, null);

    return { id: fallback?.id || null, label: fallback?.label || null };
  }

  function emitPointer(clientX: number, clientY: number, isTouching: boolean) {
    if (typeof window === 'undefined') {
      return;
    }

    const width = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const height = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    if (width <= 0 || height <= 0) {
      return;
    }

    const pageX = clientX + window.scrollX;
    const pageY = clientY + window.scrollY;
    const section = resolveSection(clientY);
    const x = clamp(pageX / width);
    const y = clamp(pageY / height);
    sendMove({ x, y, isTouching, sectionId: section.id, sectionLabel: section.label });
  }

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      emitPointer(event.clientX, event.clientY, event.pointerType !== 'mouse');
    }

    function handlePointerDown(event: PointerEvent) {
      emitPointer(event.clientX, event.clientY, event.pointerType !== 'mouse');
    }

    function handleTouchStart(event: TouchEvent) {
      const touch = event.touches[0];
      if (touch) {
        emitPointer(touch.clientX, touch.clientY, true);
      }
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (touch) {
        emitPointer(touch.clientX, touch.clientY, true);
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [sendMove]);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--teal-soft),transparent_24%),radial-gradient(circle_at_bottom_right,var(--amber-soft),transparent_26%)]" />

        <AnimatePresence>
          {participants.map((participant, index) => {
            const docX = participant.x * Math.max(documentMetrics.width, 1);
            const docY = participant.y * Math.max(documentMetrics.height, 1);
            const posX = docX - documentMetrics.scrollX;
            const posY = docY - documentMetrics.scrollY;
            const isSelf = participant.id === self?.id;
            const sectionLabel = participant.sectionLabel || participant.pageLabel;
            const showLabel = !isSelf;

            const last = lastPositions.current.get(participant.id);
            const deltaX = last ? posX - last.x : 0;
            const deltaY = last ? posY - last.y : 0;
            const distance = Math.min(Math.hypot(deltaX, deltaY), 34);
            const trailAngle = distance > 1 ? (Math.atan2(deltaY, deltaX) * 180) / Math.PI : 0;
            const trailOpacity = reduceMotion ? 0 : Math.min(distance / 34, 1) * 0.7;
            lastPositions.current.set(participant.id, { x: posX, y: posY });

            return (
              <motion.div
                key={participant.id}
                className="pointer-events-none absolute left-0 top-0"
                style={{ zIndex: isSelf ? 30 : 20 + index }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.4, x: posX, y: posY }}
                animate={{
                  x: posX,
                  y: posY,
                  scale: participant.isTouching ? 1.08 : 1,
                  opacity: 1,
                }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.4 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        x: { type: 'spring', stiffness: 300, damping: 30, mass: 0.6 },
                        y: { type: 'spring', stiffness: 300, damping: 30, mass: 0.6 },
                        scale: { type: 'spring', stiffness: 260, damping: 24, mass: 0.7 },
                        opacity: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                      }
                }
              >
                <div className="relative flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
                  <div className="relative h-6 w-6">
                    {trailOpacity > 0 && (
                      <div
                        className="absolute left-1/2 top-1/2 h-[2px] w-6 origin-left"
                        style={{
                          transform: `translate(-2px, -1px) rotate(${trailAngle + 180}deg)`,
                          background: `linear-gradient(to right, ${participant.color}, transparent)`,
                          opacity: trailOpacity,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className="absolute inset-[-10px] rounded-full blur-md"
                      style={{
                        background: `radial-gradient(circle, color-mix(in srgb, ${participant.color} 55%, transparent), transparent 72%)`,
                      }}
                      aria-hidden="true"
                    />
                    <svg
                      viewBox="0 0 24 24"
                      className="relative h-6 w-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2 L14.3 9.7 L22 12 L14.3 14.3 L12 22 L9.7 14.3 L2 12 L9.7 9.7 Z"
                        fill={participant.color}
                      />
                      <circle cx="12" cy="12" r="1.6" fill="white" />
                    </svg>
                    <div
                      className={
                        participant.isTouching
                          ? 'absolute inset-[-10px] rounded-full border border-teal/60 animate-ping'
                          : 'absolute inset-[-10px] rounded-full border border-transparent'
                      }
                    />
                  </div>
                  {showLabel && (
                    <div className="rounded-full border border-line bg-bg-card/90 px-3 py-1.5 text-[11px] font-semibold text-text-primary backdrop-blur-md">
                      <div>{participant.name}</div>
                      <div className="mt-0.5 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
                        {sectionLabel}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div
        className="hidden md:flex fixed right-4 top-20 z-[52] justify-end px-4 md:right-6 md:top-20 md:px-0 lg:left-6 lg:right-auto lg:top-auto lg:bottom-8"
        initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="pointer-events-auto flex flex-col items-end gap-3 lg:items-start">
          <button
            type="button"
            onClick={() => setIsListOpen((open) => !open)}
            className="inline-flex max-w-[calc(100vw-2.5rem)] items-center justify-center gap-2 rounded-full border border-line bg-bg-card/90 px-2.5 py-1.5 font-mono text-[10px] font-semibold text-text-secondary backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-line-hover md:max-w-[260px] md:px-4 md:py-2 md:text-[11px] lg:max-w-none"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-bg-elevated px-2 py-1 md:px-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full transition-[background-color,box-shadow] duration-500 ease-out ${status === 'connected' ? 'bg-teal shadow-[0_0_12px_var(--teal)]' : status === 'connecting' ? 'bg-amber shadow-[0_0_10px_var(--amber)]' : 'bg-text-tertiary shadow-none'}`}
              />
              <Activity size={11} className="hidden text-teal md:block" />
              <span className="md:hidden">{totalParticipants} Online</span>
              <span className="hidden md:inline">{totalParticipants} Online</span>
            </span>
          </button>

          {isListOpen && (
            <div className="w-[min(92vw,360px)] rounded-xl border border-line bg-bg-card/95 p-3 shadow-[0_20px_48px_-16px_rgba(0,0,0,0.5)] backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between px-1">
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                    Live now
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    Page and section presence
                  </p>
                </div>
                <span className="rounded-full border border-teal/30 bg-[var(--teal-soft)] px-2.5 py-1 font-mono text-[10px] font-semibold text-teal">
                  {participantList.length}
                </span>
              </div>

              <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
                {participantList.map((participant) => {
                  const isHere = participant.pagePath === pathname;
                  return (
                    <div
                      key={`${participant.id}-${participant.pagePath}`}
                      className="flex items-start justify-between gap-3 rounded-lg border border-line bg-bg-elevated px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: participant.color }}
                          />
                          <p className="truncate text-sm font-semibold text-text-primary">
                            {participant.name}
                          </p>
                        </div>
                        <p className="mt-1 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-text-tertiary">
                          {participant.pageLabel}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {participant.sectionLabel || 'Browsing page'}
                        </p>
                      </div>
                      {isHere && (
                        <span className="shrink-0 rounded-full border border-teal/30 bg-[var(--teal-soft)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-teal">
                          Here
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
