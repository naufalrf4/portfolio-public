import type { Achievement, AboutData, BlogLink, Project } from '../types';
import { getAbout, getAboutSafe, getAchievements, getBlogs, getProjectBySlug, getProjects } from './api';
import { beyondTheCode, servedAreas, technicalServices } from '../components/services/data';
import { getSiteUrl } from './site';

const SITE_NAME = 'NaufalRF Portfolio';

function heading(level: number, text: string): string {
  return `${'#'.repeat(level)} ${text}`;
}

function bullet(label: string, value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  return `- ${label}: ${value.trim()}`;
}

function join(blocks: (string | null | undefined)[]): string {
  return blocks.filter((block): block is string => Boolean(block && block.trim())).join('\n\n');
}

function list(items: (string | null | undefined)[]): string {
  return items.filter((item): item is string => Boolean(item && item.trim())).join('\n');
}

function frontMatter(title: string, canonicalPath: string, description?: string): string {
  const siteUrl = getSiteUrl();
  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `url: ${new URL(canonicalPath, siteUrl).href}`,
  ];
  if (description) lines.push(`description: ${JSON.stringify(description)}`);
  lines.push(`site: ${JSON.stringify(SITE_NAME)}`, '---');
  return lines.join('\n');
}

function formatRange(startDate: string, endDate: string | null): string {
  const end = endDate ?? 'Present';
  return startDate ? `${startDate} - ${end}` : end;
}

function skillsByCategory(about: AboutData): string {
  const grouped = new Map<string, string[]>();
  for (const skill of about.skills ?? []) {
    if (!skill.name?.trim()) continue;
    const key = skill.category?.trim() || 'Other';
    const list = grouped.get(key) ?? [];
    list.push(skill.name.trim());
    grouped.set(key, list);
  }
  if (grouped.size === 0) return '';
  return [...grouped.entries()].map(([category, names]) => `- ${category}: ${names.join(', ')}`).join('\n');
}

function experienceByType(about: AboutData, type: string): string {
  const items = (about.experience ?? []).filter(
    (item) => (item.type ?? '').trim().toLowerCase() === type
  );
  if (items.length === 0) return '';
  return items
    .map((item) => {
      const parts = [
        `### ${item.title}`,
        list([
          bullet('Organization', item.organization),
          bullet('Period', formatRange(item.startDate, item.endDate)),
          bullet('Location', item.location),
          item.skills?.length ? bullet('Skills', item.skills.join(', ')) : null,
        ]),
        item.description?.trim() || null,
      ];
      return join(parts);
    })
    .join('\n\n');
}

function achievementsMarkdown(achievements: readonly Achievement[]): string {
  return list(
    achievements.map((achievement) =>
      bullet(achievement.name, [achievement.location, achievement.monthYear].filter(Boolean).join(', '))
    )
  );
}

function aboutMarkdown(about: AboutData, achievements: readonly Achievement[]): string {
  const jobTitle = about.roles?.find((role) => role.trim().length > 0);

  return join([
    frontMatter(`About ${about.fullName}`, '/about', about.shortBio ?? about.tagline ?? undefined),
    heading(1, about.fullName),
    list([
      bullet('Role', jobTitle),
      bullet('Tagline', about.tagline),
      bullet('Location', about.location),
      bullet('Email', about.email),
      bullet('Availability', about.availabilityStatus),
      about.roles?.length ? bullet('All roles', about.roles.join(', ')) : null,
    ]),
    about.shortBio ? join([heading(2, 'Summary'), about.shortBio]) : null,
    about.bio ? join([heading(2, 'Biography'), about.bio]) : null,
    skillsByCategory(about) ? join([heading(2, 'Skills'), skillsByCategory(about)]) : null,
    experienceByType(about, 'work') ? join([heading(2, 'Work Experience'), experienceByType(about, 'work')]) : null,
    experienceByType(about, 'education') ? join([heading(2, 'Education'), experienceByType(about, 'education')]) : null,
    experienceByType(about, 'certification')
      ? join([heading(2, 'Certifications'), experienceByType(about, 'certification')])
      : null,
    experienceByType(about, 'organizational')
      ? join([heading(2, 'Organizational Experience'), experienceByType(about, 'organizational')])
      : null,
    achievements.length ? join([heading(2, 'Recognition'), achievementsMarkdown(achievements)]) : null,
    about.socialLinks?.length
      ? join([
          heading(2, 'Links'),
          about.socialLinks.map((link) => `- ${link.platform}: ${link.url}`).join('\n'),
        ])
      : null,
  ]);
}

function projectSummaryBlock(project: Project): string {
  return list([
    bullet('Category', project.category),
    project.techStack?.length ? bullet('Tech stack', project.techStack.join(', ')) : null,
    bullet('Year', project.projectDate),
    bullet('Live', project.liveUrl),
    bullet('Repository', project.repoUrl),
  ]);
}

function projectDetailMarkdown(project: Project): string {
  return join([
    frontMatter(project.title, `/projects/${project.slug}`, project.summary),
    heading(1, project.title),
    project.summary,
    projectSummaryBlock(project),
    project.description?.trim() || null,
    project.content?.trim() || null,
  ]);
}

