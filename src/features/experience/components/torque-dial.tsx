"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/features/experience/lib/media";

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICKS = 24;

/** Decorative scroll-progress gauge; each page section acts as a torque "detent". */
export function TorqueDial() {
  const dial = useRef<HTMLDivElement>(null);
  const arc = useRef<SVGCircleElement>(null);
  const value = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let detent = -1;
    const reducedMotion = prefersReducedMotion();

    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      arc.current?.setAttribute("stroke-dashoffset", String(CIRCUMFERENCE * (1 - progress)));
      if (value.current) value.current.textContent = String(Math.round(progress * 100));

      const threshold = window.innerHeight * 0.4;
      const passed = Array.from(document.querySelectorAll("main section[id]")).filter(
        (section) => section.getBoundingClientRect().top <= threshold,
      ).length;

      if (passed !== detent) {
        if (detent !== -1 && !reducedMotion) {
          dial.current?.animate(
            [{ transform: "rotate(0deg) scale(1)" }, { transform: "rotate(-8deg) scale(1.08)" }, { transform: "rotate(0deg) scale(1)" }],
            { duration: 320, easing: "cubic-bezier(0.2, 0, 0, 1)" },
          );
        }
        detent = passed;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={dial}
      aria-hidden="true"
      className="pointer-events-none fixed right-4 bottom-4 z-30 hidden size-14 rounded-full border border-border bg-background/85 text-foreground shadow-card backdrop-blur sm:block sm:size-16 print:hidden"
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full -rotate-90">
        {Array.from({ length: TICKS }, (_, index) => (
          <line
            key={index}
            x1="32"
            y1="2.5"
            x2="32"
            y2={index % 6 === 0 ? 7 : 5}
            stroke="currentColor"
            strokeOpacity="0.35"
            transform={`rotate(${(index / TICKS) * 360} 32 32)`}
          />
        ))}
        <circle
          ref={arc}
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span ref={value} className="text-sm font-bold tabular-nums">
          0
        </span>
        <span className="mt-0.5 text-[0.5rem] font-semibold tracking-widest uppercase opacity-60">
          Torque
        </span>
      </span>
    </div>
  );
}
