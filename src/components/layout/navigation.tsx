"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/lib/site-config";

/** Distance scrolled before the bar takes on a background and a hairline. */
const SCROLL_THRESHOLD = 8;

export interface NavigationProps {
	links: NavLink[];
	cta: NavLink;
}

export function Navigation({ links, cta }: NavigationProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const drawerRef = useRef<HTMLDialogElement>(null);

	/* Scroll position is read inside rAF so a fast scroll doesn't queue a
	   state update per event. */
	useEffect(() => {
		let frame = 0;
		const onScroll = () => {
			if (frame) return;
			frame = window.requestAnimationFrame(() => {
				setScrolled(window.scrollY > SCROLL_THRESHOLD);
				frame = 0;
			});
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			if (frame) window.cancelAnimationFrame(frame);
		};
	}, []);

	useEffect(() => {
		const drawer = drawerRef.current;
		if (!drawer) return;

		if (menuOpen && !drawer.open) {
			drawer.showModal();
			document.body.style.overflow = "hidden";
		} else if (!menuOpen && drawer.open) {
			drawer.close();
		}
	}, [menuOpen]);

	/*
	 * Navigating away has to close the drawer, or the panel stays over the page
	 * the link just loaded.
	 *
	 * Adjusted during render rather than in an effect: React re-runs this
	 * component before committing, so the drawer never paints in the open state
	 * on the new route. Keying off the pathname rather than the link's onClick
	 * also covers back/forward navigation, which no click handler sees.
	 */
	const [lastPathname, setLastPathname] = useState(pathname);
	if (pathname !== lastPathname) {
		setLastPathname(pathname);
		setMenuOpen(false);
	}

	useEffect(() => {
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	const handleDrawerClose = useCallback(() => {
		document.body.style.overflow = "";
		setMenuOpen(false);
	}, []);

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	return (
		<header
			className={cn(
				"sticky top-0 z-nav",
				"transition-[background-color,border-color,backdrop-filter]",
				"duration-base ease-standard",
				scrolled
					? "border-b border-line bg-surface/85 backdrop-blur-md"
					: "border-b border-transparent bg-transparent",
			)}
		>
			<Container>
				<nav
					aria-label="Primary"
					className="flex h-18 items-center justify-between gap-6 sm:h-20"
				>
					<NextLink
						href="/"
						className="text-accent transition-opacity duration-fast ease-standard hover:opacity-80"
					>
						<Logo className="size-10 sm:size-11" />
					</NextLink>

					{/* Desktop */}
					<div className="hidden items-center gap-8 sm:flex">
						<ul className="flex items-center gap-7">
							{links.map((link) => (
								<li key={link.href}>
									<NavItem
										href={link.href}
										active={isActive(link.href)}
									>
										{link.label}
									</NavItem>
								</li>
							))}
						</ul>
						<Button href={cta.href} size="sm">
							{cta.label}
						</Button>
					</div>

					{/* Mobile */}
					<button
						type="button"
						onClick={() => setMenuOpen(true)}
						aria-label="Open menu"
						aria-expanded={menuOpen}
						aria-haspopup="dialog"
						className={cn(
							"-mr-2 rounded-pill p-2 text-ink sm:hidden",
							"transition-colors duration-fast ease-standard",
							"hover:bg-surface-sunken",
						)}
					>
						<Icon name="menu" />
					</button>
				</nav>
			</Container>

			<dialog
				ref={drawerRef}
				data-drawer=""
				onClose={handleDrawerClose}
				aria-label="Menu"
				className={cn(
					"h-dvh max-h-dvh w-[min(22rem,85vw)] max-w-none",
					"border-l border-line bg-surface p-0 text-ink",
					"backdrop:bg-neutral-950/40",
				)}
			>
				<div className="flex h-full flex-col">
					<div className="flex h-18 shrink-0 items-center justify-between gutter">
						<Logo className="size-10 text-accent" title="" />
						<button
							type="button"
							onClick={() => setMenuOpen(false)}
							aria-label="Close menu"
							className={cn(
								"-mr-2 rounded-pill p-2 text-ink-muted",
								"transition-colors duration-fast ease-standard",
								"hover:bg-surface-sunken hover:text-ink",
							)}
						>
							<Icon name="close" />
						</button>
					</div>

					<ul className="flex flex-1 flex-col gap-1 gutter pt-4">
						{links.map((link) => (
							<li key={link.href}>
								<NextLink
									href={link.href}
									aria-current={
										isActive(link.href) ? "page" : undefined
									}
									className={cn(
										"block rounded-md py-3 text-h4",
										"transition-colors duration-fast ease-standard",
										isActive(link.href)
											? "text-ink-accent"
											: "text-ink hover:text-ink-accent",
									)}
								>
									{link.label}
								</NextLink>
							</li>
						))}
					</ul>

					<div className="shrink-0 gutter pb-8">
						<Button href={cta.href} block>
							{cta.label}
						</Button>
					</div>
				</div>
			</dialog>
		</header>
	);
}

function NavItem({
	href,
	active,
	children,
}: {
	href: string;
	active: boolean;
	children: React.ReactNode;
}) {
	return (
		<NextLink
			href={href}
			aria-current={active ? "page" : undefined}
			className={cn(
				"relative text-body-sm transition-colors duration-fast ease-standard",
				/* Underline grows from the centre on hover and stays put on the
				   current page. Scaling a pseudo-element keeps this off the
				   layout path. */
				"after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full",
				"after:bg-accent after:transition-transform after:duration-base",
				"after:ease-standard after:content-['']",
				active
					? "text-ink after:scale-x-100"
					: "text-ink-secondary hover:text-ink after:scale-x-0 hover:after:scale-x-100",
			)}
		>
			{children}
		</NextLink>
	);
}
