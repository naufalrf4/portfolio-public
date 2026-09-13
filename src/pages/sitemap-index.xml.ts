import type { APIRoute } from 'astro';
import { getSiteUrl } from '../lib/site';

/**
 * `/sitemap-index.xml` used to be the advertised sitemap location, and it is
 * the URL still present in previously-crawled copies of `robots.txt`. The real
 * sitemap now lives at `/sitemap.xml`, so this route permanently redirects
 * instead of 404ing crawlers that cached the old path.
 */
export const GET: APIRoute = () => {
  return new Response(null, {
    status: 301,
    headers: {
      Location: `${getSiteUrl()}/sitemap.xml`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
