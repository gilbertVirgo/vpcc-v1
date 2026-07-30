"use client";

import NextLink from "next/link";
import { useState } from "react";

import { Reveal, Stagger } from "@/components/motion/reveal";
import {
	Accent,
	Badge,
	Button,
	Card,
	Container,
	Dialog,
	Divider,
	Field,
	FormStatus,
	Grid,
	Heading,
	Icon,
	type IconName,
	Input,
	Link,
	Notice,
	Prose,
	Section,
	Select,
	Slideshow,
	Stack,
	Text,
	Textarea,
	Toggle,
} from "@/components/ui";

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function DesignSystem() {
	return (
		<main id="main">
			<Section spacing="lg">
				<Container size="text">
					<Text size="overline" tone="accent">
						Victoria Park Community Church
					</Text>
					<Heading as="h1" size="display" className="mt-4">
						Design <Accent>system</Accent>
					</Heading>
					<Text size="lg" tone="secondary" className="mt-6">
						Every token and component state in the system. If a page
						needs something that is not on this page, it gets added
						here first.
					</Text>
				</Container>
			</Section>

			<Colour />
			<Typography />
			<SpaceAndLayout />
			<Motion />
			<Buttons />
			<Links />
			<Surfaces />
			<Notices />
			<Forms />
			<Overlays />
			<Media />
			<Icons />
		</main>
	);
}

/* -------------------------------------------------------------------------- */
/* Shared scaffolding                                                          */
/* -------------------------------------------------------------------------- */

function Block({
	title,
	description,
	children,
	tone,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	tone?: "sunken";
}) {
	return (
		<Section spacing="md" tone={tone} className="border-t border-line">
			<Container>
				<Heading as="h2" size="h2">
					{title}
				</Heading>
				{description ? (
					<Text tone="muted" measure className="mt-3">
						{description}
					</Text>
				) : null}
				<div className="mt-10">{children}</div>
			</Container>
		</Section>
	);
}

function Subheading({ children }: { children: React.ReactNode }) {
	return (
		<Text size="overline" tone="muted" className="mb-4">
			{children}
		</Text>
	);
}

/* -------------------------------------------------------------------------- */
/* Colour                                                                      */
/* -------------------------------------------------------------------------- */

const NEUTRAL = [
	{ step: "50", className: "bg-neutral-50", contrast: "—" },
	{ step: "100", className: "bg-neutral-100", contrast: "1.09" },
	{ step: "200", className: "bg-neutral-200", contrast: "1.28" },
	{ step: "300", className: "bg-neutral-300", contrast: "1.68" },
	{ step: "400", className: "bg-neutral-400", contrast: "2.53" },
	{ step: "500", className: "bg-neutral-500", contrast: "3.98" },
	{ step: "600", className: "bg-neutral-600", contrast: "6.05" },
	{ step: "700", className: "bg-neutral-700", contrast: "8.95" },
	{ step: "800", className: "bg-neutral-800", contrast: "12.47" },
	{ step: "900", className: "bg-neutral-900", contrast: "15.90" },
	{ step: "950", className: "bg-neutral-950", contrast: "18.89" },
];

const PRIMARY = [
	{ step: "50", className: "bg-primary-50", contrast: "1.05" },
	{ step: "100", className: "bg-primary-100", contrast: "1.15" },
	{ step: "200", className: "bg-primary-200", contrast: "1.35" },
	{ step: "300", className: "bg-primary-300", contrast: "1.65" },
	{ step: "400", className: "bg-primary-400", contrast: "2.05" },
	{ step: "500", className: "bg-primary-500", contrast: "2.19" },
	{ step: "600", className: "bg-primary-600", contrast: "3.37" },
	{ step: "700", className: "bg-primary-700", contrast: "4.83" },
	{ step: "800", className: "bg-primary-800", contrast: "7.35" },
	{ step: "900", className: "bg-primary-900", contrast: "11.28" },
];

