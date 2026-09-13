# AGENTS.md

Authoritative AI control contract for this repository.

## 1. Project Context

- **Name:** `apps/public-astro`
- **Purpose:** serve the public portfolio experience and AI chat entrypoint
- **Architecture:** Astro 5 site with React islands and API consumption from Admin plus RAG chat integration
- **Execution Model:** runs independently from `apps/public-astro`; reads content from Admin public APIs and sends chat requests to the RAG service
- **Critical Domains:** dark-first design system parity, SEO metadata, Admin public API compatibility, chatbot integration

## 2. Technology Baseline

- **Framework:** Astro 5.17.1 with React 19.2.4
- **Runtime:** Bun
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, Framer Motion, and shared dark-first design tokens from `@naufalrf/design-tokens`
- **Package Manager:** Bun via `bun.lock`
- **Version Policy:** use versions resolved from `package.json` and `bun.lock`; never guess from memory
- **State Management:** Astro page data plus app-local React state where needed
- **Database / ORM:** none directly; consume Admin APIs and the RAG chat API only
- **Testing Stack:** `bun run build`; no lint or automated test script currently exists

## 3. Architecture and Structure Rules

- Stay API-only for content; this app must not connect directly to the database.
- Keep content reads aligned with Admin public endpoints instead of duplicating backend logic.
- Preserve the dark-first design system from `@naufalrf/design-tokens` and page/section sequencing.
- Keep SEO metadata, structured data, and page discoverability intact when editing routes.

## 4. Operational Command Set

- **Install:** `bun install`
- **Dev:** `bun run dev`
- **Build:** `bun run build`
- **Test:** no dedicated automated test command is defined in `package.json`
- **Lint:** no lint command is defined in `package.json`

## 5. Git Workflow Rules

- **Branch Strategy:** not codified locally; default to the user's current branch unless instructed otherwise
- **Review Flow:** not codified locally; do not assume auto-PR work
- **Auto-Commit:** forbidden unless the user explicitly asks
- **Auto-Push:** forbidden unless the user explicitly asks
- **Push Identity:** use only the user's identity
- **Co-Authors:** forbidden unless the user explicitly asks otherwise
- **Ignored Local Agent Artifacts:** inherit `../../AGENTS.md`

## 6. Agent Behavior

- Read this file, `../../AGENTS.md`, `../../PROGRESS.md`, `../../.context/ui-design/legacy-phase2-baseline.md`, and relevant `../../.context/base/*` files before planning or coding.
- Do not guess missing API contracts, SEO requirements, or design rules that are not evidenced in repo files.
- Keep changes scoped to this app unless an Admin contract or shared rule explicitly requires a cross-app update.
- Preserve existing behavior unless the user asks for a change or a documented contradiction must be repaired.
- Update `../../.context/` and this file when a task reveals durable public-site knowledge.
- Append a factual entry to `../../PROGRESS.md` after meaningful milestones, decisions, or discoveries.
- Do not add co-author trailers, assistant attribution, or alternate authorship metadata on the user's behalf.
- Run `bun run build` after meaningful code changes and explicitly note that lint/test commands are not defined when relevant.

## 7. Authority Order

1. this file
2. `../../AGENTS.md`
3. `../../.context/`
4. explicit user instruction that does not contradict verified project truth
5. repository code, manifests, env examples, and configs in this app

## 8. Self-Learn and Learned Rules

- Self-learn: add a short factual rule here when a task reveals a recurring public-site quirk, API contract caveat, or design constraint.
- `src/lib/api.ts` is the authoritative Admin API client for public content reads.
- Legacy `NeuButton.tsx` and other Neu* components have already been renamed to Card/Button/Badge/Input/Textarea; no phase2 carryover file remains in `src/components/shared/`.
- `src/pages/api/auth/sync.ts` proxies auth sync requests to Admin and should remain an API boundary, not a database shortcut.
- Project detail `content` from Admin may arrive as plain text/markdown or serialized Tiptap JSON, so public renderers must support both formats safely.
- Public project detail pages now consume only the simplified slug contract (`summary`, `description`, `content`, `images`) and must not depend on legacy `contexts` payloads.
- Public contact and booking flows go through local Astro API proxies (`src/pages/api/contact.ts`, `src/pages/api/bookings.ts`, `src/pages/api/bookings/available.ts`) so the browser never depends on the Admin base URL directly.
- Public AI chat should also go through the local Astro proxy layer (`src/pages/api/rag/chat.ts`) with `RAG_SERVICE_URL` on the server side; do not switch the browser back to a raw public RAG hostname.
- Guestbook auth now returns directly to `/#guestbook`; `src/components/home/Guestbook.tsx` owns syncing `guestbook_*` query params into local storage and reopening the modal, so the guestbook sign-in flow should stay modal-based instead of routing users through a dedicated public sign-in page.
- Guestbook local storage is display state only; posting now depends on the short-lived `guestbook_token` returned by Admin auth completion, not on the stored email alone.
- Shared Turnstile widgets on the public site stay hidden until the user starts typing; keep submit enforcement intact, but do not show the CAPTCHA shell or extra helper copy before interaction.
- Sticky sub-bars in the public app (project filters, about tabs) should sit below the sticky navbar with a `top-20` offset and a blurred supporting surface so they do not collide with the `h-16` navigation shell.
- Public relative-time displays should use the shared Jakarta-aware helpers in `src/lib/utils.ts`; do not reintroduce raw `new Date()` display math for guestbook/chat/project timestamps.
- The homepage guestbook list now follows a compact legacy-style marquee strip instead of stacked cards; keep the CTA separate and preserve the compact repeated-pill presentation.
- With Astro `ClientRouter` enabled, React islands that depend on the current pathname must derive it from the browser and resync on `astro:page-load`; a one-time `Astro.url.pathname` prop will go stale after client-side navigation.
- Public first-party analytics now go through the local Astro proxy route `src/pages/api/analytics.ts`; keep browser telemetry same-origin and forward source headers to Admin instead of posting directly to the Admin hostname from the browser.
