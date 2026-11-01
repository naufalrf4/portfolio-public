import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const adapter = process.env.CF_PAGES === '1'
  ? cloudflare({ imageService: 'compile' })
  : node({ mode: 'standalone' });

export default defineConfig({
  output: 'server',
  adapter,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  site: process.env.SITE_URL || 'https://naufalrf.net',

  server: { port: 3000 },
});
