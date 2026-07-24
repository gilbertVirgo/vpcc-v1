# VPCC Redesign — Build Plan

Rebuild of [vpcc.church](https://vpcc.church) on Next.js + Prismic + Netlify.
Visual language: **neutral, minimal, clean**. Motion: **smooth, subtle, restrained**.
Textual content is largely carried over from the existing CRA app (`~/vpcc-cra`).

**How to use this doc:** work top to bottom. Tick each box as it lands. Do not start a
phase until the previous phase's "Exit criteria" are all ticked.

---

## Foundations (fixed decisions)

| | |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) over a CSS-custom-property token layer |
| CMS | Prismic (Slice Machine) |
| Host | Netlify (`@netlify/plugin-nextjs`) |
| Fonts | **Area Inktrap** 500/700 (primary) + **Ivyora Text** 400/700 (serif accent), via Adobe Fonts `https://use.typekit.net/ccy7tqi.css` |
| Primary | `#FF9035` |
| Light | `#FCFCF5` |
| Dark | `#0B0C17` |

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
- [x] Define `--font-sans: "area-inktrap", <system fallback>` and `--font-serif: "ivyora-text", <serif fallback>`
- [ ] Metric-adjusted fallback faces (`size-adjust`, `ascent-override`) to cut CLS on first paint — needs the real font metrics measured first
- [x] Fluid modular type scale using `clamp()` — `display / h1 / h2 / h3 / body-lg / body / body-sm / caption / overline`
- [x] Area Inktrap has only 500 and 700: 500 = body + most headings, 700 = emphasis. Weight scale restricted to the weights that exist; `font-synthesis` off. Both families ship real italics, so no faux italic is needed
- [x] Ivyora Text (400/700) is the **accent serif only** — heading fragments, pull quotes. Never body copy. Ports the old `.serif` span treatment
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
- [ ] Page-transition treatment (App Router `template.tsx` or view transitions) — short cross-fade, no slide. Deferred to Phase 2, where the shell and real routes exist
- [x] Hover/focus/press micro-interactions defined once on the Button/Link primitives

### 1.6 Component primitives

- [x] `Button` — variants `primary / secondary / ghost / link`, sizes `sm / md / lg`, renders as `<button>` or `<Link>`/`<a>` by prop, loading + disabled states
- [x] `Link` (inline text link, underline offset, hover transition)
- [x] `Heading` / `Text` (scale-bound, polymorphic `as`)
- [x] `Section` / `Container` / `Grid` / `Stack`
- [x] `Card`
- [x] `Media` — wraps `next/image`, enforces an aspect-ratio box so images reserve space before load
- [ ] Blur placeholders — needs real assets; wire up with Prismic imagery in Phase 3
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

---

## Phase 2 — App shell

- [ ] Root layout: html lang, font links, `<SkipLink>`, global providers
- [ ] `Navigation` — Home / What's On / About / Beliefs / Connect + `Donate` button
  - [ ] Mobile drawer: focus trap, body scroll lock, `Esc`, animated with Phase 1 motion tokens
  - [ ] Active-route state; scroll-aware background transition
- [ ] `Footer` — four link groups: **Connect**, **Legal**, **Quick Links**, **Associated Organisations** (content in Appendix A)
- [ ] `error.tsx`, `not-found.tsx`, `loading.tsx`
- [ ] `Dialog` provider (replaces old `ModalContext`)
- [ ] Responsive pass across all five breakpoints

**Exit criteria:** shell navigable at every breakpoint, keyboard-only, with reduced motion on.

---

## Phase 3 — Prismic content model

- [ ] Connect existing Prismic repo `9yoxbcr3` (`https://9yoxbcr3.cdn.prismic.io/api/v2`); add `@prismicio/client`, `@prismicio/next`, `slice-machine-ui`
- [ ] `prismicio.ts` client + route resolver; link resolver for internal/external/asset links
- [ ] Draft preview + Next.js `draftMode`; on-demand revalidation webhook → Netlify
- [ ] **Custom types**
  - [ ] `settings` (singleton) — site name, nav links, footer groups, socials, contact email, default SEO/OG
  - [ ] `page` (repeatable) — UID, SEO fields, slice zone
  - [ ] `team_member` (repeatable) — name, role, bio rich text, photo, order
  - [ ] `belief` (repeatable) *or* a repeatable group inside a `beliefs_list` slice — decide, don't do both
  - [ ] `event` (repeatable) — title, date/time, location, body, image, **expiry datetime** (ports the old `timeout` behaviour that auto-hides past events)
