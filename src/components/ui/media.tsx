import NextImage, { type ImageProps as NextImageProps } from "next/image";

import { cn } from "@/lib/cn";

const RATIOS = {
	square: "aspect-square",
	portrait: "aspect-[3/4]",
	landscape: "aspect-[4/3]",
	wide: "aspect-[16/9]",
	ultrawide: "aspect-[21/9]",
	auto: "",
} as const;

export type AspectRatio = keyof typeof RATIOS;

export interface MediaProps
	extends Omit<NextImageProps, "className" | "fill" | "width" | "height"> {
	ratio?: AspectRatio;
	rounded?: boolean;
	className?: string;
	/** Intrinsic dimensions, required when ratio is "auto". */
	width?: number;
	height?: number;
}

/**
 * Image inside a fixed aspect-ratio box.
 *
 * The ratio is reserved before the image loads, so a slow photo shifts nothing
 * on the page. `sizes` defaults to full-viewport; pass a real value wherever
 * the image is narrower than the viewport or it will over-fetch.
 */
export function Media({
	ratio = "landscape",
	rounded = true,
	className,
	sizes = "100vw",
	alt,
	width,
	height,
	...props
}: MediaProps) {
	if (ratio === "auto") {
		return (
			<NextImage
				alt={alt}
				width={width}
				height={height}
				sizes={sizes}
				className={cn(
					"h-auto w-full",
					rounded ? "rounded-lg" : "",
					className,
				)}
				{...props}
			/>
		);
	}

	return (
		<div
			className={cn(
				"relative w-full overflow-hidden bg-surface-sunken",
				RATIOS[ratio],
				rounded ? "rounded-lg" : "",
				className,
			)}
		>
			<NextImage
				alt={alt}
				fill
				sizes={sizes}
				className="object-cover"
				{...props}
			/>
		</div>
	);
}
