import { Vector2 } from "three";

const NOISE = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.02;
      amplitude *= 0.5;
    }
    return value;
  }
`;

/**
 * Full-screen "liquid metal" backdrop. Domain-warped fbm (noise fed back into its own
 * coordinates) gives slow, molten flow; sharpened high values read as brushed-steel sheen.
 * The sheen is masked away from the copy side so headline contrast is preserved.
 */
export const liquidMetalShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform vec2 uResolution;
    uniform vec3 uBase;
    uniform vec3 uDeep;
    uniform vec3 uSheen;
    varying vec2 vUv;
    ${NOISE}

    void main() {
      float aspect = uResolution.x / uResolution.y;
      vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 1.6;
      float t = uTime * 0.04;

      vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
      vec2 r = vec2(
        fbm(p + 3.0 * q + vec2(1.7, 9.2) + uPointer * 0.25),
        fbm(p + 3.0 * q + vec2(8.3, 2.8) - t)
      );
      float field = fbm(p + 3.0 * r);

      float mask = aspect > 1.0
        ? smoothstep(0.45, 0.95, vUv.x)
        : smoothstep(0.5, 0.95, vUv.y);
      float sheen = pow(smoothstep(0.5, 0.95, field + 0.15 * r.x), 2.0) * mask;

      vec3 color = mix(uDeep, uBase, smoothstep(0.15, 0.85, field));
      color = mix(uDeep, color, 0.45 + 0.55 * mask);
      color += uSheen * sheen * 0.3;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * Final screen pass: radial chromatic dispersion (R and B sampled apart, growing toward the
 * edges like a real lens), animated film grain and a soft vignette. Runs after OutputPass so
 * grain is added in display space.
 */
export const filmShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uDispersion: { value: 0.012 },
    uGrain: { value: 0.045 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uDispersion;
    uniform float uGrain;
    varying vec2 vUv;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float falloff = dot(centered, centered);
      vec2 offset = centered * falloff * uDispersion * 4.0;

      vec4 base = texture2D(tDiffuse, vUv);
      float red = texture2D(tDiffuse, vUv + offset).r;
      float blue = texture2D(tDiffuse, vUv - offset).b;
      vec3 color = vec3(red, base.g, blue);

      color += (hash(vUv * uResolution + fract(uTime) * 91.7) - 0.5) * uGrain;
      color *= 1.0 - falloff * 0.55;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};
