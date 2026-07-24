/** Anything that leaves the Next.js router: absolute URLs, mail, tel, sms. */
export function isExternalHref(href: string): boolean {
	return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(href) && !href.startsWith("/");
}

/** True for hrefs that open a native handler rather than a page. */
export function isProtocolHref(href: string): boolean {
	return /^(?:mailto|tel|sms):/i.test(href);
}
