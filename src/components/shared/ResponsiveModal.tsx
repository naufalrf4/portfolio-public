import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  desktopWidthClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
  titleId?: string;
  closeLabel?: string;
  disableClose?: boolean;
}

const MOBILE_BREAKPOINT = 768;
const overlayTransition = { duration: 0.28, ease: [0.22, 1, 0.36, 1] };
const desktopTransition = { duration: 0.34, ease: [0.34, 1.56, 0.64, 1] };
const mobileTransition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };
const reducedTransition = { duration: 0 };

export function ResponsiveModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  desktopWidthClassName,
  bodyClassName,
  contentClassName,
  titleId,
  closeLabel = 'Close modal',
  disableClose = false,
}: ResponsiveModalProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setIsMounted(true);

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
    };

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disableClose, isOpen, onClose]);

  if (!isMounted) {
    return null;
  }

  const panelVariants = reduceMotion
    ? { open: { opacity: 1 }, closed: { opacity: 0 } }
    : isMobile
      ? { open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 48 } }
      : {
          open: { opacity: 1, y: 0, scale: 1 },
          closed: { opacity: 0, y: 20, scale: 0.975 },
        };
  const panelTransition = reduceMotion
    ? reducedTransition
    : isMobile
      ? mobileTransition
      : desktopTransition;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div className="fixed inset-0 z-[120]" initial="closed" animate="open" exit="closed">
          <motion.div
            data-modal-overlay="true"
            className="absolute inset-0 z-[121] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-md"
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
            transition={reduceMotion ? reducedTransition : overlayTransition}
            onClick={() => !disableClose && onClose()}
          />

          <div className="pointer-events-none absolute inset-0 z-[122] flex items-end justify-center p-0 md:items-center md:p-6 lg:p-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={(event) => event.stopPropagation()}
              variants={panelVariants}
              transition={panelTransition}
              className={cn(
                isMobile
                  ? 'w-full max-h-[92vh] overflow-hidden rounded-t-2xl border-t border-x border-line bg-bg-card shadow-[0_-16px_48px_rgba(0,0,0,0.4)]'
                  : 'w-full max-h-[calc(100vh-4rem)] overflow-hidden rounded-xl border border-line bg-bg-card shadow-[0_24px_64px_-16px_rgba(0,0,0,0.5)]',
                'pointer-events-auto',
                !isMobile && (desktopWidthClassName || 'max-w-[min(960px,calc(100vw-4rem))]'),
                contentClassName
              )}
            >
              {isMobile ? (
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-line" />
              ) : null}

              <div className="flex max-h-[inherit] flex-col">
                <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-5 md:px-8 md:pb-5 md:pt-7">
                  <div className="flex-1 pr-4">
                    <h3
                      id={titleId}
                      className="text-2xl font-bold font-display text-text-primary md:text-3xl"
                    >
                      {title}
                    </h3>
                    {description ? (
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">
                        {description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    disabled={disableClose}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-line bg-bg-elevated text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-line-hover hover:text-teal active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={closeLabel}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div
                  className={cn('flex-1 overflow-y-auto px-6 pb-5 md:px-8 md:pb-6', bodyClassName)}
                >
                  {children}
                </div>

                {footer ? (
                  <div className="sticky bottom-0 border-t border-line bg-bg-card px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 md:px-8">
                    {footer}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