- [ ] **Slice library**
  - [ ] `PageHeader` — title (with accent-styled span), intro rich text
  - [ ] `Feature` — image/slideshow + text + buttons, alternating alignment, optional enlargeable image
  - [ ] `ContentGrid` — heading + intro + N cells (title / subtitle / body)
  - [ ] `TeamGrid` — pulls `team_member` documents
  - [ ] `BeliefsList` — numbered statement list
  - [ ] `RichText`
  - [ ] `CallToAction`
  - [ ] `EventCard` — respects expiry
  - [ ] `InfoList` — labelled detail rows (When / Where / Cost / Length), as used on ESOL
  - [ ] `MapEmbed` — lazy-loaded Google Maps iframe, click-to-load placeholder
  - [ ] `ImagePoster` — full-bleed poster image
  - [ ] `ContactForm` — form embed slice
- [ ] Every slice consumes Phase 1 primitives only. No slice-local styling escape hatches
- [ ] `slicesimulator` route + mock content for each slice

**Exit criteria:** each slice renders correctly in Slice Simulator from mock data, at all breakpoints.

---

## Phase 4 — Core pages

- [ ] `/` — Home: Sundays · What's On · About us · What we believe · Connect with us (+ time-limited event feature at top)
- [ ] `/whats-on` — Calendar link, Prayer meetings, Sundays, Women's breakfast, Cell groups, Life skills course
- [ ] `/about` — "Our story (in brief)" + Our team grid
- [ ] `/beliefs` — UCCF / FIEC framing paragraph + 10 belief statements
- [ ] `[uid]` catch-all driven by the `page` type, so new pages need no code
- [ ] Per-page metadata from Prismic (`generateMetadata`)
- [ ] All copy pulled verbatim from Appendix A / the CRA source, including typographic apostrophes

**Exit criteria:** all four pages content-complete from Prismic; Lighthouse ≥ 95 across the board on each.

---

## Phase 5 — Forms & server routes

- [ ] `/connect` — first name, last name, email, message. Client + server validation
- [ ] `/donate` — same shape, separate handler and recipient
- [ ] Move `netlify/functions/submitContactForm` + `submitDonateForm` to Next Route Handlers (`app/api/*/route.ts`)
- [ ] reCAPTCHA v3 — token minted client-side, **verified server-side** (score threshold + action check)
- [ ] Mail delivery: Gmail app-password via Nodemailer. Isolate behind a `sendMail()` adapter so swapping to Resend/Postmark later is a one-file change
- [ ] Donate stays a contact form. **No Stripe** — no checkout, no webhook
- [ ] Honeypot field + per-IP rate limit
- [ ] Success / error states as inline `FormStatus`, not a modal-then-redirect-home (the current flow loses the user)
- [ ] Env vars documented in `.env.example` and set in Netlify UI. **No secrets committed**
- [ ] Manual send test against a real inbox before sign-off

**Exit criteria:** both forms deliver end-to-end on a Netlify deploy preview; bad input, bot input, and provider failure all handled visibly.

---

## Phase 6 — Secondary & campaign pages

- [ ] `/esol` — rebuilt from `PageHeader` + `ImagePoster` + `InfoList` + `CallToAction` + `MapEmbed` slices
- [ ] `/art-course`
- [ ] `/art-course-exhibition`
- [ ] Kids — currently an empty stub. Build or drop (see Open Questions)
- [ ] Confirm no bespoke page-level CSS was introduced; anything reusable is promoted to a slice

---

## Phase 7 — Assets, SEO, analytics, a11y, performance

**Assets**
- [ ] Migrate photography into Prismic; keep static PDFs and icons in `public/`
- [ ] Re-export images at correct dimensions; AVIF/WebP via `next/image`
- [ ] Decide whether the existing filtered/duotone photo treatment is retained, and if so make it a CSS layer rather than baked-into-file
- [ ] Migrate the 7 policy PDFs and the Google Docs safeguarding link
- [ ] New favicon set, `apple-touch-icon`, `manifest.json`, `theme-color: #FF9035`

**SEO**
- [ ] Metadata API defaults + per-page overrides; canonical URLs
- [ ] `sitemap.ts`, `robots.ts`
- [ ] JSON-LD: `Church` / `Organization` + `Event` for dated events
- [ ] New OG + Twitter images matching the redesign
- [ ] **301 redirects for every existing URL** — `/whats-on`, `/about`, `/beliefs`, `/connect`, `/donate`, `/esol`, `/art-course`, `/art-course-exhibition`

