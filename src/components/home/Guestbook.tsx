import React, { useEffect, useMemo, useState } from 'react';
import { Plus, UserCircle2 } from 'lucide-react';
import { Button } from '../shared/Button';
import { Section } from '../shared/Section';
import { GoogleLogo } from '../shared/GoogleLogo';
import { GuestbookModal } from './GuestbookModal';
import type { GuestbookEntry } from '@/types';
import { BlurFade } from '@/components/ui/BlurFade';
import { Marquee } from '@/components/ui/Marquee';
import { BorderBeam } from '@/components/ui/BorderBeam';
import { PageHero } from '@/components/shared/PageHero';
import {
  clearStoredGuestbookUser,
  getStoredGuestbookUser,
  setStoredGuestbookUser,
  type StoredGuestbookUser,
} from '@/lib/guestbookIdentity';
import { formatDateShort } from '@/lib/utils';

interface GuestbookProps {
  initialEntries?: GuestbookEntry[];
  turnstileSiteKey: string;
  mode?: 'home' | 'page';
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
}

interface GuestbookResponse {
  success?: boolean;
  data?: {
    entries?: GuestbookEntry[];
  };
  entries?: GuestbookEntry[];
}

const SYNC_KEYS = [
  'guestbook_sync',
  'guestbook_email',
  'guestbook_name',
  'guestbook_image',
  'guestbook_token',
] as const;

const HOME_PREVIEW_COUNT = 6;
const HOME_ROWS = 2;

function buildRows(entries: readonly GuestbookEntry[], rowCount: number): GuestbookEntry[][] {
  const count = entries.length;
  if (count === 0) return [];
  const rows = Math.min(rowCount, count);
  const base = Math.floor(count / rows);
  const remainder = count % rows;
  const out: GuestbookEntry[][] = [];
  let cursor = 0;
  for (let i = 0; i < rows; i++) {
    const size = base + (i < remainder ? 1 : 0);
    out.push(entries.slice(cursor, cursor + size));
    cursor += size;
  }
  return out.filter((row) => row.length > 0);
}

function repeatForRow(cardCount: number): number {
  if (cardCount <= 0) return 4;
  return Math.max(4, Math.ceil(6 / cardCount));
}

function Avatar({ image, size = 40 }: { image?: string | null; size?: number }) {
  const dim = `h-${size === 40 ? '10' : '9'} w-${size === 40 ? '10' : '9'}`;
  return (
    <div className={`flex ${dim} shrink-0 overflow-hidden rounded-full bg-bg-elevated text-text-tertiary`}>
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <UserCircle2 size={20} className="m-auto" />
      )}
    </div>
  );
}

