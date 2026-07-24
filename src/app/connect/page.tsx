import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/contact-form";
import { Container, Heading, Section, Text } from "@/components/ui";

export const metadata: Metadata = {
	title: "Connect",
	description:
		"Get in touch with Victoria Park Community Church. We’d love to hear from you.",
};

export default function ConnectPage() {
	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						Connect
					</Text>
					<Heading as="h1" size="h1" className="mt-4">
						We’d love to hear from you
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						Fill in your details below and someone from Victoria Park
						Community Church will get back to you shortly.
					</Text>

					<div className="mt-12">
						<ContactForm variant="contact" />
					</div>
				</Container>
			</Section>
		</main>
	);
}
