import { buildProxyHeaders } from '@naufalrf/http';

function normalizeValue(value: string | null | undefined, maxLength: number): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

export function getBrowserTimezone(): string | undefined {
  if (typeof Intl === 'undefined') return undefined;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeValue(timezone, 100) ?? undefined;
}

interface ProxyHeadersOptions {
  request: Request;
  sourcePath: string;
  timezone?: string;
  clientAddress?: string;
}

export function buildSubmissionProxyHeaders({ request, sourcePath, timezone, clientAddress }: ProxyHeadersOptions): Headers {
  return buildProxyHeaders('public-astro', sourcePath, request.headers, timezone, clientAddress);
}
