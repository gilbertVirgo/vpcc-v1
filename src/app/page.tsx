import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import type { Metadata } from "next";

import { Button, Container, Heading, Section, Stack, Text } from "@/components/ui";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { SliceContext } from "@/slices/context";

/** See the note in app/[uid]/page.tsx — this covers time-based event expiry. */
export const revalidate = 3600;

/*
 * One timestamp for the whole page.
 *
 * Read here, in the page's data layer, rather than inside a slice: slices stay
 * pure functions of their props, and every slice agrees on what "now" is.
 */
function sliceContext(): SliceContext {
	return { now: Date.now() };
}

async function getHomePage() {
	const client = createClient();
	return await client.getByUID("page", "home").catch(() => null);
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getHomePage();
	if (!page) return {};

	return {
		title: page.data.meta_title ?? undefined,
		description: page.data.meta_description ?? undefined,
		openGraph: {
			title: page.data.meta_title ?? undefined,
			description: page.data.meta_description ?? undefined,
			images: asImageSrc(page.data.meta_image)
				? [{ url: asImageSrc(page.data.meta_image) as string }]
				: undefined,
		},
	};
}

export default async function HomePage() {
	const page = await getHomePage();

	/*
	 * Until the `home` document exists in Prismic there is nothing to render.
	 * A holding page beats a 404: the site is live from the first deploy, and
	 * whoever opens it can see what to do next.
	 */
	if (!page) {
		return (
			<main id="main">
				<Section spacing="lg">
					<Container size="text">
						<Text size="overline" tone="accent">
							Not yet published
						</Text>
						<Heading as="h1" size="h1" className="mt-4">
							Victoria Park Community Church
						</Heading>
						<Text size="lg" tone="secondary" className="mt-6">
							This site is connected to Prismic but the home page
							document hasn’t been created yet. Add a Page with the
							UID <code>home</code> and it will appear here.
						</Text>
						<Stack direction="row" gap="sm" className="mt-10">
							<Button href="/connect">Get in touch</Button>
						</Stack>
					</Container>
				</Section>
			</main>
		);
	}

	return (
		<main id="main">
			<SliceZone
				slices={page.data.slices}
				components={components}
				context={sliceContext()}
			/>
		</main>
	);
}
