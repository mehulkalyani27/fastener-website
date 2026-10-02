"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { perfSpan, type PerfScope } from "@/features/experience/lib/perf";

/** Procedural studio reflections so metal reads correctly without loading an HDR file. */
export function StudioEnvironment({ perfScope }: { perfScope?: PerfScope }) {
  const gl = useThree((state) => state.gl);

  const texture = useMemo(
    () =>
      perfSpan(
        perfScope,
        "environment",
        () => {
          const generator = new PMREMGenerator(gl);
          const room = new RoomEnvironment();
          const result = generator.fromScene(room, 0.04).texture;
          room.dispose();
          generator.dispose();
          return result;
        },
        gl,
      ),
    [gl, perfScope],
  );

  useEffect(() => () => texture.dispose(), [texture]);

  return <primitive object={texture} attach="environment" />;
}
