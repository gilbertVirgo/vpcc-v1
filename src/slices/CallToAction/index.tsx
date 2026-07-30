import type { Content } from "@prismicio/client";
import type { SliceComponentProps } from "@prismicio/react";
import type { FC } from "react";

import { Reveal } from "@/components/motion/reveal";
import { PrismicButtonGroup } from "@/components/prismic/link";
import { PrismicHeading, PrismicProse } from "@/components/prismic/rich-text";
import { Container, Section } from "@/components/ui/layout";

export type CallToActionProps = SliceComponentProps<Content.CallToActionSlice>;

const TONES = {
	default: undefined,
	sunken: "sunken",
	inverse: "inverse",
} as const;

const CallToAction: FC<CallToActionProps> = ({ slice }) => {
	const tone = TONES[slice.primary.tone ?? "sunken"];
	const inverse = tone === "inverse";

	return (
		<Section spacing="md" tone={tone}>
			<Container size="text" className="text-center">
				<Reveal>
					<PrismicHeading
						field={slice.primary.title}
						as="h2"
						size="h2"
						tone={inverse ? "inverse" : undefined}
					/>
					<PrismicProse
						field={slice.primary.body}
						tone={inverse ? "inverse" : undefined}
						className="mx-auto mt-5"
					/>
					<div className="mt-8 flex justify-center">
						<PrismicButtonGroup
							buttons={slice.primary.buttons}
							size="lg"
						/>
					</div>
				</Reveal>
			</Container>
		</Section>
	);
};

export default CallToAction;
