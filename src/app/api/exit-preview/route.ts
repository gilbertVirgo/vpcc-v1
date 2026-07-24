import { exitPreview } from "@prismicio/next";

/** Ends a preview session and clears draft mode. */
export async function GET() {
	return await exitPreview();
}
