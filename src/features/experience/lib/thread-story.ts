import { SHOWCASE_SDS_VISUAL as SCREW, sdsHeadTopHeight, sdsHexRadius } from "@/features/experience/three/specs";

/**
 * Scroll schedule for the Thread section. Everything — title transitions, the screw's travel
 * and rotation — is a pure function of one scroll progress (0 → 1), so
 * forward and backward scrolling replay exactly the same states:
 *
 *   0 ─ enter ─ ENTER_END ─ hold ─ [transition 1] ─ hold ─ [transition 2] ─ hold ─ 1
 *
 * In a transition the outgoing title leaves during the first EXIT_PORTION and the incoming one
 * arrives during the last ENTER_PORTION, so only one title is ever prominent.
 */
export const THREAD_STORY = {
  trackHeight: "280svh",
  enterEnd: 0.2,
  transitions: [
    [0.34, 0.54],
    [0.68, 0.88],
  ] as const,
  exitPortion: 0.4,
  enterPortion: 0.5,
  /**
   * Allowed lean of the fastener below horizontal ("\\"), in degrees, per composition. The best
   * angle in range is chosen per viewport (see computeAssembly); ties go to `preferred`.
   */
  angle: {
    split: { min: 20, max: 34, preferred: 26 },
    stacked: { min: 18, max: 44, preferred: 30 },
  },
};

/**
 * How the whole assembly travels with scroll, per composition:
 * - rise: upward travel over the sequence, as a fraction of the stage height (linear, so the
 *   assembly climbs at a constant, physical rate as the user scrolls down);
 * - swing: total change of lean in degrees, steeper at the start and flatter at the end, which
 *   opens space low on the right for the last title.
 */
export const THREAD_MOTION = {
  split: { rise: 0.42, swing: 8 },
  stacked: { rise: 0.4, swing: 8 },
};

/** The Thread story is laid out in "model units", each this many millimetres of the screw. */
export const MM_PER_UNIT = 7;
const units = (mm: number) => mm / MM_PER_UNIT;

/** Turns the screw makes about its axis over the whole sequence (negative = driving direction). */
const SPIN_TURNS = 4.5;
export const screwSpin = (progress: number) => -(progress - 0.5) * SPIN_TURNS * Math.PI * 2;

/** Pose reference point: this far from the head's underside along the axis (model units). */
export const REFERENCE = units(30);

export type ThreadLayout = keyof typeof THREAD_STORY.angle;
export type Rect = { left: number; top: number; right: number; bottom: number };

/**
 * Assembly for a viewport (stage px): the reference point and base lean at mid-sequence, px per
 * model unit, the rise in px, and the composition (for its motion constants).
 */
export type Assembly = {
  x: number;
  y: number;
  angle: number;
  pxPerUnit: number;
  rise: number;
  layout: ThreadLayout;
};

/** Assembly pose at a given progress: reference point (stage px) and lean. */
export type Pose = { x: number; y: number; angle: number };

// Extents along the axis from the reference point, and half-thicknesses (model units).
export const REACH = {
  headTop: REFERENCE + units(sdsHeadTopHeight(SCREW)),
  /** Top of the flange, under the hex head. */
  flangeTop: REFERENCE + units(SCREW.flangeThickness),
  headUnderside: REFERENCE,
  tip: units(SCREW.length) - REFERENCE,
  /** Length of the drill point (flutes and cone) at the far end. */
  point: units(SCREW.drillPointLength + SCREW.tipLength),
};
export const HALF = {
  /** The flange is the widest part of the head. */
  head: units(SCREW.flangeDiameter / 2),
  hex: units(sdsHexRadius(SCREW)),
  shank: units(SCREW.diameter / 2),
};

