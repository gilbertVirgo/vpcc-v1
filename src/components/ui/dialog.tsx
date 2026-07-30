"use client";

import { type ReactNode, useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/cn";

import { Icon } from "./icon";

export interface DialogProps {
	open: boolean;
	onClose: () => void;
	/** Announced as the dialog's accessible name. */
	title: string;
	/** Hide the visible title but keep the accessible name. */
	hideTitle?: boolean;
	className?: string;
	children?: ReactNode;
}

/**
 * Built on the native <dialog> element.
 *
 * showModal() gives the focus trap, Esc-to-close, inert background and
 * top-layer stacking for free — all the parts a hand-rolled modal
 * traditionally gets subtly wrong. Enter/exit animation and the backdrop live
 * in src/styles/utilities.css.
 */
export function Dialog({
	open,
	onClose,
	title,
	hideTitle = false,
	className,
	children,
}: DialogProps) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
			// Prevent the page behind from scrolling under the dialog.
			document.body.style.overflow = "hidden";
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	useEffect(() => {
		return () => {
			document.body.style.overflow = "";
		};
	}, []);

	/* Esc and the browser's own close paths bypass onClose, so mirror the
	   element's state back into React rather than assuming we closed it. */
	const handleClose = useCallback(() => {
		document.body.style.overflow = "";
		onClose();
	}, [onClose]);

	/* The dialog element fills the top layer; its padding box is the panel.
	   A click landing on the element itself is therefore a backdrop click. */
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLDialogElement>) => {
			if (event.target === ref.current) onClose();
		},
		[onClose],
	);

	return (
		<dialog
			ref={ref}
			onClose={handleClose}
			onClick={handleClick}
			aria-label={hideTitle ? title : undefined}
			className={cn(
				"m-auto w-[min(36rem,calc(100vw-2rem))] max-w-none",
				"rounded-lg border border-line bg-surface p-0 text-ink",
				"shadow-overlay backdrop:bg-neutral-950/40",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-4 p-6 sm:p-8">
				<div className="min-w-0 flex-1">
					{hideTitle ? null : (
						<h2 className="text-h3 text-ink">{title}</h2>
					)}
					<div className={cn(hideTitle ? "" : "mt-4")}>
						{children}
					</div>
				</div>

				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className={cn(
						"-mt-1 -mr-1 shrink-0 rounded-pill p-2 text-ink-muted",
						"transition-colors duration-fast ease-standard",
						"hover:bg-surface-sunken hover:text-ink",
					)}
				>
					<Icon name="close" />
				</button>
			</div>
		</dialog>
	);
}
