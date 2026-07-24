import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignSystem } from "./design-system";

export const metadata: Metadata = {
	title: "Design system",
	robots: { index: false, follow: false },
};

/**
 * Every token and every component state on one page.
 *
 * Available in development, and on deploy previews where
 * NEXT_PUBLIC_SHOW_DESIGN_SYSTEM is set. 404s in production so it never ships
 * to visitors or search engines.
 */
export default function DesignSystemPage() {
	const visible =
		process.env.NODE_ENV !== "production" ||
		process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM === "true";

	if (!visible) notFound();

	return <DesignSystem />;
}
