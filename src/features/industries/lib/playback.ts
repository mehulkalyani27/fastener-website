/**
 * Auto-play clock for the Industries story. State is plain data advanced by `stepPlayback`, so the
 * whole sequence (play, pause, jump, loop) is deterministic and testable without a browser.
 * `time` runs 0 → count × CHAPTER_SECONDS; the story's progress is time / total, and each chapter
 * is one equal slice of it. `veil` (0 = scene shown, 1 = hidden) is the short fade used for jumps and
 * for the loop restart, since those are cuts between unrelated shots.
 */
export const CHAPTER_SECONDS = 9;
const FADE_OUT = 0.2;
const FADE_IN = 0.35;
const END_HOLD = 1.2;
/** A long frame (e.g. after the tab was hidden) must not skip the story ahead. */
const MAX_STEP = 0.1;

export type PlaybackState = {
  time: number;
  veil: number;
  /** Chapter being jumped to, once the veil is fully down. */
  pending: number | null;
  /** Time spent on the last frame before looping. */
  hold: number;
};

/** Starts hidden: the first usable 3D frame fades it in. */
export const initialPlayback = (): PlaybackState => ({ time: 0, veil: 1, pending: null, hold: 0 });

export function stepPlayback(
  state: PlaybackState,
  dt: number,
  running: boolean,
  count: number,
  seconds = CHAPTER_SECONDS,
): PlaybackState {
  const total = count * seconds;
  const step = Math.min(Math.max(dt, 0), MAX_STEP);
  let { time, veil, pending, hold } = state;

  if (pending !== null) {
    veil = Math.min(1, veil + step / FADE_OUT);
    if (veil >= 1) {
      time = pending * seconds;
      pending = null;
      hold = 0;
    }
  } else {
    veil = Math.max(0, veil - step / FADE_IN);
    if (running) {
      if (time >= total) {
        hold += step;
        if (hold >= END_HOLD) pending = 0;
      } else {
        time = Math.min(total, time + step);
      }
    }
  }
  return { time, veil, pending, hold };
}

/** True while the clock still has something to animate. */
export const isAnimating = (state: PlaybackState, running: boolean) =>
  running || state.pending !== null || state.veil > 0;

export const playbackProgress = (state: PlaybackState, count: number, seconds = CHAPTER_SECONDS) =>
  state.time / (count * seconds);

export const playbackChapter = (state: PlaybackState, count: number, seconds = CHAPTER_SECONDS) =>
  Math.min(Math.floor(state.time / seconds), count - 1);

/** Jump to the start of a chapter (through the veil). */
export const seekTo = (state: PlaybackState, chapter: number): PlaybackState => ({ ...state, pending: chapter });
