import { expect, pakoHash, readTransform, test } from "./support.ts";

const flowchart = [
	"flowchart TD",
	"  A[Start] --> B{Ready?}",
	"  B -->|Yes| C[Ship it]",
	"  B -->|No| D[Fix it]",
	"  D --> B",
].join("\n");

const mermaidLiveLink =
	"#pako:eNpVVGtP20AQ_Curk4qolDgPoAlWAUFCgYrSCqiqFqPqYm_sK-c76x4NaZL_3vU5piX-cl7v7MzOxF6xVGfIYjaXepEW3Di4nyYK6Hf6cK15JlQOX2-vYc6FxCyCbwgpV-DMEpyGuci9QdDewaJYRo_Q7R6vp1jPhI93n2_WcLb7RSK3hCowfQJX0EkrqyXWeIsYSnUvcJUBGqMNZOiIzkZvGyVn9ViYrK7sv-ZUG4OpO9k0LZPA_B3tGqYt40QKYizQBKpbLqhG0oW1HkEoyIUr_Cx6PzO94yuVSh-WrRlmRj-hAinUU91YlxpU6IWFkBJshZiBr8LTuXhuxTZKbvQazldTkYHVJWq1hVqkHZfaE0jYML9d4PzfAh8eTm1wqmwsIkgAN7jav7KS6DDgH_-H16wXgbXuTXW13Cp-BaM4W9aL4OzWt1elhN1oiHcTtobL3XtK29vWnXtRIlGTq3xW23MprNNmSzU3ugTLy2DiwqIJUrwlr2iZ1CB3TeSZ4LnhZWtbGsKaQmFwDgkrnKts3OttMyLtvRJNyUXW_WVfjlL8xi5mguh7ISDbU7g44daKXCHaox3JZyjt0cznOw5pf2Kvb34arLRxUZntOOEkHp2FxN8M-7WnCSMFzf8lTE0Y67DciIzFznjssC0_vTarWn3C6rCoLaajwcw_d1MttUlYojYErbj6oXXZoo32ecHiOZeW7nyVkahp48ZLC4WOZqK9ciweDodhBotX7JnFB_uDaG_QH-wfjg7Hh3t74w5bUrUfvRvujwb94fhgQNdo02F_Amk_Go8OOox7p--WKm0pGts-NW9_-Ahs_gIAkFXR";

test("draws the diagram from the link", async ({ page }) => {
	await page.goto(`/${pakoHash({ code: flowchart })}`);

	const diagram = page.locator("#canvas svg");
	await expect(diagram).toBeVisible();
	await expect(diagram).toContainText("Start");
	await expect(diagram).toContainText("Ship it");
	await expect(page.getByRole("alert")).toBeHidden();
});

test("opens a mermaid.live link after replacing the domain", async ({
	page,
}) => {
	await page.goto(`/edit/${mermaidLiveLink}`);

	const diagram = page.locator("#canvas svg");
	await expect(diagram).toContainText("Is the JSON correct?");
	await expect(diagram).toContainText("Ask them to send");
	await expect(
		diagram.locator('a[href*="mermaid-live-editor/issues/new"]'),
	).toHaveCount(1);
	await expect(page.getByRole("alert")).toBeHidden();
});

test("opens the demo from the home page", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("alert")).toContainText("No diagram in the link");

	await page.getByRole("link", { name: "Open demo" }).click();

	await expect(page.locator("#canvas svg")).toContainText(
		"Is the JSON correct?",
	);
	await expect(page.getByRole("alert")).toBeHidden();
});

test("explains a broken link and a broken diagram", async ({ page }) => {
	await page.goto("/#pako:not-a-diagram");
	await expect(page.getByRole("alert")).toContainText(
		"The link is damaged and cannot be decoded.",
	);

	await page.goto(
		`/${pakoHash({ code: "flowchart TD\n  A[Start] --> B\n  B --> [oops\n" })}`,
	);
	const alert = page.getByRole("alert");
	await expect(alert).toContainText("Cannot draw the diagram");
	await expect(alert).toContainText("Error at line 3, column 9.");
	await expect(page.locator("#canvas svg")).toHaveCount(0);
});

test("zooms with the wheel around the cursor", async ({ page }) => {
	await page.goto(`/${pakoHash({ code: flowchart })}`);
	await expect(page.locator("#canvas svg")).toBeVisible();
	const before = await readTransform(page);

	const cursor = { x: 500, y: 300 };
	await page.mouse.move(cursor.x, cursor.y);
	await page.mouse.wheel(0, -300);
	await expect
		.poll(async () => (await readTransform(page)).scale)
		.toBeGreaterThan(before.scale);

	const after = await readTransform(page);
	expect((cursor.x - after.x) / after.scale).toBeCloseTo(
		(cursor.x - before.x) / before.scale,
		3,
	);
	expect((cursor.y - after.y) / after.scale).toBeCloseTo(
		(cursor.y - before.y) / before.scale,
		3,
	);
});

test("drags the diagram and fits it back on double-click", async ({ page }) => {
	await page.goto(`/${pakoHash({ code: flowchart })}`);
	await expect(page.locator("#canvas svg")).toBeVisible();
	const fitted = await readTransform(page);

	await page.mouse.move(400, 300);
	await page.mouse.down();
	await page.mouse.move(520, 360, { steps: 6 });
	await page.mouse.up();

	const dragged = await readTransform(page);
	expect(dragged.x).toBeCloseTo(fitted.x + 120, 3);
	expect(dragged.y).toBeCloseTo(fitted.y + 60, 3);
	expect(dragged.scale).toBe(fitted.scale);

	await page.mouse.dblclick(400, 300);
	expect(await readTransform(page)).toEqual(fitted);
});
