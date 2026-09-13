import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { getBrowserTimezone } from '@/lib/submission-context';
import { Button } from '../shared/Button';
import { Textarea } from '../shared/Textarea';
import { ResponsiveModal } from '../shared/ResponsiveModal';
import { TurnstileWidget } from '../shared/TurnstileWidget';
import { GoogleLogo } from '../shared/GoogleLogo';

interface GuestbookUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  token: string;
}

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GuestbookUser | null;
  onSuccess: () => Promise<void> | void;
  turnstileSiteKey: string;
}

const CALLBACK_URL = '/#guestbook';

export function GuestbookModal({
  isOpen,
  onClose,
  user,
  onSuccess,
  turnstileSiteKey,
}: GuestbookModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const hasTurnstile = useMemo(() => turnstileSiteKey.trim().length > 0, [turnstileSiteKey]);
  const shouldShowTurnstile = message.trim().length > 0;

  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setError(null);
      setTurnstileToken('');
      setTurnstileError(null);
      setTurnstileResetKey((value) => value + 1);
      setIsSigningIn(false);
    }
  }, [isOpen]);

  function handleGoogleSignIn(): void {
    setError(null);
    setIsSigningIn(true);

    const redirectUrl = new URL('/api/auth/guestbook-start', window.location.origin);
    redirectUrl.searchParams.set('callbackUrl', CALLBACK_URL);
    window.location.href = redirectUrl.toString();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!user?.email || !user.token) {
      setError('Sign in with Google before posting to the guestbook.');
      return;
    }

    if (!message.trim()) {
      setError('Please write a message first.');
      return;
    }

    if (hasTurnstile && !turnstileToken) {
      setError('Complete the CAPTCHA verification before posting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          guestbookToken: user.token,
          turnstileToken: turnstileToken || undefined,
          timezone: getBrowserTimezone(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: { message?: string };
      } | null;

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || 'Failed to submit guestbook entry.');
      }

      setMessage('');
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      await onSuccess();
      onClose();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : 'Failed to submit guestbook entry.'
      );
      if (hasTurnstile) {
        setTurnstileToken('');
        setTurnstileResetKey((value) => value + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isComposerMode = Boolean(user?.email);
  const title = isComposerMode ? 'Leave a message' : 'Sign in for guestbook';
  const description = isComposerMode
    ? 'Share a short note, greeting, or memory. Your message will appear publicly in the guestbook.'
    : 'Continue with Google to leave a message.';

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleId="guestbook-modal-title"
      description={description}
      disableClose={isSubmitting || isSigningIn}
      bodyClassName="px-5 pb-5 md:px-7 md:pb-6"
      footer={
        isComposerMode ? (
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              data-analytics-button
              data-entity-type="guestbook_modal_cancel"
              data-entity-id="guestbook-modal"
              data-entity-label="Cancel guestbook compose"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="guestbook-modal-form"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!message.trim() || (hasTurnstile && !turnstileToken)}
            >
              <Send size={18} className="mr-2" />
              Send message
            </Button>
          </div>
        ) : (
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSigningIn}
              data-analytics-button
              data-entity-type="guestbook_signin_cancel"
              data-entity-id="guestbook-signin"
              data-entity-label="Close guestbook sign in"
            >
              Maybe later
            </Button>
            <Button
              type="button"
              variant="default"
              isLoading={isSigningIn}
              onClick={handleGoogleSignIn}
              className="gap-2.5 border-[#dadce0] bg-white text-[#1f1f1f] hover:!text-[#1f1f1f] hover:border-[#c6c6c6]"
            >
              <GoogleLogo size={18} />
              Continue with Google
            </Button>
          </div>
        )
      }
    >
      {isComposerMode ? (
        <>
          <div className="mb-5 rounded-xl border border-line bg-bg-elevated p-4 md:p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-teal">
              Posting as
            </p>
            <p className="mt-1 text-sm font-medium text-text-primary md:text-base">
              {user?.name || user?.email}
            </p>
            <p className="mt-1 font-mono text-xs text-text-tertiary md:text-sm">{user?.email}</p>
          </div>

          <form id="guestbook-modal-form" onSubmit={handleSubmit} className="space-y-5">
            <Textarea
              label="Message"
              name="message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Write something kind, memorable, or useful..."
              rows={8}
              maxLength={500}
              disabled={isSubmitting}
            />

            <div className="flex items-center justify-between text-xs text-text-secondary md:text-sm">
              <span>Keep it respectful and concise.</span>
              <span className="font-mono">{message.length}/500</span>
            </div>

            {(!hasTurnstile || shouldShowTurnstile) && (
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                action="guestbook"
                resetKey={turnstileResetKey}
                onTokenChange={setTurnstileToken}
                onErrorChange={setTurnstileError}
              />
            )}

            {turnstileError ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={16} />
                <span>{turnstileError}</span>
              </div>
            ) : null}

            {error ? (
              <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] animate-in fade-in slide-in-from-bottom-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ) : null}
          </form>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-bg-elevated p-5 md:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-line bg-bg-card">
                <GoogleLogo size={26} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-text-primary">
                  Sign in with Google
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  You will land right back here, ready to write your message.
                </p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      )}
    </ResponsiveModal>
  );
}
