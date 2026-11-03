import { defineConfig, devices } from "@playwright/test";

const port = 4317;

export default defineConfig({
	testDir: "e2e",
	forbidOnly: Boolean(process.env.CI),
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["github"], ["list"]] : "list",
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		trace: "retain-on-failure",
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
	webServer: {
		command: `serve dist --listen tcp://127.0.0.1:${port} --no-clipboard`,
		url: `http://127.0.0.1:${port}`,
		reuseExistingServer: !process.env.CI,
		env: { NO_UPDATE_CHECK: "1" },
	},
});
