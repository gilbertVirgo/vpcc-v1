import type { Metadata } from "next";

import { Button, Container, Heading, Section, Stack, Text } from "@/components/ui";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
	title: "Page not found",
	robots: { index: false, follow: true },
};

export default function NotFound() {
	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						404
					</Text>
					<Heading as="h1" size="h1" className="mt-4">
						We couldn’t find that page
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						It may have moved, or the link may be out of date. You’re
						still very welcome — here’s where to go next.
					</Text>
					<Stack direction="row" gap="sm" className="mt-10">
						<Button href="/">Back to home</Button>
						<Button href="/whats-on" variant="secondary">
							What’s on
						</Button>
					</Stack>
					<Text size="sm" tone="muted" className="mt-10">
						If you think something is broken, email us at{" "}
						{siteConfig.email}.
					</Text>
				</Container>
			</Section>
		</main>
	);
}
