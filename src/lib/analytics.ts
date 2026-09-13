import { getBrowserTimezone } from './submission-context';

const SESSION_KEY = 'public_analytics_session';

function getSessionId(): string {
  try {
    const existing = window.localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = 'public-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return 'public-session';
  }
}

export function trackConversion(entityType: string, entityId: string): void {
  if (typeof window === 'undefined') return;

  const body = JSON.stringify({
    page: window.location.pathname || '/',
    eventType: 'click',
    entityType,
    entityId,
    userSession: getSessionId(),
    timezone: getBrowserTimezone(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
    return;
  }

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
