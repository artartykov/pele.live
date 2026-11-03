export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"body-empty": [2, "always"],
		"footer-empty": [2, "always"],
		"scope-enum": [
			2,
			"always",
			["viewer", "link", "zoom", "e2e", "ci", "deps"],
		],
	},
};
