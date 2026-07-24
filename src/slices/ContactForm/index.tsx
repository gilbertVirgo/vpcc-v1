import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { ContactForm as Form } from "@/components/forms/contact-form";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type ContactFormProps = SliceComponentProps<Content.ContactFormSlice>;

/**
 * Embeds the contact or donate form in a page.
 *
 * Renders the same component the standalone /connect and /donate routes use,
 * so the two can never drift apart.
 */
const ContactForm: FC<ContactFormProps> = ({ slice }) => (
	<Section spacing="md">
		<Container size="text">
			<PrismicHeading field={slice.primary.title} as="h2" size="h2" />
			<PrismicProse field={slice.primary.intro} className="mt-5" />
			<div className="mt-12">
				<Form variant={slice.primary.form === "donate" ? "donate" : "contact"} />
			</div>
		</Container>
	</Section>
);

export default ContactForm;
