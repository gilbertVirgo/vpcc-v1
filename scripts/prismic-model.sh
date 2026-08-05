#!/usr/bin/env bash
#
# Builds the VPCC content model with the Prismic CLI.
#
# Prerequisite — the CLI needs a prismic.config.json, and only `init` writes
# one. It opens a browser to authenticate, so it cannot be run unattended:
#
#   npx prismic login
#   npx prismic init --repo 9yoxbcr3 --no-setup
#
# Then:
#
#   ./scripts/prismic-model.sh      # build the model locally
#   npx prismic status              # review what would change
#   npx prismic push                # send it to Prismic
#   npx prismic gen types           # generate TypeScript types
#
# The script is additive and not idempotent: re-running it over an existing
# model will error on fields that already exist. To rebuild from scratch,
# delete the customtypes/ and src/slices/ directories first.

set -euo pipefail

p() { npx prismic "$@"; }

echo "==> Content types"

# ---------------------------------------------------------------------------
# settings — site chrome. Mirrors src/lib/site-config.ts, which it replaces.
# ---------------------------------------------------------------------------
p type create "Settings" --single --id settings || true

p field add text site_name --to-type settings --label "Site name"
p field add text contact_email --to-type settings --label "Contact email"

p field add group nav --to-type settings --label "Navigation"
p field add text nav.label --to-type settings --label "Label"
p field add link nav.link --to-type settings --label "Link"

p field add text nav_cta_label --to-type settings --label "Nav button label"
p field add link nav_cta_link --to-type settings --label "Nav button link"

# Prismic groups nest one level only, so footer sections are flattened and
# grouped in the UI by the `section` value the editor types.
p field add group footer_links --to-type settings --label "Footer links"
p field add text footer_links.section --to-type settings --label "Section heading"
p field add text footer_links.label --to-type settings --label "Label"
p field add link footer_links.link --to-type settings --label "Link"
p field add select footer_links.icon --to-type settings --label "Icon" \
	--option none --option instagram --option facebook --option mail \
	--default-value none

# Site-wide notice. The title is the on switch; the dates are a display window
# and are never rendered, so nothing in the model can contradict the wording.
# Both ends are optional — no start means "from now", no end means "until
# someone takes it down".
p field add rich-text notice_text --to-type settings --label "Notice" \
	--allow paragraph,strong,em,hyperlink --single
p field add date notice_starts_at --to-type settings --label "Notice shows from"
p field add date notice_ends_at --to-type settings --label "Notice shows until"

p field add text meeting_when --to-type settings --label "Meeting time"
p field add text meeting_venue --to-type settings --label "Venue"
p field add text meeting_address --to-type settings --label "Address"
p field add link meeting_directions --to-type settings --label "Directions link"

p field add text meta_title --to-type settings --label "Default meta title"
p field add text meta_description --to-type settings --label "Default meta description"
p field add image og_image --to-type settings --label "Default share image"

# ---------------------------------------------------------------------------
# page — every page on the site. Composed entirely from slices.
# ---------------------------------------------------------------------------
p type create "Page" --format page --id page

# ---------------------------------------------------------------------------
# team_member — referenced by the Team Grid slice.
# ---------------------------------------------------------------------------
p type create "Team member" --id team_member

p field add text name --to-type team_member --label "Name"
p field add text role --to-type team_member --label "Role"
p field add rich-text bio --to-type team_member --label "Bio" \
	--allow paragraph,strong,em,hyperlink
p field add image photo --to-type team_member --label "Photo"
p field add number sort_order --to-type team_member --label "Sort order"

# ---------------------------------------------------------------------------
# event — dated things. `expires_at` ports the old site's `timeout`, which
# auto-hid a feature once it was in the past.
#
# `details` is the labelled-rows model the info_list slice uses, on the document
# rather than a slice: a competition's entry fee, categories and closing date
# are facts about the event, and they have to travel with it to /events, to the
# EventList slice and to whatever comes next. Free-form prose in `body` would
# read the same on one page and be unusable on the others.
#
# `--format page` because an event has its own URL. It is not cosmetic: the CLI
# rewrites prismic.config.json on every `field` command and regenerates `routes`
# from the page-format types, so a custom-format event silently loses its route
# entry the next time anyone touches a field — taking previews, `event.url`, the
# sitemap and the Event JSON-LD with it. As a page type the CLI writes the route
# itself and leaves an edited path alone. It also gets editors the Page Builder
# and working previews, which a document with a URL should have anyway.
# ---------------------------------------------------------------------------
p type create "Event" --format page --id event

