import { Accent, Button, Container, Heading, Section, Stack, Text } from "@/components/ui";

/**
 * Placeholder. Replaced in Phase 4 by the Prismic-driven home page.
 */
export default function HomePage() {
	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						Phase 1 · Design system
					</Text>
					<Heading as="h1" size="display" className="mt-4">
						Victoria Park <Accent>Community</Accent> Church
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						The foundation is in place: tokens, type, motion and the
						component primitives. Pages come next.
					</Text>
					<Stack direction="row" gap="sm" className="mt-10">
						<Button href="/design-system">View the design system</Button>
					</Stack>
				</Container>
			</Section>
		</main>
	);
}
