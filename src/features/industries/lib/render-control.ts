/**
 * Shared between the playback clock (outside the canvas) and the canvas's frame driver. Methods
 * rather than fields, so both sides use it without mutating each other's props.
 */
export function createRenderControl() {
  let animating = false;
  let wake: (() => void) | null = null;
  return {
    /** The clock is advancing: keep rendering every frame. */
    get animating() {
      return animating;
    },
    setAnimating(value: boolean) {
      animating = value;
    },
    /** Registered by the canvas: requests a frame, which also restarts a stopped loop. */
    setWake(callback: (() => void) | null) {
      wake = callback;
    },
    wake() {
      wake?.();
    },
  };
}

export type RenderControl = ReturnType<typeof createRenderControl>;
