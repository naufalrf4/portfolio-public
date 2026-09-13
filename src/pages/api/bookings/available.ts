import type { APIRoute } from 'astro';

const ADMIN_API_URL =
  process.env.ADMIN_API_URL?.trim() || import.meta.env.ADMIN_API_URL?.trim() || 'http://localhost:3001';

export const GET: APIRoute = async ({ url }) => {
  try {
    const search = url.searchParams.toString();
    const endpoint = `${ADMIN_API_URL}/api/v1/public/bookings/available${search ? `?${search}` : ''}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const payload = await response.text();
    return new Response(payload, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: { message: 'Failed to load availability.' } }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
