import type { MetadataRoute } from "next";

import { getSettings } from "@/lib/settings";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
	const settings = await getSettings();

	return {
		name: settings.name,
		short_name: "VPCC",
		description: settings.seo.description,
		start_url: "/",
		display: "standalone",
		background_color: "#FCFCF5", // design-tokens-ignore — manifest takes literals
		theme_color: "#FF9035", // design-tokens-ignore — manifest takes literals
		icons: [
			{
				src: "/favicon.svg",
				sizes: "any",
				type: "image/svg+xml",
				purpose: "any",
			},
		],
	};
}