p field add text title --to-type event --label "Title"
p field add text summary --to-type event --label "Summary" \
	--placeholder "One line, used on cards and as the share description"
p field add timestamp starts_at --to-type event --label "Starts"
p field add timestamp ends_at --to-type event --label "Ends"
p field add text location --to-type event --label "Location"
p field add group details --to-type event --label "Details"
p field add text details.label --to-type event --label "Label" \
	--placeholder "Photos due"
p field add rich-text details.value --to-type event --label "Value" \
	--allow paragraph,strong,em,hyperlink --placeholder "Wednesday 26 August"
p field add rich-text body --to-type event --label "Description" \
	--allow paragraph,strong,em,hyperlink
p field add image image --to-type event --label "Image"
# A poster is portrait and its words live at its edges, so it survives no
# social crop at all. `share_image` is the landscape cut; `image` is the
# fallback when there isn't one.
p field add image share_image --to-type event --label "Share image"
p field add timestamp expires_at --to-type event --label "Hide after"
p field add text cta_label --to-type event --label "Button label"
p field add link cta_link --to-type event --label "Button link"
# The sign-up closes before the event does — a competition takes entries until
# August and hands out prizes in September. Without this the page would keep
# offering a live entry form for the fortnight in between.
p field add timestamp cta_expires_at --to-type event --label "Hide button after"

echo "==> Slices"

# ---------------------------------------------------------------------------
# page_header
# ---------------------------------------------------------------------------
p slice create "Page header" --id page_header
p field add rich-text title --to-slice page_header --label "Title" \
	--allow heading1 --single
p field add rich-text intro --to-slice page_header --label "Intro" \
	--allow paragraph,strong,em,hyperlink

# ---------------------------------------------------------------------------
# feature — image/slideshow beside text. The workhorse of the old site.
# ---------------------------------------------------------------------------
p slice create "Feature" --id feature
p field add rich-text title --to-slice feature --label "Title" \
	--allow heading2 --single
p field add rich-text body --to-slice feature --label "Body" \
	--allow paragraph,strong,em,hyperlink
p field add group images --to-slice feature --label "Images"
p field add image images.image --to-slice feature --label "Image"
p field add group buttons --to-slice feature --label "Buttons"
p field add text buttons.label --to-slice feature --label "Label"
p field add link buttons.link --to-slice feature --label "Link"
p field add select image_position --to-slice feature --label "Image position" \
	--option left --option right --default-value left
p field add boolean image_enlargeable --to-slice feature \
	--label "Image can be enlarged"

# ---------------------------------------------------------------------------
# content_grid
# ---------------------------------------------------------------------------
p slice create "Content grid" --id content_grid
p field add rich-text title --to-slice content_grid --label "Title" \
	--allow heading2 --single
p field add rich-text intro --to-slice content_grid --label "Intro" \
	--allow paragraph,strong,em,hyperlink
p field add group cells --to-slice content_grid --label "Cells"
p field add text cells.title --to-slice content_grid --label "Title"
p field add text cells.subtitle --to-slice content_grid --label "Subtitle"
p field add rich-text cells.body --to-slice content_grid --label "Body" \
	--allow paragraph,strong,em,hyperlink

# ---------------------------------------------------------------------------
# team_grid
# ---------------------------------------------------------------------------
p slice create "Team grid" --id team_grid
p field add rich-text title --to-slice team_grid --label "Title" \
	--allow heading2 --single
p field add rich-text intro --to-slice team_grid --label "Intro" \
	--allow paragraph,strong,em,hyperlink
p field add group members --to-slice team_grid --label "Members"
p field add content-relationship members.member --to-slice team_grid \
	--label "Team member" --custom-type team_member \
	--field name --field role --field bio --field photo

