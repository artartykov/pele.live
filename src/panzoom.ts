export interface Transform {
	x: number;
	y: number;
	scale: number;
}

const minScale = 0.02;
const maxScale = 20;
const fitMargin = 24;
const dragThreshold = 3;
const wheelSensitivity = 0.002;

interface Drag {
	pointerId: number;
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	active: boolean;
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

export class PanZoom {
	readonly #viewport: HTMLElement;
	readonly #canvas: HTMLElement;
	#transform: Transform = { x: 0, y: 0, scale: 1 };
	#width = 0;
	#height = 0;
	#moved = false;
	#drag: Drag | undefined;

	constructor(viewport: HTMLElement, canvas: HTMLElement) {
		this.#viewport = viewport;
		this.#canvas = canvas;
		viewport.addEventListener("wheel", (event) => this.#onWheel(event), {
			passive: false,
		});
		viewport.addEventListener("pointerdown", (event) =>
			this.#onPointerDown(event),
		);
		viewport.addEventListener("pointermove", (event) =>
			this.#onPointerMove(event),
		);
		viewport.addEventListener("pointerup", (event) => this.#onPointerUp(event));
		viewport.addEventListener("pointercancel", (event) =>
			this.#onPointerUp(event),
		);
		viewport.addEventListener("dblclick", () => this.fit());
		window.addEventListener("resize", () => {
			if (!this.#moved) {
				this.fit();
			}
		});
	}

	show(width: number, height: number) {
		this.#width = width;
		this.#height = height;
		this.fit();
	}

	fit() {
		const { clientWidth, clientHeight } = this.#viewport;
		if (!this.#width || !this.#height) {
			return;
		}
		const scale = clamp(
			Math.min(
				(clientWidth - fitMargin * 2) / this.#width,
				(clientHeight - fitMargin * 2) / this.#height,
				1,
			),
			minScale,
			maxScale,
		);
		this.#moved = false;
		this.#apply({
			x: (clientWidth - this.#width * scale) / 2,
			y: (clientHeight - this.#height * scale) / 2,
			scale,
		});
	}

	zoomAt(pointX: number, pointY: number, factor: number) {
		const { x, y, scale } = this.#transform;
		const nextScale = clamp(scale * factor, minScale, maxScale);
		const ratio = nextScale / scale;
		this.#moved = true;
		this.#apply({
			x: pointX - (pointX - x) * ratio,
			y: pointY - (pointY - y) * ratio,
			scale: nextScale,
		});
	}

	#apply(transform: Transform) {
		this.#transform = transform;
		this.#canvas.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;
	}

	#localPoint(event: MouseEvent) {
		const rect = this.#viewport.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	}

	#onWheel(event: WheelEvent) {
		event.preventDefault();
		const unit =
			event.deltaMode === WheelEvent.DOM_DELTA_LINE
				? 16
				: event.deltaMode === WheelEvent.DOM_DELTA_PAGE
					? this.#viewport.clientHeight
					: 1;
		const point = this.#localPoint(event);
		this.zoomAt(
			point.x,
			point.y,
			Math.exp(-event.deltaY * unit * wheelSensitivity),
		);
	}

	#onPointerDown(event: PointerEvent) {
		if (event.button !== 0 || this.#drag) {
			return;
		}
		this.#drag = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: this.#transform.x,
			originY: this.#transform.y,
			active: false,
		};
	}

	#onPointerMove(event: PointerEvent) {
		const drag = this.#drag;
		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}
		const deltaX = event.clientX - drag.startX;
		const deltaY = event.clientY - drag.startY;
		if (!drag.active) {
			if (Math.hypot(deltaX, deltaY) < dragThreshold) {
				return;
			}
			drag.active = true;
			this.#viewport.setPointerCapture(event.pointerId);
			this.#viewport.classList.add("dragging");
		}
		this.#moved = true;
		this.#apply({
			...this.#transform,
			x: drag.originX + deltaX,
			y: drag.originY + deltaY,
		});
	}

	#onPointerUp(event: PointerEvent) {
		const drag = this.#drag;
		if (!drag || drag.pointerId !== event.pointerId) {
			return;
		}
		if (drag.active) {
			this.#viewport.releasePointerCapture(event.pointerId);
			this.#viewport.classList.remove("dragging");
		}
		this.#drag = undefined;
	}
}
