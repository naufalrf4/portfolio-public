import type { APIRoute } from 'astro';
import { buildSubmissionProxyHeaders } from '@/lib/submission-context';

const ADMIN_API_URL =
  process.env.ADMIN_API_URL?.trim() || import.meta.env.ADMIN_API_URL?.trim() || 'http://localhost:3001';

async function proxy(request: Request, method: 'GET' | 'POST', clientAddress: string, body?: unknown): Promise<Response> {
  const timezone =
    body && typeof body === 'object' && 'timezone' in body && typeof body.timezone === 'string'
      ? body.timezone
      : undefined;

  const response = await fetch(`${ADMIN_API_URL}/api/v1/public/guestbook`, {
    method,
    headers: buildSubmissionProxyHeaders({ request, sourcePath: '/#guestbook', timezone, clientAddress }),
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.text();
  return new Response(payload, {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const GET: APIRoute = async ({ request, clientAddress }) => {
  try {
    return await proxy(request, 'GET', clientAddress);
  } catch {
    return new Response(JSON.stringify({ entries: [] }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    return await proxy(request, 'POST', clientAddress, body);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to submit guestbook entry.' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
