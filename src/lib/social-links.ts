import type { SocialLink } from '@/types';

const PUBLIC_SOCIAL_PLATFORMS = new Set([
  'github',
  'linkedin',
  'twitter',
  'x',
  'instagram',
  'youtube',
  'email',
]);

export type PublicSocialPlatform =
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'instagram'
  | 'youtube'
  | 'email';

function normalizeComparableUrl(url: string): string {
  return url.trim().replace(/\/+$/, '').toLowerCase();
}

function getUrlMetadata(rawUrl: string): { normalizedUrl: string; host: string } | null {
  const normalizedUrl = normalizeComparableUrl(rawUrl);

  if (!normalizedUrl) {
    return null;
  }

  if (normalizedUrl.startsWith('mailto:')) {
    return { normalizedUrl, host: 'mailto' };
  }

  try {
    const url = new URL(normalizedUrl);
    return { normalizedUrl, host: url.hostname.replace(/^www\./, '') };
  } catch {
    return null;
  }
}

function containsKeyword(haystack: string, keyword: string): boolean {
  return (
    haystack === keyword || haystack.includes(`${keyword} `) || haystack.includes(` ${keyword}`)
  );
}

function getLinkTokens(link: SocialLink): string {
  return [link.platform, getUrlMetadata(link.url)?.normalizedUrl]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ')
    .toLowerCase();
}

export function detectPublicSocialPlatform(link: SocialLink): PublicSocialPlatform | null {
  const urlMetadata = getUrlMetadata(link.url);
  const host = urlMetadata?.host ?? '';
  const tokens = getLinkTokens(link);

  if (host === 'mailto' || containsKeyword(tokens, 'email') || containsKeyword(tokens, 'mail')) {
    return 'email';
  }

  if (host === 'github.com' || tokens.includes('github')) {
    return 'github';
  }

  if (host === 'linkedin.com' || host.endsWith('.linkedin.com') || tokens.includes('linkedin')) {
    return 'linkedin';
  }

  if (
    host === 'twitter.com' ||
    host === 'x.com' ||
    host.endsWith('.x.com') ||
    tokens.includes('twitter') ||
    containsKeyword(tokens, 'x')
  ) {
    return 'twitter';
  }

  if (host === 'instagram.com' || host.endsWith('.instagram.com') || tokens.includes('instagram')) {
    return 'instagram';
  }

  if (host === 'youtube.com' || host === 'youtu.be' || tokens.includes('youtube')) {
    return 'youtube';
  }

  return null;
}

export function isPublicSocialPlatform(platform: string | null | undefined): boolean {
  if (!platform) {
    return false;
  }

  return PUBLIC_SOCIAL_PLATFORMS.has(platform.trim().toLowerCase());
}

export function filterPublicSocialLinks(links: SocialLink[] | null | undefined): SocialLink[] {
  if (!links || links.length === 0) {
    return [];
  }

  return links.flatMap((link) => {
    const platform = detectPublicSocialPlatform(link);

    if (!platform || !isPublicSocialPlatform(platform)) {
      return [];
    }

    return [
      {
        ...link,
        platform,
      },
    ];
  });
}
