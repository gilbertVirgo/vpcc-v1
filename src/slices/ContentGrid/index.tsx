import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Stagger } from "@/components/motion/reveal";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { Card } from "@/components/ui/surface";
import { Heading, Text } from "@/components/ui/typography";

export type ContentGridProps = SliceComponentProps<Content.ContentGridSlice>;

const ContentGrid: FC<ContentGridProps> = ({ slice }) => {
	const cells = slice.primary.cells.filter(
		(cell) => cell.title || cell.subtitle || cell.body?.length,
	);

	return (
		<Section spacing="md">
			<Container>
				<div className="measure">
					<PrismicHeading field={slice.primary.title} as="h2" size="h2" />
					<PrismicProse field={slice.primary.intro} className="mt-5" />
				</div>

				{cells.length > 0 ? (
					<Stagger
						className="mt-12 grid grid-cols-1 gap-6 xs:grid-cols-2 md:grid-cols-3"
						itemClassName="h-full"
					>
						{cells.map((cell, index) => (
							<Card key={index} className="h-full">
								{cell.title ? (
									<Heading as="h3" size="h4">
										{cell.title}
									</Heading>
								) : null}
								{cell.subtitle ? (
									<Text
										size="overline"
										tone="accent"
										className="mt-2"
									>
										{cell.subtitle}
									</Text>
								) : null}
								<PrismicProse field={cell.body} className="mt-4" />
							</Card>
						))}
					</Stagger>
				) : null}
			</Container>
		</Section>
	);
};

export default ContentGrid;
