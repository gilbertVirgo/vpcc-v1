import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { ContactForm as Form } from "@/components/forms/contact-form";
import {
	hasContent,
	PrismicHeading,
	PrismicProse,
} from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type ContactFormProps = SliceComponentProps<Content.ContactFormSlice>;

/**
 * Embeds the contact or donate form in a page.
 *
 * Renders the same component the standalone /connect and /donate routes use,
 * so the two can never drift apart.
 */
const ContactForm: FC<ContactFormProps> = ({ slice }) => {
	/* On /connect and /donate the page header already carries the heading and
	   intro, so this slice is the form alone. Spacing it away from a heading
	   that isn't there leaves a hole under the intro above. */
	const hasIntro =
		hasContent(slice.primary.title) || hasContent(slice.primary.intro);

	return (
		<Section spacing="md">
			<Container size="text">
				<PrismicHeading field={slice.primary.title} as="h2" size="h2" />
				<PrismicProse field={slice.primary.intro} className="mt-5" />
				<div className={hasIntro ? "mt-12" : undefined}>
					<Form
						variant={
							slice.primary.form === "donate"
								? "donate"
								: "contact"
						}
					/>
				</div>
			</Container>
		</Section>
	);
};

export default ContactForm;
