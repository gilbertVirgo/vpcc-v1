import { converter, formatHex, wcagContrast, clampChroma } from "culori";

const toOklch = converter("oklch");
const toRgb = converter("rgb");

const SEED = {
	light: "#FCFCF5",
	dark: "#0B0C17",
	primary: "#FF9035",
};

const L = toOklch(SEED.light);
const D = toOklch(SEED.dark);
const P = toOklch(SEED.primary);

console.log("SEEDS");
for (const [k, v] of Object.entries({ light: L, dark: D, primary: P })) {
	console.log(
		`  ${k.padEnd(8)} L=${v.l.toFixed(4)} C=${v.c.toFixed(4)} H=${(v.h ?? 0).toFixed(2)}`,
	);
}

const fmt = (c) =>
	`oklch(${(c.l * 100).toFixed(2)}% ${c.c.toFixed(4)} ${(c.h ?? 0).toFixed(2)})`;
const hex = (c) => formatHex(clampChroma(c, "oklch"));

// ---- Neutral ramp -------------------------------------------------------
// Warm paper at the top, cool ink at the bottom, genuinely neutral in the
// middle. Chroma is tapered to zero at the midpoint so mid-greys never pick up
// a green/cyan cast (which straight hue interpolation between a warm and a cool
// endpoint would produce).
const NEUTRAL_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// Perceptual lightness targets. Weighted toward the light end because that is
// where the UI lives: surfaces, hairlines, muted text.
const NEUTRAL_L = {
	50: 1.0,
	100: 0.965,
	200: 0.9,
	300: 0.8,
	400: 0.66,
	500: 0.52,
	600: 0.4,
	700: 0.29,
	800: 0.19,
	900: 0.1,
	950: 0.0,
};

const neutral = {};
for (const step of NEUTRAL_STEPS) {
	const t = NEUTRAL_L[step]; // 1 = light seed, 0 = dark seed
	const l = D.l + (L.l - D.l) * t;
	// Chroma taper: full at the extremes, zero at t = 0.5
	const away = Math.abs(t - 0.5) * 2; // 0 at midpoint, 1 at either end
	const taper = Math.pow(away, 1.4);
	const warm = t >= 0.5;
	const c = (warm ? L.c : D.c) * taper;
	const h = warm ? L.h : D.h;
	neutral[step] = { mode: "oklch", l, c, h };
}
// Preserve the exact brand seeds at the ends.
neutral[50] = L;
neutral[950] = D;

// ---- Primary ramp -------------------------------------------------------
// Constant hue. Lightness fans out from the seed; chroma follows a curve that
// peaks near the seed and falls away at both ends so tints stay clean and
// shades stay saturated rather than turning brown.
const PRIMARY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
const PRIMARY_L = {
	50: 0.975,
	100: 0.945,
	200: 0.895,
	300: 0.835,
	400: 0.775,
	500: P.l,
	600: 0.645,
	700: 0.555,
	800: 0.455,
	900: 0.35,
};
const PRIMARY_C = {
	50: 0.014,
	100: 0.032,
	200: 0.062,
	300: 0.098,
	400: 0.14,
	500: P.c,
	600: 0.165,
	700: 0.15,
	800: 0.125,
	900: 0.098,
};

const primary = {};
for (const step of PRIMARY_STEPS) {
	primary[step] = clampChroma(
		{ mode: "oklch", l: PRIMARY_L[step], c: PRIMARY_C[step], h: P.h },
		"oklch",
	);
}
primary[500] = P;

// ---- Report -------------------------------------------------------------
const onLight = (c) => wcagContrast(toRgb(c), toRgb(L));
const onDark = (c) => wcagContrast(toRgb(c), toRgb(D));

const table = (name, ramp) => {
	console.log(`\n${name}`);
	for (const [step, c] of Object.entries(ramp)) {
		console.log(
			`  ${String(step).padEnd(4)} ${hex(c).padEnd(9)} ${fmt(c).padEnd(30)}` +
				` on-light ${onLight(c).toFixed(2).padStart(5)}` +
				` on-dark ${onDark(c).toFixed(2).padStart(5)}`,
		);
	}
};

table("NEUTRAL", neutral);
table("PRIMARY", primary);

// ---- CSS ----------------------------------------------------------------
let css = "";
for (const [step, c] of Object.entries(neutral)) {
	css += `\t--color-neutral-${step}: ${fmt(c)}; /* ${hex(c)} */\n`;
}
css += "\n";
for (const [step, c] of Object.entries(primary)) {
	css += `\t--color-primary-${step}: ${fmt(c)}; /* ${hex(c)} */\n`;
}
console.log("\n---CSS---\n" + css);
