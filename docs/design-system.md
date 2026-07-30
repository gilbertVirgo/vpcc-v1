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

| File                               | Holds                                                     |
| ---------------------------------- | --------------------------------------------------------- |
| `src/styles/tokens.color.css`      | Ramps + semantic colour                                   |
| `src/styles/tokens.typography.css` | Families, type scale, weights, measure                    |
| `src/styles/tokens.layout.css`     | Space, breakpoints, containers, radii, elevation, z-index |
| `src/styles/tokens.motion.css`     | Durations, easings, reveal, reduced-motion switch         |
| `src/styles/base.css`              | Element defaults, focus, `.font-accent`                   |
| `src/styles/utilities.css`         | Custom utilities, dialog styling, reveal mechanics        |
| `src/components/ui/`               | The primitives                                            |
| `src/lib/cn.ts`                    | Class merging, taught this system's scales                |

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

| Token           | On surface                       |
| --------------- | -------------------------------- |
| `ink`           | 18.89:1                          |
| `ink-secondary` | 8.95:1                           |
| `ink-muted`     | 6.05:1 — the floor for body text |
| `ink-accent`    | 4.83:1                           |

`ink-accent` is tuned for the light surface and does not travel: on
`surface-inverse` it drops to **3.91:1** and fails AA. `ink-inverse` on
`surface-inverse` is **18.89:1** — the same pair as `ink` on `surface`, read the
other way round. Anything that puts text on a dark band uses `ink-inverse`.

There is **no dark mode**. `#0B0C17` is text and footer colour. `surface-inverse`
exists for the occasional dark band, not a theme.

## Typography

**Area Inktrap** — 500 and 700, roman and italic. One family, everything.

From Adobe Fonts kit `ccy7tqi`, linked in the root layout.

There is no second face. Emphasis comes from weight, size and colour.

Area Inktrap has no weight below 500 and nothing between 500 and 700. The
weight scale is restricted to `font-medium` (500) and `font-bold` (700) so
`font-light` fails at author time instead of silently synthesising a weight.
`font-synthesis` is off in `base.css` for the same reason.

`Accent` reproduces the old site's two-tone headings by dropping a fragment to
weight 500 against the heading's 700 — same family, same size:

```tsx
<Heading size="h1">
	April 3rd: <Accent>Hot Cross Buns</Accent>
</Heading>
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

## Notices

`Notice` warns about a change to the ordinary run of things — a Sunday with no
service, a venue moved at short notice. It is site-wide, set on the `settings`
singleton, and rendered in the root layout below the nav.

**One centred sentence, on a pale wash, between hairlines.**

```
No Sunday service on Sundays 9 and 16 August — back as usual on 23 August
└── title ──────┘ └────────────── description ──────────────────────────┘
```

The first cut was a full-strength `accent` field the width of the viewport,
three stacked lines deep, with a calendar icon. It was the loudest thing on
every page: it outweighed the h1 beneath it and collided with the logo and the
nav button, which are the two places the brand orange is meant to land.
`accent-subtle` is 1.15:1 against the page — enough to read as a separate band,
not enough to compete for the eye. The ranking is done by the words: `ink` bold
for the title, `ink-secondary` for the rest.

The band is ~50px. If a notice needs more room than one sentence, it wants a
page, not a strip.

**The description continues the title's sentence.** Nothing is inserted between
them but a single space, so the description supplies its own opening word and
its own punctuation. That is what lets one model serve "No Sunday service **on
Sundays 9 and 16 August**" and "Car park closed **— use the Grove Road
entrance**" without the component guessing at grammar it cannot see.

**The dates are a display window, and are never rendered.**

```
notice_title        "No Sunday service"          the on switch
notice_description  rich text, one sentence      continues the title
notice_starts_at    2026-08-01                   optional — omit for "from now"
notice_ends_at      2026-08-16                   optional — omit for "until pulled"
```

Both days are inclusive: 1 to 16 August covers all of the 1st and all of the
16th. An earlier model derived the window from the days the notice was _about_
and printed them in the sentence. It could not express two Sundays with a
normal week between them without claiming the whole run, and it left an editor
no way to stage a notice ahead of time. Keeping the dates out of the words
means nothing in the model can contradict the wording — the editor writes the
dates they mean, in the words they mean them.

The title is the on switch. Both dates being optional leaves nothing else that
could stand for intent, so clearing the title is how a notice is pulled early.
A notice with no end runs until someone does that.

Days end at London midnight, not UTC — through the summer those are an hour
apart, so a UTC boundary would take a Sunday notice down an hour early. See
`isWithinWindow` in `src/lib/dates.ts`. A malformed bound is ignored rather
than treated as closed: a notice that overstays is recoverable, one that
silently never appears is the failure nobody notices.

The window is checked on the server, so it is only as fresh as the cached page.
The Prismic webhook busts the cache when an editor changes the notice, but
nothing fires when a date merely passes, so the hourly `revalidate` on the page
routes is what eventually brings a notice up or takes it down. Same trade as
`EventList`.

Rich text in the band goes through `PrismicInline`, which flattens paragraphs to
spans so the copy can sit mid-sentence. Its links underline in
`decoration-current`, not `line-strong`: inline copy inherits its caller's
colour, so a link has no colour of its own to be told apart by and the underline
is the whole affordance — `line-strong` reaches 1.47:1 on this band, which is
not an affordance at all.

`Prose` has an `inverse` tone for rich text on `surface-inverse` —
`CallToAction` in its inverse tone. Links take `ink-inverse` (18.89:1, against
3.91:1 for `ink-accent` there) and the underline switches to
`decoration-current` for the same reason.

Pass the tone. A `text-ink-inverse` className on `Prose` recolours the container
but not the descendant `[&_a]` rule, so the links stay orange — the bug the tone
exists to make unexpressible.

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
- `Notice` is a named landmark, not a live region. It sits above `<main>`, so
  the skip link jumps past it; the name is how someone still finds it. It is
  server-rendered and present at load, so there is nothing to announce — an
  alert would interrupt for content the reader is about to reach anyway.

## Adding to the system

1. Can an existing primitive do it with a new variant? Add the variant.
2. Does it need a value that isn't a token? Add the token first, in the right
   file, then use it.
3. Add it to `/design-system` in every state it supports.
4. If you added a colour or a text size, add it to the lists in `src/lib/cn.ts`
   — `tailwind-merge` can't dedupe classes it doesn't know about, and
   `cn("text-h1", "text-h2")` will silently keep both.
5. `npm run check` before committing.
