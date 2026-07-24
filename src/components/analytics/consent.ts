"use client";

import { useSyncExternalStore } from "react";

/**
 * Analytics consent.
 *
 * Google Analytics sets cookies that are not strictly necessary to deliver the
 * site, so under UK PECR they require consent before anything is loaded. This
 * stores the visitor's answer and gates the tag on it — GA is not merely
 * configured to hold off, it is never fetched until consent exists.
 */

export type ConsentState = "granted" | "denied" | null;

const KEY = "vpcc-analytics-consent";

const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	/* Another tab answering the banner should settle this one too. */
	window.addEventListener("storage", listener);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", listener);
	};
}

function getSnapshot(): ConsentState {
	try {
		const value = window.localStorage.getItem(KEY);
		return value === "granted" || value === "denied" ? value : null;
	} catch {
		// Private browsing, or storage disabled. Treat as undecided.
		return null;
	}
}

/*
 * The server has no way to know the answer, so it renders as undecided and the
 * client corrects it after hydration. useSyncExternalStore is what makes that
 * safe: reading localStorage during render, or in an effect, would either
 * mismatch hydration or flash the banner at everyone who has already answered.
 */
const getServerSnapshot = (): ConsentState => null;

export function useConsent(): ConsentState {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setConsent(value: Exclude<ConsentState, null>) {
	try {
		window.localStorage.setItem(KEY, value);
	} catch {
		// Nothing to persist to; the choice holds for this page view only.
	}
	notify();
}
