import type { MiddlewareHandler } from 'astro';
import { buildMarkdown, supportsMarkdown } from './lib/markdown-view';

function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;

  const entries = accept
    .split(',')
    .map((part) => {
      const [type, ...params] = part.trim().split(';');
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith('q='));
      return { type: type.trim().toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
    })
    .filter((entry) => Number.isFinite(entry.q) && entry.q > 0);

  const markdown = entries.find((entry) => entry.type === 'text/markdown' || entry.type === 'text/x-markdown');
  if (!markdown) return false;

  const html = entries.find((entry) => entry.type === 'text/html');
  if (!html) return true;

  return markdown.q >= html.q;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, url } = context;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return next();
  }

  if (!prefersMarkdown(request.headers.get('accept')) || !supportsMarkdown(url.pathname)) {
    const response = await next();
    if (supportsMarkdown(url.pathname)) {
      response.headers.append('Vary', 'Accept');
    }
    return response;
  }

  try {
    const markdown = await buildMarkdown(url.pathname);
    if (!markdown) return next();

    return new Response(request.method === 'HEAD' ? null : markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
        Vary: 'Accept',
        Link: `<${url.href}>; rel="canonical"`,
      },
    });
  } catch {
    return next();
  }
};
