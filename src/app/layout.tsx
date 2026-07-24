import type { Metadata, Viewport } from "next";

import { Footer } from "@/components/layout/footer";
import { Navigation } from "@/components/layout/navigation";
import { SkipLink } from "@/components/ui/a11y";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: siteConfig.name,
		template: `%s · ${siteConfig.name}`,
	},
	description: siteConfig.description,
};

export const viewport: Viewport = {
	themeColor: "#FF9035", // design-tokens-ignore — required literal, no CSS context
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
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
				<Navigation />
				{children}
				<Footer />
			</body>
		</html>
	);
}
