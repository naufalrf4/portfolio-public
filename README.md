# Public portfolio

Astro SSR frontend for `naufalrf.net`. Content, auth, guestbook, booking, analytics, and RAG chat requests go through Admin APIs; this app has no database access.

## Local development

This app can be run from the monorepo workspace, or as its own repository after extraction:

```sh
bun install --frozen-lockfile
cp .env.example .env.local
bun run dev
```

The standalone repository includes snapshots of shared `@naufalrf/*` packages under `packages/`; their source commit is recorded in `packages/UPSTREAM-SNAPSHOT.md`. Keep secrets out of browser-prefixed variables and local env files out of Git.

Run `bun run build` for the Cloudflare SSR build. See [DEPLOYMENT.md](./DEPLOYMENT.md) for Pages settings, runtime variables, and preview checks.