export function Guestbook({
  initialEntries = [],
  turnstileSiteKey,
  mode = 'home',
  heroEyebrow,
  heroTitle,
  heroDescription,
}: GuestbookProps) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(initialEntries);
  const [user, setUser] = useState<StoredGuestbookUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const isSynced = currentUrl.searchParams.get('guestbook_sync') === '1';
    const syncedEmail = currentUrl.searchParams.get('guestbook_email');
    const syncedToken = currentUrl.searchParams.get('guestbook_token');

    if (isSynced && syncedEmail && syncedToken) {
      const syncedUser: StoredGuestbookUser = {
        id: syncedEmail,
        email: syncedEmail,
        name: currentUrl.searchParams.get('guestbook_name'),
        image: currentUrl.searchParams.get('guestbook_image'),
        token: syncedToken,
      };

      setStoredGuestbookUser(syncedUser);
      setUser(syncedUser);
      setIsModalOpen(true);

      const cleanedUrl = new URL(window.location.href);
      for (const key of SYNC_KEYS) {
        cleanedUrl.searchParams.delete(key);
      }
      window.history.replaceState({}, '', cleanedUrl.toString());
      return;
    }

    const stored = getStoredGuestbookUser();
    if (stored) {
      setUser(stored);
    }
  }, []);

  const isPageMode = mode === 'page';
  const homePreview = useMemo(() => entries.slice(0, HOME_PREVIEW_COUNT), [entries]);
  const homeRows = useMemo(() => buildRows(homePreview, HOME_ROWS), [homePreview]);

  async function refreshEntries(): Promise<void> {
    const response = await fetch('/api/guestbook');
    if (!response.ok) {
      throw new Error('Failed to refresh guestbook entries.');
    }
    const payload = (await response.json()) as GuestbookResponse;
    setEntries(payload.data?.entries ?? payload.entries ?? []);
  }

  async function handleSuccess(): Promise<void> {
    setError(null);
    setSuccess('Your message has been added to the guestbook.');
    await refreshEntries();
  }

  function handleSignOut(): void {
    clearStoredGuestbookUser();
    setUser(null);
    setIsModalOpen(false);
    setSuccess(null);
  }

  const composerCard = (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-card p-6">
      {user ? (
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-line">
              {user.image ? (
                <img src={user.image} alt={user.name || ''} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <UserCircle2 className="h-full w-full p-2 text-text-tertiary" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{user.name || user.email}</p>
              <button
                onClick={handleSignOut}
                className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary hover:text-text-primary"
              >
                Sign out
              </button>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="w-full justify-center"
            data-analytics-button
            data-entity-type="guestbook_open_compose"
            data-entity-id="guestbook"
            data-entity-label="Leave a guestbook message"
          >
            <Plus size={18} className="mr-2" />
            Compose Message
          </Button>
        </div>
      ) : (
        <div className="relative z-10 space-y-6">
          <p className="text-center font-mono text-xs text-text-tertiary">Add your voice to the guestbook</p>
          <Button
            variant="default"
            size="md"
            onClick={() => setIsModalOpen(true)}
            className="w-full justify-center gap-2.5 border-[#dadce0] bg-white text-[#1f1f1f] hover:!text-[#1f1f1f] hover:border-[#c6c6c6]"
            data-analytics-button
            data-entity-type="guestbook_signin_cta"
            data-entity-id="guestbook"
            data-entity-label="Sign in to guestbook"
          >
            <GoogleLogo size={18} />
            Sign in to post
          </Button>
        </div>
      )}
      <BorderBeam size={100} duration={12} colorFrom="var(--teal)" colorTo="var(--bg-elevated)" />
    </div>
  );

  const modal = (
    <GuestbookModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      user={user}
      onSuccess={handleSuccess}
      turnstileSiteKey={turnstileSiteKey}
    />
  );

  if (isPageMode) {
    return (
      <Section id="guestbook" scene="signal" className="relative w-full py-12 md:py-16">
        <div className="w-full">
          <div className="mb-10 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            {heroTitle && (
<PageHero
eyebrow={heroEyebrow}
title={heroTitle}
                description={heroDescription}
                className="mb-0 md:mb-0"
/>
            )}
            <div className="relative">
              {composerCard}
              {success && <p className="mt-4 font-mono text-xs text-teal">{success}</p>}
              {error && <p className="mt-4 font-mono text-xs text-[var(--error)]">{error}</p>}
            </div>
          </div>

          {entries.length === 0 ? (
            <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-line">
              <span className="font-mono text-xs text-text-tertiary">No messages yet</span>
            </div>
          ) : (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {entries.map((entry) => (
                <article
                  key={entry.id}
                  className="mb-5 break-inside-avoid rounded-2xl border border-line bg-bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-line-hover"
                >
                  <div className="flex items-center gap-3">
                    <Avatar image={entry.user.image} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {entry.user.name || 'Anonymous'}
                      </p>
                      {entry.createdAt && (
                        <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                          {formatDateShort(entry.createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
                    {entry.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
        {modal}
      </Section>
    );
  }

  return (
    <Section id="guestbook" scene="signal" className="relative w-full overflow-hidden border-t border-line py-16 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          {}
          <BlurFade delay={0.2} inView className="order-2 w-full min-w-0 lg:order-1">
            {homeRows.length === 0 ? (
              <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-dashed border-line">
                <span className="font-mono text-xs text-text-tertiary">No messages yet</span>
              </div>
            ) : (
              <div className="relative flex w-full flex-col gap-4 overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--bg)] to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--bg)] to-transparent" />

                {homeRows.map((row, idx) => (
                  <Marquee
                    key={`row-${idx}`}
                    pauseOnHover
                    reverse={idx % 2 === 0}
                    repeat={repeatForRow(row.length)}
                    className="w-full [--duration:40s]"
                  >
                    {row.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex h-[120px] w-[300px] shrink-0 items-start gap-4 overflow-hidden rounded-xl border border-line bg-bg-card p-4 transition-colors hover:border-line-hover"
                      >
                        <Avatar image={entry.user.image} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
                            {entry.user.name || 'Anonymous'}
                          </p>
                          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-text-primary">
                            {entry.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </Marquee>
                ))}
              </div>
            )}
          </BlurFade>

          {}
          <BlurFade delay={0.4} inView className="order-1 flex flex-col justify-center lg:order-2">
            <span className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-teal">06 / Guestbook</span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary md:text-4xl lg:text-5xl">
              Guestbook
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
              A few words from people who stopped by. Reactions, notes, and quick hellos.
            </p>

            <div className="relative mt-12">
              {composerCard}
              {success && <p className="mt-4 font-mono text-xs text-teal">{success}</p>}
              {error && <p className="mt-4 font-mono text-xs text-[var(--error)]">{error}</p>}
            </div>

            <a
              href="/guestbook"
              className="group mt-6 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary"
              data-analytics-button
              data-entity-type="guestbook_view_all"
              data-entity-id="guestbook"
              data-entity-label="View all guestbook messages"
            >
              View all messages
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
          </BlurFade>
        </div>
      </div>
      {modal}
    </Section>
  );
}
