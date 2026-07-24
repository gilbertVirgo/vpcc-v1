# Decisions worth remembering

Short notes on choices that aren't obvious from the code, and on bugs whose
cause took real effort to find.

## No route-level `loading.tsx`

**Removed deliberately. Do not add one back without re-testing hydration.**

A root-level `loading.tsx` broke hydration of every page's content. Symptoms:

- `<main>` and everything inside it had no React fiber — inert server HTML
- Nothing inside a slice worked: no slideshow, no image enlarge, no
  click-to-load map, no contact form. The form fell back to a native submit
- The layout still hydrated normally (nav drawer opened, GA injected), which
  made it look like the site was fine
- **No error, in the console or the build.** Nothing failed; the content simply
  never became interactive

The DOM showed React's Suspense markers (`<template id="B:0">`, `<div id="S:0">`)
with the boundary never settling, and briefly two `<main id="main">` elements —
the fallback's and the page's. Removing the duplicate id did not fix it; only
removing `loading.tsx` did.

The feature earns nothing here: pages are statically prerendered and resolve
immediately, so there is no wait to cover. It cost all client interactivity.

If a genuinely slow route appears later, scope a `loading.tsx` to that segment
only, and verify afterwards that `document.querySelector('main')` has a
`__reactFiber$…` key.

## `next/script` was unreliable for reCAPTCHA

The reCAPTCHA tag was never injected on the `/connect` route via `next/script`,
with either `lazyOnload` or `afterInteractive`, while GA's tag injected fine
from the layout. Since the token is required for the form to work at all, the
script is now injected imperatively on mount in
`src/components/forms/contact-form.tsx`, with a guard against a second copy.

`getRecaptchaToken` also waits for `window.grecaptcha` rather than giving up
immediately — otherwise a visitor who submits faster than the script loads sends
no token and the server rejects them with a 403.
