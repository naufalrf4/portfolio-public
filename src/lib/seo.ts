import type { Achievement, AboutData, BlogLink, Project } from '../types';
import { getSiteUrl } from './site';

/**
 * Canonical `@id` fragments. Schema graphs only resolve into a single entity
 * when every page references the *same* identifier, so these are centralized
 * here rather than re-spelled per page.
 */
export const PERSON_ID = '#person';
export const WEBSITE_ID = '#website';

export function personId(siteUrl = getSiteUrl()): string {
  return `${siteUrl}/${PERSON_ID}`;
}

type JsonLd = Record<string, unknown>;

/**
 * Drops empty values so a page never emits `"image": null` or `"sameAs": []`.
 * Schema consumers treat a present-but-empty property as an assertion that the
 * value is genuinely absent, which is worse than omitting it.
 */
function compact(input: JsonLd): JsonLd {
  const output: JsonLd = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    output[key] = value;
  }
  return output;
}

function absoluteUrl(path: string | null | undefined, siteUrl: string): string | undefined {
  if (!path) return undefined;
  try {
    return new URL(path, siteUrl).href;
  } catch {
    return undefined;
  }
}

/**
 * Media in Admin is served from Google Cloud Storage as *signed* URLs that
 * carry `X-Goog-Expires` (currently 3600s). Those are fine for an `<img>` the
 * visitor loads immediately, but they must never be published in structured
 * data: Google fetches schema images long after the page render, by which time
 * the signature is dead and the fetch 403s. A broken `image` is worse than an
 * absent one, so an expiring URL is treated as no image at all.
 */
function isExpiringSignedUrl(url: string): boolean {
  return /[?&]X-Goog-Expires=/i.test(url) || /[?&]X-Amz-Expires=/i.test(url);
}

export function stableImageUrl(
  path: string | null | undefined,
  siteUrl: string = getSiteUrl()
): string | undefined {
  const resolved = absoluteUrl(path, siteUrl);
  if (!resolved) return undefined;
  return isExpiringSignedUrl(resolved) ? undefined : resolved;
}

function isoDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

// `projectDate` is free text (`text()`, validated as `z.string().max(50)`), so it
// carries values like '2025', '2024-06', or a range such as '2023 - 2024'. Schema.org
// Date accepts ISO 8601 at reduced precision, so partial values are emitted as-is
// rather than coerced into a fabricated January 1st, and ranges are dropped instead
// of being guessed at.
function isoPartialDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^\d{4}(-\d{2}){0,2}$/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed
    .toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Asia/Jakarta' })
    .slice(0, 7);
}

export interface BreadcrumbCrumb {
  name: string;
  path: string;
}

export interface FaqSchemaEntry {
  readonly question: string;
  readonly answer: string;
}

/**
 * BreadcrumbList is one of the few structured-data types Google still renders
 * as a Search feature, so every page below the root should emit one.
 */
export function buildBreadcrumbSchema(crumbs: readonly BreadcrumbCrumb[], siteUrl = getSiteUrl()): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path, siteUrl),
    })),
  };
}

/**
 * `FAQPage` is only valid when the questions and answers are both visible on
 * the page itself, so this takes the same `faqs` array the UI renders rather
 * than a separate copy written for crawlers. Answers are plain text: Google
 * rejects `acceptedAnswer` text containing markup, and these are prose anyway.
 */
export function buildFaqSchema(
  faqs: readonly FaqSchemaEntry[],
  canonicalPath: string,
  siteUrl = getSiteUrl()
): JsonLd {
  const pageUrl = absoluteUrl(canonicalPath, siteUrl);

  return compact({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': pageUrl ? `${pageUrl}#faq` : undefined,
    url: pageUrl,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  });
}

/**
 * `ProfilePage` is Google's documented type for a page about a single person,
 * and it is the strongest available signal tying this site to the Person
 * entity. `mainEntity` points at the same `@id` the global Person schema
 * declares so the two merge instead of competing.
 */
