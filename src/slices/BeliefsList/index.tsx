import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Stagger } from "@/components/motion/reveal";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";

export type BeliefsListProps = SliceComponentProps<Content.BeliefsListSlice>;

/**
 * A numbered list of doctrinal statements.
 *
 * An ordered list, so the numbering is structural rather than decorative and
 * a screen reader announces position and count.
 */
const BeliefsList: FC<BeliefsListProps> = ({ slice }) => {
	const statements = slice.primary.statements.filter(
		(item) => item.statement?.length,
	);

	return (
		<Section spacing="md">
			<Container size="text">
				<PrismicHeading field={slice.primary.title} as="h2" size="h2" />
				<PrismicProse field={slice.primary.intro} className="mt-5" />

				{statements.length > 0 ? (
					<Stagger as="ol" className="mt-12 flex flex-col gap-8">
						{statements.map((item, index) => (
							<li
								key={index}
								className="grid grid-cols-[2rem_1fr] gap-4 border-t border-line pt-6"
							>
								<Text
									size="overline"
									tone="accent"
									aria-hidden="true"
								>
									{String(index + 1).padStart(2, "0")}
								</Text>
								<PrismicProse field={item.statement} />
							</li>
						))}
					</Stagger>
				) : null}
			</Container>
		</Section>
	);
};

export default BeliefsList;
