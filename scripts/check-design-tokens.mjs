#!/usr/bin/env node
/*
 * Design-system guard.
 *
 * Components and slices must express colour and spacing through tokens. This
 * fails the build on raw hex/rgb colours and on arbitrary pixel values in
 * Tailwind brackets, which are the two ways a design system quietly rots.
 *
 * Token definitions themselves live in src/styles and are exempt.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SCAN = ["src/components", "src/slices", "src/app"];
const EXEMPT = [/^src\/styles\//, /^src\/app\/globals\.css$/];

/* Custom properties that are set locally at the point of use rather than
   declared in the token files. */
const LOCAL_VARS = new Set(["--reveal-index"]);

const RULES = [
	{
		name: "raw hex colour",
		re: /#[0-9a-fA-F]{3,8}\b/g,
		hint: "use a semantic colour token (see src/styles/tokens.color.css)",
	},
	{
		name: "raw rgb()/hsl() colour",
		re: /\b(?:rgba?|hsla?)\(/g,
		hint: "use a semantic colour token",
	},
	{
		// Anchored to the `utility-[` shape so it matches Tailwind arbitrary
		// values (`mt-[13px]`) and not ordinary array literals that happen to
		// contain a px string.
		name: "arbitrary pixel value",
		re: /[a-zA-Z0-9]-\[[^\]\s]*?\d+px[^\]\s]*?\]/g,
		hint: "use the spacing scale or add a token",
	},
];

/** @param {string} dir */
function* walk(dir) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return;
	}
	for (const entry of entries) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) yield* walk(full);
		else if (/\.(tsx?|jsx?|css)$/.test(entry)) yield full;
	}
}

const violations = [];

for (const base of SCAN) {
	for (const file of walk(join(ROOT, base))) {
		const rel = relative(ROOT, file);
		if (EXEMPT.some((re) => re.test(rel))) continue;

		const lines = readFileSync(file, "utf8").split("\n");
		lines.forEach((line, i) => {
			if (line.includes("design-tokens-ignore")) return;
			for (const rule of RULES) {
				rule.re.lastIndex = 0;
				const match = rule.re.exec(line);
				if (match) {
					violations.push(
						`${rel}:${i + 1}  ${rule.name} "${match[0]}" — ${rule.hint}`,
					);
				}
			}
		});
	}
}

/*
 * Dangling var() references.
 *
 * A `var(--color-text-primary)` left behind after the token was renamed to
 * `--color-ink` does not error — CSS silently falls back to the initial value,
 * so body text quietly becomes pure black instead of the brand ink. Nothing
 * else in the toolchain catches this.
 */
const defined = new Set();
for (const file of walk(join(ROOT, "src/styles"))) {
	const source = readFileSync(file, "utf8");
	for (const match of source.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)) {
		defined.add(match[1]);
	}
}

for (const base of [...SCAN, "src/styles"]) {
	for (const file of walk(join(ROOT, base))) {
		const rel = relative(ROOT, file);
		const lines = readFileSync(file, "utf8").split("\n");
		lines.forEach((line, i) => {
			for (const match of line.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)) {
				const name = match[1];
				if (defined.has(name) || LOCAL_VARS.has(name)) continue;
				violations.push(
					`${rel}:${i + 1}  dangling var() "${name}" — no such token; CSS will fall back silently`,
				);
			}
		});
	}
}

if (violations.length > 0) {
	console.error(
		`\nDesign token check failed — ${violations.length} violation(s):\n`,
	);
	for (const v of violations) console.error(`  ${v}`);
	console.error(
		"\nAdd a `design-tokens-ignore` comment on the line if the value is genuinely one-off.\n",
	);
	process.exit(1);
}

console.log("Design token check passed.");
