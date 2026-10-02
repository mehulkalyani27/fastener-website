/*
 * The 3D canvases are prepared one at a time while the page is idle, so a new WebGL context is
 * never created while another is being created, rendering or torn down (measured in the browser:
 * context creation took 1.4–2.1 s in that situation against 0.18 s on its own). Each canvas also
 * mounts as soon as it is near the viewport, whatever the queue says.
 */
const ORDER = ["thread", "industries"] as const;
export type QueuedCanvas = (typeof ORDER)[number];

const settled = new Set<QueuedCanvas>();
const listeners = new Set<() => void>();
let idle = false;
let started = false;

const notify = () => listeners.forEach((listener) => listener());

function startWhenIdle() {
  if (started || typeof window === "undefined") return;
  started = true;
  const begin = () => {
    idle = true;
    notify();
  };
  const whenIdle = () => ("requestIdleCallback" in window ? window.requestIdleCallback(begin) : setTimeout(begin, 200));
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

/** The canvas has rendered its first frame (or will never be created): the next one may start. */
export function settleCanvas(id: QueuedCanvas) {
  if (settled.has(id)) return;
  settled.add(id);
  notify();
}

export function subscribeQueue(listener: () => void) {
  startWhenIdle();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export const isWarmTurn = (id: QueuedCanvas) =>
  idle && ORDER.slice(0, ORDER.indexOf(id)).every((earlier) => settled.has(earlier));