# ---------------------------------------------------------------------------
# beliefs_list — a group rather than a `belief` type: the statements are a
# fixed doctrinal list, never queried on their own, and never reused.
# ---------------------------------------------------------------------------
p slice create "Beliefs list" --id beliefs_list
p field add rich-text title --to-slice beliefs_list --label "Title" \
	--allow heading2 --single
p field add rich-text intro --to-slice beliefs_list --label "Intro" \
	--allow paragraph,strong,em,hyperlink
p field add group statements --to-slice beliefs_list --label "Statements"
p field add rich-text statements.statement --to-slice beliefs_list \
	--label "Statement" --allow paragraph,strong,em,hyperlink

# ---------------------------------------------------------------------------
# rich_text
# ---------------------------------------------------------------------------
p slice create "Rich text" --id rich_text
p field add rich-text content --to-slice rich_text --label "Content" \
	--allow heading2,heading3,paragraph,strong,em,hyperlink,list-item,o-list-item

# ---------------------------------------------------------------------------
# call_to_action
# ---------------------------------------------------------------------------
p slice create "Call to action" --id call_to_action
p field add rich-text title --to-slice call_to_action --label "Title" \
	--allow heading2 --single
p field add rich-text body --to-slice call_to_action --label "Body" \
	--allow paragraph,strong,em,hyperlink
p field add group buttons --to-slice call_to_action --label "Buttons"
p field add text buttons.label --to-slice call_to_action --label "Label"
p field add link buttons.link --to-slice call_to_action --label "Link"
p field add select tone --to-slice call_to_action --label "Tone" \
	--option default --option sunken --option inverse --default-value sunken

# ---------------------------------------------------------------------------
# event_list
# ---------------------------------------------------------------------------
p slice create "Event list" --id event_list
p field add rich-text title --to-slice event_list --label "Title" \
	--allow heading2 --single
p field add group events --to-slice event_list --label "Events"
p field add content-relationship events.event --to-slice event_list \
	--label "Event" --custom-type event \
	--field title --field starts_at --field ends_at --field location \
	--field body --field image --field expires_at

# ---------------------------------------------------------------------------
# info_list — labelled detail rows (When / Where / Cost / Length), as on ESOL.
# ---------------------------------------------------------------------------
p slice create "Info list" --id info_list
p field add rich-text title --to-slice info_list --label "Title" \
	--allow heading2 --single
p field add group rows --to-slice info_list --label "Rows"
p field add text rows.label --to-slice info_list --label "Label"
p field add rich-text rows.value --to-slice info_list --label "Value" \
	--allow paragraph,strong,em,hyperlink

# ---------------------------------------------------------------------------
# map_embed
# ---------------------------------------------------------------------------
p slice create "Map embed" --id map_embed
p field add rich-text title --to-slice map_embed --label "Title" \
	--allow heading2 --single
p field add text address --to-slice map_embed --label "Address"
p field add text embed_url --to-slice map_embed --label "Google Maps embed URL"
p field add link directions_link --to-slice map_embed --label "Directions link"

# ---------------------------------------------------------------------------
# image_poster
# ---------------------------------------------------------------------------
p slice create "Image poster" --id image_poster
p field add image image --to-slice image_poster --label "Image"
p field add rich-text caption --to-slice image_poster --label "Caption" \
	--allow paragraph,strong,em,hyperlink
p field add link link --to-slice image_poster --label "Link"

# ---------------------------------------------------------------------------
# contact_form — picks which handler the form posts to.
# ---------------------------------------------------------------------------
p slice create "Contact form" --id contact_form
p field add rich-text title --to-slice contact_form --label "Title" \
	--allow heading2 --single
p field add rich-text intro --to-slice contact_form --label "Intro" \
	--allow paragraph,strong,em,hyperlink
p field add select form --to-slice contact_form --label "Form" \
	--option contact --option donate --default-value contact

echo "==> Connecting slices to the page type"

for slice in page_header feature content_grid team_grid beliefs_list \
	rich_text call_to_action event_list info_list map_embed \
	image_poster contact_form; do
	p slice connect "$slice" --to page
done

echo
echo "Model built locally. Next:"
echo "  npx prismic status      # review the diff"
echo "  npx prismic push        # send it to Prismic"
echo "  npx prismic gen types   # generate TypeScript types"
