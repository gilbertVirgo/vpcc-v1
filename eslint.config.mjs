import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
	/* A config object carrying only `ignores` is a global ignore. These mirror
	   .prettierignore: build output and generated files. `.claude` holds nested
	   git worktrees, each with its own build output, so linting it means linting
	   every checkout at once. */
	{
		ignores: [
			"**/.next/**",
			"node_modules/**",
			"out/**",
			"build/**",
			"dist/**",
			".netlify/**",
			".claude/**",
			"next-env.d.ts",
			"prismicio-types.d.ts",
		],
	},
	...coreWebVitals,
	...typescript,
	{
		rules: {
			/* A leading underscore marks a binding that exists only to strip a
			   prop out of a rest spread. */
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					destructuredArrayIgnorePattern: "^_",
					ignoreRestSiblings: true,
				},
			],
		},
	},
];

export default config;