export function buildProfilePageSchema(
  about: AboutData,
  options: { canonicalPath: string; description: string },
  achievements: readonly Achievement[] = [],
  siteUrl = getSiteUrl()
): JsonLd {
  const jobTitle = about.roles?.find((role) => role.trim().length > 0) ?? undefined;
  const skillNames = (about.skills ?? [])
    .map((skill) => skill.name)
    .filter((name): name is string => Boolean(name && name.trim()));

  // `experience` is a single mixed list distinguished only by `type`
  // (work / education / certification / organizational - see
  // components/about/ExperienceTabs.tsx). Certifications legitimately carry no
  // end date, so filtering on `endDate === null` alone would promote every
  // issuer into `worksFor` and claim AWS, Cisco, and Microsoft as employers.
  // Each type must therefore map to the property that is actually true of it.
  const experienceItems = about.experience ?? [];

  const namedOrgsOfType = (type: string, currentOnly = false) =>
    experienceItems
      .filter((item) => item.type?.trim().toLowerCase() === type)
      .filter((item) => Boolean(item.organization?.trim()))
      .filter((item) => (currentOnly ? item.endDate === null : true))
      .map((item) => compact({ '@type': 'Organization', name: item.organization }));

  const worksFor = namedOrgsOfType('work', true);
  const alumniOf = namedOrgsOfType('education');
  const memberOf = namedOrgsOfType('organizational');

  const person = compact({
    '@type': 'Person',
    '@id': personId(siteUrl),
    name: about.fullName,
    description: about.shortBio || about.tagline || options.description,
    jobTitle,
    email: about.email ? `mailto:${about.email}` : undefined,
    image: stableImageUrl(about.avatarUrl, siteUrl),
    url: absoluteUrl(options.canonicalPath, siteUrl),
    knowsAbout: skillNames,
    // `socialLinks` also carries the contact address and the site's own URL.
    // `sameAs` is for *other* profiles identifying the same person: a mailto
    // is not a profile (email already has its own property), and listing the
    // canonical host as an alias of itself asserts nothing.
    sameAs: (about.socialLinks ?? [])
      .map((link) => link.url)
      .filter((url): url is string => Boolean(url))
      .filter((url) => !url.toLowerCase().startsWith('mailto:'))
      .filter((url) => url.replace(/\/$/, '') !== siteUrl.replace(/\/$/, '')),
    worksFor: worksFor.length > 0 ? worksFor : undefined,
    alumniOf: alumniOf.length > 0 ? alumniOf : undefined,
    memberOf: memberOf.length > 0 ? memberOf : undefined,
    homeLocation: about.location
      ? compact({ '@type': 'Place', name: about.location })
      : undefined,
    // Schema.org `award` is a flat text list, not a structured entity - it has
    // no dedicated `Award` type, so each competition result is rendered as a
    // single descriptive string rather than an object.
    award: achievements
      .map((achievement) =>
        [achievement.name, achievement.location, achievement.monthYear].filter(Boolean).join(' — ')
      )
      .filter((entry) => entry.trim().length > 0),
  });

  return compact({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absoluteUrl(options.canonicalPath, siteUrl),
    url: absoluteUrl(options.canonicalPath, siteUrl),
    name: `${about.fullName} - About`,
    description: options.description,
    dateModified: isoDate(about.updatedAt),
    isPartOf: { '@id': `${siteUrl}/${WEBSITE_ID}` },
    mainEntity: person,
  });
}

/**
 * A portfolio index is a `CollectionPage` whose `mainEntity` is an ordered
 * `ItemList`. This is semantic organization rather than a rich-result play:
 * it tells a crawler the page is a curated set and names each member, which is
 * what lets an answer engine enumerate the work without guessing from markup.
 */
export function buildProjectCollectionSchema(
  projects: readonly Project[],
  options: { canonicalPath: string; name: string; description: string },
  siteUrl = getSiteUrl()
): JsonLd {
  const pageUrl = absoluteUrl(options.canonicalPath, siteUrl);

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    url: pageUrl,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': `${siteUrl}/${WEBSITE_ID}` },
    about: { '@id': personId(siteUrl) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: projects.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: compact({
          '@type': 'CreativeWork',
          '@id': `${siteUrl}/projects/${project.slug}`,
          url: `${siteUrl}/projects/${project.slug}`,
          name: project.title,
          description: project.summary,
          image: stableImageUrl(project.imageUrl, siteUrl),
          genre: project.category,
          keywords: project.techStack?.length ? project.techStack.join(', ') : undefined,
          dateModified: isoDate(project.updatedAt),
          author: { '@id': personId(siteUrl) },
        }),
      })),
    },
  });
}

/**
 * The publications list deliberately mixes writing Naufal authored with press
 * coverage written *about* him, and the `Blog` contract carries no authorship
 * field to tell them apart - real `source` values are publisher names like
 * `IPB University`, `Medium`, `Jurnal`, and `Metropolitan`. Guessing from a
 * publisher name would assert authorship of someone else's article, so no
 * `author` is emitted at all: each entry gets its true `publisher` and links
 * to its real off-site `url`. Add `author` here only once the API exposes an
 * explicit authored/coverage flag.
 */
