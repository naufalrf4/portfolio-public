import type { APIRoute } from 'astro';
import { buildSubmissionProxyHeaders } from '@/lib/submission-context';

const ADMIN_API_URL =
  process.env.ADMIN_API_URL?.trim() || import.meta.env.ADMIN_API_URL?.trim() || 'http://localhost:3001';

async function proxy(request: Request, body: unknown, clientAddress: string): Promise<Response> {
  const timezone =
    body && typeof body === 'object' && 'timezone' in body && typeof body.timezone === 'string'
      ? body.timezone
      : undefined;

  const response = await fetch(`${ADMIN_API_URL}/api/v1/public/contact`, {
    method: 'POST',
    headers: buildSubmissionProxyHeaders({ request, sourcePath: '/contact', timezone, clientAddress }),
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
  try {
    const body = await request.json();
    return await proxy(request, body, clientAddress);
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to send your message.' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
