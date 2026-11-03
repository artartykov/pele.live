import { PeleError, render } from "pele";
import { decodeLink, LinkError } from "./link.js";
import { PanZoom } from "./panzoom.js";

const element = <T extends HTMLElement>(id: string): T => {
	const found = document.getElementById(id);
	if (!found) {
		throw new Error(`Missing #${id}`);
	}
	return found as T;
};

const viewport = element("viewport");
const canvas = element("canvas");
const message = element("message");
const messageTitle = element("message-title");
const messageText = element("message-text");
const messageDetails = element("message-details");
const demo = element("demo");
const panZoom = new PanZoom(viewport, canvas);

const showMessage = (
	title: string,
	text: string,
	details = "",
	withDemo = false,
) => {
	canvas.replaceChildren();
	demo.hidden = !withDemo;
	messageTitle.textContent = title;
	messageText.textContent = text;
	messageDetails.textContent = details;
	messageDetails.hidden = !details;
	message.hidden = false;
};

const showError = (error: unknown) => {
	if (error instanceof LinkError) {
		showMessage("Cannot open the link", error.message);
		return;
	}
	if (error instanceof PeleError) {
		if (error.line) {
			showMessage(
				"Cannot draw the diagram",
				`Error at line ${error.line}, column ${error.column}.`,
				error.message,
			);
		} else {
			showMessage("Cannot draw the diagram", error.message);
		}
		return;
	}
	showMessage(
		"Cannot draw the diagram",
		error instanceof Error ? error.message : String(error),
	);
};

const homeUrl = () => document.baseURI.replace(/\/$/, "");

let latest = 0;

const show = async () => {
	const request = ++latest;
	if (location.hash.length <= 1) {
		showMessage(
			"No diagram in the link",
			`Take a mermaid.live link and replace https://mermaid.live with ${homeUrl()}.`,
			"",
			true,
		);
		return;
	}
	try {
		const diagram = await decodeLink(location.hash);
		if (request !== latest) {
			return;
		}
		const result = render(diagram.code, {
			responsive: false,
			config: diagram.config,
		});
		canvas.innerHTML = result.svg;
		message.hidden = true;
		panZoom.show(result.width, result.height);
	} catch (error) {
		if (request === latest) {
			showError(error);
		}
	}
};

window.addEventListener("hashchange", () => void show());
void show();
