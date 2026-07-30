"use client";

import { useEffect } from "react";

import {
	Button,
	Container,
	Heading,
	Section,
	Stack,
	Text,
} from "@/components/ui";
import { siteConfig } from "@/lib/site-config";

/**
 * Route-level error boundary.
 *
 * `reset()` re-renders the segment, which recovers from a transient failure
 * without a full page load. The digest is surfaced quietly so a visitor can
 * quote it if they get in touch — the message itself is withheld in production
 * by Next, and shouldn't be shown regardless.
 */
export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						Something went wrong
					</Text>
					<Heading as="h1" size="h1" className="mt-4">
						This page didn’t load
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						Sorry about that. Try again, and if it keeps happening
						do let us know at {siteConfig.email}.
					</Text>
					<Stack direction="row" gap="sm" className="mt-10">
						<Button onClick={reset}>Try again</Button>
						<Button href="/" variant="secondary">
							Back to home
						</Button>
					</Stack>
					{error.digest ? (
						<Text size="caption" tone="muted" className="mt-10">
							Reference: {error.digest}
						</Text>
					) : null}
				</Container>
			</Section>
		</main>
	);
}
