"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import { Color, MathUtils, type ShaderMaterial, Vector2 } from "three";
import { readCssColor } from "@/features/experience/lib/media";
import { liquidMetalShader } from "@/features/experience/three/shaders";

type LiquidMetalBackgroundProps = {
  pointer: RefObject<{ x: number; y: number }>;
};

export function LiquidMetalBackground({ pointer }: LiquidMetalBackgroundProps) {
  const material = useRef<ShaderMaterial>(null);
  const size = useThree((state) => state.size);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector2() },
      uResolution: { value: new Vector2(1, 1) },
      uBase: { value: new Color(readCssColor("--color-ink", "#1f2440")) },
      uDeep: { value: new Color("#12152a") },
      uSheen: { value: new Color(readCssColor("--color-ink-accent", "#a9b0c9")) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const shader = material.current;
    if (!shader) return;
    shader.uniforms.uTime.value = state.clock.elapsedTime;
    shader.uniforms.uResolution.value.set(size.width, size.height);
    const target = shader.uniforms.uPointer.value;
    target.x = MathUtils.damp(target.x, pointer.current.x, 1.5, delta);
    target.y = MathUtils.damp(target.y, pointer.current.y, 1.5, delta);
  });

  return (
    <mesh frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={liquidMetalShader.vertexShader}
        fragmentShader={liquidMetalShader.fragmentShader}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
