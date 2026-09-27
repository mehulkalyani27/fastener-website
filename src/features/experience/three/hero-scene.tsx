"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import { type DirectionalLight, type Group, MathUtils } from "three";
import { useWindowPointer } from "@/features/experience/hooks/use-window-pointer";
import { readCssColor } from "@/features/experience/lib/media";
import { FilmComposer } from "@/features/experience/three/film-composer";
import { BOLT_CENTER_OFFSET, getBoltGeometry } from "@/features/experience/three/geometry";
import { LiquidMetalBackground } from "@/features/experience/three/liquid-metal-background";
import { HEAT_TINTED_STEEL_MATERIAL } from "@/features/experience/three/materials";
import { StudioEnvironment } from "@/features/experience/three/studio-environment";

const INTRO_SECONDS = 2.8;
const SCROLL_TURNS = 3;
const SCROLL_DROP = 2.4;

export type HeroLayout = "split" | "stacked";

type HeroSceneProps = {
  progress: RefObject<number>;
  active: boolean;
  layout: HeroLayout;
};

const BOLT_HEIGHT = 3.3;
/** Widest the tilted bolt gets either side of its axis, including pointer-driven lean. */
const BOLT_HALF_WIDTH = 1.28;
const ZONE_MARGIN_PX = 24;

// Mirrors of the layout CSS: Container max-w-content (80rem) and px-gutter
// (clamp(1rem, 4vw, 2.5rem)), and the hero copy's split:max-w-[min(42rem,52%)].
const CONTAINER_MAX_PX = 1280;
const COPY_MAX_PX = 672;
const COPY_FRACTION = 0.52;
const gutterPx = (width: number) => Math.min(Math.max(16, width * 0.04), 40);

type Pointer = RefObject<{ x: number; y: number }>;

function HeroBolt({
  progress,
  pointer,
  layout: mode,
}: {
  progress: RefObject<number>;
  pointer: Pointer;
  layout: HeroLayout;
}) {
  const group = useRef<Group>(null);
  const keyLight = useRef<DirectionalLight>(null);
  const intro = useRef(0);
  const geometry = useMemo(() => getBoltGeometry(), []);
  const rimColor = useMemo(() => readCssColor("--color-ink-accent", "#a9b0c9"), []);
  const viewport = useThree((state) => state.viewport);
  const size = useThree((state) => state.size);

  // Split: centered in the free zone between the copy and the grid's right edge, scaled down
  // only if that zone is narrower than the bolt. Stacked: centered in the band, ~80% of its height.
  const worldPerPx = viewport.width / size.width;
  const contentWidth = Math.min(size.width, CONTAINER_MAX_PX) - 2 * gutterPx(size.width);
  const zoneStart = Math.min(COPY_MAX_PX, contentWidth * COPY_FRACTION);
  const zoneWidth = contentWidth - zoneStart - ZONE_MARGIN_PX * 2;
  const layout =
    mode === "split"
      ? {
          x: ((zoneStart + contentWidth) / 2 - contentWidth / 2) * worldPerPx,
          y: 0,
          scale: Math.min(1, (zoneWidth * worldPerPx) / (BOLT_HALF_WIDTH * 2)),
        }
      : { x: 0, y: 0, scale: Math.min(1, (viewport.height * 0.8) / BOLT_HEIGHT) };

  useFrame((state, delta) => {
    const bolt = group.current;
    const light = keyLight.current;
    if (!bolt || !light) return;

    // Intro eases out over INTRO_SECONDS; scroll progress then "drives" the bolt:
    // each turn advances it downward, like a screw feeding into a thread.
    intro.current = Math.min(1, intro.current + delta / INTRO_SECONDS);
    const eased = 1 - Math.pow(1 - intro.current, 4);
    const scroll = progress.current;
    const { x, y } = pointer.current;

    bolt.rotation.y =
      (1 - eased) * -Math.PI * 2.5 +
      state.clock.elapsedTime * 0.12 +
      scroll * SCROLL_TURNS * Math.PI * 2;
    bolt.position.x = layout.x;
    bolt.position.y = layout.y + MathUtils.lerp(-3, 0, eased) - scroll * SCROLL_DROP;
    bolt.scale.setScalar(layout.scale * MathUtils.lerp(0.75, 1, eased));
    bolt.rotation.x = MathUtils.damp(bolt.rotation.x, 0.32 - y * 0.12, 3, delta);
    bolt.rotation.z = MathUtils.damp(bolt.rotation.z, -0.28 + x * 0.1, 3, delta);

    light.position.x = MathUtils.damp(light.position.x, 2 + x * 5, 2.5, delta);
    light.position.y = MathUtils.damp(light.position.y, 3 + y * 4, 2.5, delta);
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight ref={keyLight} position={[2, 3, 5]} intensity={2.4} />
      <directionalLight position={[-4, 2, -4]} intensity={2.2} color={rimColor} />
      <group ref={group}>
        <mesh geometry={geometry} position-y={BOLT_CENTER_OFFSET}>
          <meshPhysicalMaterial {...HEAT_TINTED_STEEL_MATERIAL} />
        </mesh>
      </group>
    </>
  );
}

function HeroContent({ progress, layout }: Pick<HeroSceneProps, "progress" | "layout">) {
  const pointer = useWindowPointer();

  return (
    <>
      <LiquidMetalBackground pointer={pointer} />
      <StudioEnvironment />
      <HeroBolt progress={progress} pointer={pointer} layout={layout} />
      <FilmComposer />
    </>
  );
}

// `flat` disables tone mapping so the shader's navy matches the header exactly after OutputPass.
export default function HeroScene({ progress, active, layout }: HeroSceneProps) {
  return (
    <Canvas
      flat
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7], fov: 35 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <HeroContent progress={progress} layout={layout} />
    </Canvas>
  );
}
