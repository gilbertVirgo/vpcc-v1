import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type RichTextProps = SliceComponentProps<Content.RichTextSlice>;

/** Free-form prose, for anything the structured slices don't cover. */
const RichText: FC<RichTextProps> = ({ slice }) => (
	<Section spacing="sm">
		<Container size="text">
			<PrismicProse field={slice.primary.content} />
		</Container>
	</Section>
);

export default RichText;
