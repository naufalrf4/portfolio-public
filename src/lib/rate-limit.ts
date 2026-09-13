interface RateLimitState {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get('x-real-ip') || request.headers.get('cf-connecting-ip');
  return realIp?.trim() || 'unknown';
}

export function getRateLimitState(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      retryAfter: Math.ceil(config.windowMs / 1000),
      limit: config.maxRequests,
    };
  }

  if (current.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      limit: config.maxRequests,
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, config.maxRequests - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    limit: config.maxRequests,
  };
}

export function applyRateLimitHeaders(headers: Headers, rateLimitResult: RateLimitResult) {
  headers.set('X-RateLimit-Limit', String(rateLimitResult.limit));
  headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
  headers.set('Retry-After', String(rateLimitResult.retryAfter));
}
