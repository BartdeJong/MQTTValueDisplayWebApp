import js from "@eslint/js";
import globals from "globals";
import svelte from "eslint-plugin-svelte";

export default [
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	{
		files: ["**/*.{js,mjs,svelte}"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: js.configs.recommended.rules,
	},
	...svelte.configs["flat/recommended"],
];
