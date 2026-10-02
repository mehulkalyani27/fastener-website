import type { WebGLRenderer } from "three";

/*
 * Development-only timing for the 3D sections. Every entry point is a no-op unless NODE_ENV is
 * "development", so production builds neither log nor mark. Marks are `fp:<scope>[#cycle]:<event>`
 * (visible in the Chrome Performance panel's Timings lane); in the browser console use
 * `__fastenerPerf.summary()` / `.report()` / `.clear()`.
 */
export const PERF_ENABLED = process.env.NODE_ENV === "development";

export type PerfScope = "thread" | "industries" | "shared";
type Detail = Record<string, unknown>;

type Cycle = {
  id: number;
  events: Map<string, number>;
  enterAt: number | null;
  endedAt: number | null;
};
type ScopeState = {
  cycle: Cycle;
  cycles: Cycle[];
  scoped: Map<string, number>;
  visible: boolean;
  enterAt: number | null;
};
type Row = { kind: "mark" | "measure"; scope: PerfScope; cycle: number; name: string; at: number; ms?: number; detail?: Detail };

/** Once per page (not per canvas cycle). */
const SCOPED_EVENTS = new Set(["component-mount", "scroll-driver-ready", "chunk-requested", "chunk-loaded"]);
const REPEATING_EVENTS = new Set(["section-enter", "section-exit", "user-input"]);
/** [from, to, label]: measured when `to` is marked and `from` already is, within one cycle. */
const PAIRS: readonly (readonly [string, string, string])[] = [
  ["canvas-requested", "canvas-mount", "canvas-requested → canvas-mount"],
  ["canvas-mount", "webgl-context-ready", "canvas-mount → webgl-context-ready"],
  ["webgl-context-ready", "scene-graph-mounted", "webgl-context-ready → scene-graph-mounted"],
  ["frameloop-active", "first-render-start", "frameloop-active → first-render-start"],
  ["first-render-start", "first-render-end", "first-render (CPU, includes shader compile)"],
  ["canvas-mount", "usable-frame", "canvas-mount → usable-frame"],
  ["canvas-requested", "usable-frame", "canvas-requested → usable-frame"],
];
const ENTER_TARGETS = ["usable-frame", "animation-ready"];

const scopes = new Map<PerfScope, ScopeState>();
const rows: Row[] = [];
let gpuLabel: string | undefined;

const newCycle = (id: number, visibleSince: number | null): Cycle => ({
  id,
  events: new Map(),
  enterAt: visibleSince,
  endedAt: null,
});

function scopeState(scope: PerfScope) {
  let state = scopes.get(scope);
  if (!state) {
    const cycle = newCycle(0, null);
    state = { cycle, cycles: [cycle], scoped: new Map(), visible: false, enterAt: null };
    scopes.set(scope, state);
  }
  return state;
}

const round = (value: number) => Math.round(value * 10) / 10;
const label = (scope: PerfScope, cycle: number) => (cycle ? `${scope}#${cycle}` : scope);

function install() {
  if (typeof window === "undefined") return;
  const target = window as unknown as Record<string, unknown>;
  target.__fastenerPerf ??= { summary: perfSummary, report: perfReport, clear: perfClear };
}

function record(row: Row) {
  rows.push(row);
  const name = `fp:${label(row.scope, row.cycle)}${row.kind === "mark" ? ":" : ": "}${row.name}`;
  if (row.kind === "mark") {
    performance.mark(name, { startTime: row.at, detail: row.detail });
    console.log(`[perf] ${label(row.scope, row.cycle)} ${row.name} @ ${round(row.at)} ms`, row.detail ?? "");
  } else {
    console.log(`[perf] ${label(row.scope, row.cycle)} ▸ ${row.name}: ${round(row.ms ?? 0)} ms`);
  }
  install();
}

function measure(scope: PerfScope, cycle: number, name: string, start: number, end: number, detail?: Detail) {
  const ms = end - start;
  const from = Math.min(start, end);
  const to = Math.max(start, end);
  const suffix = ms < 0 ? " (ready before)" : "";
  performance.measure(`fp:${label(scope, cycle)}: ${name}${suffix}`, { start: from, end: to, detail: { ms, ...detail } });
  record({ kind: "measure", scope, cycle, name: name + suffix, at: to, ms, detail });
}

function markAt(scope: PerfScope, event: string, at: number, detail?: Detail) {
  const state = scopeState(scope);
  const scoped = SCOPED_EVENTS.has(event);
  const store = scoped ? state.scoped : state.cycle.events;
  if (!REPEATING_EVENTS.has(event) && store.has(event)) return;
  store.set(event, at);
  record({ kind: "mark", scope, cycle: scoped ? 0 : state.cycle.id, name: event, at, detail });
  afterMark(scope, state, event, at);
}

