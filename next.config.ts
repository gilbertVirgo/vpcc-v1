import type { NextConfig } from "next";

/**
 * Whether the /design-system reference page is reachable.
 *
 * Always in development. On a deploy preview, set
 * NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true.
 */
const showDesignSystem =
	process.env.NODE_ENV !== "production" ||
	process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM === "true";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	async rewrites() {
		/*
		 * Hide the design system by making the route fail to resolve.
		 *
		 * The page also calls notFound(), but in Next 16.2.11 a page-level
		 * notFound() renders the 404 body while leaving the status at 200 — a
		 * soft 404, which search engines may index. Genuinely missing routes
		 * return a correct 404, so rewriting to a path with no route gives the
		 * right status. The notFound() call stays as a second line of defence.
		 *
		 * `beforeFiles` is required: `afterFiles` rewrites run only once
		 * filesystem routes have been tried, and the page itself would match
		 * first.
		 */
		return {
			beforeFiles: showDesignSystem
				? []
				: [
						{
							source: "/design-system/:path*",
							destination: "/__no-design-system-in-production",
						},
					],
			afterFiles: [],
			fallback: [],
		};
	},
	images: {
		remotePatterns: [
			// Prismic asset CDN — the only remote image source.
			{ protocol: "https", hostname: "images.prismic.io" },
			{ protocol: "https", hostname: "prismic-io.s3.amazonaws.com" },
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{ key: "X-Content-Type-Options", value: "nosniff" },
					{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
					},
				],
			},
		];
	},
};

export default nextConfig;
