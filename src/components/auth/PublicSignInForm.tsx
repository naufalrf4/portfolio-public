import React, { useEffect, useMemo, useState } from 'react';
import { Chrome, UserCircle2 } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { getStoredGuestbookUser, setStoredGuestbookUser } from '@/lib/guestbookIdentity';

interface PublicSignInFormProps {
  callbackUrl?: string;
}

interface SyncedUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  token: string;
}

export function PublicSignInForm({ callbackUrl = '/' }: PublicSignInFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const nextUrl = useMemo(() => (callbackUrl.startsWith('/') ? callbackUrl : '/'), [callbackUrl]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const isSynced = url.searchParams.get('guestbook_sync') === '1';
    const email = url.searchParams.get('guestbook_email');
    const token = url.searchParams.get('guestbook_token');

    if (isSynced && email && token) {
      const syncedUser: SyncedUser = {
        id: email,
        email,
        name: url.searchParams.get('guestbook_name'),
        image: url.searchParams.get('guestbook_image'),
        token,
      };

      setStoredGuestbookUser(syncedUser);
      window.location.replace(nextUrl);
      return;
    }

    const stored = getStoredGuestbookUser();
    if (!stored) {
      return;
    }

    if (stored?.email) {
      window.location.replace(nextUrl);
    }
  }, [nextUrl]);

  function handleGoogleSignIn(): void {
    setError(null);
    setIsLoading(true);

    const redirectUrl = new URL('/api/auth/guestbook-start', window.location.origin);
    redirectUrl.searchParams.set('callbackUrl', nextUrl);
    window.location.href = redirectUrl.toString();
  }

  return (
    <Card className="mx-auto max-w-xl p-6 md:p-8">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-elevated text-teal border border-line">
          <UserCircle2 size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary">Sign in for guestbook</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Continue with Google to create or refresh your guestbook identity through the Admin user
            system.
          </p>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-[var(--error)]">{error}</p> : null}

      <Button
        type="button"
        variant="primary"
        size="md"
        isLoading={isLoading}
        className="w-full"
        onClick={handleGoogleSignIn}
      >
        <Chrome size={18} className="mr-2" />
        Continue with Google
      </Button>
    </Card>
  );
}