function projectListMarkdown(projects: readonly Project[], authorName: string): string {
  const siteUrl = getSiteUrl();
  const byCategory = new Map<string, Project[]>();
  for (const project of projects) {
    const key = project.category?.trim() || 'Other';
    const list = byCategory.get(key) ?? [];
    list.push(project);
    byCategory.set(key, list);
  }

  const sections = [...byCategory.entries()].map(([category, items]) =>
    join([
      heading(2, category),
      items
        .map((project) =>
          join([
            `### ${project.title}`,
            project.summary,
            list([
              bullet('URL', `${siteUrl}/projects/${project.slug}`),
              project.techStack?.length ? bullet('Tech stack', project.techStack.join(', ')) : null,
              bullet('Live', project.liveUrl),
              bullet('Repository', project.repoUrl),
            ]),
          ])
        )
        .join('\n\n'),
    ])
  );

  return join([
    frontMatter('Projects', '/projects', `Engineering case studies by ${authorName}.`),
    heading(1, 'Projects'),
    `${projects.length} case studies across web, IoT and hardware, and desktop applications.`,
    ...sections,
  ]);
}

function publicationsMarkdown(blogs: readonly BlogLink[], authorName: string): string {
  return join([
    frontMatter('Publications', '/publications', `Research and writing by ${authorName}.`),
    heading(1, 'Publications'),
    blogs
      .map((blog) =>
        join([
          `## ${blog.title}`,
          blog.description ?? null,
          list([
            bullet('Source', blog.source),
            bullet('Published', blog.publishedAt),
            bullet('URL', blog.url),
          ]),
        ])
      )
      .join('\n\n'),
  ]);
}

function servicesMarkdown(about: AboutData): string {
  const technical = technicalServices
    .map((service) =>
      join([
        `### ${service.title}`,
        service.outcome,
        service.description,
        bullet('Stack', [...service.stack].join(', ')),
      ])
    )
    .join('\n\n');

  const beyond = beyondTheCode
    .map((offer) => join([`### ${offer.title}`, offer.outcome, offer.description]))
    .join('\n\n');

  return join([
    frontMatter('Services', '/services', `How to work with ${about.fullName}.`),
    heading(1, 'Services'),
    list([
      bullet('Provider', about.fullName),
      bullet('Based in', about.location),
      bullet('Availability', about.availabilityStatus),
      bullet('Contact', about.email),
      bullet('Areas served', servedAreas.join(', ')),
    ]),
    join([heading(2, 'Technical Services'), technical]),
    join([heading(2, 'Beyond the Code'), beyond]),
  ]);
}

function homeMarkdown(about: AboutData, projects: readonly Project[]): string {
  const siteUrl = getSiteUrl();
  const featured = projects.filter((project) => project.featured).slice(0, 6);

  return join([
    frontMatter(SITE_NAME, '/', about.shortBio ?? about.tagline ?? undefined),
    heading(1, about.fullName),
    list([
      bullet('Role', about.roles?.find((role) => role.trim().length > 0)),
      bullet('Location', about.location),
      bullet('Email', about.email),
      bullet('Availability', about.availabilityStatus),
    ]),
    about.shortBio ?? null,
    join([
      heading(2, 'Pages'),
      [
        `- About: ${siteUrl}/about`,
        `- Projects: ${siteUrl}/projects`,
        `- Services: ${siteUrl}/services`,
        `- Publications: ${siteUrl}/publications`,
        `- Contact: ${siteUrl}/contact`,
      ].join('\n'),
    ]),
    featured.length
      ? join([
          heading(2, 'Featured Projects'),
          featured
            .map((project) => `- ${project.title}: ${project.summary} (${siteUrl}/projects/${project.slug})`)
            .join('\n'),
        ])
      : null,
  ]);
}

function contactMarkdown(about: AboutData): string {
  return join([
    frontMatter('Contact', '/contact', `Get in touch with ${about.fullName}.`),
    heading(1, 'Contact'),
    list([
      bullet('Email', about.email),
      bullet('Location', about.location),
      bullet('Availability', about.availabilityStatus),
      bullet('Website', getSiteUrl()),
    ]),
    about.socialLinks?.length
      ? join([heading(2, 'Links'), about.socialLinks.map((link) => `- ${link.platform}: ${link.url}`).join('\n')])
      : null,
  ]);
}

export const MARKDOWN_ROUTES = new Set(['/', '/about', '/projects', '/publications', '/services', '/contact']);

export function supportsMarkdown(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return MARKDOWN_ROUTES.has(normalized) || /^\/projects\/[^/]+$/.test(normalized);
}

export async function buildMarkdown(pathname: string): Promise<string | null> {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

  if (normalized === '/') {
    const [about, projects] = await Promise.all([getAbout(), getProjects()]);
    return homeMarkdown(about, projects.projects);
  }

  if (normalized === '/about') {
    const [about, achievements] = await Promise.all([getAbout(), getAchievements()]);
    return aboutMarkdown(about, achievements.achievements);
  }

  if (normalized === '/projects') {
    const [{ projects }, about] = await Promise.all([getProjects(), getAboutSafe()]);
    return projectListMarkdown(projects, about.fullName);
  }

  if (normalized === '/publications') {
    const [{ blogs }, about] = await Promise.all([getBlogs(), getAboutSafe()]);
    return publicationsMarkdown(blogs, about.fullName);
  }

  if (normalized === '/services') {
    return servicesMarkdown(await getAboutSafe());
  }

  if (normalized === '/contact') {
    return contactMarkdown(await getAboutSafe());
  }

  const slugMatch = normalized.match(/^\/projects\/([^/]+)$/);
  if (slugMatch) {
    const project = await getProjectBySlug(slugMatch[1]);
    return project ? projectDetailMarkdown(project) : null;
  }

  return null;
}
