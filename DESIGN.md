# VPCC design system — agent reference

A precise, rules-first spec for coding agents (and humans in a hurry) working on
this repo. It says **what to write**. For **why** each rule exists, see
[`docs/design-system.md`](docs/design-system.md).

**Visual language:** neutral, minimal, clean. **Motion:** smooth, subtle,
restrained. If a choice makes the page louder, it's probably wrong.

**Sources of truth, in order:** `src/styles/tokens.*.css` → `src/components/ui/*`
→ this file. If they disagree, the code wins. Fix this file in the same change.

---

## 1. Hard rules

Breaking a **MUST** is a bug. `npm run check` catches some of them; review
catches the rest.

### MUST

1. Use **semantic colour tokens** only: `bg-surface`, `text-ink-muted`,
   `border-line`.
2. Build with the **primitives** in `src/components/ui/` before you write raw
   markup. Add a variant before you add a component.
3. Put every page band in `<Section>` and every page-width frame in
   `<Container>`. `Container` owns the horizontal gutter.
4. Choose the heading **level** (`as`) for the document outline. Choose the
   **size** for the layout. The two are independent.
5. Use one `h1` per page. On CMS pages the `PageHeader` slice renders it, and
   every other slice heading is an `h2`.
6. Underline inline links (`<Link variant="inline">` or `Prose` does this).
7. Wrap every form control in `<Field>`. `Toggle` is the one exception because
   it labels itself.
8. Give every page `<main id="main">`. `SkipLink` targets it.
9. Animate only `transform`/`translate`/`scale`, `opacity`, `filter` and
   colours. Use the duration and easing utilities from the motion tokens.
10. Run `npm run check` before committing: typecheck, ESLint, token guard and
    Prettier.

### MUST NOT

1. Use **raw ramp steps** in components: `bg-neutral-100`, `text-primary-600`.
   The ramps exist only for the semantic layer to point at.
2. Use **raw colour literals**: `#fff`, `rgb()`, `hsl()`. The guard fails the
   build.
3. Use **arbitrary pixel values** like `mt-[13px]` or `w-[320px]`. The guard
   fails the build. Use the spacing scale or add a token.
4. Write `var(--token)` references to tokens that don't exist. The guard fails
   the build because CSS would fall back silently.
5. Use orange as text, except `text-ink-accent`. `accent` (`#FF9035`) is a
   **fill** and fails contrast as text (2.19:1).
6. Use `text-ink-accent` on a dark band. It drops to 3.91:1 there, which fails
   AA. Use `text-ink-inverse`.
7. Use font weights other than `font-medium` (500) and `font-bold` (700). The
   others don't exist (`font-light`, `font-semibold`, `font-black`). Area
   Inktrap ships no other weights, and synthesis is off.
8. Add a second typeface, a dark mode, or shadows for depth. Depth is a hairline
   `border-line`.
9. Set page-level `px-*` / `padding-inline` anywhere except `Container`. It
   doubles the gutter.
10. Write your own `prefers-reduced-motion` media query or `matchMedia` call.
    Reduced motion is handled once, at the token layer. `Slideshow` is the only
    exception.
11. Add loops, bounces or overshoot easing. The button spinner is the only
    exception.
12. Add a route-level `loading.tsx`. It silently kills hydration of all page
    content (see `docs/decisions.md`).
13. Fake a link with an `onClick`, or fake a button with an `<a>`. `<Button>`
    renders the right element from `href`.

Genuine one-offs can escape the guard with a `design-tokens-ignore` comment on
the same line. Treat that as a last resort and justify it in the comment.

---

## 2. Stack and files

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 (CSS-first
`@theme`) · Prismic (slices) · Netlify. Code style: tabs and double quotes.
Prettier sorts the Tailwind classes. Use the `@/` path alias.

