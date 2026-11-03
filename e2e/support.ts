import { createRequire } from "node:module";
import { deflateSync } from "node:zlib";
import { test as base, expect, type Page } from "@playwright/test";

const peleBundle = createRequire(import.meta.url).resolve("pele");

export const test = base.extend<{ localPele: undefined }>({
	localPele: [
		async ({ page }, use) => {
			if (process.env.PELE_CDN !== "live") {
				await page.route("https://cdn.jsdelivr.net/npm/pele@1/**", (route) =>
					route.fulfill({ path: peleBundle, contentType: "text/javascript" }),
				);
			}
			await use(undefined);
		},
		{ auto: true },
	],
});

export { expect };

export const pakoHash = (state: object) =>
	`#pako:${deflateSync(JSON.stringify(state)).toString("base64url")}`;

export interface Transform {
	x: number;
	y: number;
	scale: number;
}

export const readTransform = async (page: Page): Promise<Transform> => {
	const value = await page
		.locator("#canvas")
		.evaluate((canvas) => canvas.style.transform);
	const match = value.match(
		/^translate\((-?[\d.e+-]+)px, (-?[\d.e+-]+)px\) scale\(([\d.e+-]+)\)$/,
	);
	if (!match) {
		throw new Error(`Unexpected transform: ${value}`);
	}
	return { x: Number(match[1]), y: Number(match[2]), scale: Number(match[3]) };
};
