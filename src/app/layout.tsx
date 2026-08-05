import type { Metadata, Viewport } from "next";

import { Analytics } from "@/components/analytics/analytics";
import { Footer } from "@/components/layout/footer";
import { Navigation } from "@/components/layout/navigation";
import { SiteNotice } from "@/components/layout/site-notice";
import { ChurchJsonLd } from "@/components/seo/json-ld";
import { SkipLink } from "@/components/ui/a11y";
import { getSettings } from "@/lib/settings";
import { getSiteUrl } from "@/lib/site-url";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSettings();

	return {
		/* Makes every relative canonical and OG URL absolute. Without it, Next
		   emits relative URLs that crawlers and social scrapers resolve against
		   whatever host served the page — including preview domains. */
		metadataBase: new URL(getSiteUrl()),
		title: {
			default: settings.seo.title,
			template: `%s · ${settings.name}`,
		},
		description: settings.seo.description,
		alternates: { canonical: "/" },
		openGraph: {
			type: "website",
			locale: "en_GB",
			siteName: settings.name,
			title: settings.seo.title,
			description: settings.seo.description,
			images: settings.seo.image
				? [{ url: settings.seo.image }]
				: undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: settings.seo.title,
			description: settings.seo.description,
			images: settings.seo.image ? [settings.seo.image] : undefined,
		},
		icons: {
			icon: "/favicon.svg",
			apple: "/favicon.svg",
		},
	};
}

export const viewport: Viewport = {
	themeColor: "#FF9035", // design-tokens-ignore — required literal, no CSS context
	width: "device-width",
	initialScale: 1,
};

/*
 * One timestamp for the whole render, read here in the layout's data layer
 * rather than inside the notice — the same arrangement the pages use for
 * slices. See src/slices/context.ts.
 */
function stampNow(): number {
	return Date.now();
}

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const now = stampNow();

	/* Chrome comes from the Prismic `settings` document, falling back to
	   src/lib/site-config.ts while that document is unpublished or incomplete. */
	const settings = await getSettings();

	return (
		<html lang="en-GB">
			<head>
				<link
					rel="preconnect"
					href="https://use.typekit.net"
					crossOrigin=""
				/>
				<link
					rel="preconnect"
					href="https://p.typekit.net"
					crossOrigin=""
				/>
				{/* Adobe Fonts: area-inktrap (500/700) */}
				<link
					rel="stylesheet"
					href="https://use.typekit.net/ccy7tqi.css"
				/>
				<ChurchJsonLd settings={settings} />
			</head>
			<body className="flex min-h-dvh flex-col">
				<SkipLink />
				<Navigation links={settings.navigation} cta={settings.navCta} />
				{/* Below the sticky bar, above the page: it scrolls away like
				    content rather than eating height on every screen. */}
				<SiteNotice notice={settings.notice} now={now} />
				{children}
				<Footer
					name={settings.name}
					sections={settings.footer}
					meeting={settings.meeting}
				/>
				<Analytics />
			</body>
		</html>
	);
}
