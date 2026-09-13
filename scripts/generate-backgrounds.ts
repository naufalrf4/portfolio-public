import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Generates plain background plates for covers, LinkedIn banners, and OG cards.
 *
 * Backgrounds only: gradient, texture, glow, hairline border. Screenshots,
 * mockups, logos, and text get composed on top by hand. Generated rather than
 * prompted from an image model because a flat gradient plus an even texture has
 * to be exact and identical across the set, which is the one thing image models
 * cannot guarantee.
 *
 * Values mirror packages/design-tokens/tokens.css.
 */

const OUT_DIR = path.resolve(import.meta.dirname, '../public/backgrounds');

const PALETTE = {
  dark: {
    base: '#0b0d10',
    raise: '#14171b',
    line: '#343b44',
    teal: '#3ed9c4',
    textureOpacity: 0.45,
    glowOpacity: 0.16,
  },
  light: {
    base: '#faf8f4',
    raise: '#f2eee6',
    line: '#d4cdbf',
    teal: '#0f8577',
    textureOpacity: 0.55,
    glowOpacity: 0.1,
  },
} as const;

const SIZES = {
  cover: { w: 1600, h: 900 },
  linkedin: { w: 1584, h: 396 },
  og: { w: 1200, h: 630 },
} as const;

type ThemeName = keyof typeof PALETTE;
type SizeName = keyof typeof SIZES;
type Texture = 'dots' | 'grid' | 'clean';

interface Options {
  theme: ThemeName;
  size: SizeName;
  texture: Texture;
}

function texturePattern(texture: Texture, line: string): string {
  if (texture === 'grid') {
    return `<pattern id="tex" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0 H0 V48" fill="none" stroke="${line}" stroke-width="1" />
    </pattern>`;
  }
  return `<pattern id="tex" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="1.5" r="1.5" fill="${line}" />
    </pattern>`;
}

function buildSvg({ theme, size, texture }: Options): string {
  const c = PALETTE[theme];
  const { w, h } = SIZES[size];
  const showTexture = texture !== 'clean';

  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.base}" />
      <stop offset="100%" stop-color="${c.raise}" />
    </linearGradient>
    <radialGradient id="glow" cx="16%" cy="10%" r="76%">
      <stop offset="0%" stop-color="${c.teal}" stop-opacity="${c.glowOpacity}" />
      <stop offset="100%" stop-color="${c.teal}" stop-opacity="0" />
    </radialGradient>
    ${showTexture ? texturePattern(texture, c.line) : ''}
  </defs>

  <rect width="${w}" height="${h}" fill="url(#bg)" />
  ${showTexture ? `<rect width="${w}" height="${h}" fill="url(#tex)" opacity="${c.textureOpacity}" />` : ''}
  <rect width="${w}" height="${h}" fill="url(#glow)" />
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${c.line}" stroke-width="2" />
</svg>`;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const themes: ThemeName[] = ['dark', 'light'];
  const sizes: SizeName[] = ['cover', 'linkedin', 'og'];
  const textures: Texture[] = ['dots', 'grid', 'clean'];

  let count = 0;
  for (const size of sizes) {
    for (const theme of themes) {
      for (const texture of textures) {
        const { w, h } = SIZES[size];
        await sharp(Buffer.from(buildSvg({ theme, size, texture })))
          .png()
          .toFile(path.join(OUT_DIR, `${size}-${w}x${h}-${theme}-${texture}.png`));
        count++;
      }
    }
  }

  console.log(`Generated ${count} background plates in ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
