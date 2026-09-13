import type { APIRoute } from 'astro';
import { buildSubmissionProxyHeaders } from '@/lib/submission-context';
import { applyRateLimitHeaders, getClientIp, getRateLimitState } from '@/lib/rate-limit';

const RAG_SERVICE_URL =
  process.env.RAG_SERVICE_URL?.trim() || import.meta.env.RAG_SERVICE_URL?.trim() || 'http://localhost:3005';
const RATE_LIMIT_CONFIG = {
  maxRequests: 12,
  windowMs: 60 * 1000,
};

async function proxy(request: Request, body: unknown, clientAddress: string): Promise<Response> {
  const response = await fetch(`${RAG_SERVICE_URL}/chat`, {
    method: 'POST',
    headers: buildSubmissionProxyHeaders({ request, sourcePath: '/ai-chatbot', clientAddress }),
    body: JSON.stringify(body),
  });

  const payload = await response.text();
  return new Response(payload, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rateLimitState = getRateLimitState(`chat:${clientAddress || getClientIp(request)}`, RATE_LIMIT_CONFIG);

  if (!rateLimitState.allowed) {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    applyRateLimitHeaders(headers, rateLimitState);

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Too many chat requests. Please wait a minute before trying again.',
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
    const response = await proxy(request, body, clientAddress);
    applyRateLimitHeaders(response.headers, rateLimitState);
    return response;
  } catch {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    applyRateLimitHeaders(headers, rateLimitState);

    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to send chat request.' } }),
      {
        status: 500,
        headers,
      }
    );
  }
};
