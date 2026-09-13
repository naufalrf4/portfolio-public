import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { submitContactForm } from '@/lib/api';
import { trackConversion } from '@/lib/analytics';
import { getBrowserTimezone } from '@/lib/submission-context';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Textarea } from '../shared/Textarea';
import { TurnstileWidget } from '../shared/TurnstileWidget';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  turnstileSiteKey: string;
}

const INITIAL_FORM: FormData = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm({ turnstileSiteKey }: ContactFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const hasTurnstile = useMemo(() => turnstileSiteKey.trim().length > 0, [turnstileSiteKey]);
  const shouldShowTurnstile = useMemo(
    () =>
      Boolean(
        formData.name.trim() ||
        formData.email.trim() ||
        formData.subject.trim() ||
        formData.message.trim()
      ),
    [formData.email, formData.message, formData.name, formData.subject]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Please share your name.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Please share your email address.';
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.subject.trim()) {
      nextErrors.subject = 'Please add a short subject.';
    }
    if (!formData.message.trim()) {
      nextErrors.message = 'Please add a message.';
    } else if (formData.message.trim().length < 20) {
      nextErrors.message = 'Please add a little more detail so I can respond well.';
    }

    if (hasTurnstile && !turnstileToken) {
      setSubmitError('Complete the CAPTCHA verification before sending your message.');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && (!hasTurnstile || Boolean(turnstileToken));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        turnstileToken: turnstileToken || undefined,
        timezone: getBrowserTimezone(),
      });

      setFormData(INITIAL_FORM);
      setErrors({});
      setSubmitSuccess('Message sent successfully. I will get back to you soon.');
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      trackConversion('contact_conversion', 'contact-form');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to send your message.');
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your name"
          error={errors.name}
          disabled={isLoading}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          error={errors.email}
          disabled={isLoading}
          required
        />
      </div>

      <Input
        label="Subject"
        name="subject"
        value={formData.subject}
        onChange={handleChange}
        placeholder="Question, consultation, collaboration, or booking"
        error={errors.subject}
        disabled={isLoading}
        required
      />

      <Textarea
        label="Message"
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Share what you need, what you want to discuss, or any context that will help me respond well."
        rows={6}
        error={errors.message}
        disabled={isLoading}
        required
      />

      {(!hasTurnstile || shouldShowTurnstile) && (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          action="contact"
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

      {submitError ? (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={16} />
          <span>{submitError}</span>
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="flex items-center gap-2 rounded-xl border border-teal/30 bg-[var(--teal-soft)] p-3 text-sm text-teal animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          <span>{submitSuccess}</span>
        </div>
      ) : null}

      <Button
        type="submit"
        data-analytics-button
        data-entity-type="contact_submit"
        data-entity-id="contact-form"
        data-entity-label="Send contact message"
        variant="accent"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading || (hasTurnstile && !turnstileToken)}
        className="w-full"
      >
        <Send size={18} className="mr-2" />
        Send Message
      </Button>
    </form>
  );
}
