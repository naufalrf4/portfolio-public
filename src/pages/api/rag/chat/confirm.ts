import type { APIRoute } from 'astro';
import { buildSubmissionProxyHeaders } from '@/lib/submission-context';
import { applyRateLimitHeaders, getClientIp, getRateLimitState } from '@/lib/rate-limit';

const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL?.trim() || import.meta.env.RAG_SERVICE_URL?.trim() || 'http://localhost:3005';
const RATE_LIMIT_CONFIG = {
  maxRequests: 6,
  windowMs: 60 * 1000,
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rateLimitState = getRateLimitState(`chat-confirm:${clientAddress || getClientIp(request)}`, RATE_LIMIT_CONFIG);

  if (!rateLimitState.allowed) {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    applyRateLimitHeaders(headers, rateLimitState);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Too many confirmation requests. Please wait a minute before trying again.',
          code: 'RATE_LIMITED',
        },
      }),
      {
        status: 429,
        headers,
      }
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(`${RAG_SERVICE_URL}/chat/confirm`, {
      method: 'POST',
      headers: buildSubmissionProxyHeaders({ request, sourcePath: '/ai-chatbot', clientAddress }),
      body: JSON.stringify(body),
    });

    const payload = await response.text();
    const headers = new Headers({ 'Content-Type': 'application/json' });
    applyRateLimitHeaders(headers, rateLimitState);

    return new Response(payload, {
      status: response.status,
      headers,
    });
  } catch {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    applyRateLimitHeaders(headers, rateLimitState);

    return new Response(
      JSON.stringify({ success: false, message: 'Failed to confirm action.' }),
      { status: 500, headers },
    );
  }
};
