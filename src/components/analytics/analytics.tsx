"use client";

import Script from "next/script";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

import { setConsent, useConsent } from "./consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics 4, behind a consent banner.
 *
 * GA is loaded only once consent is granted. Declining leaves the site with no
 * analytics at all, which is the point — a banner whose "no" does nothing is
 * worse than no banner.
 *
 * Renders nothing when NEXT_PUBLIC_GA_ID is unset, so development and preview
 * builds are silent and no banner appears where there is nothing to consent to.
 */
export function Analytics() {
	const consent = useConsent();

	if (!GA_ID) return null;

	return (
		<>
			{consent === "granted" ? (
				<>
					<Script
						src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
						strategy="afterInteractive"
					/>
					<Script id="ga-init" strategy="afterInteractive">
						{`
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', '${GA_ID}', { anonymize_ip: true });
						`}
					</Script>
				</>
			) : null}

			{consent === null ? <ConsentBanner /> : null}
		</>
	);
}

function ConsentBanner() {
	return (
		<div
			role="region"
			aria-label="Cookies"
			className={cn(
				"fixed inset-x-0 bottom-0 z-toast",
				"border-t border-line bg-surface-raised shadow-overlay",
			)}
		>
			<Container>
				<div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
					<Text size="sm" tone="secondary" className="measure">
						We’d like to use Google Analytics to understand how people
						use this site. It sets cookies, so we’ll only do it if
						you’re happy. Everything works either way.
					</Text>
					<div className="flex shrink-0 gap-3">
						<Button size="sm" onClick={() => setConsent("granted")}>
							Allow
						</Button>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => setConsent("denied")}
						>
							No thanks
						</Button>
					</div>
				</div>
			</Container>
		</div>
	);
}
