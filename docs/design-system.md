# Design system

The rules that keep the site looking like one thing. Read this before adding a
component or reaching for a value.

## The one rule

**Components consume semantic tokens. Nothing else.**

```tsx
<div className="bg-surface text-ink border-line" />   // yes
<div className="bg-neutral-50 text-neutral-950" />    // no — raw ramp step
<div className="bg-[#FCFCF5]" />                      // no — and CI will fail
```

Raw ramp steps (`neutral-400`, `primary-600`) exist so the semantic layer has
something to point at. Pages and components point at the semantic layer.

`npm run lint:tokens` fails the build on raw hex, `rgb()`/`hsl()`, arbitrary
pixel values, and `var()` references to tokens that don't exist.

## Files

| File | Holds |
|---|---|
| `src/styles/tokens.color.css` | Ramps + semantic colour |
| `src/styles/tokens.typography.css` | Families, type scale, weights, measure |
| `src/styles/tokens.layout.css` | Space, breakpoints, containers, radii, elevation, z-index |
| `src/styles/tokens.motion.css` | Durations, easings, reveal, reduced-motion switch |
| `src/styles/base.css` | Element defaults, focus, `.font-accent` |
| `src/styles/utilities.css` | Custom utilities, dialog styling, reveal mechanics |
| `src/components/ui/` | The primitives |
| `src/lib/cn.ts` | Class merging, taught this system's scales |

`/design-system` renders every token and component state. It is the reference —
keep it current when you add something.

## Colour

Three brand seeds: primary `#FF9035`, light `#FCFCF5`, dark `#0B0C17`.

Ramps are generated in OKLCH by `scripts/generate-color-ramps.mjs`
(`npm run tokens:colors`). Don't hand-edit the ramp values — change the script
and re-run it. It prints a contrast table alongside the CSS.

The neutral ramp runs warm at the light end and cool at the dark end, with
chroma tapered to zero at `neutral-500`. Interpolating hue straight between a
warm and a cool seed would push mid-greens through the middle of the ramp; the
taper is what keeps the mid-greys neutral.

### Contrast, and the orange problem

`#FF9035` on `#FCFCF5` is **2.19:1**. It fails AA at every size. So:

- **`accent` is a fill.** Its label is `accent-contrast` (dark ink) at 8.61:1.
- **`ink-accent` (`primary-700`) is the only orange allowed as text** — 4.83:1.
- Buttons lighten on hover rather than darken, so label contrast improves on
  interaction (9.20:1) instead of degrading.

| Token | On surface |
|---|---|
| `ink` | 18.89:1 |
| `ink-secondary` | 8.95:1 |
| `ink-muted` | 6.05:1 — the floor for body text |
| `ink-accent` | 4.83:1 |

There is **no dark mode**. `#0B0C17` is text and footer colour. `surface-inverse`
exists for the occasional dark band, not a theme.

## Typography

- **Area Inktrap** — 500 and 700, roman and italic. Everything.
- **Ivyora Text** — 400 and 700, roman and italic. **Accent only**: heading
  fragments, pull quotes. Never body copy.

Both come from Adobe Fonts kit `ccy7tqi`, linked in the root layout.

Area Inktrap has no weight below 500 and nothing between 500 and 700. The
weight scale is restricted to `font-regular` / `font-medium` / `font-bold` so
`font-light` fails at author time instead of silently synthesising a weight.
`font-synthesis` is off in `base.css` for the same reason.

The accent serif reproduces the old site's `.serif` span:

```tsx
<Heading size="h1">April 3rd: <Accent>Hot Cross Buns</Accent></Heading>
```

Heading **level** and heading **size** are separate props. Pick the level for
the document outline, the size for the layout.

## Space and layout

4px base (`space-4` = 1rem). Section rhythm and the page gutter are fluid.

**`Container` owns the horizontal gutter.** Nothing else sets page-level
left/right padding — that is how gutters end up doubled.

Breakpoints carry over from the previous site: `xs` 500, `sm` 750, `md` 1150,
`lg` 1350, `xl` 1500.

Depth is a hairline border, not a shadow. The two shadows are for things that
genuinely float (dialog, popover).

## Motion

1. Only `transform`, `opacity`, `filter` and `color` animate.
2. Movement is small — a reveal rises 12px.
3. Nothing loops, bounces or overshoots. The one exception is the button
   spinner, which is `motion-safe:` only.
4. **Reduced motion is handled once**, in `tokens.motion.css`, by collapsing
   the duration tokens. No component writes its own media query.

Durations collapse to `0.01ms` rather than zero so `transitionend` handlers
still fire and nothing hangs waiting for them.

`Slideshow` is the sole component allowed to call `matchMedia` directly: a
token can shorten a CSS transition but cannot stop a `setTimeout`, so autoplay
needs its own check.

### Reveals

```tsx
<Reveal><Card>…</Card></Reveal>

<Stagger className="grid grid-cols-3 gap-6" itemClassName="h-full">
  {items.map(item => <Card key={item.id}>…</Card>)}
</Stagger>
```

`Stagger` gives each child its own observer, so a long list doesn't start its
whole cascade the moment its top edge appears.

The hidden state is wrapped in `@media (scripting: enabled)`. Without
JavaScript nothing can flip the state attribute, so the hidden rule must not
apply — otherwise a no-JS visitor or a non-executing crawler gets a blank page.

## Accessibility

- `:focus-visible` is styled globally. Don't remove an outline without
  replacing it.
- Form controls take their `id`, `name` and aria wiring from `Field` context, so
  a label pointing at nothing isn't expressible.
- Error regions render always and hide with a class, so the live region exists
  in the accessibility tree before it has anything to announce.
- `Dialog` is the native `<dialog>` element — focus trap, `Esc` and inert
  background come from the platform.
- Inline links are underlined. Colour alone is not an affordance.
- Every page needs `<main id="main">` for `SkipLink`.

## Adding to the system

1. Can an existing primitive do it with a new variant? Add the variant.
2. Does it need a value that isn't a token? Add the token first, in the right
   file, then use it.
3. Add it to `/design-system` in every state it supports.
4. If you added a colour or a text size, add it to the lists in `src/lib/cn.ts`
   — `tailwind-merge` can't dedupe classes it doesn't know about, and
   `cn("text-h1", "text-h2")` will silently keep both.
5. `npm run check` before committing.
