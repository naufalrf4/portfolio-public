import type { APIRoute } from 'astro';
import { getSiteUrl } from '../lib/site';

/**
 * Agents that retrieve pages to ground and cite answers in AI search products.
 * Listed explicitly (rather than leaning on `User-agent: *`) so the intent to
 * permit AI *search* access stays legible to anyone reading the file.
 *
 * `OAI-SearchBot` is the agent behind ChatGPT search results and is distinct
 * from `GPTBot`: per OpenAI's crawler docs, blocking it removes the site from
 * ChatGPT search answers. Omitting it silently costs citation eligibility.
 */
const AI_SEARCH_CRAWLERS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'Google-Extended',
  'CCBot',
] as const;

/**
 * Routes with no informational value to a search index: the API surface and
 * transient auth handoffs. Auth pages are additionally marked `noindex` in the
 * document head, which is the directive that actually removes an
 * already-indexed URL - `Disallow` only prevents future crawling.
 */
const DISALLOWED_PATHS = ['/api/', '/auth/'] as const;

export const GET: APIRoute = () => {
  const siteUrl = getSiteUrl();
  const lines: string[] = [];

  for (const agent of ['*', ...AI_SEARCH_CRAWLERS]) {
    lines.push(`User-agent: ${agent}`, 'Allow: /');
    for (const path of DISALLOWED_PATHS) {
      lines.push(`Disallow: ${path}`);
    }
    lines.push('');
  }

  lines.push(`Sitemap: ${siteUrl}/sitemap.xml`, '');

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
