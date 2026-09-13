import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  RefreshCcw,
} from 'lucide-react';
import { getBookingAvailability, submitBooking } from '@/lib/api';
import { trackConversion } from '@/lib/analytics';
import { getBrowserTimezone } from '@/lib/submission-context';
import type { BookingAvailability, BookingSlot } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { Textarea } from '../shared/Textarea';
import { TurnstileWidget } from '../shared/TurnstileWidget';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface BookingCalendarProps {
  turnstileSiteKey: string;
}

type BookingStep = 1 | 2 | 3;

const INITIAL_FORM: BookingFormData = {
  name: '',
  email: '',
  phone: '',
  notes: '',
};

const STEPS: Array<{ id: BookingStep; label: string; title: string }> = [
  { id: 1, label: 'Step 1', title: 'Choose a date' },
  { id: 2, label: 'Step 2', title: 'Pick a time' },
  { id: 3, label: 'Step 3', title: 'Share your details' },
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatDateLabel(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function formatTimeRange(slot: BookingSlot): string {
  return `${slot.startTime} - ${slot.endTime}`;
}

export function BookingCalendar({ turnstileSiteKey }: BookingCalendarProps) {
  const [availability, setAvailability] = useState<BookingAvailability>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [formData, setFormData] = useState<BookingFormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const hasTurnstile = useMemo(() => turnstileSiteKey.trim().length > 0, [turnstileSiteKey]);
  const shouldShowTurnstile = useMemo(
    () =>
      Boolean(
        formData.name.trim() ||
        formData.email.trim() ||
        formData.phone.trim() ||
        formData.notes.trim()
      ),
    [formData.email, formData.name, formData.notes, formData.phone]
  );

  const dates = useMemo(() => Object.keys(availability).sort(), [availability]);
  const slots = selectedDate ? (availability[selectedDate] ?? []) : [];
  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slots]
  );

  const loadAvailability = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const nextAvailability = await getBookingAvailability(21);
      setAvailability(nextAvailability);

      const firstDate = Object.keys(nextAvailability).sort()[0] ?? null;
      const firstSlotId = firstDate ? (nextAvailability[firstDate]?.[0]?.id ?? null) : null;
      setSelectedDate(firstDate);
      setSelectedSlotId(firstSlotId);
      setCurrentStep(1);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load booking availability.');
      setAvailability({});
      setSelectedDate(null);
      setSelectedSlotId(null);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAvailability();
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedSlotId(null);
      return;
    }

    const nextSlots = availability[selectedDate] ?? [];
    if (!nextSlots.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(nextSlots[0]?.id ?? null);
    }
  }, [availability, selectedDate, selectedSlotId]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  const goToStep = (step: BookingStep) => {
    if (step === 2 && !selectedDate) {
      setSubmitError('Choose an available date before continuing.');
      return;
    }

    if (step === 3 && !selectedSlotId) {
      setSubmitError('Choose an available time slot before continuing.');
      return;
    }

    setSubmitError(null);
    setCurrentStep(step);
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof BookingFormData, string>> = {};

    if (!selectedSlotId) {
      setSubmitError('Choose an available time slot before booking.');
      return false;
    }
    if (!formData.name.trim()) {
      nextErrors.name = 'Please share your name.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Please share your email address.';
    } else if (!isValidEmail(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (formData.phone.trim() && formData.phone.trim().length < 8) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }
    if (hasTurnstile && !turnstileToken) {
      setSubmitError('Complete the CAPTCHA verification before booking.');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && (!hasTurnstile || Boolean(turnstileToken));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate() || !selectedSlotId) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const booking = await submitBooking({
        slotId: selectedSlotId,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        turnstileToken: turnstileToken || undefined,
        timezone: getBrowserTimezone(),
      });

      setFormData(INITIAL_FORM);
      setErrors({});
      setSubmitSuccess(
        `Booking requested for ${booking.date} at ${booking.time}. Please check your email for confirmation.`
      );
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      trackConversion('booking_conversion', booking.id);
      await loadAvailability();
      setCurrentStep(1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to book the selected slot.');
      setTurnstileToken('');
      setTurnstileResetKey((value) => value + 1);
      await loadAvailability();
      setCurrentStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-xl bg-bg-elevated p-5 border border-line">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal">
            Availability
          </p>
          <h3 className="mt-2 text-xl font-semibold text-text-primary">Book a call</h3>
        </div>
        <button
          type="button"
          onClick={() => void loadAvailability()}
          data-analytics-button
          data-entity-type="booking_refresh"
          data-entity-id="booking-calendar"
          data-entity-label="Refresh booking availability"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-elevated text-text-secondary border border-line transition-all duration-200 hover:-translate-y-0.5 hover:text-teal"
          aria-label="Refresh availability"
        >
          <RefreshCcw size={18} className={cn(isLoading && 'animate-spin')} />
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;
          const isAccessible = step.id <= currentStep;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => isAccessible && goToStep(step.id)}
              data-analytics-button
              data-entity-type="booking_step"
              data-entity-id={String(step.id)}
              data-entity-label={step.title}
              disabled={!isAccessible}
              className={cn(
                'rounded-xl px-4 py-4 text-left transition-all duration-200',
                'border border-line',
                isActive &&
                  'bg-[var(--teal-soft)] text-teal border border-line',
                isComplete &&
                  'bg-[var(--teal-soft)] text-teal border border-line',
                !isActive && !isComplete && 'bg-bg-elevated text-text-secondary',
                !isAccessible && 'cursor-not-allowed opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-semibold',
                    isActive && 'bg-bg-card/70 text-teal',
                    isComplete && 'bg-bg-card/70 text-teal',
                    !isActive && !isComplete && 'bg-bg-elevated text-text-secondary'
                  )}
                >
                  {isComplete ? <Check size={16} /> : step.id}
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] opacity-75">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{step.title}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {loadError ? (
        <div className="flex items-center gap-2 rounded-xl border border-[var(--error)]/40 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)] animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={16} />
          <span>{loadError}</span>
        </div>
      ) : null}

      {submitSuccess ? (
        <div className="flex items-center gap-2 rounded-xl border border-teal/30 bg-[var(--teal-soft)] p-3 text-sm text-teal animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} />
          <span>{submitSuccess}</span>
        </div>
      ) : null}

      <div className="rounded-xl bg-bg-elevated p-5 border border-line md:p-6">
        {currentStep === 1 ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <CalendarDays size={16} className="text-teal" />
              <span>Select a date</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[88px] animate-pulse rounded-xl bg-bg-elevated border border-line"
                    />
                  ))
                : dates.map((date) => {
                    const count = availability[date]?.length ?? 0;
                    const isActive = selectedDate === date;

                    return (
                      <button
                        key={date}
                        type="button"
                        data-analytics-button
                        data-entity-type="booking_date"
                        data-entity-id={date}
                        data-entity-label={formatDateLabel(date)}
                        onClick={() => {
                          setSelectedDate(date);
                          setSubmitError(null);
                        }}
                        className={cn(
                          'rounded-xl px-4 py-4 text-left transition-all duration-200',
                          'border border-line',
                          isActive
                            ? 'bg-[var(--teal-soft)] text-teal border border-line'
                            : 'bg-bg-elevated text-text-primary hover:-translate-y-0.5 hover:text-teal'
                        )}
                      >
                        <p className="text-sm font-semibold">{formatDateLabel(date)}</p>
                        <p className="mt-1 text-xs text-text-secondary">
                          {count} slot{count === 1 ? '' : 's'} available
                        </p>
                      </button>
                    );
                  })}
            </div>

            {!isLoading && dates.length === 0 ? (
              <div className="rounded-xl bg-bg-elevated p-5 text-sm text-text-secondary border border-line">
                No booking slots are available right now. Send a direct message instead and we can
                coordinate another time manually.
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="accent"
                onClick={() => goToStep(2)}
                disabled={!selectedDate || isLoading}
                className="gap-2"
                data-analytics-button
                data-entity-type="booking_continue"
                data-entity-id="step-2"
                data-entity-label="Continue to booking times"
              >
                Continue to time
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="rounded-xl bg-bg-elevated p-4 text-sm text-text-secondary border border-line">
              Selected date:{' '}
              <span className="font-semibold text-text-primary">
                {selectedDate ? formatDateLabel(selectedDate) : '-'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <Clock3 size={16} className="text-teal" />
              <span>Select a time slot</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {slots.map((slot) => {
                const isActive = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    data-analytics-button
                    data-entity-type="booking_slot"
                    data-entity-id={slot.id}
                    data-entity-label={formatTimeRange(slot)}
                    onClick={() => {
                      setSelectedSlotId(slot.id);
                      setSubmitError(null);
                    }}
                    className={cn(
                      'rounded-xl px-4 py-4 text-left transition-all duration-200',
                      'border border-line',
                      isActive
                        ? 'bg-[var(--teal-soft)] text-teal border border-line'
                        : 'bg-bg-elevated text-text-primary hover:-translate-y-0.5 hover:text-teal'
                    )}
                  >
                    <p className="font-semibold">{formatTimeRange(slot)}</p>
                    <p className="mt-1 text-xs text-text-secondary">{slot.duration} minutes</p>
                  </button>
                );
              })}
            </div>

            {slots.length === 0 ? (
              <div className="rounded-xl bg-bg-elevated p-5 text-sm text-text-secondary border border-line">
                There are no remaining time slots for this date. Pick a different day.
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(1)}
                className="gap-2"
                data-analytics-button
                data-entity-type="booking_back"
                data-entity-id="step-1"
                data-entity-label="Back to booking dates"
              >
                <ArrowLeft size={16} />
                Back to dates
              </Button>
              <Button
                type="button"
                variant="accent"
                onClick={() => goToStep(3)}
                disabled={!selectedSlotId}
                className="gap-2"
                data-analytics-button
                data-entity-type="booking_continue"
                data-entity-id="step-3"
                data-entity-label="Continue to booking details"
              >
                Continue to details
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-bg-elevated p-4 border border-line">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal">
                  Date
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {selectedDate ? formatDateLabel(selectedDate) : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-bg-elevated p-4 border border-line">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal">
                  Time
                </p>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {selectedSlot
                    ? `${formatTimeRange(selectedSlot)} (${selectedSlot.duration} min)`
                    : '-'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                error={errors.name}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                required
              />
            </div>

            <Input
              label="Phone (optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+62..."
              error={errors.phone}
              disabled={isSubmitting}
            />

            <Textarea
              label="Notes (optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Share context for the call, goals, or anything I should review first."
              rows={4}
              disabled={isSubmitting}
            />

            {hasTurnstile && !shouldShowTurnstile ? (
              <p className="text-center text-xs text-text-secondary md:text-sm">
                Add your details first and the CAPTCHA will appear before the final submit.
              </p>
            ) : null}

            {(!hasTurnstile || shouldShowTurnstile) && (
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                action="booking"
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

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(2)}
                className="gap-2"
                data-analytics-button
                data-entity-type="booking_back"
                data-entity-id="step-2"
                data-entity-label="Back to booking times"
              >
                <ArrowLeft size={16} />
                Back to time
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                isLoading={isSubmitting}
                disabled={isSubmitting || !selectedSlotId || (hasTurnstile && !turnstileToken)}
                className="gap-2 sm:min-w-[240px]"
                data-analytics-button
                data-entity-type="booking_submit"
                data-entity-id="booking-calendar"
                data-entity-label="Submit booking request"
              >
                Reserve selected slot
                <ArrowRight size={16} />
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
}