**Analytics**
- [ ] Re-add GA4 `G-6YS7D18ZT5` via `next/script` (`afterInteractive`), or replace with a cookieless alternative
- [ ] Confirm cookie-banner obligation given the analytics choice

**Accessibility**
- [ ] Keyboard pass on every page; visible focus throughout
- [ ] Screen-reader pass on nav, forms, slideshow, dialog
- [ ] Reduced-motion pass
- [ ] Colour-contrast re-check on real page compositions
- [ ] Axe clean sitewide

**Performance**
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

- [ ] Netlify site created; branch deploys + deploy previews on
- [ ] Env vars set in Netlify (production + preview contexts)
- [ ] Prismic webhook → Netlify build/revalidate, verified
- [ ] Cross-browser: Safari (macOS + iOS), Chrome, Firefox, Android Chrome
- [ ] Real-device check on a small phone (≤375px wide)
- [ ] Redirect map tested against the live URL list
- [ ] Stakeholder review + sign-off
- [ ] DNS cutover for `vpcc.church` (leave `calendar.vpcc.church` untouched)
- [ ] HTTPS + HSTS confirmed; security headers set
- [ ] Post-launch: 404 monitoring, GA traffic sanity check, form-delivery check
- [ ] Archive the CRA repo, note the cutover date in its README

---

## Appendix A — Content inventory (carried over)

**Routes:** `/` · `/whats-on` · `/about` · `/beliefs` · `/connect` · `/donate` · `/esol` · `/art-course` · `/art-course-exhibition`

**Nav:** Home · What's On · About · Beliefs · Connect · **Donate** (button)

**Home features:** Sundays · What's on? · About us · What we believe · Connect with us
— plus time-limited event features that auto-expire.

**What's On features:** Calendar · Prayer meetings · Sundays · Women's breakfast · Cell groups · Life skills course

**About:** "Our story (in brief)" narrative + team grid (Ben Virgo — Lead Pastor; Gil Virgo — Pastor; Isaiah Jagdeo — Safeguarding Lead; Beth Jagdeo — Lead Kids Worker; Rachel Virgo — Life-Skills Coach)

**Beliefs:** UCCF doctrinal basis + FIEC doctrinal basis & ethos statements framing, then 10 statements

**Footer**
- *Connect* — `@vpcc.church` (Instagram), Facebook, `ben@vpcc.church`
- *Legal* — Safeguarding Policy (Google Doc), Complaint, Conflict of Interest, Data Protection & Privacy, Financial Management, Serious Incident Reporting (PDFs)
- *Quick Links* — Calendar (`calendar.vpcc.church`), Donate
- *Associated Organisations* — FIEC, Christian Heritage London

**Key facts:** Sundays 3:00–4:30pm, Victoria Park Baptist Church, 186 Grove Road, London E3 5TG. Secondary venue: 17 Lark Row, London E2 9JA. Founded 2011.

---

## Appendix B — Decisions

Resolved 2026-07-24:

- **Typekit `ccy7tqi`** — confirmed configured and domain-allowed.
- **Serif accent** — `ivyora-text` (400, 700) added to the kit. Accent use only.
- **`#0B0C17`** — text and footer colour only. No inverse theme, no dark mode.
- **Stripe** — not used. Donate remains a contact form.
- **Forms** — Next Route Handlers. Gmail app-password sending retained, behind an adapter.
- **Prismic** — existing repo `9yoxbcr3`.

---

## Open Questions (non-blocking — answer before the phase that needs them)

| # | Question | Needed by |
|---|---|---|
| 1 | **Kids page** — build it out, or drop it? Currently a one-line stub. | Phase 6 |
| 2 | **Photography** — reuse existing filtered/duotone images, or is new photography coming? If reusing, is the filter part of the brand or a legacy artefact? | Phase 7 |
| 3 | **Analytics** — keep GA4 `G-6YS7D18ZT5`, or move to something cookieless and skip the consent banner? | Phase 7 |
| 4 | **Content scope** — anything added or retired during the rebuild, or strictly a redesign of existing content? | Phase 8 |
| 5 | **Launch date** — drives how much of Phases 6–7 is v1 vs. fast-follow. | Phase 9 |
