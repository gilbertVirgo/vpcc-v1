import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
	{
		ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts"],
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