function afterMark(scope: PerfScope, state: ScopeState, event: string, at: number) {
  const { cycle } = state;
  for (const [from, to, name] of PAIRS) {
    const start = cycle.events.get(from);
    if (to === event && start !== undefined) measure(scope, cycle.id, name, start, at);
  }

  if (event === "section-enter") {
    state.visible = true;
    state.enterAt = at;
    cycle.enterAt ??= at;
    for (const target of ENTER_TARGETS) {
      const end = cycle.events.get(target);
      if (end !== undefined) measure(scope, cycle.id, `section-enter → ${target}`, cycle.enterAt, end);
    }
  } else if (event === "section-exit") {
    state.visible = false;
  } else if (ENTER_TARGETS.includes(event) && cycle.enterAt !== null) {
    measure(scope, cycle.id, `section-enter → ${event}`, cycle.enterAt, at);
  }

  if (event === "usable-frame" && state.scoped.has("scroll-driver-ready")) markAt(scope, "animation-ready", at);
  if (event === "scroll-driver-ready" && cycle.events.has("usable-frame")) markAt(scope, "animation-ready", at);
}

export function perfMark(scope: PerfScope | undefined, event: string, detail?: Detail) {
  if (!PERF_ENABLED || !scope) return;
  markAt(scope, event, performance.now(), detail);
}

/**
 * Times `build` and returns its result. With `gl` and `?perf=gpu` in the URL, waits for the GPU to
 * finish the queued work, so the span includes GPU time (this stalls the page: measurement only).
 */
export function perfSpan<T>(scope: PerfScope | undefined, name: string, build: () => T, gl?: WebGLRenderer): T {
  if (!PERF_ENABLED || !scope) return build();
  const start = performance.now();
  markAt(scope, `${name}:start`, start);
  const result = build();
  if (gl && perfGpuSync()) gl.getContext().finish();
  const end = performance.now();
  markAt(scope, `${name}:end`, end);
  measure(scope, scopeState(scope).cycle.id, name, start, end);
  return result;
}

export const perfGpuSync = () =>
  PERF_ENABLED && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("perf") === "gpu";

/** Wraps a dynamic import so the chunk request and arrival are marked; returns it unchanged otherwise. */
export function perfImport<T>(scope: PerfScope, request: Promise<T>): Promise<T> {
  if (!PERF_ENABLED) return request;
  perfMark(scope, "chunk-requested");
  return request.then((module) => {
    perfMark(scope, "chunk-loaded");
    return module;
  });
}

/** A canvas is wanted: starts a new cycle (a StrictMode remount right after an end reuses the cycle). */
export function perfBeginCycle(scope: PerfScope) {
  if (!PERF_ENABLED) return;
  const state = scopeState(scope);
  const { cycle } = state;
  if (cycle.id > 0 && cycle.endedAt !== null && performance.now() - cycle.endedAt < 100) {
    cycle.endedAt = null;
  } else {
    const next = newCycle(cycle.id + 1, state.visible ? state.enterAt : null);
    state.cycle = next;
    state.cycles.push(next);
  }
  markAt(scope, "canvas-requested", performance.now());
}

export function perfEndCycle(scope: PerfScope) {
  if (!PERF_ENABLED) return;
  const state = scopeState(scope);
  const { cycle } = state;
  cycle.endedAt = performance.now();
  setTimeout(() => {
    if (state.cycle === cycle && cycle.endedAt !== null) markAt(scope, "canvas-released", performance.now());
  }, 100);
}

export function perfSection(scope: PerfScope, visible: boolean) {
  if (!PERF_ENABLED) return;
  perfMark(scope, visible ? "section-enter" : "section-exit");
}

export function perfSetGpu(renderer: string | undefined) {
  gpuLabel = renderer;
}

function perfEnv() {
  if (typeof window === "undefined") return {};
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; saveData?: boolean } };
  return {
    gpu: gpuLabel,
    cores: nav.hardwareConcurrency,
    memoryGB: nav.deviceMemory,
    dpr: window.devicePixelRatio,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    network: nav.connection?.effectiveType,
    saveData: nav.connection?.saveData,
    userAgent: nav.userAgent,
  };
}

/** Per scope: page-level event times, and for each canvas cycle its event times and measured durations (ms). */
export function perfSummary() {
  const out: Record<string, unknown> = { env: perfEnv() };
  for (const [scope, state] of scopes) {
    out[scope] = {
      page: Object.fromEntries([...state.scoped].map(([name, at]) => [name, round(at)])),
      cycles: state.cycles
        .filter((cycle) => cycle.events.size > 0)
        .map((cycle) => ({
          cycle: cycle.id,
          at: Object.fromEntries([...cycle.events].map(([name, at]) => [name, round(at)])),
          ms: Object.fromEntries(
            rows
              .filter((row) => row.kind === "measure" && row.scope === scope && row.cycle === cycle.id)
              .map((row) => [row.name, round(row.ms ?? 0)]),
          ),
        })),
    };
  }
  return out;
}

export function perfReport() {
  const table = rows.map((row) => ({
    t: round(row.at),
    scope: label(row.scope, row.cycle),
    kind: row.kind,
    event: row.name,
    ms: row.ms === undefined ? "" : round(row.ms),
  }));
  console.table(table);
  return table;
}

export function perfClear() {
  rows.length = 0;
  scopes.clear();
  performance.clearMarks();
  performance.clearMeasures();
}
