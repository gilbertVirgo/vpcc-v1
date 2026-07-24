import { type Content, isFilled } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Stagger } from "@/components/motion/reveal";
import { PrismicMedia } from "@/components/prismic/media";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";
import { Heading, Text } from "@/components/ui/typography";

export type TeamGridProps = SliceComponentProps<Content.TeamGridSlice>;

/**
 * The team, pulled from `team_member` documents.
 *
 * The relationship fetches name, role, bio and photo, so no second query is
 * needed to render a card.
 */
const TeamGrid: FC<TeamGridProps> = ({ slice }) => {
	const members = slice.primary.members
		.map((item) => item.member)
		.filter(isFilled.contentRelationship);

	return (
		<Section spacing="md">
			<Container>
				<div className="measure">
					<PrismicHeading field={slice.primary.title} as="h2" size="h2" />
					<PrismicProse field={slice.primary.intro} className="mt-5" />
				</div>

				{members.length > 0 ? (
					<Stagger
						className="mt-12 grid grid-cols-1 gap-8 xs:grid-cols-2 md:grid-cols-3"
						itemClassName="h-full"
					>
						{members.map((member, index) => {
							const data = member.data;
							if (!data) return null;
							return (
								<article key={member.id || index}>
									{data.photo?.url ? (
										<PrismicMedia
											field={data.photo}
											ratio="portrait"
											sizes="(min-width: 1150px) 33vw, (min-width: 500px) 50vw, 100vw"
											className="mb-5"
										/>
									) : null}
									<Heading as="h3" size="h4">
										{data.name}
									</Heading>
									{data.role ? (
										<Text
											size="overline"
											tone="accent"
											className="mt-2"
										>
											{data.role}
										</Text>
									) : null}
									<PrismicProse field={data.bio} className="mt-4" />
								</article>
							);
						})}
					</Stagger>
				) : null}
			</Container>
		</Section>
	);
};

export default TeamGrid;