/** Enter and exit windows of a title on the progress axis. */
export function titleWindow(index: number) {
  const { enterEnd, transitions, exitPortion, enterPortion } = THREAD_STORY;
  const previous = transitions[index - 1];
  const next = transitions[index];
  const enter: [number, number] = previous
    ? [previous[1] - (previous[1] - previous[0]) * enterPortion, previous[1]]
    : [0, enterEnd];
  const exit: [number, number] | null = next ? [next[0], next[0] + (next[1] - next[0]) * exitPortion] : null;
  return { enter, exit };
}

/** How far titles slide in from (and back out to) their side, in px. */
export const entryDistance = (stageWidth: number) => Math.min(stageWidth * 0.1, 160);

/** Below this opacity a title is imperceptible and not treated as on stage. */
const VISIBLE_OPACITY = 0.02;

/**
 * Title state at a progress: opacity, and `shift` — how far out toward its own side it sits, as
 * a fraction of entryDistance. Entering eases out (quadratic), leaving eases in. This one function
 * drives the titles on screen and the layout search, so they cannot disagree.
 */
export function titleState(index: number, progress: number) {
  const { enter, exit } = titleWindow(index);
  let shown = 0;
  if (progress >= enter[1]) shown = 1;
  else if (progress > enter[0]) {
    const t = (progress - enter[0]) / (enter[1] - enter[0]);
    shown = 1 - (1 - t) * (1 - t);
  }
  if (exit && progress > exit[0]) {
    const t = Math.min((progress - exit[0]) / (exit[1] - exit[0]), 1);
    shown = Math.min(shown, 1 - t * t);
  }
  return { opacity: shown, shift: 1 - shown };
}

/**
 * The single source of the assembly's motion, used by both the renderer and the layout search:
 * the whole assembly climbs as progress increases (screen y decreases) and its lean flattens.
 */
export function assemblyPose(assembly: Assembly, progress: number): Pose {
  const { swing } = THREAD_MOTION[assembly.layout];
  return {
    x: assembly.x,
    y: assembly.y + (0.5 - progress) * assembly.rise,
    angle: assembly.angle + ((swing * Math.PI) / 180) * (0.5 - progress),
  };
}

/** Minimum gap (px) between any part and a visible title, and to the stage edges. */
const CLEARANCE_PX = 16;
/** Upper bounds on scale (px per model unit) so the fastener stays an anchor, not a wall. */
const MAX_UNIT_OF_SHORT_SIDE = 0.16;
const MAX_UNIT_PX = 150;

/**
 * Progress values checked by the layout search: an even grid, densified inside every title's
 * enter/exit window, where a title is sliding and the moving assembly comes closest to it.
 */
const SAMPLES = (() => {
  const points = new Set<number>();
  for (let step = 0; step <= 40; step++) points.add(step / 40);
  for (let title = 0; title <= THREAD_STORY.transitions.length; title++) {
    const { enter, exit } = titleWindow(title);
    for (const [start, end] of exit ? [enter, exit] : [enter]) {
      for (let step = 0; step <= 12; step++) points.add(start + ((end - start) * step) / 12);
    }
  }
  return [...points];
})();

