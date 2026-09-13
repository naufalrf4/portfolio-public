import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const JAKARTA_TIME_ZONE = 'Asia/Jakarta';
const JAKARTA_DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: JAKARTA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

function getValidDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

function toJakartaDate(date: string | Date): Date {
  const source = getValidDate(date);
  const parts = JAKARTA_DATE_FORMATTER.formatToParts(source);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return new Date(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
      Number(values.hour),
      Number(values.minute),
      Number(values.second)
    )
  );
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = getValidDate(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: JAKARTA_TIME_ZONE,
  });
}

export function formatDateShort(date: string | Date): string {
  return getValidDate(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: JAKARTA_TIME_ZONE,
  });
}

// `projectDate` is a free-text column (`text()`, validated as `z.string().max(50)`),
// so it holds things like '2025', '2024-06', or a range such as '2023 - 2024'.
// Bare years and unparseable ranges are returned untouched instead of being coerced
// into a fabricated month, and anything date-like is narrowed to month + year.
export function formatMonthYear(value: string | Date): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}$/.test(trimmed)) return trimmed;

    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return trimmed;

    return parsed.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      timeZone: JAKARTA_TIME_ZONE,
    });
  }

  return value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: JAKARTA_TIME_ZONE,
  });
}

export function getJakartaYear(date: string | Date = new Date()): number {
  return Number(
    getValidDate(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      timeZone: JAKARTA_TIME_ZONE,
    })
  );
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatDistanceToNow(date: string | Date): string {
  const now = toJakartaDate(new Date());
  const targetDate = toJakartaDate(date);
  const diff = Math.max(0, now.getTime() - targetDate.getTime());

  if (diff < MINUTE) {
    return 'just now';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  const years = Math.floor(diff / YEAR);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}
