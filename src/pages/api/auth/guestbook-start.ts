import type { APIRoute } from 'astro';

const ADMIN_PUBLIC_URL =
  process.env.ADMIN_PUBLIC_URL?.trim() ||
  import.meta.env.ADMIN_PUBLIC_URL?.trim() ||
  'https://admin.naufalrf.net';

const PUBLIC_SITE_URL =
  process.env.PUBLIC_SITE_URL?.trim() ||
  import.meta.env.PUBLIC_SITE_URL?.trim() ||
  'https://naufalrf.net';

export const GET: APIRoute = async ({ request, url }) => {
  const callbackUrl = url.searchParams.get('callbackUrl') || '/';
  const nextUrl = callbackUrl.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/';
  const requestOrigin = (() => {
    try {
      return new URL(request.url).origin;
    } catch {
      return PUBLIC_SITE_URL;
    }
  })();
  const publicOrigin = requestOrigin.includes('localhost') ? PUBLIC_SITE_URL : requestOrigin;
  const returnTo = new URL(nextUrl, publicOrigin);

  const adminSignInUrl = new URL('/public-auth/signin', ADMIN_PUBLIC_URL);
  adminSignInUrl.searchParams.set(
    'callbackUrl',
    `/api/v1/public/auth/complete?returnTo=${encodeURIComponent(returnTo.toString())}`
  );

  return Response.redirect(adminSignInUrl.toString(), 302);
};
