import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";

export type InfoListProps = SliceComponentProps<Content.InfoListSlice>;

/**
 * Labelled detail rows — When / Where / Cost / Length, as on the ESOL page.
 *
 * A description list, so the label/value pairing is conveyed structurally
 * rather than only by layout.
 */
const InfoList: FC<InfoListProps> = ({ slice }) => {
	const rows = slice.primary.rows.filter((row) => row.label || row.value?.length);

	return (
		<Section spacing="sm">
			<Container size="text">
				<PrismicHeading field={slice.primary.title} as="h2" size="h3" />

				{rows.length > 0 ? (
					<dl className="mt-8 border-t border-line">
						{rows.map((row, index) => (
							<div
								key={index}
								className="grid gap-1 border-b border-line py-4 xs:grid-cols-[10rem_1fr] xs:gap-6"
							>
								<dt>
									<Text size="overline" tone="muted" as="span">
										{row.label}
									</Text>
								</dt>
								<dd>
									<PrismicProse field={row.value} />
								</dd>
							</div>
						))}
					</dl>
				) : null}
			</Container>
		</Section>
	);
};

export default InfoList;
