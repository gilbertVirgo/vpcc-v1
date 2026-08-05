# VPCC Redesign — Build Plan

Rebuild of [vpcc.church](https://vpcc.church) on Next.js + Prismic + Netlify.
Visual language: **neutral, minimal, clean**. Motion: **smooth, subtle, restrained**.
Textual content is largely carried over from the existing CRA app (`~/vpcc-cra`).

**How to use this doc:** work top to bottom. Tick each box as it lands. Do not start a
phase until the previous phase's "Exit criteria" are all ticked.

---

## Foundations (fixed decisions)

|           |                                                                                                       |
| --------- | ----------------------------------------------------------------------------------------------------- |
| Framework | Next.js (App Router)                                                                                  |
| Language  | TypeScript                                                                                            |
| Styling   | Tailwind CSS v4 (CSS-first `@theme`) over a CSS-custom-property token layer                           |
| CMS       | Prismic (Slice Machine)                                                                               |
| Host      | Netlify (`@netlify/plugin-nextjs`)                                                                    |
| Font      | **Area Inktrap** 500/700 only, via Adobe Fonts `https://use.typekit.net/ccy7tqi.css`. No second face. |
| Primary   | `#FF9035`                                                                                             |
| Light     | `#FCFCF5`                                                                                             |
| Dark      | `#0B0C17`                                                                                             |

Assumptions made where the brief was silent — flagged in **Open Questions** at the end.
Change them there before Phase 1 starts, not after.

---

## Phase 1 — Design System

> Nothing visual gets built outside this system. If a page needs a value that isn't a
> token or a component, the token/component gets added here first.

### 1.1 Scaffold

- [x] Next.js 16 + React 19 + TypeScript + Tailwind v4 + ESLint, `src/` dir, `@/*` alias (scaffolded by hand — `create-next-app` refuses a non-empty directory)
- [x] Prettier + `prettier-plugin-tailwindcss`; match existing house style (tabs, double quotes)
- [x] `.nvmrc` pinned to Node 24, matching `NODE_VERSION` in `netlify.toml`
- [x] `netlify.toml` — build command, `@netlify/plugin-nextjs`, Node version
- [x] Initial commit; confirm `next dev` and `next build` both pass clean

### 1.2 Typography

- [x] Add Typekit stylesheet to root layout `<head>` with `<link rel="preconnect">` to `use.typekit.net` and `p.typekitcdn.com`
- [x] Define `--font-sans: "area-inktrap", <system fallback>`
- [ ] Metric-adjusted fallback faces (`size-adjust`, `ascent-override`) to cut CLS on first paint — needs the real font metrics measured first
- [x] Fluid modular type scale using `clamp()` — `display / h1 / h2 / h3 / body-lg / body / body-sm / caption / overline`
- [x] Area Inktrap has only 500 and 700: 500 = body + most headings, 700 = emphasis. Weight scale restricted to the weights that exist; `font-synthesis` off. Both families ship real italics, so no faux italic is needed
- [x] Two-tone headings (the old site's `.serif` span) ported as a **weight** contrast — fragment at 500 against the heading's 700. No second typeface
- [x] Line-height, letter-spacing (tighter as size increases), and `text-wrap: balance` on headings / `pretty` on paragraphs
- [x] Measure cap: body copy max ~68ch

### 1.3 Colour

- [x] Seed tokens: `--color-primary: #FF9035`, `--color-light: #FCFCF5`, `--color-dark: #0B0C17`
- [x] Interpolate a **neutral ramp** (`neutral-50 … neutral-950`) between Light and Dark in OKLCH, not sRGB, so the mid-tones stay clean rather than muddy
- [x] Interpolate a **primary ramp** (`primary-50 … primary-900`) around `#FF9035` — tints toward Light, shades toward Dark
- [x] Semantic layer (components only ever reference these):
    - `surface`, `surface-raised`, `surface-sunken`, `surface-inverse`
    - `ink`, `ink-secondary`, `ink-muted`, `ink-inverse`, `ink-accent` (named `ink` so utilities read `text-ink-muted`, not `text-text-muted`)
    - `line`, `line-strong`, `line-inverse`
    - `accent`, `accent-hover`, `accent-pressed`, `accent-contrast`
    - `focus-ring`, `success`, `danger`
- [x] Contrast audit: every text/background pair ≥ WCAG AA (4.5:1 body, 3:1 large). `#FF9035` on `#FCFCF5` **fails** for body text — restrict primary to fills, borders, and large display type; use a darkened primary shade for accent text
- [x] `#0B0C17` is **text and footer colour only** — no inverse theme, no dark mode toggle, no dark section variants. Keeps the component matrix small

### 1.4 Space, layout, shape

- [x] 4px base spacing scale (`space-1 … space-24`) + fluid section-rhythm tokens (`section-sm/md/lg`)
- [x] Breakpoints (carry over from existing site): 500 / 750 / 1150 / 1350 / 1500
- [x] `<Container>` with named max-widths (`narrow / text / default / wide / full`) + responsive gutter; `<Grid>` primitive with 1/2/3/4/12-column presets
- [x] Radii scale (`sm / md / lg / pill`) — keep small; minimal reads sharper
- [x] Elevation: prefer hairline `line` over shadows. Two soft shadows only, for overlays
- [x] Z-index scale as tokens (nav, dropdown, overlay, modal, toast)

### 1.5 Motion

- [x] Duration tokens: `instant 80ms`, `fast 160ms`, `base 240ms`, `slow 400ms`, `slower 640ms`
- [x] Easing tokens: `standard cubic-bezier(.2,0,0,1)`, `entrance cubic-bezier(0,0,0,1)`, `exit cubic-bezier(.3,0,1,1)`
- [x] Global rule: only `transform` and `opacity` animate. No animating layout properties
- [x] `prefers-reduced-motion: reduce` kill-switch at the token level — one place, not per-component (the current site re-implements this in every block)
- [x] `useInView` reveal hook built on `IntersectionObserver` — fires once, `rootMargin` tuned so content is never revealed below the fold on fast scroll
- [x] `<Reveal>` and `<Stagger>` primitives: fade + ≤12px rise, 60–80ms stagger. Replaces the `setTimeout` cascades in the old `renderBlock.js`
- [x] Page-transition treatment — `template.tsx` cross-fade with a 4px lift, built in Phase 2 once real routes existed
- [x] Hover/focus/press micro-interactions defined once on the Button/Link primitives

### 1.6 Component primitives

- [x] `Button` — variants `primary / secondary / ghost / link`, sizes `sm / md / lg`, renders as `<button>` or `<Link>`/`<a>` by prop, loading + disabled states
- [x] `Link` (inline text link, underline offset, hover transition)
- [x] `Heading` / `Text` (scale-bound, polymorphic `as`)
- [x] `Section` / `Container` / `Grid` / `Stack`
- [x] `Card`
- [x] `Media` — wraps `next/image`, enforces an aspect-ratio box so images reserve space before load
- [x] Blur placeholders — `lib/image-placeholder` fetches a 16px imgix render of each Prismic asset and inlines it as a data URI
- [x] `Slideshow` — accessible carousel (keyboard, swipe, pause, live-region), replaces old `Slideshow.js`
- [x] Form set: `Field`, `Label`, `Input`, `Textarea`, `Checkbox`, `Radio`, `Select`, `FieldError`, `FormStatus`
- [x] `Dialog` / `Modal` — focus trap, scroll lock, `Esc`, restores focus on close
- [x] `Icon` — inline SVG, 14 glyphs on a 24px grid
- [ ] Migrate the remaining marks from `public/assets/icons` + `glyphs` (Phase 7, with the rest of the assets)
- [x] `Divider`, `Badge`
- [ ] `Skeleton` — no loading surface needs one yet; add when Phase 4 introduces one
- [x] `VisuallyHidden`, `SkipLink`

### 1.7 Documentation & guardrails

- [x] `/design-system` route: every token, scale, and component state on one page. `noindex`, and 404 in production
- [x] `docs/design-system.md` — usage rules, do/don't, when to add a new token
- [x] `npm run lint:tokens` fails on raw hex, `rgb()`/`hsl()`, arbitrary px values, **and** `var()` references to tokens that no longer exist (this last check caught a real dangling-token bug)
- [x] Focus-visible styling applied globally
- [ ] Verified by keyboard on every interactive primitive — needs a foreground browser

### Exit criteria

- [x] `/design-system` renders every token and component state; computed styles verified against the token values
- [x] Zero hard-coded colours or spacing outside the token files
- [ ] Reduced-motion enabled → page is fully static and fully readable. Token kill-switch is in place; **not yet observed in a real browser**
- [ ] Axe reports zero violations on `/design-system` — not yet run
- [x] `/design-system` returns 404 in production and 200 when `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true` — verified against a real production build

---

## Phase 2 — App shell

- [x] Root layout: `lang="en-GB"`, Typekit preconnect + stylesheet, `<SkipLink>`, nav/footer shell
- [x] `Navigation` — Home / What's On / About / Beliefs / Connect + `Donate` button
    - [x] Mobile drawer: native `<dialog>` (focus trap, `Esc`, inert background from the platform) + body scroll lock, right-pinned slide on the motion tokens
    - [x] Active-route state (centre-out underline, `aria-current`); drawer closes on any navigation, including back/forward
    - [ ] Scroll-aware background transition — built, but **unverified**: the preview pane runs backgrounded so `requestAnimationFrame` never fires
- [x] `Footer` — four link groups on `surface-inverse`; 5 policy PDFs copied into `public/assets/pdf` and serving
- [x] `error.tsx`, `not-found.tsx`, `loading.tsx`
- [ ] `Dialog` provider (replaces old `ModalContext`) — deferred to Phase 3. Forms now use inline `FormStatus`, so the only remaining consumer is the enlargeable feature image, which the Feature slice introduces
- [x] Responsive check at 375px and 1280px
- [ ] Remaining breakpoints (500 / 750 / 1150 / 1350 / 1500) — worth a pass once real page content exists in Phase 4

**Exit criteria:** shell navigable at every breakpoint, keyboard-only, with reduced motion on.

---

## Phase 3 — Prismic content model

- [x] Connected repo **`de628675`**. `9yoxbcr3` turned out to be on the Legacy Builder, which the CLI can't drive; it had 0 documents, so a fresh Type Builder repo was cheaper than migrating
- [x] `@prismicio/client`, `@prismicio/next`, `@prismicio/react` installed
- [x] `src/prismicio.ts` — client, route resolver (`home` → `/`, everything else → `/:uid`), cache tags
- [x] Preview + `draftMode` routes (`/api/preview`, `/api/exit-preview`)
- [x] Revalidation webhook (`/api/revalidate`) — constant-time secret check, fails closed when the secret is unset
- [x] Model authored as `scripts/prismic-model.sh` — every `prismic` CLI call, re-runnable
- [x] **Custom types** pushed: `settings`, `page`, `team_member`, `event`
    - [x] `settings` (singleton) — site name, nav links, footer groups, socials, contact email, default SEO/OG
    - [x] `page` (repeatable) — UID, SEO fields, slice zone
    - [x] `team_member` (repeatable) — name, role, bio rich text, photo, order
    - [x] Beliefs modelled as a repeatable group inside the `beliefs_list` slice, not a document type
    - [x] `event` (repeatable) — title, summary, date/time, location, labelled detail rows, body, poster + share image, **expiry datetime** (ports the old `timeout` behaviour that auto-hides past events), CTA
- [x] **Slice library** — 12 slices pushed and built as React components
    - [x] `PageHeader` — title (with accent-styled span), intro rich text
    - [x] `Feature` — image/slideshow + text + buttons, alternating alignment, optional enlargeable image
    - [x] `ContentGrid` — heading + intro + N cells (title / subtitle / body)
    - [x] `TeamGrid` — pulls `team_member` documents
    - [x] `BeliefsList` — numbered statement list
    - [x] `RichText`
    - [x] `CallToAction`
    - [x] `EventCard` — respects expiry
    - [x] `InfoList` — labelled detail rows (When / Where / Cost / Length), as used on ESOL
    - [x] `MapEmbed` — lazy-loaded Google Maps iframe, click-to-load placeholder
    - [x] `ImagePoster` — full-bleed poster image
    - [x] `ContactForm` — form embed slice
- [x] Every slice consumes Phase 1 primitives only — enforced by `lint:tokens`
- [ ] Render each slice against sample content — **nothing has been seen rendered yet**; the repository has no documents

**Exit criteria:** each slice renders correctly in Slice Simulator from mock data, at all breakpoints.

---

## Phase 4 — Core pages

- [x] `/` — Home, driven by the `home` document
- [x] `/whats-on` — Calendar, Prayer meetings, Sundays, Cell groups, Life skills course
- [x] `/about` — "Our story (in brief)" + team grid
- [x] `/beliefs` — UCCF / FIEC framing + 10 statements
- [x] `[uid]` catch-all driven by the `page` type, so new pages need no code
- [x] `/whats-on/:uid` — driven by the `event` type, with a summary block on `/whats-on` itself, both present only while an event is live. See [`docs/events.md`](docs/events.md)
- [x] Per-page metadata from Prismic (`generateMetadata`)
- [x] All copy pulled verbatim from the CRA source, including typographic apostrophes

**Exit criteria:** all four pages content-complete from Prismic; Lighthouse ≥ 95 across the board on each.

> **Blocked:** the 12 migrated documents are unpublished, so no page renders yet.

---

## Phase 5 — Forms & server routes

- [x] `/connect` — first name, last name, email, message. Client and server run the same validation from one shared module
- [x] `/donate` — same component, separate recipient and subject via a `variant` prop
- [x] Replaced both Netlify Functions with one route handler at `/api/contact`
- [x] reCAPTCHA v3 verified server-side — success, score ≥ 0.5, and action match. The old site minted a token and never checked it, which made it decorative
- [x] Mail delivery: Gmail app-password via Nodemailer, behind a `sendMail()` adapter
- [x] Donate stays a contact form. **No Stripe** — no checkout, no webhook
- [x] Honeypot (answers 200 so bots get no signal) + best-effort per-IP rate limit, 5/min
- [x] Success and error as inline `FormStatus`, replacing the old modal-then-redirect-home that threw away the visitor's place
- [x] Env vars documented in `.env.example`
- [x] Set on Netlify: `GMAIL_USER`, `GMAIL_PASS`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`
- [ ] `PRISMIC_WEBHOOK_SECRET` — set when the webhook is registered (Phase 9)
- [ ] `NEXT_PUBLIC_SITE_URL` — deliberately unset until DNS cutover, so preview builds advertise their own URL and `robots.txt` keeps them out of the index
- [x] Gmail SMTP auth verified for `hello@vpcc.church` (connection only — nothing sent)
- [x] End-to-end send from `localhost` — `POST /api/contact` 200, reCAPTCHA passed, mail accepted by Gmail
- [ ] End-to-end send from the deployed site — 403, reCAPTCHA rejected: `vpcc-v1.netlify.app` is not on the key's allowed-domain list

**Exit criteria:** both forms deliver end-to-end on a Netlify deploy preview; bad input, bot input, and provider failure all handled visibly.

---

## Phase 6 — Secondary & campaign pages

- [x] `/esol` — **retired**. 301 to `/whats-on`
- [x] `/art-course` — **retired**. 301 to `/whats-on`
- [x] `/art-course-exhibition` — **retired**. 301 to `/whats-on`
- [x] Kids — **dropped**. Never existed as more than a stub
- [ ] Confirm no bespoke page-level CSS was introduced; anything reusable is promoted to a slice

---

## Phase 7 — Assets, SEO, analytics, a11y, performance

**Assets**

- [x] Photography migrated into Prismic (11 images); PDFs and icons stay in `public/`
- [ ] Re-export images at correct dimensions; AVIF/WebP via `next/image`
- [ ] Decide whether the existing filtered/duotone photo treatment is retained, and if so make it a CSS layer rather than baked-into-file
- [x] Policy PDFs copied to `public/assets/pdf` and the Google Docs safeguarding link carried over
- [x] Favicon, apple-touch-icon and `manifest.ts` wired up
- [ ] Raster favicon fallback (`.ico`/PNG) for clients that don't take SVG

**SEO**

- [x] Metadata API defaults + per-page overrides; `metadataBase` so canonicals and OG URLs are absolute
- [x] `sitemap.ts` (from published Prismic pages, via the route resolver) and `robots.ts` (deploy previews disallow everything)
- [x] JSON-LD `Church`, driven by the settings document
- [x] JSON-LD `Event` on each event page, plus `/whats-on/:uid` in the sitemap while an event is live
- [ ] New OG + Twitter images matching the redesign
- [x] Paths for `/whats-on`, `/about`, `/beliefs`, `/connect`, `/donate` are unchanged, so no redirect is needed
- [x] `/esol`, `/art-course`, `/art-course-exhibition` — retired, 301 to `/whats-on` in `netlify.toml`
- [x] `/events` and `/events/*` — 301 to `/whats-on` and `/whats-on/:splat`, because a printed QR code points at one of them

**Analytics**

- [x] GA4 `G-6YS7D18ZT5` via `next/script` (`afterInteractive`), loaded only after consent
- [x] Consent banner built. GA sets non-essential cookies, so under UK PECR it needs consent before loading — declining means the tag is never fetched
- [ ] Have someone confirm the banner wording is acceptable to the church

**Accessibility**

- [ ] Keyboard pass on every page; visible focus throughout
- [ ] Screen-reader pass on nav, forms, slideshow, dialog
- [ ] Reduced-motion pass
- [ ] Colour-contrast re-check on real page compositions
- [ ] Axe clean sitewide

**Performance**

- [x] Blur-up placeholders on every Prismic image, fetched from imgix at 16px and inlined as a data URI (`lib/image-placeholder.ts`); `priority` on the page's lead image only
- [ ] Font-loading strategy verified (no FOIT, minimal CLS from the Typekit `<link>`)
- [ ] Lighthouse ≥ 95 mobile on every route
- [ ] CLS < 0.05, LCP < 2.0s on 4G throttle
- [ ] Bundle audit — client components only where genuinely interactive

---

## Phase 8 — Content migration

- [ ] Create `settings` document (nav, footer, socials, SEO defaults)
- [ ] Enter Home, What's On, About, Beliefs page documents
- [ ] Enter 5 team members: Ben Virgo, Gil Virgo, Isaiah Jagdeo, Beth Jagdeo, Rachel Virgo
- [ ] Enter 10 belief statements
- [ ] Enter ESOL / Art Course / Exhibition pages
- [ ] Proofread against the old site — copy, apostrophes, external links, PDF links
- [ ] Verify every outbound link resolves (FIEC, UCCF, CAP, LCM, Union, Christian Heritage London, maps, calendar, socials)
- [ ] Hand editors a short "how to update the site" doc

---

## Phase 9 — Launch

- [x] Netlify site created. The live site is the `vpcc-website` project (`88c9ff4a…`) serving https://vpcc.church; the original `vpcc-v1` project is now orphaned and wants decommissioning
- [x] GitHub repo connected in the Netlify UI — a push to `main` deploys itself
- [x] Env vars set in Netlify (see Phase 5 for the two deliberately still unset)
- [x] reCAPTCHA working on vpcc.church, verified against Google's siteverify end to end. The score threshold had to come down to 0.3: a new key scores nearly everyone 0.3, and 0.5 rejected every human. Raise it once the key has traffic history — accepted submissions log their score
- [x] `PRISMIC_WEBHOOK_SECRET` set and `/api/revalidate` verified (401 without it, 200 with)
- [x] Prismic webhook registered — `Netlify revalidate` → `https://vpcc.church/api/revalidate`, enabled, secret set, triggers `documentsPublished` + `documentsUnpublished`
- [ ] Cross-browser: Safari (macOS + iOS), Chrome, Firefox, Android Chrome
- [ ] Real-device check on a small phone (≤375px wide)
- [ ] Redirect map tested against the live URL list
- [ ] Stakeholder review + sign-off
- [ ] DNS cutover for `vpcc.church` (leave `calendar.vpcc.church` untouched)
- [ ] HTTPS + HSTS confirmed; security headers set
- [x] Form delivery: a live submission returns 200 and nodemailer accepts it; confirm the mail actually lands in `gil@vpcc.church`
- [ ] Post-launch: 404 monitoring, GA traffic sanity check
- [ ] Archive the CRA repo, note the cutover date in its README

---

## Appendix A — Content inventory (carried over)

**Routes:** `/` · `/whats-on` · `/about` · `/beliefs` · `/connect` · `/donate` · `/esol` · `/art-course` · `/art-course-exhibition`

**Nav:** Home · What's On · About · Beliefs · Connect · **Donate** (button)

**Home features:** Sundays · What's on? · About us · What we believe · Connect with us
— plus time-limited event features that auto-expire.

**What's On features:** Calendar · Prayer meetings · Sundays · Cell groups · Life skills course

**About:** "Our story (in brief)" narrative + team grid (Ben Virgo — Lead Pastor; Gil Virgo — Pastor; Isaiah Jagdeo — Safeguarding Lead; Beth Jagdeo — Lead Kids Worker; Rachel Virgo — Life-Skills Coach)

**Beliefs:** UCCF doctrinal basis + FIEC doctrinal basis & ethos statements framing, then 10 statements

**Footer**

- _Connect_ — `@vpcc.church` (Instagram), Facebook, `hello@vpcc.church`
- _Legal_ — Safeguarding Policy (Google Doc), Complaint, Conflict of Interest, Data Protection & Privacy, Financial Management, Serious Incident Reporting (PDFs)
- _Quick Links_ — Calendar (`calendar.vpcc.church`), Donate
- _Associated Organisations_ — FIEC, Christian Heritage London

**Key facts:** Sundays 3:00–4:30pm, Victoria Park Baptist Church, 186 Grove Road, London E3 5TG. Secondary venue: 17 Lark Row, London E2 9JA. Founded 2011.

---

## Appendix B — Decisions

Resolved 2026-07-24:

- **Typekit `ccy7tqi`** — confirmed configured and domain-allowed.
- **Serif accent** — tried `ivyora-text`, rejected on sight (2026-07-24). Single family: Area Inktrap only. Two-tone headings are a weight contrast instead.
- **`#0B0C17`** — text and footer colour only. No inverse theme, no dark mode.
- **Stripe** — not used. Donate remains a contact form.
- **Forms** — Next Route Handlers. Gmail app-password sending retained, behind an adapter.
- **Prismic** — existing repo `9yoxbcr3`.

---

## Open Questions (non-blocking — answer before the phase that needs them)

| #     | Question                                                                                                                                                  | Needed by |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| ~~1~~ | ~~Kids page~~ — dropped                                                                                                                                   | —         |
| 2     | **Photography** — reuse existing filtered/duotone images, or is new photography coming? If reusing, is the filter part of the brand or a legacy artefact? | Phase 7   |
| ~~3~~ | ~~Analytics~~ — GA4, behind a consent banner                                                                                                              | —         |
| 4     | **Content scope** — anything added or retired during the rebuild, or strictly a redesign of existing content?                                             | Phase 8   |
| 5     | **Launch date** — drives how much of Phases 6–7 is v1 vs. fast-follow.                                                                                    | Phase 9   |
