# Cloudflare Pages deployment

This repository is deployed as a standalone Cloudflare Pages project for `naufalrf.net`.

## Build settings

- Build command: `bun install --frozen-lockfile && bun run build`
- Build output: `dist`
- Bun version: `BUN_VERSION=1.4.3` is pinned in `wrangler.toml`; `packageManager` is also pinned in `package.json`.
- Wrangler project: `naufalrf-public` (`wrangler.toml`)

Non-secret values in `wrangler.toml` are the source of truth for both Preview and Production. `keep_vars = true` preserves additional dashboard secrets. Set `ADMIN_INTERNAL_API_TOKEN` as a Pages secret and set `PUBLIC_TURNSTILE_SITE_KEY` to the public widget key; never commit either value.

Set the same required variables for Preview and Production, with environment-specific URLs where appropriate:

| Variable | Kind | Purpose |
|---|---|---|
| `ADMIN_API_URL` | server variable | `https://admin.naufalrf.net`; SSR and server routes call Admin here, including RAG chat/confirm proxy routes. |
| `ADMIN_INTERNAL_API_TOKEN` | secret | Least-privilege Admin token for server-side log shipping. Never add a `PUBLIC_` prefix. |
| `ADMIN_PUBLIC_URL` | server variable | `https://admin.naufalrf.net`; guestbook sign-in redirects. |
| `SITE_URL` | build/runtime variable | `https://naufalrf.net`; canonical and sitemap origin. |
| `PUBLIC_SITE_URL` | server variable | `https://naufalrf.net`; public auth callback/origin behavior. |
| `PUBLIC_TURNSTILE_SITE_KEY` | public value | Cloudflare Turnstile site key for forms; configure the widget for `naufalrf.net`. |
| `PUBLIC_CURSOR_WS_URL` | public value | `wss://presence.naufalrf.net/ws`. |
| `PUBLIC_MOCK_DATA` | build/runtime variable | `false` in Preview and Production. |

The adapter selects a `SESSION` KV driver by default, but this app does not call Astro's server session API and its local Pages SSR smoke passed without that binding. Keep it unconfigured unless a route starts using `Astro.session`; if that changes, declare the KV binding in the Wrangler config and verify Preview. Local Wrangler secrets belong in `.dev.vars`; the file is ignored by Git.

RAG chat and confirmation call Admin's public proxy. Do not configure `RAG_SERVICE_URL`, RAG credentials, database credentials, or any direct RAG address in this project.

Before production traffic, verify the Pages preview for SSR pages and `/api` routes, auth redirects, Turnstile, media, guestbook/bookings/contact, analytics, RAG chat/confirm, and Presence websocket connection. Add the exact Preview origin to Admin's public-origin list and Live Presence's origin allowlist before testing those cross-host flows; keep the lists explicit.