export function buildPublicationCollectionSchema(
  blogs: readonly BlogLink[],
  options: { canonicalPath: string; name: string; description: string },
  siteUrl = getSiteUrl()
): JsonLd {
  const pageUrl = absoluteUrl(options.canonicalPath, siteUrl);

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': pageUrl,
    url: pageUrl,
    name: options.name,
    description: options.description,
    isPartOf: { '@id': `${siteUrl}/${WEBSITE_ID}` },
    about: { '@id': personId(siteUrl) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: blogs.length,
      itemListElement: blogs.map((blog, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: compact({
          '@type': 'Article',
          '@id': blog.url,
          url: blog.url,
          headline: blog.title,
          description: blog.description,
          image: stableImageUrl(blog.imageUrl, siteUrl),
          datePublished: isoDate(blog.publishedAt),
          articleSection: blog.category,
          publisher: blog.source ? compact({ '@type': 'Organization', name: blog.source }) : undefined,
        }),
      })),
    },
  });
}

export interface ServiceOffering {
  name: string;
  description: string;
}

/**
 * `Service` + `hasOfferCatalog` describes what is actually on offer without
 * inventing prices or ratings. No `Offer.price` is emitted because none is
 * published on the page, and fabricating one to chase a rich result would be
 * both wrong and a policy violation.
 */
export function buildServiceSchema(
  offerings: readonly ServiceOffering[],
  options: {
    canonicalPath: string;
    name: string;
    description: string;
    areaServed?: string | readonly string[];
    /**
     * Indonesian phrasings for the same services. Commercial demand here is
     * searched in Indonesian ("jasa pembuatan sistem monitoring IoT"), but the
     * visible copy is English, so the page has nothing for those queries to
     * match. These belong in `alternateName` rather than in the UI: they are
     * genuine alternate labels for services actually offered, not keyword
     * padding, and they keep the visible design untouched.
     */
    alternateNames?: readonly string[];
  },
  siteUrl = getSiteUrl()
): JsonLd {
  const pageUrl = absoluteUrl(options.canonicalPath, siteUrl);

  return compact({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': pageUrl,
    url: pageUrl,
    name: options.name,
    alternateName: options.alternateNames?.length ? [...options.alternateNames] : undefined,
    description: options.description,
    serviceType: options.name,
    provider: { '@id': personId(siteUrl) },
    areaServed: Array.isArray(options.areaServed)
      ? options.areaServed.map((place) => compact({ '@type': 'Place', name: place }))
      : options.areaServed
        ? compact({ '@type': 'Place', name: options.areaServed })
        : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: options.name,
      itemListElement: offerings.map((offering) => ({
        '@type': 'Offer',
        itemOffered: compact({
          '@type': 'Service',
          name: offering.name,
          description: offering.description,
        }),
      })),
    },
  });
}

/**
 * A project case study is a `CreativeWork`, not an `Article`: these pages
 * describe something that was built, not a piece of writing. `Article` also
 * implies editorial content Google may evaluate against news/author signals
 * these pages do not have.
 *
 * `author` references the shared Person `@id` rather than restating the name
 * inline, so the case study attaches to the same entity as every other page
 * instead of creating a second, unlinked Person.
 *
 * `dateModified` is normalized through `isoDate`: the Admin API returns Postgres
 * timestamps like `2026-09-01 03:25:31.827+07`, which is NOT valid ISO 8601 -
 * Schema.org requires ISO 8601, so passing the raw value through would emit a
 * date consumers can legitimately reject. `dateCreated` comes from the free-text
 * `projectDate` instead, so it goes through `isoPartialDate` and keeps whatever
 * precision the data actually has.
 */
export function buildProjectSchema(
  project: Project,
  siteUrl = getSiteUrl()
): JsonLd {
  const pageUrl = `${siteUrl}/projects/${project.slug}`;
  const images = (project.images ?? [])
    .map((image) => stableImageUrl(image.url, siteUrl))
    .filter((url): url is string => Boolean(url));
  const primaryImage = stableImageUrl(project.imageUrl, siteUrl);
  const allImages = [...new Set([primaryImage, ...images].filter((u): u is string => Boolean(u)))];

  return compact({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': pageUrl,
    url: pageUrl,
    name: project.title,
    headline: project.title,
    description: project.summary,
    image: allImages,
    genre: project.category,
    keywords: project.techStack?.length ? project.techStack.join(', ') : undefined,
    dateCreated: isoPartialDate(project.projectDate),
    dateModified: isoDate(project.updatedAt),
    author: { '@id': personId(siteUrl) },
    creator: { '@id': personId(siteUrl) },
    isPartOf: { '@id': `${siteUrl}/${WEBSITE_ID}` },
    // `codeRepository` and `sameAs` are only meaningful when the project
    // actually exposes them; many are client work with neither.
    sameAs: project.liveUrl ? [project.liveUrl] : undefined,
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
  });
}
