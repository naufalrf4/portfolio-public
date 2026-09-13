import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getBlogs, getProjects } from '../lib/api';
import { getSiteUrl } from '../lib/site';

export const GET: APIRoute = async () => {
  const siteUrl = getSiteUrl();

  let projects: Awaited<ReturnType<typeof getProjects>>['projects'] = [];
  try {
    projects = (await getProjects()).projects;
  } catch {
    projects = [];
  }

  let blogs: Awaited<ReturnType<typeof getBlogs>>['blogs'] = [];
  try {
    blogs = (await getBlogs()).blogs;
  } catch {
    blogs = [];
  }

  const projectItems = projects.map((project) => ({
    title: project.title,
    description: project.summary,
    link: `${siteUrl}/projects/${project.slug}`,
    pubDate: new Date(project.createdAt),
  }));

  const blogItems = blogs.map((blog) => ({
    title: blog.title,
    description: blog.description ?? undefined,
    link: blog.url,
    pubDate: new Date(blog.publishedAt),
  }));

  const items = [...projectItems, ...blogItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime()
  );

  return rss({
    title: 'NaufalRF Portfolio',
    description: 'Projects and publications from Naufal Rizqullah Firdaus.',
    site: siteUrl,
    items,
  });
};
