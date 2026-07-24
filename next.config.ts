import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
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
