import type { APIRoute } from 'astro';
import { buildSubmissionProxyHeaders } from '@/lib/submission-context';

const ADMIN_API_URL =
  process.env.ADMIN_API_URL?.trim() ||
  import.meta.env.ADMIN_API_URL?.trim() ||
  'http://localhost:3001';

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const body = await request.json();
    const timezone =
      body && typeof body === 'object' && typeof body.timezone === 'string'
        ? body.timezone
        : undefined;
    const sourcePath =
      body && typeof body === 'object' && typeof body.page === 'string' ? body.page : '/';

    const response = await fetch(`${ADMIN_API_URL}/api/v1/public/analytics`, {
      method: 'POST',
      headers: buildSubmissionProxyHeaders({ request, sourcePath, timezone, clientAddress }),
      body: JSON.stringify(body),
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to track analytics event.' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