function Ramp({
	name,
	steps,
}: {
	name: string;
	steps: { step: string; className: string; contrast: string }[];
}) {
	return (
		<div>
			<Subheading>{name} · contrast on surface</Subheading>
			<div className="grid grid-cols-3 gap-3 xs:grid-cols-4 md:grid-cols-11">
				{steps.map((swatch) => (
					<div key={swatch.step}>
						<div
							className={`h-16 rounded-md border border-line ${swatch.className}`}
						/>
						<Text size="caption" tone="secondary" className="mt-2">
							{swatch.step}
						</Text>
						<Text size="caption" tone="muted">
							{swatch.contrast}
						</Text>
					</div>
				))}
			</div>
		</div>
	);
}

function Colour() {
	return (
		<Block
			title="Colour"
			description="Ramps are generated in OKLCH from the three brand seeds. Components reference the semantic layer only — never a raw ramp step."
		>
			<Stack gap="xl">
				<Ramp name="Neutral" steps={NEUTRAL} />
				<Ramp name="Primary" steps={PRIMARY} />

				<div>
					<Subheading>Semantic</Subheading>
					<Grid cols={3} gap="md">
						<Card padding="sm">
							<Text size="caption" tone="muted">
								Text on surface
							</Text>
							<Text className="mt-2">ink · 18.89:1</Text>
							<Text tone="secondary">ink-secondary · 8.95:1</Text>
							<Text tone="muted">ink-muted · 6.05:1</Text>
							<Text tone="accent">ink-accent · 4.83:1</Text>
						</Card>

						<Card padding="sm" className="bg-surface-inverse">
							<Text size="caption" tone="inverse">
								Inverse
							</Text>
							<Text tone="inverse" className="mt-2">
								ink-inverse on surface-inverse · 18.89:1
							</Text>
							<Text
								size="caption"
								tone="inverse"
								className="mt-3"
							>
								ink-accent is only 3.91:1 here, so rich text on
								a dark band takes the inverse Prose tone
								instead.
							</Text>
						</Card>

						<Card padding="sm">
							<Text size="caption" tone="muted">
								Accent fill
							</Text>
							<div className="mt-3 rounded-md bg-accent p-4">
								<Text className="text-accent-contrast">
									accent-contrast on accent · 8.61:1
								</Text>
							</div>
							<Text size="caption" tone="muted" className="mt-3">
								primary-500 is a fill, never text. As text on
								surface it is 2.19:1 and fails AA at every size.
							</Text>
						</Card>
					</Grid>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
/* -------------------------------------------------------------------------- */

const SCALE = [
	{ name: "display", className: "text-display" },
	{ name: "h1", className: "text-h1" },
	{ name: "h2", className: "text-h2" },
	{ name: "h3", className: "text-h3" },
	{ name: "h4", className: "text-h4" },
	{ name: "body-lg", className: "text-body-lg" },
	{ name: "body", className: "text-body" },
	{ name: "body-sm", className: "text-body-sm" },
	{ name: "caption", className: "text-caption" },
	{ name: "overline", className: "text-overline uppercase" },
];

function Typography() {
	return (
		<Block
			title="Typography"
			description="One family. Area Inktrap at 500 and 700 carries everything — emphasis comes from weight, size and colour rather than a second face."
			tone="sunken"
		>
			<Stack gap="xl">
				<div>
					<Subheading>
						Scale · fluid between 375px and 1500px
					</Subheading>
					<Stack gap="md">
						{SCALE.map((step) => (
							<div
								key={step.name}
								className="flex flex-col gap-1 border-b border-line pb-4 sm:flex-row sm:items-baseline sm:gap-6"
							>
								<Text
									size="caption"
									tone="muted"
									className="w-24 shrink-0"
								>
									{step.name}
								</Text>
								<p className={step.className}>
									We are Victoria Park Community Church
								</p>
							</div>
						))}
					</Stack>
				</div>

				<div>
					<Subheading>
						Accent fragment · weight 500 against 700
					</Subheading>
					<Heading size="h1">
						April 3rd: <Accent>Hot Cross Buns</Accent>
					</Heading>
					<Heading size="h2" className="mt-6">
						Our story <Accent>(in brief)</Accent>
					</Heading>
				</div>

				<div>
					<Subheading>Prose · CMS rich text</Subheading>
					<Card padding="md" tone="raised">
						<Prose>
							<p>
								Victoria Park Community Church began in 2011,
								when friends and family gathered in Pastor
								Ben&rsquo;s living room with a shared vision: to
								enjoy and share the hope of the gospel in Tower
								Hamlets.
							</p>
							<p>
								We meet from 3:00pm&ndash;4:30pm at{" "}
								<a href="https://maps.app.goo.gl/CQFsTYqZfuUAEvuP7">
									Victoria Park Baptist Church
								</a>
								, 186 Grove Road, London E3 5TG.
							</p>
							<h3>What to expect</h3>
							<ul>
								<li>Conversation practice</li>
								<li>Cooking together</li>
								<li>
									<strong>Stories</strong> and discussion
								</li>
							</ul>
						</Prose>
					</Card>
				</div>

				<div>
					<Subheading>Prose · inverse tone</Subheading>
					<div className="rounded-lg bg-surface-inverse p-6">
						<Prose tone="inverse">
							<p>
								Rich text on a dark band. Links take the
								band&rsquo;s own ink at 18.89:1 —{" "}
								<a href="https://maps.app.goo.gl/CQFsTYqZfuUAEvuP7">
									find us
								</a>{" "}
								— and lean on the underline, because{" "}
								<strong>ink-accent</strong> is an orange tuned
								for light surfaces and only reaches 3.91:1 on
								this fill.
							</p>
						</Prose>
					</div>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Space and layout                                                            */
/* -------------------------------------------------------------------------- */

const SPACING = [
	"1",
	"2",
	"3",
	"4",
	"5",
	"6",
	"8",
	"10",
	"12",
	"16",
	"20",
	"24",
];
const SPACING_WIDTHS: Record<string, string> = {
	"1": "w-1",
	"2": "w-2",
	"3": "w-3",
	"4": "w-4",
	"5": "w-5",
	"6": "w-6",
	"8": "w-8",
	"10": "w-10",
	"12": "w-12",
	"16": "w-16",
	"20": "w-20",
	"24": "w-24",
};

function SpaceAndLayout() {
	return (
		<Block
			title="Space & layout"
			description="A 4px base scale, fluid section rhythm, and a gutter owned exclusively by Container."
		>
			<Stack gap="xl">
				<div>
					<Subheading>Spacing scale · 4px base</Subheading>
					<Stack gap="xs">
						{SPACING.map((step) => (
							<div key={step} className="flex items-center gap-4">
								<Text
									size="caption"
									tone="muted"
									className="w-10 shrink-0"
								>
									{step}
								</Text>
								<div
									className={`h-3 rounded-sm bg-accent ${SPACING_WIDTHS[step]}`}
								/>
							</div>
						))}
					</Stack>
				</div>

				<div>
					<Subheading>Containers</Subheading>
					<Stack gap="sm">
						{(["narrow", "text", "default", "wide"] as const).map(
							(size) => (
								<div
									key={size}
									className="rounded-md bg-surface-sunken py-2"
								>
									<Container size={size}>
										<div className="rounded-sm bg-accent-subtle px-3 py-2">
											<Text size="caption" tone="accent">
												{size}
											</Text>
										</div>
									</Container>
								</div>
							),
						)}
					</Stack>
				</div>

				<div>
					<Subheading>Breakpoints</Subheading>
					<Grid cols={4} gap="sm">
						{[
							["xs", "500px"],
							["sm", "750px"],
							["md", "1150px"],
							["lg", "1350px"],
							["xl", "1500px"],
						].map(([name, value]) => (
							<Card key={name} padding="sm">
								<Text size="overline" tone="muted">
									{name}
								</Text>
								<Text className="mt-1">{value}</Text>
							</Card>
						))}
					</Grid>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

function Motion() {
	const [key, setKey] = useState(0);

	return (
		<Block
			title="Motion"
			description="Only transform and opacity animate. Reduced motion is handled once at the token layer — turn it on in your OS and every effect below collapses to an instant render."
			tone="sunken"
		>
			<Stack gap="xl">
				<div>
					<Subheading>Durations & easings</Subheading>
					<Grid cols={3} gap="sm">
						{[
							["instant", "80ms", "colour on hover"],
							["fast", "160ms", "small state changes"],
							["base", "240ms", "the default"],
							["slow", "400ms", "reveals, drawers"],
							["slower", "640ms", "page transitions"],
						].map(([name, value, use]) => (
							<Card key={name} padding="sm">
								<Text size="overline" tone="muted">
									{name}
								</Text>
								<Text className="mt-1">{value}</Text>
								<Text size="caption" tone="muted">
									{use}
								</Text>
							</Card>
						))}
					</Grid>
				</div>

				<div>
					<div className="flex items-center justify-between gap-4">
						<Subheading>Reveal & stagger</Subheading>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => setKey((k) => k + 1)}
						>
							Replay
						</Button>
					</div>
					<Stagger
						key={key}
						className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-4"
						itemClassName="h-full"
					>
						{[1, 2, 3, 4].map((n) => (
							<Card key={n} padding="sm" className="h-full">
								<Text size="overline" tone="muted">
									Item {n}
								</Text>
								<Text className="mt-1">
									Fades and lifts{" "}
									{n === 1 ? "first" : `${n}th`}
								</Text>
							</Card>
						))}
					</Stagger>
				</div>

				<div>
					<Subheading>Single reveal</Subheading>
					<Reveal key={`single-${key}`}>
						<Card padding="md" tone="raised">
							<Text>
								12px rise, 400ms, entrance easing. Nothing
								loops, nothing overshoots.
							</Text>
						</Card>
					</Reveal>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Buttons                                                                     */
/* -------------------------------------------------------------------------- */

function Buttons() {
	const [loading, setLoading] = useState(false);

	return (
		<Block title="Button">
			<Stack gap="xl">
				<div>
					<Subheading>Variants</Subheading>
					<Stack direction="row" gap="sm" align="center">
						<Button variant="primary">Get directions</Button>
						<Button variant="secondary">Find out more</Button>
						<Button variant="ghost">Skip</Button>
					</Stack>
				</div>

				<div className="rounded-lg bg-surface-inverse p-6">
					<Subheading>Inverse</Subheading>
					<Stack direction="row" gap="sm" align="center">
						<Button variant="primary">Donate</Button>
						<Button variant="inverse">Learn more</Button>
					</Stack>
				</div>

				<div>
					<Subheading>Sizes</Subheading>
					<Stack direction="row" gap="sm" align="center">
						<Button size="sm">Small</Button>
						<Button size="md">Medium</Button>
						<Button size="lg">Large</Button>
					</Stack>
				</div>

				<div>
					<Subheading>States</Subheading>
					<Stack direction="row" gap="sm" align="center">
						<Button disabled>Disabled</Button>
						<Button
							loading={loading}
							onClick={() => {
								setLoading(true);
								window.setTimeout(
									() => setLoading(false),
									1600,
								);
							}}
						>
							{loading ? "Sending" : "Send"}
						</Button>
						<Button href="/design-system">Internal link</Button>
						<Button href="https://fiec.org.uk" variant="secondary">
							External link
							<Icon name="external" className="size-4" />
						</Button>
					</Stack>
				</div>

				<div>
					<Subheading>Block</Subheading>
					<div className="max-w-narrow">
						<Button block>Send</Button>
					</div>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Links                                                                       */
/* -------------------------------------------------------------------------- */

function Links() {
	return (
		<Block title="Link" tone="sunken">
			<Stack gap="lg">
				<Text measure>
					An <Link href="/design-system">inline link</Link> is
					underlined because colour alone is not an accessible
					affordance. An{" "}
					<Link href="https://fiec.org.uk">external link</Link> gets
					target and rel applied automatically.
				</Text>
				<Stack direction="row" gap="lg">
					<Link href="/design-system" variant="standalone">
						Standalone
					</Link>
					<Link href="/design-system" variant="muted">
						Muted
					</Link>
				</Stack>
				<div className="rounded-lg bg-surface-inverse p-6">
					<Link href="/design-system" variant="inverse">
						Inverse
					</Link>
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                    */
/* -------------------------------------------------------------------------- */

function Surfaces() {
	return (
		<Block
			title="Card, Divider & Badge"
			description="Depth is expressed with hairline borders. Shadows are reserved for things that genuinely float."
		>
			<Stack gap="xl">
				<Grid cols={3} gap="md">
					<Card tone="outlined">
						<Text size="overline" tone="muted">
							Outlined
						</Text>
						<Text className="mt-2">The house default.</Text>
					</Card>
					<Card tone="raised">
						<Text size="overline" tone="muted">
							Raised
						</Text>
						<Text className="mt-2">White on warm paper.</Text>
					</Card>
					<Card tone="sunken">
						<Text size="overline" tone="muted">
							Sunken
						</Text>
						<Text className="mt-2">Recedes from the page.</Text>
					</Card>
				</Grid>

				<Card interactive>
					<Text size="overline" tone="muted">
						Interactive
					</Text>
					<Text className="mt-2">
						Lifts 2px and sharpens its border on hover.
					</Text>
				</Card>

				<div>
					<Subheading>Badge</Subheading>
					<Stack direction="row" gap="sm" align="center">
						<Badge>This Sunday</Badge>
						<Badge tone="neutral">Weekly</Badge>
						<Badge tone="outline">Free</Badge>
					</Stack>
				</div>

				<div>
					<Subheading>Divider</Subheading>
					<Divider />
				</div>
			</Stack>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Notice                                                                      */
/* -------------------------------------------------------------------------- */

/*
 * Laid out by hand rather than through `Block`, because `Notice` is full-bleed
 * and brings its own `Container`. Nesting it inside another one would double
 * the gutter — the exact thing the gutter rule exists to prevent.
 */
function Notices() {
	return (
		<Section spacing="md" className="border-t border-line">
			<Container>
				<Heading as="h2" size="h2">
					Notice
				</Heading>
				<Text tone="muted" measure className="mt-3">
					A time-limited warning about a change to the ordinary run of
					things. One centred line on a pale accent wash, between
					hairlines. Site-wide, and shown only inside the window set
					in Settings — those dates never appear in the words. The
					emphasis is the editor’s: a bold fragment takes `ink`
					against the line’s `ink-secondary`.
				</Text>
			</Container>

			<Stack gap="lg" className="mt-10">
				<Notice>
					<strong>No Sunday service this week</strong> — we’re back as
					usual on 23 August
				</Notice>

				{/* Bold mid-line rather than opening it. */}
				<Notice>
					We’re meeting at <strong>Bethnal Green</strong> for the rest
					of the month —{" "}
					<NextLink
						href="/whats-on"
						className="underline decoration-current underline-offset-4 hover:decoration-2"
					>
						see what’s on
					</NextLink>
				</Notice>

				{/* No emphasis at all — an editor who bolded nothing. */}
				<Notice>
					The hall is closed for building work until Easter
				</Notice>
			</Stack>
		</Section>
	);
}

/* -------------------------------------------------------------------------- */
/* Forms                                                                       */
/* -------------------------------------------------------------------------- */

function Forms() {
	const [showError, setShowError] = useState(false);

	return (
		<Block
			title="Form"
			description="Controls read their id, name and aria wiring from Field context, so a label pointing at nothing is not expressible."
			tone="sunken"
		>
			<div className="max-w-text">
				<Stack gap="lg">
					<Field name="firstName" label="First name" required>
						<Input type="text" autoComplete="given-name" />
					</Field>

					<Field
						name="email"
						label="Email address"
						required
						hint="We will only use this to reply to you."
						error={
							showError
								? "Enter a valid email address."
								: undefined
						}
					>
						<Input type="email" autoComplete="email" />
					</Field>

					<Field name="reason" label="What is this about?">
						<Select defaultValue="">
							<option value="" disabled>
								Choose one
							</option>
							<option value="visiting">
								Visiting on a Sunday
							</option>
							<option value="kids">Kids and families</option>
							<option value="other">Something else</option>
						</Select>
					</Field>

					<Field name="message" label="Message" required>
						<Textarea placeholder="Tell us a little about yourself" />
					</Field>

					<Toggle
						label="Send me occasional updates about what is on"
						name="updates"
					/>

					<Stack direction="row" gap="sm" align="center">
						<Button>Send</Button>
						<Button
							variant="ghost"
							onClick={() => setShowError((v) => !v)}
						>
							Toggle error state
						</Button>
					</Stack>

					<Divider />

					<FormStatus tone="success" title="Message sent">
						Thank you for getting in touch. We will get back to you
						as soon as possible.
					</FormStatus>

					<FormStatus tone="error" title="Something went wrong">
						Your message has not been sent. Please try again, or
						email us directly at ben@vpcc.church.
					</FormStatus>
				</Stack>
			</div>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Overlays                                                                    */
/* -------------------------------------------------------------------------- */

function Overlays() {
	const [open, setOpen] = useState(false);

	return (
		<Block
			title="Dialog"
			description="Built on the native dialog element, so the focus trap, Esc handling and inert background come from the platform rather than from us."
		>
			<Button onClick={() => setOpen(true)}>Open dialog</Button>
			<Dialog
				open={open}
				onClose={() => setOpen(false)}
				title="Sunday reminder"
			>
				<Text tone="secondary">
					We meet from 3:00pm&ndash;4:30pm at Victoria Park Baptist
					Church, 186 Grove Road, London E3 5TG.
				</Text>
				<Stack direction="row" gap="sm" className="mt-6">
					<Button href="https://maps.app.goo.gl/CQFsTYqZfuUAEvuP7">
						Get directions
					</Button>
					<Button variant="ghost" onClick={() => setOpen(false)}>
						Close
					</Button>
				</Stack>
			</Dialog>
		</Block>
	);
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

const SAMPLE_IMAGES = [
	{ src: "/design-system/placeholder-1.svg", alt: "Placeholder one" },
	{ src: "/design-system/placeholder-2.svg", alt: "Placeholder two" },
	{ src: "/design-system/placeholder-3.svg", alt: "Placeholder three" },
];

function Media() {
	return (
		<Block
			title="Media & Slideshow"
			description="Aspect ratio is reserved before the image loads, so a slow photo shifts nothing. The carousel pauses on hover and focus, and does not autoplay under reduced motion."
			tone="sunken"
		>
			<Grid cols={2} gap="lg">
				<div>
					<Subheading>Slideshow</Subheading>
					<Slideshow
						images={SAMPLE_IMAGES}
						sizes="(min-width: 750px) 50vw, 100vw"
						unoptimized
					/>
				</div>
				<div>
					<Subheading>Ratios</Subheading>
					<Grid cols={2} gap="sm">
						{(
							["square", "portrait", "landscape", "wide"] as const
						).map((ratio) => (
							<div key={ratio}>
								<MediaSample ratio={ratio} />
								<Text
									size="caption"
									tone="muted"
									className="mt-2"
								>
									{ratio}
								</Text>
							</div>
						))}
					</Grid>
				</div>
			</Grid>
		</Block>
	);
}

function MediaSample({
	ratio,
}: {
	ratio: "square" | "portrait" | "landscape" | "wide";
}) {
	const classes = {
		square: "aspect-square",
		portrait: "aspect-[3/4]",
		landscape: "aspect-[4/3]",
		wide: "aspect-[16/9]",
	};
	return (
		<div
			className={`rounded-lg border border-line bg-surface-sunken ${classes[ratio]}`}
		/>
	);
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

const ICONS: IconName[] = [
	"arrow-left",
	"arrow-right",
	"chevron-left",
	"chevron-right",
	"chevron-down",
	"close",
	"menu",
	"mail",
	"phone",
	"pin",
	"calendar",
	"external",
	"instagram",
	"facebook",
];

function Icons() {
	return (
		<Block
			title="Icon"
			description="Drawn on a 24px grid at 1.75 stroke so they sit alongside Area Inktrap without reading heavier than the type."
		>
			<div className="grid grid-cols-3 gap-4 xs:grid-cols-4 md:grid-cols-7">
				{ICONS.map((name) => (
					<Card key={name} padding="sm" className="text-center">
						<Icon name={name} className="mx-auto" />
						<Text size="caption" tone="muted" className="mt-3">
							{name}
						</Text>
					</Card>
				))}
			</div>
		</Block>
	);
}
