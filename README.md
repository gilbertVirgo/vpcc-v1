# Victoria Park Community Church

Redesign of [vpcc.church](https://vpcc.church).

Next.js (App Router) · React · Tailwind CSS v4 · Prismic · Netlify

## Getting started

```bash
npm install
npm run dev
```

- <http://localhost:3000> — the site
- <http://localhost:3000/design-system> — every token and component state

## Scripts

| Script                  | Does                                                   |
| ----------------------- | ------------------------------------------------------ |
| `npm run dev`           | Dev server                                             |
| `npm run build`         | Production build                                       |
| `npm run check`         | Typecheck + ESLint + design-token guard                |
| `npm run lint:tokens`   | Design-token guard on its own                          |
| `npm run tokens:colors` | Regenerate the colour ramps and print a contrast table |
| `npm run format`        | Prettier                                               |

Run `npm run check` before committing.

## Layout

```
src/
  app/            routes
  components/
    ui/           design-system primitives
    motion/       reveal / in-view
  lib/            cn(), link helpers, the live-event query
  styles/         design tokens, base layer, custom utilities
scripts/          colour-ramp generator, design-token guard
docs/             design-system.md, events.md
```

## Documentation

- [`PLAN.md`](PLAN.md) — phase-by-phase build plan, with decisions and open
  questions
- [`docs/design-system.md`](docs/design-system.md) — how to use and extend the
  design system
- [`docs/events.md`](docs/events.md) — how `/events` puts itself up and takes
  itself down

## Notes

Fonts come from Adobe Fonts kit `ccy7tqi` (Area Inktrap). The kit's
allowed-domains list has to include any new preview host or the fonts fall back
silently.

The `/design-system` route 404s in production. Set
`NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true` to expose it on a deploy preview.