| File                               | Holds                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `src/styles/tokens.color.css`      | Ramps + semantic colours                                                    |
| `src/styles/tokens.typography.css` | Font family, type scale, weights, measure                                   |
| `src/styles/tokens.layout.css`     | Spacing, sections, gutter, breakpoints, containers, radii, shadows, z-index |
| `src/styles/tokens.motion.css`     | Durations, easings, reveal, reduced-motion switch                           |
| `src/styles/base.css`              | Element defaults, focus ring, `.font-accent`                                |
| `src/styles/utilities.css`         | Custom utilities, `<dialog>` styling, reveal mechanics                      |
| `src/components/ui/`               | Primitives (barrel: `@/components/ui`)                                      |
| `src/components/motion/reveal.tsx` | `Reveal`, `Stagger`                                                         |
| `src/components/prismic/`          | Rich-text and link bridges from Prismic to the primitives                   |
| `src/slices/`                      | CMS slices (each has `model.json` + `index.tsx`)                            |
| `src/lib/cn.ts`                    | `cn()`, which is `clsx` + `tailwind-merge` taught this system's scales      |
| `scripts/check-design-tokens.mjs`  | Token guard (`npm run lint:tokens`)                                         |
| `scripts/generate-color-ramps.mjs` | Ramp generator (`npm run tokens:colors`)                                    |

