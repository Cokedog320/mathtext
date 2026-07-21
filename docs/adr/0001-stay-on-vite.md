# Stay on Vite instead of migrating to Next.js

MathText is a single-page client-side tool (no routing, no server-side logic — the
`@google/genai`/`express`/`GEMINI_API_KEY` remnants from the original AI Studio template
are unused in `src/`) deployed as a static site on Cloudflare Pages. We considered
migrating to Next.js but decided against it: Next.js's core value (SSR data fetching,
API routes/Server Actions, file-based multi-page routing, SEO-oriented rendering) all
require a need we don't have — no backend, no planned multi-page split, no SEO goal —
and Cloudflare Pages would require an extra adapter (`@cloudflare/next-on-pages` or
OpenNext) to get anything beyond a static export anyway. Vite has no reported pain
points (build speed, dev experience). Revisit this if a real backend, multi-page/routing
need, or SEO requirement emerges.
