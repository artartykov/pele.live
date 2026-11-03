import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const routes = ["view", "edit"];

await rm("dist", { recursive: true, force: true });
await cp("static", "dist", { recursive: true });

const page = await readFile("static/index.html", "utf8");
if (!page.includes("<head>")) {
	throw new Error("static/index.html has no <head> tag");
}
const nestedPage = page.replace("<head>", '<head>\n\t\t<base href="../">');

for (const route of routes) {
	await mkdir(`dist/${route}`, { recursive: true });
	await writeFile(`dist/${route}/index.html`, nestedPage);
}
