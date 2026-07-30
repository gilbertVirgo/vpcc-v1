import NextLink from "next/link";

import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { isExternalHref } from "@/lib/links";
import type { FooterSection } from "@/lib/site-config";

export interface FooterProps {
	name: string;
	sections: FooterSection[];
	meeting: { when: string; venue: string; address: string };
}

export function Footer({ name, sections, meeting }: FooterProps) {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-auto bg-surface-inverse text-ink-inverse">
			<Container>
				<div className="section-y">
					<div className="grid gap-12 sm:grid-cols-2 md:grid-cols-[auto_1fr]">
						<div>
							<NextLink
								href="/"
								className="inline-block transition-opacity duration-fast ease-standard hover:opacity-80"
							>
								<Logo className="size-12" />
							</NextLink>
							<Text
								size="sm"
								tone="inverse"
								className="mt-6 max-w-[24ch] opacity-70"
							>
								{meeting.when}
								<br />
								{meeting.venue}
								<br />
								{meeting.address}
							</Text>
						</div>

						<div className="grid gap-10 xs:grid-cols-2 md:grid-cols-4">
							{sections.map((section) => (
								<section key={section.title}>
									<h2 className="text-overline uppercase opacity-60">
										{section.title}
									</h2>
									<ul className="mt-4 flex flex-col gap-3">
										{section.links.map((link) => (
											<li key={link.label}>
												<FooterLink
													href={link.href}
													icon={link.icon}
												>
													{link.label}
												</FooterLink>
											</li>
										))}
									</ul>
								</section>
							))}
						</div>
					</div>

					<div className="mt-16 border-t border-line-inverse pt-8">
						<Text
							size="caption"
							tone="inverse"
							className="opacity-60"
						>
							© {year} {name}
						</Text>
					</div>
				</div>
			</Container>
		</footer>
	);
}

function FooterLink({
	href,
	icon,
	children,
}: {
	href: string;
	icon?: React.ComponentProps<typeof Icon>["name"];
	children: React.ReactNode;
}) {
	const classes = cn(
		"inline-flex items-center gap-2 text-body-sm",
		"opacity-80 transition-opacity duration-fast ease-standard",
		"hover:opacity-100 hover:underline hover:underline-offset-4",
	);

	const content = (
		<>
			{/* No extra opacity — the link is already at 80%, and a hairline
			    stroke at 16px disappears if it is dimmed twice. */}
			{icon ? <Icon name={icon} className="size-4" /> : null}
			{children}
		</>
	);

	/* PDFs and policy documents live in /assets, so they are same-origin but
	   not Next routes — treat any non-route path as a plain anchor. */
	const isDocument = href.startsWith("/assets/");

	if (isExternalHref(href) || isDocument) {
		return (
			<a
				href={href}
				target={isDocument ? undefined : "_blank"}
				rel={isDocument ? undefined : "noopener noreferrer"}
				className={classes}
			>
				{content}
			</a>
		);
	}

	return (
		<NextLink href={href} className={classes}>
			{content}
		</NextLink>
	);
}
