# Victoria Park Community Church — design system

**A self-contained brand and design spec for AI agents and designers making
anything for VPCC: web pages, emails, slides, social graphics, print.**

You don't need the website's code to use this. Every value here is final: hex
colours, pixel sizes, CSS you can paste. Where a rule exists for a reason, the
reason is given in one line so you can apply it to cases this document doesn't
cover.

|                  |                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Organisation     | Victoria Park Community Church (**VPCC**)                                                                 |
| Description      | A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.                             |
| Website          | <https://vpcc.church>                                                                                     |
| Contact          | hello@vpcc.church · Instagram [@vpcc.church](https://www.instagram.com/vpcc.church)                       |
| Visual character | **Neutral, minimal, clean.** Motion: **smooth, subtle, restrained.**                                      |
| Source of truth  | The `vpcc-v1` repository (`src/styles/tokens.*.css`). If it disagrees with this file, the repository wins |
| Last updated     | 13 November 2026                                                                                          |

**Contents:**

1. The rules
2. Colour
3. Typography
4. Space, shape and depth
5. Components
6. Iconography
7. Logo
8. Imagery
9. Motion
10. Accessibility
11. Voice and copy
12. Applying the system to other media
13. Appendix A: CSS tokens
14. Appendix B: JSON tokens
15. Appendix C: Logo SVG

---

## 1. The rules

If you only read one section, read this one.

1. **Warm paper, dark ink, one orange.** The page is `#FCFCF5`, text is
   `#0B0C17`, and the brand orange `#FF9035` is used sparingly as a **fill**.
2. **Orange is never text.** `#FF9035` on paper is 2.19:1 and fails every
   contrast standard. When text must be orange, use `#AE5900` (4.84:1).
3. **On orange fills, text is dark ink `#0B0C17`** (8.61:1), never white
   (2.19:1).
4. **On dark backgrounds, text is paper `#FCFCF5`.** The text orange `#AE5900`
   drops to 3.91:1 on dark and fails, so links on dark are paper and
   underlined.
5. **One typeface: Area Inktrap, weights 500 and 700 only.** There is no
   second face, no light weight and no semibold. Emphasis comes from weight,
   size and colour.
6. **Depth is a hairline, not a shadow.** Cards and panels get a 1px `#E0E0DB`
   border. Shadows are only for things that genuinely float, such as a dialog.
7. **Radii stay tight:** 4, 8 or 14px, or a full pill. Nothing softer.
8. **There is no dark mode.** Dark (`#0B0C17`) is used for the footer and the
   occasional contrast band, never as a whole theme.
9. **The brand orange lands in a few places only:** the logo, the primary
   button, and small accents. If orange is the loudest thing on a page that
   isn't the main call to action, tone it down. Use the pale wash `#FFE8D9`
   instead.
10. **Motion is small and calm.** Fade and rise by 12px at most. Nothing
    loops, bounces or overshoots. Respect reduced-motion settings.
11. **Text links are underlined.** Colour alone is not an affordance.

---

## 2. Colour

### Core palette (roles)

Use these by role. The names are the system's token names, and Appendices A and
B give them as CSS and JSON.

| Role              | Hex                                          | Use                                                                                |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `surface`         | `#FCFCF5`                                    | Page background: warm paper. **Brand light**                                       |
| `surface-raised`  | `#FFFFFF`                                    | Cards that lift off the page, form fields                                          |
| `surface-sunken`  | `#F2F2EC`                                    | Quiet bands, hover fills, image placeholders                                       |
| `surface-inverse` | `#0B0C17`                                    | Dark bands, footer. **Brand dark**                                                 |
| `ink`             | `#0B0C17`                                    | Headings, primary text                                                             |
| `ink-secondary`   | `#47474B`                                    | Body copy, secondary text                                                          |
| `ink-muted`       | `#606162`                                    | Captions, hints, metadata. The lightest grey allowed for text                      |
| `ink-inverse`     | `#FCFCF5`                                    | All text on dark                                                                   |
| `ink-accent`      | `#AE5900`                                    | The only orange allowed as text: links, eyebrows                                   |
| `line`            | `#E0E0DB`                                    | Default 1px hairline: cards, dividers                                              |
| `line-strong`     | `#C5C5C2`                                    | Form field borders, link underlines, hover borders                                 |
| `line-inverse`    | `rgba(255,255,255,0.16)` ≈ `#32333C` on dark | Hairlines on dark                                                                  |
| `accent`          | `#FF9035`                                    | **Fill only**: primary button, active indicator, text selection. **Brand primary** |
| `accent-hover`    | `#F99C57`                                    | Hover fill. It's lighter, so the dark label gains contrast                         |
| `accent-pressed`  | `#D56E00`                                    | Pressed fill                                                                       |
| `accent-contrast` | `#0B0C17`                                    | Text on an orange fill                                                             |
| `accent-subtle`   | `#FFE8D9`                                    | Pale orange wash: notice bands, soft highlights                                    |
| `focus-ring`      | `#D56E00`                                    | Keyboard focus outline                                                             |
| `success`         | `#298646`                                    | Success borders and icons. **Not for small text** (4.44:1)                         |
| `success-surface` | `#E1F5E4`                                    | Success message background                                                         |
| `danger`          | `#BE2323`                                    | Error text and borders (5.90:1 on paper)                                           |
| `danger-surface`  | `#FFE6E2`                                    | Error message background                                                           |

### Text on background: what's allowed

WCAG AA needs **4.5:1** for normal text and **3:1** for large text (24px and
up, or 18.7px and up in bold).

| Text                     | On                     | Contrast | Verdict                                                                 |
| ------------------------ | ---------------------- | -------- | ----------------------------------------------------------------------- |
| `#0B0C17` ink            | `#FCFCF5` paper        | 18.89:1  | ✅ Everything                                                           |
| `#47474B`                | `#FCFCF5` paper        | 8.95:1   | ✅ Body copy                                                            |
| `#606162`                | `#FCFCF5` paper        | 6.05:1   | ✅ Captions and metadata (the floor)                                    |
| `#606162`                | `#F2F2EC` sunken       | 5.55:1   | ✅                                                                      |
| `#AE5900`                | `#FCFCF5` paper        | 4.84:1   | ✅ Links, eyebrows                                                      |
| `#AE5900`                | `#FFFFFF` white        | 4.98:1   | ✅                                                                      |
| `#0B0C17` ink            | `#FF9035` orange       | 8.61:1   | ✅ Button labels                                                        |
| `#0B0C17` ink            | `#F99C57` orange hover | 9.20:1   | ✅                                                                      |
| `#0B0C17` ink            | `#FFE8D9` wash         | 16.46:1  | ✅                                                                      |
| `#47474B`                | `#FFE8D9` wash         | 7.80:1   | ✅                                                                      |
| `#FCFCF5` paper          | `#0B0C17` dark         | 18.89:1  | ✅ All text on dark                                                     |
| `#FCFCF5` at 70% opacity | `#0B0C17` dark         | 9.37:1   | ✅ Secondary text on dark                                               |
| `#FCFCF5` at 60% opacity | `#0B0C17` dark         | 7.08:1   | ✅ Metadata on dark. Go no lower                                        |
| `#BE2323`                | `#FCFCF5` paper        | 5.90:1   | ✅ Error text                                                           |
| `#AE5900`                | `#FFE8D9` wash         | 4.21:1   | ⚠️ Large or bold text ≥ 18.7px only. Use ink on the wash for small text |
| `#298646`                | `#FCFCF5` paper        | 4.44:1   | ⚠️ Large text and icons only                                            |
| `#AE5900`                | `#0B0C17` dark         | 3.91:1   | ❌ Never. Use paper on dark                                             |
| `#FF9035`                | `#FCFCF5` paper        | 2.19:1   | ❌ Never as text, at any size                                           |
| `#FCFCF5` / white        | `#FF9035` orange       | 2.19:1   | ❌ Never. Orange fills take dark ink                                    |

### Full ramps

The ramps were generated in OKLCH from the three brand seeds. Use the role
colours above. The ramps are listed only so tints in charts and illustrations
stay on-palette.

| Step | Neutral                 | Primary                   |
| ---- | ----------------------- | ------------------------- |
| 50   | `#FCFCF5` (seed: light) | `#FFF5EE`                 |
| 100  | `#F2F2EC`               | `#FFE8D9`                 |
| 200  | `#E0E0DB`               | `#FED2B6`                 |
| 300  | `#C5C5C2`               | `#FBB88B`                 |
| 400  | `#A1A19F`               | `#F99C57`                 |
| 500  | `#7D7D7D`               | `#FF9035` (seed: primary) |
| 600  | `#606162`               | `#D56E00`                 |
| 700  | `#47474B`               | `#AE5900`                 |
| 800  | `#313238`               | `#854200`                 |
| 900  | `#1E1F28`               | `#5C2C00`                 |
| 950  | `#0B0C17` (seed: dark)  | —                         |

The neutral ramp is warm at the light end and cool at the dark end, with no
tint in the middle (`#7D7D7D`). Don't mix in other greys: Tailwind's `gray`,
`#333` and `#999` all read as foreign next to it.

Avoid introducing new hues. If a chart needs several series, use orange
`#FF9035`, ink `#0B0C17`, then neutral steps (`#7D7D7D`, `#C5C5C2`) and
primary tints (`#FBB88B`, `#854200`).

---

## 3. Typography

### Typeface

**Area Inktrap** (by Blaze Type), in **Medium 500** and **Bold 700**, roman and
italic. It is the only typeface.

- **Web:** Adobe Fonts kit `ccy7tqi`
  (`<link rel="stylesheet" href="https://use.typekit.net/ccy7tqi.css">`),
  `font-family: "area-inktrap"`. The kit is **locked to approved domains**
  (vpcc.church and its previews). On any other domain the font silently falls
  back, so a new site needs its domain added to the kit by the kit owner.
- **Desktop (slides, print, graphics):** activate it through Adobe Fonts with
  a Creative Cloud licence.
- **Fallback** when Area Inktrap isn't available, for example in email:
  `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`.
  Don't substitute another characterful display face. A plain system sans is
  closer in spirit than a lookalike.
- **Never fake weights.** The font has nothing below 500 and nothing between
  500 and 700, so don't ask for 300, 400 or 600. On the web, set
  `font-synthesis: none`.

### Scale

Web sizes are fluid. They interpolate between a 375px and a 1500px viewport;
the exact `clamp()` values are in Appendix A. For a fixed canvas, use the
**Desktop** column, or **Mobile** for small canvases.

| Style      | Mobile | Desktop | Weight | Line height | Tracking | Case      | Use                                |
| ---------- | ------ | ------- | ------ | ----------- | -------- | --------- | ---------------------------------- |
| Display    | 44px   | 96px    | 700    | 0.95        | −0.03em  | Sentence  | Home hero only                     |
| H1         | 36px   | 64px    | 700    | 1.02        | −0.025em | Sentence  | Page title, one per page           |
| H2         | 28px   | 44px    | 700    | 1.08        | −0.02em  | Sentence  | Section titles                     |
| H3         | 22px   | 30px    | 700    | 1.2         | −0.015em | Sentence  | Sub-sections, dialog titles        |
| H4         | 18px   | 22px    | 700    | 1.3         | −0.01em  | Sentence  | Card titles                        |
| Body large | 18px   | 21px    | 500    | 1.6         | −0.005em | —         | Intros, lead paragraphs            |
| Body       | 16px   | 18px    | 500    | 1.65        | 0        | —         | Default text                       |
| Body small | 15px   | 16px    | 500    | 1.6         | 0        | —         | Buttons, form labels, nav, notices |
| Caption    | 13px   | 14px    | 500    | 1.5         | 0.005em  | —         | Hints, errors, metadata            |
| Overline   | 12px   | 13px    | 700    | 1.4         | 0.09em   | UPPERCASE | Eyebrows above titles, badges      |

- **Body text weight is 500**, not 400. Bold (700) is for headings and
  emphasis.
- **Line length:** about 68 characters for body text (`max-width: 68ch`). Use
  44ch for short columns and 82ch at most.
- Balance heading lines (`text-wrap: balance`) and avoid orphans in paragraphs
  (`text-wrap: pretty`).
- Headings are ink `#0B0C17`. Body copy is `#47474B`, with bold runs in ink.

### Two-tone headings

The house way to set part of a heading apart is to **drop that fragment to
weight 500** against the heading's 700. It keeps the same size, colour and
face, and it is not italic.

> **April 3rd:** Hot Cross Buns — "April 3rd:" in 700, "Hot Cross Buns" in 500
>
> **Our story** (in brief) — "(in brief)" in 500

Use it on a fragment, never on a whole heading, and never in body text.

---

## 4. Space, shape and depth

### Spacing

The base unit is **4px**. Use multiples: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.

| Relationship                | Space                               |
| --------------------------- | ----------------------------------- |
| Eyebrow → title             | 8px                                 |
| Heading → its body text     | 16–24px (20px typical)              |
| Paragraph → paragraph       | 16px                                |
| Body → buttons              | 32px                                |
| Buttons side by side        | 12px                                |
| Intro block → grid of cards | 48px                                |
| Grid gap                    | 24px (mobile) → 32px (750px and up) |
| Card padding                | 24px (mobile) → 32px (750px and up) |

### Sections and page frame (web)

| Token                     | Mobile → desktop | Use                                      |
| ------------------------- | ---------------- | ---------------------------------------- |
| Section padding (small)   | 32 → 48px        | Top and bottom of a compact band         |
| Section padding (default) | 44 → 72px        | Top and bottom of a normal band          |
| Section padding (large)   | 56 → 96px        | Top and bottom of a feature band         |
| Page gutter               | 20 → 48px        | Left and right padding of the page frame |

Every band pads its own top and bottom, so the visible gap between two bands
is the sum of both. A page's opening band (its title) pads the top only, so
the intro sits with the content that follows it.

| Container | Max width | Use                                    |
| --------- | --------- | -------------------------------------- |
| Narrow    | 544px     | Forms, single narrow column            |
| Text      | 704px     | Articles, page intros, calls to action |
| Default   | 1248px    | Standard page frame                    |
| Wide      | 1440px    | Near-full-bleed media                  |

**Breakpoints**, mobile-first: **500**, **750**, **1150**, **1350** and
**1500px**. Layouts usually go from one column to two at 750px and to three or
four at 1150px.

### Shape

| Radius | px   | Use                                       |
| ------ | ---- | ----------------------------------------- |
| sm     | 4px  | Focus ring, checkboxes                    |
| md     | 8px  | Form fields, inline messages              |
| lg     | 14px | Cards, images, dialogs                    |
| pill   | full | Buttons, badges, round icon buttons, dots |

### Depth

- Express depth with a **1px hairline** in `#E0E0DB` (`#C5C5C2` on hover or
  for stronger edges). Lift with colour: a white card on the paper page.
- Use shadows only for floating layers:
    - **Overlay** (dialogs, floating buttons):
      `0 1px 2px rgba(11,12,23,0.04), 0 8px 24px rgba(11,12,23,0.08)`
    - **Popover:** `0 1px 2px rgba(11,12,23,0.05), 0 16px 48px rgba(11,12,23,0.12)`
- Modal backdrop: `rgba(11,12,23,0.4)` with a 2px blur.

---

## 5. Components

These are visual specs, independent of any framework. Build them in whatever
the target medium uses.

### Buttons

All buttons are pills with bold (700) labels, no wrapping, a gap of 8px between
an icon and the label, and a press scale of 0.98.

| Size   | Height | Horizontal padding | Label size |
| ------ | ------ | ------------------ | ---------- |
| Small  | 36px   | 16px               | Body small |
| Medium | 44px   | 24px               | Body small |
| Large  | 52px   | 32px               | Body       |

| Variant               | Rest                                                 | Hover            | Pressed        |
| --------------------- | ---------------------------------------------------- | ---------------- | -------------- |
| **Primary**           | Fill `#FF9035`, label `#0B0C17`                      | Fill `#F99C57`   | Fill `#D56E00` |
| **Secondary**         | Transparent, 1px border `#C5C5C2`, label `#0B0C17`   | Fill `#F2F2EC`   | —              |
| **Ghost**             | Transparent, label `#0B0C17`                         | Fill `#F2F2EC`   | —              |
| **Inverse** (on dark) | Transparent, 1px border white @ 16%, label `#FCFCF5` | Fill paper @ 10% | —              |

- Use **one primary per group.** Every other button in the group is
  secondary.
- Disabled buttons are at 50% opacity. A loading button shows a small spinning
  ring in the label colour; it's the only looping animation allowed.
- Labels are short verbs in sentence case: "Get in touch", "Find out more",
  "Get directions".

### Links

| Context                  | Style                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Inline, in a paragraph   | `#AE5900`, underlined with a 1px `#C5C5C2` line offset 4px. On hover the underline takes the text colour |
| Standalone (lists, nav)  | `#0B0C17`, no underline. On hover the text turns `#AE5900` and gets an underline                         |
| Muted (footer, metadata) | `#606162`. On hover the text turns `#0B0C17` and gets an underline                                       |
| On dark                  | `#FCFCF5` with an underline in the same colour                                                           |

External links open in a new tab.

### Cards

- Radius 14px, padding 24px (32px from 750px up).
- **Outlined** (the default): transparent with a 1px `#E0E0DB` border.
  **Raised:** white with the same border. **Sunken:** `#F2F2EC` with no border.
- A clickable card's border goes to `#C5C5C2` on hover and the card lifts 2px.
- A typical card holds an H4 title, an optional overline eyebrow in `#AE5900`,
  and body text in `#47474B`.

### Badge

A pill with 12px horizontal and 4px vertical padding, in the overline style.

| Tone    | Background                 | Text      | Notes                                                                 |
| ------- | -------------------------- | --------- | --------------------------------------------------------------------- |
| Neutral | `#F2F2EC`                  | `#47474B` | The default for new work                                              |
| Outline | none, 1px border `#E0E0DB` | `#47474B` |                                                                       |
| Accent  | `#FFE8D9`                  | `#0B0C17` | Use ink text. `#AE5900` on this wash is 4.21:1, below AA at this size |

### Notice band

A site-wide strip for a change to the normal routine, such as "No Sunday
service this week".

- Full width, background `#FFE8D9`, with 1px `#E0E0DB` hairlines above and
  below.
- **One centred line**: body small, `#47474B`, with the key phrase bold in
  `#0B0C17`. It's about 50px tall.
- Never use full-strength orange here. It outshouts the page title and
  competes with the logo.
- If the message needs more than one line, it needs its own page.

### Forms

- **Field:** white background, 1px `#C5C5C2` border, radius 8px, padding
  12px × 16px, body-size text in ink, placeholder in `#606162`. The border
  goes to `#606162` on hover and to `#BE2323` when the field is invalid.
- **Label:** above the field, body small, bold, ink. Optional fields add
  "(optional)" after the label, in weight 500 and `#606162`. Required fields
  carry no marker.
- **Hint and error:** caption size, below the label and below the field. Hints
  are `#606162` and errors `#BE2323`. The space between label, field and
  messages is 8px.
- **Checkboxes and radios** are native controls tinted `#FF9035`, at 20px.
- **Outcome message:** shown inline, never in a pop-up. Radius 8px, 20px
  padding, a bold ink title over body-small `#47474B` text. A success message
  has a `#298646` border on `#E1F5E4`; an error has a `#BE2323` border on
  `#FFE6E2`.

### Dialog

Background `#FCFCF5`, 1px `#E0E0DB` border, radius 14px, overlay shadow, and a
width of at most 576px. Padding is 24px (32px from 750px up). The title is H3.
A round ghost close button with a ✕ icon sits at the top right. The backdrop is
ink at 40% with a 2px blur. It fades in and scales from 0.98 to 1.

### Images

- Radius 14px. Reserve the space with a fixed ratio and fill it with
  `#F2F2EC` until the image loads.
- Ratios: **4:3 (default)**, 1:1, 3:4, 16:9 and 21:9.
- A slideshow crossfades over 400ms and never cuts. It pauses on hover and
  focus, has previous and next controls, and doesn't autoplay under reduced
  motion. The position dots are 6px; the active one is a 24px-wide orange
  pill.

### Focus and selection

- **Focus:** a 2px solid `#D56E00` outline, offset 2px, with a 4px radius, on
  every interactive element.
- **Text selection:** `#FF9035` background with `#0B0C17` text.

---

## 6. Iconography

- Outline icons on a **24×24 grid** with a **1.75px stroke**, round caps and
  joins, and no fill. They are drawn in the text colour (`currentColor`).
- Default size is 24px; 16px in the footer and in dense rows.
- **Brand marks such as Instagram and Facebook are drawn as outlines too,**
  not as their solid official forms. Mixed solid and outline icons read as
  three different weights at 16px.
- The current set is arrow left and right, chevron left, right and down,
  close, menu, mail, phone, map pin, calendar, external link, Instagram and
  Facebook. New icons should match that style. Lucide icons with
  `stroke-width="1.75"` are the closest library match.

---

## 7. Logo

The mark is a **filled disc with "vpcc" knocked out** in lowercase. The SVG is
in Appendix C.

- **Colour:** `#FF9035` on light backgrounds and `#FCFCF5` on dark. It is a
  single colour; don't use gradients, outlines or other colours.
- **Size:** at least 40px (44px on desktop in the header, 48px in the footer).
- **Clear space:** at least a quarter of the disc's diameter on every side.
  This is a recommendation; no formal clear-space rule has been set.
- Don't place it on busy photography. Don't stretch it, rotate it or add a
  shadow.
- The orange logo and the primary button are the two places the brand orange
  is meant to land. Keep other orange near the logo to a minimum.
- **Accessible name:** "Victoria Park Community Church".

---

## 8. Imagery

- Use real photographs of the church community, its events and the
  neighbourhood around Victoria Park. Avoid stock imagery.
- Present photos plainly: 14px radius and no borders, frames or overlays.
- **This is still undecided:** whether the old site's filtered or duotone
  photo treatment carries over. Until it's decided, use unfiltered photos, and
  don't introduce a new filter.
- Every image needs real alt text that describes it. Use empty alt text only
  for decoration.

---

## 9. Motion

| Duration | Value | Use                                 |
| -------- | ----- | ----------------------------------- |
| Instant  | 80ms  | Colour change on hover              |
| Fast     | 160ms | Buttons, links, small state changes |
| Base     | 240ms | The default: cards, dialogs         |
| Slow     | 400ms | Reveals, drawers, crossfades        |
| Slower   | 640ms | Full-page transitions               |

| Easing   | Curve                        | Use               |
| -------- | ---------------------------- | ----------------- |
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | The default       |
| Entrance | `cubic-bezier(0, 0, 0, 1)`   | Elements arriving |
| Exit     | `cubic-bezier(0.3, 0, 1, 1)` | Elements leaving  |

- Animate only transform, opacity, filter and colour.
- **Scroll reveal:** fade from 0 and rise 12px over 400ms with the entrance
  easing. Stagger list items 70ms apart.
- **Page transition:** fade in and rise 4px over 240ms.
- **Drawer:** slide in from the right over 400ms. Don't also fade or scale it.
- Nothing loops, bounces or overshoots. The one exception is a loading
  spinner.
- **Reduced motion:** when `prefers-reduced-motion: reduce` is set, collapse
  every duration to about 0 (use 0.01ms so end events still fire) and set the
  reveal distance to 0. Content without JavaScript must never stay hidden.

---

## 10. Accessibility

The target is **WCAG 2.2 AA**.

- Use only the text and background pairs in §2.
- Give every interactive element a visible focus ring (§5). Don't remove one
  without replacing it.
- Underline inline links.
- Use one H1 per page and don't skip heading levels. Choose the heading level
  for the page structure; visual size is a separate decision.
- Give icon-only buttons an accessible name.
- Use real buttons and links, never clickable divs.
- Moving content can be paused and doesn't autoplay under reduced motion.
- Give form fields visible labels (not placeholder-only). Connect errors to
  their field and announce them.
- Put a "Skip to content" link first on every web page.
- Touch targets are at least 36px, and 44px for primary actions.

---

## 11. Voice and copy

- **Warm, plain and direct.** Write as a welcoming local church, not an
  institution. Use short sentences and everyday words.
- Use **British English**: colour, organise, programme, neighbourhood.
- Use typographic punctuation: curly apostrophes and quotes (’ “ ”), and an em
  dash with spaces for asides ( — ).
- **Dates:** "Sunday 23 August", "Wednesday 2 September", with no ordinal
  suffixes in running text. **Times:** lowercase with no space: "3:15pm",
  "10am".
- **Casing:** sentence case for headings, buttons, form labels and UI text.
  Proper names keep their capitals, as do the established page names: "What’s
  On", "About", "Beliefs", "Connect", "Donate".
- A notice is one line. A button label is a short verb phrase.

---

## 12. Applying the system to other media

| Medium              | Guidance                                                                                                                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slides**          | Use a paper `#FCFCF5` background, ink titles and one orange element per slide at most (the logo counts). Section dividers can use the dark band with paper text. Use the desktop type sizes, scaled to the canvas, with generous margins of at least 1/12 of the width |
| **Social graphics** | Use a paper or dark background, with orange as a block, shape or the logo, never as text. Make the headline H1 style in ink or paper, and set the logo in a corner with clear space. Keep text to one short line and a date                                            |
| **Email**           | The web font won't load, so use the fallback stack. Use paper or white as the background. Make buttons orange pills with dark ink labels, built with a table so they render everywhere. Underline links in `#AE5900`                                                   |
| **Print**           | Use Area Inktrap via Adobe Fonts. Uncoated paper suits the warm-paper feel. Orange `#FF9035` will shift in CMYK, so proof it. Keep body text at 9pt or above in `#47474B` or ink                                                                                       |
| **Charts and data** | Use the palette advice in §2. Draw gridlines in `#E0E0DB`, set labels in `#606162` and leave the chart without shadows or 3D effects                                                                                                                                   |

---

## Appendix A: CSS tokens

Paste this into any web project. Hex values are exact equivalents of the
production OKLCH values.

```css
:root {
	/* Colour — surfaces */
	--color-surface: #fcfcf5;
	--color-surface-raised: #ffffff;
	--color-surface-sunken: #f2f2ec;
	--color-surface-inverse: #0b0c17;

	/* Colour — text */
	--color-ink: #0b0c17;
	--color-ink-secondary: #47474b;
	--color-ink-muted: #606162;
	--color-ink-inverse: #fcfcf5;
	--color-ink-accent: #ae5900;

	/* Colour — lines */
	--color-line: #e0e0db;
	--color-line-strong: #c5c5c2;
	--color-line-inverse: rgba(255, 255, 255, 0.16);

	/* Colour — accent */
	--color-accent: #ff9035;
	--color-accent-hover: #f99c57;
	--color-accent-pressed: #d56e00;
	--color-accent-contrast: #0b0c17;
	--color-accent-subtle: #ffe8d9;

	/* Colour — state */
	--color-focus-ring: #d56e00;
	--color-success: #298646;
	--color-success-surface: #e1f5e4;
	--color-danger: #be2323;
	--color-danger-surface: #ffe6e2;

	/* Type */
	--font-sans:
		"area-inktrap", ui-sans-serif, system-ui, -apple-system, "Segoe UI",
		Roboto, "Helvetica Neue", Arial, sans-serif;
	--font-weight-medium: 500;
	--font-weight-bold: 700;

	--text-display: clamp(2.75rem, 1.6667rem + 4.622vw, 6rem);
	--text-h1: clamp(2.25rem, 1.6667rem + 2.489vw, 4rem);
	--text-h2: clamp(1.75rem, 1.4167rem + 1.422vw, 2.75rem);
	--text-h3: clamp(1.375rem, 1.2083rem + 0.711vw, 1.875rem);
	--text-h4: clamp(1.125rem, 1.0417rem + 0.356vw, 1.375rem);
	--text-body-lg: clamp(1.125rem, 1.0625rem + 0.267vw, 1.3125rem);
	--text-body: clamp(1rem, 0.9583rem + 0.178vw, 1.125rem);
	--text-body-sm: clamp(0.9375rem, 0.9167rem + 0.089vw, 1rem);
	--text-caption: clamp(0.8125rem, 0.7917rem + 0.089vw, 0.875rem);
	--text-overline: clamp(0.75rem, 0.7292rem + 0.089vw, 0.8125rem);

	--measure-tight: 44ch;
	--measure: 68ch;
	--measure-wide: 82ch;

	/* Space */
	--space-unit: 0.25rem; /* 4px */
	--space-section-sm: clamp(2rem, 1.5rem + 1.5vw, 3rem);
	--space-section: clamp(2.75rem, 2rem + 2.5vw, 4.5rem);
	--space-section-lg: clamp(3.5rem, 2.5rem + 3.5vw, 6rem);
	--space-gutter: clamp(1.25rem, 0.75rem + 2.2vw, 3rem);

	/* Containers */
	--container-narrow: 34rem; /* 544px */
	--container-text: 44rem; /* 704px */
	--container-default: 78rem; /* 1248px */
	--container-wide: 90rem; /* 1440px */

	/* Shape */
	--radius-sm: 0.25rem;
	--radius-md: 0.5rem;
	--radius-lg: 0.875rem;
	--radius-pill: 999px;

	/* Elevation — floating layers only */
	--shadow-overlay:
		0 1px 2px rgba(11, 12, 23, 0.04), 0 8px 24px rgba(11, 12, 23, 0.08);
	--shadow-popover:
		0 1px 2px rgba(11, 12, 23, 0.05), 0 16px 48px rgba(11, 12, 23, 0.12);

	/* Motion */
	--duration-instant: 80ms;
	--duration-fast: 160ms;
	--duration-base: 240ms;
	--duration-slow: 400ms;
	--duration-slower: 640ms;
	--ease-standard: cubic-bezier(0.2, 0, 0, 1);
	--ease-entrance: cubic-bezier(0, 0, 0, 1);
	--ease-exit: cubic-bezier(0.3, 0, 1, 1);
	--reveal-distance: 0.75rem;
	--reveal-stagger: 70ms;
}

@media (prefers-reduced-motion: reduce) {
	:root {
		--duration-instant: 0.01ms;
		--duration-fast: 0.01ms;
		--duration-base: 0.01ms;
		--duration-slow: 0.01ms;
		--duration-slower: 0.01ms;
		--reveal-distance: 0rem;
		--reveal-stagger: 0ms;
	}
}

/* Element defaults */
body {
	background: var(--color-surface);
	color: var(--color-ink);
	font-family: var(--font-sans);
	font-size: var(--text-body);
	font-weight: var(--font-weight-medium);
	line-height: 1.65;
	font-synthesis: none;
	-webkit-font-smoothing: antialiased;
}
h1,
h2,
h3,
h4,
h5,
h6 {
	font-weight: var(--font-weight-bold);
	text-wrap: balance;
}
p {
	text-wrap: pretty;
}
:focus-visible {
	outline: 2px solid var(--color-focus-ring);
	outline-offset: 2px;
	border-radius: var(--radius-sm);
}
::selection {
	background: var(--color-accent);
	color: var(--color-accent-contrast);
}
```

Breakpoints for media queries: `500px`, `750px`, `1150px`, `1350px` and
`1500px`, all as `min-width`.

---

## Appendix B: JSON tokens

For tools that don't take CSS, such as slide generators, design tools and
image scripts.

```json
{
	"color": {
		"surface": "#FCFCF5",
		"surfaceRaised": "#FFFFFF",
		"surfaceSunken": "#F2F2EC",
		"surfaceInverse": "#0B0C17",
		"ink": "#0B0C17",
		"inkSecondary": "#47474B",
		"inkMuted": "#606162",
		"inkInverse": "#FCFCF5",
		"inkAccent": "#AE5900",
		"line": "#E0E0DB",
		"lineStrong": "#C5C5C2",
		"accent": "#FF9035",
		"accentHover": "#F99C57",
		"accentPressed": "#D56E00",
		"accentContrast": "#0B0C17",
		"accentSubtle": "#FFE8D9",
		"focusRing": "#D56E00",
		"success": "#298646",
		"successSurface": "#E1F5E4",
		"danger": "#BE2323",
		"dangerSurface": "#FFE6E2"
	},
	"font": {
		"family": "Area Inktrap",
		"webFamily": "area-inktrap",
		"adobeFontsKit": "ccy7tqi",
		"weights": { "medium": 500, "bold": 700 },
		"fallback": "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
	},
	"type": {
		"display": {
			"min": 44,
			"max": 96,
			"weight": 700,
			"lineHeight": 0.95,
			"tracking": "-0.03em"
		},
		"h1": {
			"min": 36,
			"max": 64,
			"weight": 700,
			"lineHeight": 1.02,
			"tracking": "-0.025em"
		},
		"h2": {
			"min": 28,
			"max": 44,
			"weight": 700,
			"lineHeight": 1.08,
			"tracking": "-0.02em"
		},
		"h3": {
			"min": 22,
			"max": 30,
			"weight": 700,
			"lineHeight": 1.2,
			"tracking": "-0.015em"
		},
		"h4": {
			"min": 18,
			"max": 22,
			"weight": 700,
			"lineHeight": 1.3,
			"tracking": "-0.01em"
		},
		"bodyLg": {
			"min": 18,
			"max": 21,
			"weight": 500,
			"lineHeight": 1.6,
			"tracking": "-0.005em"
		},
		"body": {
			"min": 16,
			"max": 18,
			"weight": 500,
			"lineHeight": 1.65,
			"tracking": "0"
		},
		"bodySm": {
			"min": 15,
			"max": 16,
			"weight": 500,
			"lineHeight": 1.6,
			"tracking": "0"
		},
		"caption": {
			"min": 13,
			"max": 14,
			"weight": 500,
			"lineHeight": 1.5,
			"tracking": "0.005em"
		},
		"overline": {
			"min": 12,
			"max": 13,
			"weight": 700,
			"lineHeight": 1.4,
			"tracking": "0.09em",
			"uppercase": true
		}
	},
	"radius": { "sm": 4, "md": 8, "lg": 14, "pill": 999 },
	"spaceUnit": 4,
	"breakpoints": { "xs": 500, "sm": 750, "md": 1150, "lg": 1350, "xl": 1500 },
	"container": { "narrow": 544, "text": 704, "default": 1248, "wide": 1440 },
	"duration": {
		"instant": 80,
		"fast": 160,
		"base": 240,
		"slow": 400,
		"slower": 640
	},
	"easing": {
		"standard": "cubic-bezier(0.2, 0, 0, 1)",
		"entrance": "cubic-bezier(0, 0, 0, 1)",
		"exit": "cubic-bezier(0.3, 0, 1, 1)"
	}
}
```

---

## Appendix C: Logo SVG

The mark is single-colour and inherits `currentColor`. Set `color: #FF9035` on
light backgrounds and `color: #FCFCF5` on dark.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Victoria Park Community Church">
	<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100ZM12.32 43.36L19.04 60H23.52L30.24 43.36H25.76L21.28 55.44L16.8 43.36H12.32ZM40.8638 42.96C36.0638 42.96 31.9037 46.88 31.9037 51.68V68.32H36.3838V58.96C37.8237 60 39.4238 60.4 41.1037 60.4C45.8237 60.4 49.8237 56.48 49.8237 51.68C49.8237 46.48 46.0638 42.96 40.8638 42.96ZM45.3438 51.68C45.3438 54.24 43.5037 56.24 40.8638 56.24C38.3037 56.24 36.3838 54.24 36.3838 51.68C36.3838 49.04 38.3037 47.12 40.8638 47.12C43.5037 47.12 45.3438 49.04 45.3438 51.68ZM52.5491 51.68C52.5491 56.88 56.3091 60.4 61.5091 60.4C63.8291 60.4 66.0691 59.44 67.6691 57.76L64.7091 54.88C63.9091 55.68 62.7091 56.24 61.5091 56.24C58.9491 56.24 57.0291 54.24 57.0291 51.68C57.0291 49.04 58.9491 47.12 61.5091 47.12C62.7891 47.12 63.9091 47.6 64.7891 48.4L67.7491 45.44C65.9891 43.68 63.9891 42.96 61.5091 42.96C56.7091 42.96 52.5491 46.88 52.5491 51.68ZM70.3225 51.68C70.3225 56.88 74.0825 60.4 79.2825 60.4C81.6025 60.4 83.8425 59.44 85.4425 57.76L82.4825 54.88C81.6825 55.68 80.4825 56.24 79.2825 56.24C76.7225 56.24 74.8025 54.24 74.8025 51.68C74.8025 49.04 76.7225 47.12 79.2825 47.12C80.5625 47.12 81.6825 47.6 82.5625 48.4L85.5225 45.44C83.7625 43.68 81.7625 42.96 79.2825 42.96C74.4825 42.96 70.3225 46.88 70.3225 51.68Z"/>
</svg>
```
