import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Navigation } from "@/components/layout/navigation";
import { SkipLink } from "@/components/ui/a11y";
import { getSettings } from "@/lib/settings";

import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
	const settings = await getSettings();

	return {
		title: {
			default: settings.seo.title,
			template: `%s · ${settings.name}`,
		},
		description: settings.seo.description,
		openGraph: {
			title: settings.seo.title,
			description: settings.seo.description,
			images: settings.seo.image ? [{ url: settings.seo.image }] : undefined,
		},
	};
}

export const viewport: Viewport = {
	themeColor: "#FF9035", // design-tokens-ignore — required literal, no CSS context
	width: "device-width",
	initialScale: 1,
};

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	/* Chrome comes from the Prismic `settings` document, falling back to
	   src/lib/site-config.ts while that document is unpublished or incomplete. */
	const settings = await getSettings();

	return (
		<html lang="en-GB">
			<head>
				<link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
				<link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
				{/* Adobe Fonts: area-inktrap (500/700) */}
				<link rel="stylesheet" href="https://use.typekit.net/ccy7tqi.css" />
			</head>
			<body className="flex min-h-dvh flex-col">
				<SkipLink />
				<Navigation links={settings.navigation} cta={settings.navCta} />
				{children}
				<Footer
					name={settings.name}
					sections={settings.footer}
					meeting={settings.meeting}
				/>
			</body>
		</html>
	);
}
