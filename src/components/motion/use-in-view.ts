"use client";

import { useCallback, useState } from "react";

export interface UseInViewOptions {
	/** Stop observing after the first intersection. */
	once?: boolean;
	rootMargin?: string;
	threshold?: number;
}

/**
 * Fires once an element scrolls into view.
 *
 * Wired as a callback ref rather than an effect, so the observer attaches at
 * the moment the node lands in the DOM — no second render pass, and no
 * ordering assumptions about when the ref is populated.
 *
 * The negative bottom margin holds the trigger back slightly so content
 * animates as it settles into the viewport rather than the instant its top
 * edge clips the fold.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
	once = true,
	rootMargin = "0px 0px -12% 0px",
	threshold = 0.1,
}: UseInViewOptions = {}) {
	const [inView, setInView] = useState(false);

	const ref = useCallback(
		(node: T | null) => {
			if (!node) return;

			// No IntersectionObserver: show everything rather than nothing.
			if (typeof IntersectionObserver === "undefined") {
				setInView(true);
				return;
			}

			/*
			 * An element that has already scrolled past the top of the viewport
			 * — after a hash navigation or a browser scroll restore — never
			 * intersects again, so the observer alone would leave it hidden
			 * permanently. Resolve that case up front.
			 */
			if (node.getBoundingClientRect().bottom <= 0) {
				setInView(true);
				if (once) return;
			}

			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							setInView(true);
							if (once) observer.unobserve(entry.target);
						} else if (!once) {
							setInView(false);
						}
					}
				},
				{ rootMargin, threshold },
			);

			observer.observe(node);
			return () => observer.disconnect();
		},
		[once, rootMargin, threshold],
	);

	return { ref, inView };
}
