# Events

Things that are on for a while and then aren't.

## The one rule

**One query decides everything.** `getLiveEvents` in `src/lib/events.ts` is the
only thing that says whether an event counts, and three surfaces read it:

| Surface          | With live events                 | Without |
| ---------------- | -------------------------------- | ------- |
| `/whats-on`      | a block per event, soonest first | nothing |
| `/whats-on/:uid` | the event's own page             | 404     |
| `sitemap.xml`    | each event's URL                 | neither |

Nothing is toggled by hand. Publishing an event puts it on What's On; the event
finishing takes it off, and its own page 404s at the same moment. A page linking
to an event that has already gone is the failure this arrangement is built to
make impossible — so if you add a fourth surface, read the same function.

## Where events go on the page

Straight after the page header on What's On, above the standing features
(Calendar, Prayer meetings, Sundays…). What is on this month outranks what is on
every month, and below five features is where it would go unread.

Each one renders as `EventSummary` — poster, date, place, the one-line summary,
and a **Full details** button. Deliberately the same shape as the Feature slices
it sits among, because it is one of the things going on, not an announcement
bolted to the top of the page.

The facts and the sign-up link are on the event's own page, not in the summary.
Repeating the closing date in two places is how the two end up disagreeing.

**To place events somewhere else, or to show a chosen few in a chosen order,**
add an `event_list` slice. Doing that on What's On turns the automatic block off
— an editor saying where the events go wins, and nothing is shown twice. See
`liveEventsFor` in `src/app/[uid]/page.tsx`.

## When an event is finished

`expires_at` if set, otherwise `ends_at`. An event with neither stays up until
someone sets one.

`expires_at` is the override, and it exists because the two are not always the
same thing: a competition whose closing date has passed is over even though its
prize evening has not. It ports the previous site's `timeout` field, which is
how the Hot Cross Buns feature removed itself once the morning was over.

Falling back to `ends_at` is the part worth knowing about. Leaving "hide after"
empty used to mean _never_, which is a sensible default for a slice on a page
somebody maintains and the wrong one for something that puts itself up.

## It is only as fresh as the cache

Prismic's webhook busts the cache when an editor publishes. **Nothing fires when
a date merely passes.** Time-based revalidation is what eventually brings an
event up or takes it down, so a finished one lingers a few minutes. Same trade
as the site notice.

Two windows are in play and the shorter one wins: the routes declare
`revalidate = 3600` as a backstop, and the Prismic fetch inside them declares
300 in production — which is why `next build` reports 5m against `/whats-on`.
The hour is what you get if the fetch cache is ever taken out of the picture.

If an event has to come down to the minute, unpublish it. That fires a webhook.

## The model

```
title         Photo Competition: Hope in East London
summary       one line — the block on What's On, the meta description, the share card
starts_at     when the event itself happens (not the closing date)
ends_at       optional
location      one line, as you'd say it out loud
details       repeatable label + value rows — the facts people scan for
body          anything that needs sentences
image         the poster, portrait, shown uncropped
share_image   landscape 1200 × 630, for social. Falls back to `image`
expires_at    hide after — see above
cta_label     "Enter the competition"
cta_link      the sign-up form
cta_expires_at  hide the button after — sign-up usually closes first
```

**`details` carries the facts, `body` carries the prose.** Closing date, entry
fee, categories, prize, theme — each is a row. They read as a scannable list,
they line up with the `info_list` slice used elsewhere on the site, and they
travel: the same rows work on the event's own page and anywhere an event is
shown next. The same facts buried in a paragraph work on exactly one of those.

**The poster is not the content.** Everything printed on it is repeated as real
text, because an image reaches neither a screen reader nor a search engine, and
because the poster is otherwise the only copy of the closing date. Give it alt
text describing what it shows, not what it says.

Any shape works and nothing is cropped, so upload the artwork as it was laid
out. A white background is fine: the poster carries a hairline border, which is
what keeps it reading as a deliberate object against the page's warm off-white
rather than as a patch that missed. On What's On it is capped at 24rem — a
portrait poster filling half a column would stand twice as tall as anything
else on the page.

**`share_image` is not interchangeable with `image`.** A poster is portrait and
every social card is landscape, so sharing the poster crops the middle out of it
and takes the date with it.

**Set `cta_expires_at` whenever sign-up closes before the event.** A competition
takes entries in August and hands out prizes in September; without it the page
spends that fortnight offering a live entry form to people who have already
missed the deadline, and they only find out afterwards. Past that timestamp the
button is dropped and everything else stays — say "entries have closed" in
`body` if it needs saying. Empty means the button stands as long as the event
does, which is right for anything you can just turn up to.

## Titles

A colon in the title sets the part after it at weight 500 against the heading's
700 — the previous site's two-tone headings, via `Accent`. "Photo Competition:
Hope in East London" gets it; "Carol Service" doesn't, and looks fine either
way. Nothing to configure; write the title that reads best.

## Wording

Say the age range, not the rating. "Adults (18 and over)" rather than "Adult
(18+)" — on a photo competition the singular reads as a content rating, and
"18+" beside it doubles the effect.

## Check the time on the first publish

Prismic stores timestamps as UTC. Times are rendered in `Europe/London`, so
through British Summer Time a value stored as 18:00 renders as **7pm**.

Publish the first event and look at the page. If the time is an hour later than
you meant, the Page Builder took what you typed as UTC rather than as local
time — enter 5pm to mean 6pm BST, and check again in the winter. The site is
right either way; it is the picker that needs pinning down.

## The event type is a page type, and has to stay one

`format: page` in `customtypes/event/index.json` is load-bearing. The Prismic
CLI rewrites `prismic.config.json` on every `field` command and regenerates
`routes` from the page-format types — so as a custom-format type, `event` loses
its `/whats-on/:uid` route entry the next time anyone adds or moves a field, and
with it go previews, `event.url`, the sitemap entries and the `Event` JSON-LD.
Nothing fails loudly; the URLs just quietly stop resolving.

As a page type the CLI writes the route itself and leaves an edited path alone.
It defaults to `/event/:uid`, which is why the path in `prismic.config.json`
says `/whats-on/:uid` — that edit is deliberate and survives.

## `/events` still resolves

Events were briefly served from `/events` and `/events/:uid`, and a printed QR
code points at one of those URLs. Both 301 to their `/whats-on` equivalents in
`netlify.toml`, splat and all, so the code lands on the event rather than on the
index. Paper cannot be redeployed — that redirect is permanent.

`RESERVED_UIDS` in `src/app/[uid]/page.tsx` therefore keeps a `page` document
from claiming the UID `events`: the redirect would shadow it and the page would
be unreachable with nothing to show for it. `home` is in there for the same
class of reason.