The live reference for every token and component state is **`/design-system`**
(`npm run dev`, then <http://localhost:3000/design-system>). It 404s in
production unless `NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true`.

Tailwind's default palette, type scale, font weights, radii, shadows,
breakpoints, containers and easings are **all removed** (`--*: initial`). A
stock class like `text-lg`, `bg-gray-100`, `rounded-xl`, `shadow-md` or
`ease-in-out` either emits nothing or fails. Use only the names below.

---

## 3. Colour

Brand seeds: primary `#FF9035`, light `#FCFCF5`, dark `#0B0C17`. Never type
these into a component.

### Semantic tokens (use these)

Each token works as `bg-*`, `text-*`, `border-*`, `decoration-*` and so on.

| Token                         | Value              | Use                                                    | Contrast on `surface`   |
| ----------------------------- | ------------------ | ------------------------------------------------------ | ----------------------- |
| `surface`                     | neutral-50         | Page background (warm paper)                           | —                       |
| `surface-raised`              | pure white         | Cards that lift, form controls                         | —                       |
| `surface-sunken`              | neutral-100        | Quiet bands, hover fills, image placeholders           | —                       |
| `surface-inverse`             | neutral-950        | Dark bands, footer. Not a theme                        | —                       |
| `ink`                         | neutral-950        | Headings, primary text                                 | 18.89:1                 |
| `ink-secondary`               | neutral-700        | Body copy in `Prose`, secondary text                   | 8.95:1                  |
| `ink-muted`                   | neutral-600        | Meta, hints, captions. **The floor for body text**     | 6.05:1                  |
| `ink-inverse`                 | neutral-50         | All text on `surface-inverse`                          | 18.89:1 on inverse      |
| `ink-accent`                  | primary-700        | **The only orange allowed as text** (links, overlines) | 4.83:1                  |
| `line`                        | neutral-200        | Default hairline: cards, dividers                      | —                       |
| `line-strong`                 | neutral-300        | Control borders, link underlines, hover borders        | —                       |
| `line-inverse`                | white @ 16%        | Hairlines on dark bands                                | —                       |
| `accent`                      | primary-500        | **Fill only**: primary button, active dot, selection   | 2.19:1 (as text, fails) |
| `accent-hover`                | primary-400        | Hover fill (lighter, so the label's contrast improves) | —                       |
| `accent-pressed`              | primary-600        | Active/pressed fill                                    | —                       |
| `accent-contrast`             | neutral-950        | Label on an `accent` fill                              | 8.61:1 on accent        |
| `accent-subtle`               | primary-100        | Pale wash: `Notice`, accent `Badge`                    | —                       |
| `focus-ring`                  | primary-600        | Focus outline (set globally)                           | —                       |
| `success` / `success-surface` | green / pale green | Success border / fill                                  | —                       |
| `danger` / `danger-surface`   | red / pale red     | Error text and border / fill                           | —                       |

Plus `transparent` and `current`. Opacity modifiers are fine on semantic
tokens, for example `hover:bg-ink-inverse/10` or `bg-surface-raised/90`.

### Allowed text-on-surface pairs

| Surface                                                        | Text tokens                                                                             |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `surface`, `surface-raised`, `surface-sunken`, `accent-subtle` | `ink`, `ink-secondary`, `ink-muted`, `ink-accent`                                       |
| `surface-inverse`                                              | `ink-inverse` only. Footer meta text may use `opacity-60`/`opacity-70` on `ink-inverse` |
| `accent`                                                       | `accent-contrast` only                                                                  |
| `success-surface` / `danger-surface`                           | `ink`, `ink-secondary`                                                                  |

There is **no dark mode**. Don't add `dark:` variants.

### Changing colours

Don't hand-edit ramp values. Edit `scripts/generate-color-ramps.mjs` and run
`npm run tokens:colors`, which prints the CSS and a contrast table. To add a
semantic token, add it to `tokens.color.css` **and** to `COLORS` in
`src/lib/cn.ts`.

---

## 4. Typography

**Area Inktrap**, weights 500 and 700, roman and italic. It is the only family
(`font-sans`). It loads from Adobe Fonts kit `ccy7tqi`. Emphasis comes from
weight, size and colour, never from a second face.

### Scale (fluid between 375px and 1500px viewports)

| Class           | Size (min → max) | Line height | Weight | Tracking | Use                                             |
| --------------- | ---------------- | ----------- | ------ | -------- | ----------------------------------------------- |
| `text-display`  | 44 → 96px        | 0.95        | 700    | −0.03em  | Home hero only                                  |
| `text-h1`       | 36 → 64px        | 1.02        | 700    | −0.025em | Page title                                      |
| `text-h2`       | 28 → 44px        | 1.08        | 700    | −0.02em  | Section titles                                  |
| `text-h3`       | 22 → 30px        | 1.2         | 700    | −0.015em | Sub-sections, dialog title, `h2` in `Prose`     |
| `text-h4`       | 18 → 22px        | 1.3         | 700    | −0.01em  | Card titles, `h3` in `Prose`                    |
| `text-body-lg`  | 18 → 21px        | 1.6         | 500    | −0.005em | Intros, lead paragraphs                         |
| `text-body`     | 16 → 18px        | 1.65        | 500    | 0        | Default body                                    |
| `text-body-sm`  | 15 → 16px        | 1.6         | 500    | 0        | Buttons, labels, nav, notices                   |
| `text-caption`  | 13 → 14px        | 1.5         | 500    | 0.005em  | Hints, errors, meta                             |
| `text-overline` | 12 → 13px        | 1.4         | 700    | 0.09em   | Eyebrows and badges. **Always add `uppercase`** |

Each `text-*` class sets size, line height, tracking **and** weight together.

**Weights:** only `font-medium` (500) and `font-bold` (700). Body defaults to 500. Headings default to 700.

**Measure:** `measure` (68ch, body), `measure-tight` (44ch), `measure-wide`
(82ch). `Prose` applies `measure` itself.

**Accent fragment:** use `<Accent>` inside a heading. It drops the fragment to
weight 500 against the heading's 700. In Prismic heading fields, italic (`em`)
maps to the same thing. Use it on a fragment only, never on a whole heading or
on body copy.

```tsx
<Heading as="h1" size="h1">
	Our story <Accent>(in brief)</Accent>
</Heading>
```

`h1`–`h6` get `text-wrap: balance` and `p` gets `text-wrap: pretty` from the
base layer.

---

## 5. Space, layout and shape

### Spacing

The base unit is 4px: `p-4` is 1rem and `gap-6` is 1.5rem. Any integer step
works. Use the steps the system already uses:

| Purpose                     | Classes                                           |
| --------------------------- | ------------------------------------------------- |
| Heading → body              | `mt-4` to `mt-6` (`mt-5` is typical)              |
| Body → buttons              | `mt-8`                                            |
| Intro block → grid of cards | `mt-12`                                           |
| Card padding                | `p-5` / `p-6 sm:p-8` / `p-8 sm:p-10` (via `Card`) |
| Grid gaps                   | `gap-6 sm:gap-8` (md), `gap-8 sm:gap-12` (lg)     |
| Button groups               | `gap-3`                                           |

### Section rhythm (vertical)

Prefer `<Section spacing>` over these utilities.

| Utility        | `Section spacing` | Value                                         |
| -------------- | ----------------- | --------------------------------------------- |
| `section-y-sm` | `sm`              | 32 → 48px top and bottom                      |
| `section-y`    | `md` (default)    | 44 → 72px top and bottom                      |
| `section-y-lg` | `lg`              | 56 → 96px top and bottom                      |
| `section-t-lg` | `header`          | 56 → 96px **top only**: a page's opening band |

These are **half-gaps**. Stacked sections add their padding together, so don't
add margins between sections.

### Gutter and containers

`gutter` (20 → 48px inline padding) comes from `Container`. Don't apply it by
hand, except inside full-bleed chrome such as the nav drawer.

| `Container size` | Max width | Use                                    |
| ---------------- | --------- | -------------------------------------- |
| `narrow`         | 544px     | Forms, a single narrow column          |
| `text`           | 704px     | Article/prose pages, `PageHeader`, CTA |
| `default`        | 1248px    | The standard page frame                |
| `wide`           | 1440px    | Near-full-bleed media                  |
| `full`           | none      | Edge to edge (gutter still applies)    |

The matching `max-w-narrow`, `max-w-text`, `max-w-default` and `max-w-wide`
classes exist. `flush` removes the gutter.

### Breakpoints (mobile-first)

| Prefix | Min width |
| ------ | --------- |
| `xs:`  | 500px     |
| `sm:`  | 750px     |
| `md:`  | 1150px    |
| `lg:`  | 1350px    |
| `xl:`  | 1500px    |

These are not Tailwind's defaults. `sm` is 750px and `md` is 1150px. The usual
two-column split happens at `sm:`.

### Radius

| Class          | Value | Use                                 |
| -------------- | ----- | ----------------------------------- |
| `rounded-none` | 0     | —                                   |
| `rounded-sm`   | 4px   | Focus ring, checkboxes              |
| `rounded-md`   | 8px   | Form controls, `FormStatus`         |
| `rounded-lg`   | 14px  | Cards, media, dialogs               |
| `rounded-pill` | pill  | Buttons, badges, icon buttons, dots |

There is no `rounded-xl` or `rounded-2xl`. Keep radii tight.

### Elevation and depth

- Depth means a **hairline border** (`border border-line`), not a shadow.
- `shadow-overlay`: dialogs and floating controls. `shadow-popover`: popovers.
  These are the only two.
- Z-index utilities: `z-sticky` (100), `z-nav` (200), `z-dropdown` (300),
  `z-overlay` (800), `z-modal` (900), `z-toast` (1000). Use these, not
  `z-[999]`.

---

## 6. Motion

| Duration utility   | Value | Use                                 |
| ------------------ | ----- | ----------------------------------- |
| `duration-instant` | 80ms  | Colour on hover                     |
| `duration-fast`    | 160ms | Small state changes, links, buttons |
| `duration-base`    | 240ms | The default; cards, dialogs         |
| `duration-slow`    | 400ms | Reveals, drawers, crossfades        |
| `duration-slower`  | 640ms | Full-page transitions               |

| Easing utility  | Curve                     | Use                    |
| --------------- | ------------------------- | ---------------------- |
| `ease-standard` | `cubic-bezier(0.2,0,0,1)` | Default for everything |
| `ease-entrance` | `cubic-bezier(0,0,0,1)`   | Things arriving        |
| `ease-exit`     | `cubic-bezier(0.3,0,1,1)` | Things leaving         |
| `ease-linear`   | linear                    | Progress only          |

The canonical hover transition is
`transition-colors duration-fast ease-standard`. Name the properties when you
mix them: `transition-[border-color,background-color,translate]`.

Movement stays small. A reveal rises 12px and an interactive card lifts with
`hover:-translate-y-0.5`. Buttons press with `active:scale-[0.98]` (already in
`Button`).

**Scroll reveals:** wrap content in `<Reveal>`. For a list or grid use
`<Stagger>`, which gives one observer per child. Inside a grid, pass
`itemClassName="h-full"` so equal-height cards stay equal. The reveal is
CSS-driven and gated on `@media (scripting: enabled)`, so no-JS visitors still
see content.

```tsx
<Stagger
	className="mt-12 grid grid-cols-1 gap-6 xs:grid-cols-2 md:grid-cols-3"
	itemClassName="h-full"
>
	{items.map((item) => (
		<Card key={item.id} className="h-full">
			…
		</Card>
	))}
</Stagger>
```

Reduced motion collapses every duration token to `0.01ms` and the reveal
distance to 0. You get it for free when you use the tokens. A looping animation
must be `motion-safe:` only.

---

## 7. Component reference

Import from `@/components/ui` (barrel) or the specific file. Every component
accepts `className`, which `cn()` merges, so a later class correctly overrides a
variant's class.

### Layout: `layout.tsx`

| Component   | Props (default **bold**)                                                                                                      | Notes                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `Section`   | `as` (**section**), `spacing`: none · sm · **md** · lg · header; `tone`: **default** · sunken · inverse; `id`                 | A page band. Owns vertical rhythm and background. `inverse` sets `text-ink-inverse` |
| `Container` | `as` (**div**), `size`: narrow · text · **default** · wide · full; `flush`                                                    | The page frame. Owns the gutter                                                     |
| `Stack`     | `direction`: **column** · row (wraps); `gap`: none · xs(2) · sm(3) · **md(5)** · lg(8) · xl(12) · 2xl(16); `align`; `justify` | Flex stack                                                                          |
| `Grid`      | `cols`: 1 · 2 · 3 · 4 · **12** (responsive presets); `gap`: none · sm · **md** · lg                                           | `3` = 1 → 2 at xs → 3 at md                                                         |

### Typography: `typography.tsx`

| Component | Props                                                                                                                                | Notes                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Heading` | `as`: h1–h6 · p · span (**h2**); `size`: display · h1 · **h2** · h3 · h4; `tone`: **primary** · secondary · muted · inverse · accent | Level and size are independent                                                                                                                                                  |
| `Text`    | `as` (**p**); `size`: lg · **md** · sm · caption · overline; `tone` (as Heading); `weight`: **medium** · bold; `measure`             | `overline` adds `uppercase`                                                                                                                                                     |
| `Accent`  | children                                                                                                                             | Weight-500 fragment inside a heading                                                                                                                                            |
| `Prose`   | `tone`: **default** · inverse                                                                                                        | For CMS rich text. Styles bare `p`, `h2`, `h3`, `ul`, `ol`, `a`, `strong` and `em`. On dark bands **pass `tone="inverse"`**; a `text-ink-inverse` className leaves links orange |

### Actions: `button.tsx`, `link.tsx`

| Component | Props                                                                                                                                      | Notes                                                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`  | `variant`: **primary** · secondary · ghost · inverse; `size`: sm (h-9) · **md** (h-11) · lg (h-13); `block`; `href`; `loading`; `download` | With `href` it renders `NextLink`, or `<a>` for external links and downloads, with `target`/`rel` set automatically. Without `href` it renders `<button type="button">`. `loading` shows a spinner and disables the button |
| `Link`    | `href`; `variant`: **inline** · standalone · inverse · muted                                                                               | Text link. External links get `_blank` + `noopener`                                                                                                                                                                        |

Use one `primary` button per group. Every other button in the group is
`secondary`; `PrismicButtonGroup` does this for you. Use `inverse` buttons and
links on `surface-inverse`.

### Surfaces: `surface.tsx`

| Component | Props                                                                                                   | Notes                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `Card`    | `as`; `tone`: **outlined** · raised · sunken · plain; `padding`: none · sm · **md** · lg; `interactive` | `rounded-lg`. `interactive` adds a hover border and a 2px lift                                |
| `Badge`   | `tone`: **accent** · neutral · outline                                                                  | Pill, overline type                                                                           |
| `Divider` | `tone`: **default** · inverse                                                                           | `<hr>` hairline                                                                               |
| `Notice`  | children (one line; bold is the emphasis)                                                               | Site-wide notice band. Rendered by `layout/site-notice.tsx`; don't reuse it for inline alerts |

### Media: `media.tsx`, `slideshow.tsx`, `icon.tsx`

| Component   | Props                                                                                                                                                           | Notes                                                                                                                                                                                                                                              |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Media`     | `ratio`: square · portrait (3/4) · **landscape** (4/3) · wide (16/9) · ultrawide (21/9) · auto; `rounded` (**true**); `sizes` (**100vw**); `blurDataURL`; `alt` | Wraps `next/image` in a ratio box. **Always pass a real `sizes`** when the image is narrower than the viewport, for example `"(min-width: 750px) 50vw, 100vw"`                                                                                     |
| `Slideshow` | `images: SlideshowImage[]`; `interval` (**5000**); `ratio`; `sizes`; `priority`                                                                                 | Crossfades, pauses on hover and focus, and has keyboard, swipe and dot controls. No autoplay under reduced motion. One image renders a plain `Media`                                                                                               |
| `Icon`      | `name`; `label` (only when the icon is a control's sole content)                                                                                                | 24px grid with a 1.75 stroke in `currentColor`; `size-6` by default. Names: `arrow-right`, `arrow-left`, `chevron-left`, `chevron-right`, `chevron-down`, `close`, `menu`, `mail`, `phone`, `pin`, `calendar`, `external`, `instagram`, `facebook` |
| `Logo`      | `className`, `title` (`@/components/brand/logo`)                                                                                                                | `currentColor`: `text-accent` on light surfaces, inherits `ink-inverse` in the footer                                                                                                                                                              |

To add an icon, add a stroked path to `PATHS` in `icon.tsx` on the 24×24 grid,
outline style. Don't add filled brand marks.

### Overlay: `dialog.tsx`

`Dialog`: `open`, `onClose`, `title` (the accessible name), `hideTitle`. It is
the native `<dialog>` with `showModal()`, so the focus trap, Esc and inert
background come from the browser. Clicking the backdrop closes it. Its width is
`min(36rem, 100vw - 2rem)`; override it with `className`. It is a client
component.

### Forms: `form.tsx` (client)

```tsx
<Field name="email" label="Email" hint="We'll only use it to reply." error={errors.email} required>
	<Input type="email" autoComplete="email" />
</Field>
<Field name="message" label="Message" required>
	<Textarea />
</Field>
<Toggle label="Keep me updated" name="updates" />
<FormStatus tone="success" title="Thanks — message sent">We'll be in touch soon.</FormStatus>
```

- `Field` supplies the `id`, `name`, `required`, `aria-invalid` and
  `aria-describedby` that `Input`, `Textarea` and `Select` read. Don't pass
  those props yourself. A control outside a `Field` throws.
- Required fields carry no marker. Optional fields show "(optional)" after
  the label, so pass `required` on every field that is required.
- The error region always renders and is hidden until it has content, so screen
  readers announce it.
- `FormStatus` shows the outcome inline. Don't open a modal and don't redirect.

### Accessibility helpers: `a11y.tsx`

`SkipLink` comes first in the root layout and targets `#main`. Use
`VisuallyHidden` (`sr-only`) for screen-reader-only text.

---

## 8. Prismic slices

Pages are slice-driven. Use the bridges in `src/components/prismic/`. Don't
render Prismic fields raw.

| Helper                                    | Use                                                                                                        |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `PrismicHeading field as size tone`       | A single-block rich-text heading. The slice picks the level; italic becomes `Accent`                       |
| `PrismicProse field tone className`       | Rich-text body inside `Prose`. Returns `null` when empty                                                   |
| `PrismicInline field`                     | Rich text flattened to spans, for one line. Inherits colour; its links underline with `decoration-current` |
| `PrismicButtonGroup buttons size variant` | Repeatable label+link rows. Skips half-filled rows. First is `primary`, the rest `secondary`               |
| `linkHref(field)`                         | Resolves a link field to an `href`, or `undefined`                                                         |
| `hasContent(field)`                       | Use this, never `field.length`. Prismic leaves an empty paragraph behind when a field is cleared           |
| `isLeadImageSlice(slices, index)`         | `true` only for the page's first image slice. Only that one gets `priority`                                |

### Slice skeleton

```tsx
import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Reveal } from "@/components/motion/reveal";
import { PrismicButtonGroup } from "@/components/prismic/link";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type ExampleProps = SliceComponentProps<Content.ExampleSlice>;

const Example: FC<ExampleProps> = ({ slice }) => (
	<Section spacing="md">
		<Container>
			<Reveal>
				<div className="measure">
					<PrismicHeading
						field={slice.primary.title}
						as="h2"
						size="h2"
					/>
					<PrismicProse field={slice.primary.body} className="mt-5" />
				</div>
				<div className="mt-8">
					<PrismicButtonGroup buttons={slice.primary.buttons} />
				</div>
			</Reveal>
		</Container>
	</Section>
);

export default Example;
```

- Slices are **server components** by default. If a slice needs
  interactivity, split it: an async server `index.tsx` prepares the data (for
  example blur placeholders via `getBlurDataURL`) and a `"use client"` body
  renders it. `Feature` is the model to follow.
- Slices are pure functions of their props. If a slice needs the current time,
  read it from `context.now` (`SliceContext`), not `Date.now()`.
- Register new slices in `src/slices/index.ts`. That file is Prismic-generated,
  so keep its format.

---

## 9. Recipes

**Dark call-to-action band**

```tsx
<Section tone="inverse">
	<Container size="text" className="text-center">
		<Heading as="h2" size="h2" tone="inverse">
			Join us on Sunday
		</Heading>
		<Prose tone="inverse" className="mx-auto mt-5">
			…
		</Prose>
		<div className="mt-8 flex justify-center gap-3">
			<Button href="/visit" size="lg">
				Plan a visit
			</Button>
			<Button href="/connect" size="lg" variant="inverse">
				Get in touch
			</Button>
		</div>
	</Container>
</Section>
```

**Image beside text** (stacked on mobile, two columns from `sm`)

```tsx
<Section>
	<Container>
		<div className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12">
			<Media
				src={src}
				alt={alt}
				ratio="landscape"
				sizes="(min-width: 750px) 50vw, 100vw"
			/>
			<div>
				<Heading as="h2" size="h2">
					…
				</Heading>
				<Prose className="mt-5">…</Prose>
			</div>
		</div>
	</Container>
</Section>
```

**Eyebrow + title in a card**

```tsx
<Card className="h-full">
	<Heading as="h3" size="h4">
		Life Skills
	</Heading>
	<Text size="overline" tone="accent" className="mt-2">
		Thursdays
	</Text>
	<Text tone="secondary" className="mt-4">
		…
	</Text>
</Card>
```

**Page opening** (only on hand-built routes; CMS pages use the `PageHeader`
slice)

```tsx
<Section as="header" spacing="header">
	<Container size="text">
		<Heading as="h1" size="h1">
			What’s On
		</Heading>
		<Text size="lg" tone="secondary" className="mt-6">
			…
		</Text>
	</Container>
</Section>
```

---

## 10. Wrong → right

| Wrong                                            | Right                                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------------------- |
| `bg-neutral-100`                                 | `bg-surface-sunken`                                                          |
| `text-primary-500` / `text-accent`               | `text-ink-accent` (as text), or `bg-accent text-accent-contrast` (as a fill) |
| `text-gray-500`, `text-sm`, `font-semibold`      | `text-ink-muted`, `text-body-sm`, `font-bold`                                |
| `<h2 className="text-4xl font-bold">`            | `<Heading as="h2" size="h2">`                                                |
| `<div className="px-6 max-w-7xl mx-auto">`       | `<Container>`                                                                |
| `<div className="py-24">` around a band          | `<Section spacing="lg">`                                                     |
| `shadow-md` on a card                            | `<Card>` (hairline) or `<Card tone="raised">`                                |
| `rounded-xl`, `rounded-2xl`                      | `rounded-lg`                                                                 |
| `mt-[13px]`, `w-[320px]`                         | `mt-3`, `w-80` or a token                                                    |
| `<a onClick={…}>`, `<div onClick>`               | `<Button>` (or a real `<button>`)                                            |
| `<a href="https://…" target="_blank">`           | `<Link href="https://…">` / `<Button href=…>`                                |
| `<Prose className="text-ink-inverse">`           | `<Prose tone="inverse">`                                                     |
| `<input id="x" aria-describedby=…>` + `<label>`  | `<Field name label><Input /></Field>`                                        |
| `transition-all duration-300 ease-in-out`        | `transition-colors duration-fast ease-standard`                              |
| `@media (prefers-reduced-motion)` in a component | Use the duration tokens; they already collapse                               |
| `animate-bounce`, `animate-pulse`                | Don't. Static, or `Reveal`                                                   |
| `if (field.length)` on rich text                 | `hasContent(field)`                                                          |
| `priority` on every image                        | Only where `isLeadImageSlice(...)` is true                                   |
| `<Image sizes="100vw">` in a half-width column   | `sizes="(min-width: 750px) 50vw, 100vw"`                                     |
| `cn("text-h1", someCustomSize)` with a new token | Add the token to the lists in `src/lib/cn.ts` first                          |

---

## 11. Accessibility checklist

- [ ] The focus ring is visible. It's global (`:focus-visible`, 2px
      `focus-ring`, 2px offset). Don't remove an outline without replacing it.
- [ ] Every text/surface pair is from the allowed list in §3.
- [ ] Inline links are underlined. Colour is never the only affordance.
- [ ] Heading levels form a valid outline: one `h1`, no skipped levels.
- [ ] Icon-only controls have an accessible name (`aria-label` on the button,
      or `Icon label`).
- [ ] Images have meaningful `alt`, or `alt=""` if they're decorative.
- [ ] Interactive elements are `<button>` or `<a>`, never a div with a click
      handler.
- [ ] Carousels and other moving content can be paused and don't autoplay under
      reduced motion.
- [ ] Hidden-but-mounted content is `inert` + `aria-hidden`.
- [ ] Live regions exist before they need to announce (render them always, hide
      them with a class).

---

## 12. Copy conventions

- **British English** (colour, organise, programme). Use typographic
  apostrophes and quotes (’ “ ”) in content. Use an em dash with spaces
  (`—`) for asides.
- Dates read naturally: "Sunday 23 August", "Wednesday 2 September". Times are
  lowercase with no space: "3:15pm".
- Use sentence case for buttons, form labels and UI text ("Get in touch",
  "Email address"). Page and nav names keep their established casing ("What’s
  On", "Quick Links"), as do policy titles. Make button labels verbs ("Get
  directions", "Find out more").
- A site-wide notice is **one line**. If it needs more, it needs a page.

---

## 13. Extending the system

1. **Can an existing primitive do it with a new variant?** Add the variant to
   its `cva` config.
2. **Does it need a value that isn't a token?** Add the token to the right
   `tokens.*.css` file first, then use it. Tailwind v4 has no `duration-*` or
   `z-*` theme namespace, so new tokens of those kinds also need an `@utility`
   in `utilities.css`.
3. **New colour or text size?** Add it to `COLORS` or `TEXT_SIZES` in
   `src/lib/cn.ts`. Otherwise `tailwind-merge` won't dedupe it.
4. **New component?** Put it in `src/components/ui/`, use `cva` for variants,
   accept `className` and merge it with `cn()`, export it from
   `src/components/ui/index.ts`, and add `"use client"` only if it needs state
   or effects.
5. **Show it** on `/design-system` (`src/app/design-system/design-system.tsx`)
   in every state it supports.
6. **Verify** with `npm run check` and a visual check at 375px, 750px and
   1150px or wider.
7. **Document** any non-obvious decision in `docs/design-system.md` (the why)
   and update this file (the what).
