import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { Container, Heading, Section, Text } from "@/components/ui";

export const metadata: Metadata = {
	title: "Donate",
	description:
		"Support the work of Victoria Park Community Church. Share your details and we’ll be in touch.",
};

export default function DonatePage() {
	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						Donate
					</Text>
					<Heading as="h1" size="h1" className="mt-4">
						Thank you for supporting us
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						Share your contact details below and we’ll be in touch soon
						to discuss the best way for you to give.
					</Text>

					<div className="mt-12">
						<ContactForm
							variant="donate"
							submitLabel="Send"
							successTitle="Thank you"
							successMessage="We’ve received your details and will be in touch soon to discuss how you’d like to give."
						/>
					</div>
				</Container>
			</Section>
		</main>
	);
}
