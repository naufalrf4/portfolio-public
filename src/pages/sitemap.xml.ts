import type { APIRoute } from 'astro';
import { getBlogs, getProjects } from '../lib/api';
import { getSiteUrl } from '../lib/site';

interface SitemapEntry {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod?: string;
}

const STATIC_ROUTES: ReadonlyArray<{ path: string; changefreq: string; priority: string }> = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.9' },
  { path: '/projects', changefreq: 'weekly', priority: '0.9' },
  { path: '/services', changefreq: 'monthly', priority: '0.8' },
  { path: '/publications', changefreq: 'weekly', priority: '0.8' },
  { path: '/contact', changefreq: 'yearly', priority: '0.7' },
  { path: '/ai-chatbot', changefreq: 'monthly', priority: '0.6' },
  { path: '/guestbook', changefreq: 'weekly', priority: '0.5' },
];


function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toW3cDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

function renderEntry(entry: SitemapEntry): string {
  const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : '';
  return `  <url><loc>${escapeXml(entry.loc)}</loc>${lastmod}<changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`;
}

export const GET: APIRoute = async () => {
  const siteUrl = getSiteUrl();

  // The sitemap must stay servable even when Admin is unreachable: a sitemap
  // that 500s teaches crawlers the whole URL set is gone, while a static-only
  // sitemap merely under-reports until the next fetch succeeds.
  const [projectsResult, blogsResult] = await Promise.allSettled([getProjects(), getBlogs()]);
  const projects = projectsResult.status === 'fulfilled' ? projectsResult.value.projects : [];
  const blogs = blogsResult.status === 'fulfilled' ? blogsResult.value.blogs : [];

  const newestProjectUpdate = projects
    .map((project) => toW3cDate(project.updatedAt))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  const newestBlogUpdate = blogs
    .map((blog) => toW3cDate(blog.publishedAt))
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  const staticEntries: SitemapEntry[] = STATIC_ROUTES.map((route) => {
    const base: SitemapEntry = {
      // The homepage canonical is `https://naufalrf.net/`, so the sitemap must
      // advertise that exact URL: bare-origin and trailing-slash forms are
      // different URLs to a crawler, and disagreeing with the canonical wastes
      // the signal. Inner routes stay slashless for the same reason.
      loc: route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`,
      changefreq: route.changefreq,
      priority: route.priority,
    };
    if (route.path === '/projects' && newestProjectUpdate) base.lastmod = newestProjectUpdate;
    if (route.path === '/publications' && newestBlogUpdate) base.lastmod = newestBlogUpdate;
    return base;
  });

  const projectEntries: SitemapEntry[] = projects.map((project) => ({
    loc: `${siteUrl}/projects/${project.slug}`,
    changefreq: 'monthly',
    priority: project.featured ? '0.8' : '0.7',
    lastmod: toW3cDate(project.updatedAt),
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...projectEntries].map(renderEntry).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
    },
  });
};
