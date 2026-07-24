import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Victoria Park Community Church",
		template: "%s · Victoria Park Community Church",
	},
	description:
		"A welcoming community rooted in the gospel near Victoria Park, Tower Hamlets.",
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
				{/* Adobe Fonts: area-inktrap (500/700) + ivyora-text (400/700) */}
				<link rel="stylesheet" href="https://use.typekit.net/ccy7tqi.css" />
			</head>
			<body>{children}</body>
		</html>
	);
}
