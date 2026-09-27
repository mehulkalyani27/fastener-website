"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { filmShader } from "@/features/experience/three/shaders";

/** Replaces R3F's default render with RenderPass → OutputPass → film pass. */
export function FilmComposer() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);
  const composer = useRef<EffectComposer | null>(null);
  const film = useRef<ShaderPass | null>(null);

  useEffect(() => {
    const instance = new EffectComposer(gl);
    const filmPass = new ShaderPass(filmShader);
    instance.addPass(new RenderPass(scene, camera));
    instance.addPass(new OutputPass());
    instance.addPass(filmPass);
    composer.current = instance;
    film.current = filmPass;
    return () => {
      instance.dispose();
      composer.current = null;
      film.current = null;
    };
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.current?.setPixelRatio(dpr);
    composer.current?.setSize(size.width, size.height);
    film.current?.uniforms.uResolution.value.set(size.width * dpr, size.height * dpr);
  }, [size, dpr, gl, scene, camera]);

  // A positive priority tells R3F this callback owns rendering for the frame.
  useFrame((state, delta) => {
    if (!composer.current || !film.current) return;
    film.current.uniforms.uTime.value = state.clock.elapsedTime;
    composer.current.render(delta);
  }, 1);

  return null;
}