function distanceToRect(x: number, y: number, rect: Rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

type Part = { from: number; to: number; half: number; steps: number; staysInside: boolean };

/** Scroll range in which the whole drill point must be on stage (it may leave at the very start and end). */
const POINT_VISIBLE = [0.2, 0.8] as const;

const ANGLE_STEP = 4;
/** Candidate positions of the assembly along its handoff line, as fractions of the stage diagonal. */
const ALONG = [-0.3, -0.15, 0, 0.15, 0.3];

/**
 * Chooses the viewport's assembly. At the hand-off from the first title (top row) to the second
 * (bottom row), the axis runs through the midpoint between the first title's bottom-left corner
 * and the second's top-right corner — the corridor between them. For each allowed angle and a few
 * positions along that line, the scale is the largest at which, at every sampled progress with
 * the rise and swing applied, head and shank keep CLEARANCE_PX from every title on stage at that
 * moment (at its slid position), and head and drill point stay inside the stage (the threaded
 * middle may run off the edge). The largest screw wins. Runs on resize only.
 */
export function computeAssembly(
  width: number,
  height: number,
  titles: Rect[],
  directions: number[],
  layout: ThreadLayout,
): Assembly {
  const { min, max, preferred } = THREAD_STORY.angle[layout];
  const motion = THREAD_MOTION[layout];
  const rise = motion.rise * height;
  const [first, second] = titles;
  const handoff = (titleWindow(0).exit![1] + titleWindow(1).enter[0]) / 2;
  const mx = (first.left + second.right) / 2;
  const my = (first.bottom + second.top) / 2;
  const diagonal = Math.hypot(width, height);

  let best: Assembly | undefined;
  let bestScore = -1;
  for (let degrees = min; degrees <= max; degrees += ANGLE_STEP) {
    const angle = (degrees * Math.PI) / 180;
    const atHandoff = angle + ((motion.swing * Math.PI) / 180) * (0.5 - handoff);
    for (const fraction of ALONG) {
      // Reference point on the hand-off line; undo the rise so the pose at `handoff` lands there.
      const x = mx + Math.cos(atHandoff) * fraction * diagonal;
      const y = my + Math.sin(atHandoff) * fraction * diagonal - (0.5 - handoff) * rise;
      const make = (k: number): Assembly => ({ x, y, angle, pxPerUnit: k, rise, layout });
      const k = largestFit(make, width, height, titles, directions);
      const score = k * (1 - 0.002 * Math.abs(degrees - preferred));
      if (score > bestScore) {
        best = make(k);
        bestScore = score;
      }
    }
  }
  return best!;
}

/** Titles on stage at a progress, at their slid positions (direction: +1 right, -1 left). */
function titlesOnStage(titles: Rect[], directions: number[], progress: number, width: number) {
  const distance = entryDistance(width);
  return titles.flatMap((rect, index) => {
    const { opacity, shift } = titleState(index, progress);
    if (opacity <= VISIBLE_OPACITY) return [];
    const dx = shift * distance * directions[index];
    return [{ left: rect.left + dx, top: rect.top, right: rect.right + dx, bottom: rect.bottom }];
  });
}

function largestFit(
  make: (k: number) => Assembly,
  width: number,
  height: number,
  titles: Rect[],
  directions: number[],
) {
  const fits = (k: number) => {
    const assembly = make(k);
    return SAMPLES.every((progress) => {
      const pose = assemblyPose(assembly, progress);
      const ux = Math.cos(pose.angle);
      const uy = Math.sin(pose.angle);
      const parts: Part[] = [
        { from: -REACH.headTop, to: -REACH.headUnderside, half: HALF.head, steps: 6, staysInside: true },
        { from: -REACH.headUnderside, to: REACH.tip - REACH.point, half: HALF.shank, steps: 64, staysInside: false },
        { from: REACH.tip - REACH.point, to: REACH.tip, half: HALF.shank, steps: 8, staysInside: progress >= POINT_VISIBLE[0] && progress <= POINT_VISIBLE[1] },
      ];
      const visible = titlesOnStage(titles, directions, progress, width);

      return parts.every(({ from, to, half, steps, staysInside }) => {
        const reach = half * k + CLEARANCE_PX;
        for (let step = 0; step <= steps; step++) {
          const along = (from + ((to - from) * step) / steps) * k;
          const px = pose.x + ux * along;
          const py = pose.y + uy * along;
          if (staysInside && (px < reach || py < reach || px > width - reach || py > height - reach)) return false;
          if (visible.some((rect) => distanceToRect(px, py, rect) < reach)) return false;
        }
        return true;
      });
    });
  };

  let low = 0;
  let high = Math.min(Math.min(width, height) * MAX_UNIT_OF_SHORT_SIDE, MAX_UNIT_PX);
  if (fits(high)) return high;
  for (let iteration = 0; iteration < 16; iteration++) {
    const mid = (low + high) / 2;
    if (fits(mid)) low = mid;
    else high = mid;
  }
  return low;
}
