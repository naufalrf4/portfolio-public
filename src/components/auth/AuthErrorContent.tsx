import React from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';

interface AuthErrorContentProps {
  message?: string;
}

export function AuthErrorContent({ message }: AuthErrorContentProps) {
  return (
    <Card className="mx-auto max-w-2xl p-8 md:p-10 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--error)]/40 bg-[var(--error)]/10 text-[var(--error)]">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-2xl font-bold text-text-primary">Guestbook sign-in failed</h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        {message ||
          'We could not complete the guestbook sign-in flow. Please try again from the guestbook section.'}
      </p>
      <div className="mt-8 flex justify-center">
        <a href="/auth/signin?callbackUrl=/">
          <Button variant="primary" size="md">
            <ArrowLeft size={18} className="mr-2" />
            Back to sign in
          </Button>
        </a>
      </div>
    </Card>
  );
}
