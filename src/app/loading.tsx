import { Container, Section } from "@/components/ui";

/**
 * Route-level loading state.
 *
 * Blocks of the page tone rather than a spinner: pages here are static and
 * resolve fast, so a spinner would flash more often than it would inform.
 * Nothing animates — a pulsing skeleton on a sub-100ms transition is noise.
 */
export default function Loading() {
	return (
		<main id="main" aria-busy="true" aria-label="Loading">
			<Section spacing="lg">
				<Container size="text">
					<div className="h-3 w-32 rounded-sm bg-surface-sunken" />
					<div className="mt-6 h-12 w-full rounded-md bg-surface-sunken" />
					<div className="mt-3 h-12 w-3/4 rounded-md bg-surface-sunken" />
					<div className="mt-8 h-4 w-full rounded-sm bg-surface-sunken" />
					<div className="mt-3 h-4 w-5/6 rounded-sm bg-surface-sunken" />
				</Container>
			</Section>
		</main>
	);
}
