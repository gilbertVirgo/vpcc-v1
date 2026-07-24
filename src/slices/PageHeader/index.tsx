import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type PageHeaderProps = SliceComponentProps<Content.PageHeaderSlice>;

/**
 * The opening block of a page. Renders the h1, so a page should carry at most
 * one — every other slice heading is an h2.
 */
const PageHeader: FC<PageHeaderProps> = ({ slice }) => (
	<Section as="header" spacing="lg">
		<Container size="text">
			<PrismicHeading field={slice.primary.title} as="h1" size="h1" />
			<PrismicProse field={slice.primary.intro} className="mt-6 text-body-lg" />
		</Container>
	</Section>
);

export default PageHeader;
