import type { RenderOptions } from "pele";

export type DiagramConfig = NonNullable<RenderOptions["config"]>;

export interface Diagram {
	code: string;
	config: DiagramConfig | undefined;
}

export class LinkError extends Error {}

const decodeBase64 = (text: string): Uint8Array<ArrayBuffer> => {
	const normalized = text.replaceAll("-", "+").replaceAll("_", "/");
	const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
	return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
};

const inflate = (bytes: Uint8Array<ArrayBuffer>): Promise<string> => {
	const stream = new Blob([bytes])
		.stream()
		.pipeThrough(new DecompressionStream("deflate"));
	return new Response(stream).text();
};

const decodePayload = async (scheme: string, data: string): Promise<string> => {
	if (scheme === "pako") {
		return inflate(decodeBase64(data));
	}
	if (scheme === "base64") {
		return new TextDecoder().decode(decodeBase64(data));
	}
	throw new LinkError(
		`Unsupported link format "${scheme}". Expected #pako:… or #base64:….`,
	);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null && !Array.isArray(value);

const readConfig = (value: unknown): DiagramConfig | undefined => {
	if (typeof value === "string") {
		try {
			return readConfig(JSON.parse(value));
		} catch {
			return undefined;
		}
	}
	return isRecord(value) ? (value as DiagramConfig) : undefined;
};

export const decodeLink = async (hash: string): Promise<Diagram> => {
	const payload = hash.replace(/^#/, "");
	const separator = payload.indexOf(":");
	const scheme = separator === -1 ? payload : payload.slice(0, separator);
	const data = payload.slice(separator + 1);

	let json: string;
	try {
		json = await decodePayload(scheme, data);
	} catch (error) {
		if (error instanceof LinkError) {
			throw error;
		}
		throw new LinkError("The link is damaged and cannot be decoded.");
	}

	let state: unknown;
	try {
		state = JSON.parse(json);
	} catch {
		throw new LinkError("The link does not contain valid diagram data.");
	}

	if (
		!isRecord(state) ||
		typeof state.code !== "string" ||
		!state.code.trim()
	) {
		throw new LinkError("The link does not contain a diagram.");
	}

	return { code: state.code, config: readConfig(state.mermaid) };
};
