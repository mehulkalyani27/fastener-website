"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { FINE_POINTER_QUERY, prefersReducedMotion } from "@/features/experience/lib/media";

const BASE_SIZE = 28;
const MAX_SIZE = 84;
const MAGNET_STRENGTH = 0.25;
const INTERACTIVE = "a, button, [data-magnetic]";
/** Dense text lists (the footer) opt out: a seated hex would overlap the neighbouring rows. */
const PLAIN = "[data-cursor-plain]";

/** The interactive element the cursor should seat on, if any. */
const seatTarget = (node: Element | null) => {
  const element = node?.closest<HTMLElement>(INTERACTIVE) ?? null;
  return element && !element.closest(PLAIN) ? element : null;
};

/**
 * Hexagonal "Allen socket" cursor. It trails the pointer, seats onto interactive elements
 * (grows to fit, turns 30°), tightens a sixth of a turn on press with a ripple, and lets
 * [data-magnetic] elements lean toward the pointer before springing back. Inside a
 * [data-cursor-plain] container it only trails the pointer. The native cursor stays visible for
 * accessibility.
 */
export function HexCursor() {
  const cursor = useRef<HTMLDivElement>(null);
  const socket = useRef<SVGSVGElement>(null);
  const ripple = useRef<SVGPolygonElement>(null);

  useEffect(() => {
    const element = cursor.current;
    const socketElement = socket.current;
    const rippleElement = ripple.current;
    if (!element || !socketElement || !rippleElement) return;
    if (!window.matchMedia(FINE_POINTER_QUERY).matches || prefersReducedMotion()) return;

    const pointer = { x: -100, y: -100 };
    let target: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    gsap.set(element, { xPercent: -50, yPercent: -50, x: pointer.x, y: pointer.y });
    const moveX = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });

    const releaseMagnet = () => {
      if (!magnet) return;
      gsap.to(magnet, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" });
      magnet = null;
    };

    const seat = (next: HTMLElement | null) => {
      if (next === target) return;
      target = next;
      if (magnet !== next) releaseMagnet();

      if (next) {
        const size = Math.min(next.getBoundingClientRect().height + 20, MAX_SIZE);
        gsap.to(element, { scale: size / BASE_SIZE, rotation: 30, duration: 0.45, ease: "back.out(2.2)" });
      } else {
        gsap.to(element, { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2.2)" });
      }
    };

    const track = () => {
      if (!target) {
        moveX(pointer.x);
        moveY(pointer.y);
        return;
      }
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (pointer.x - centerX) * MAGNET_STRENGTH;
      const dy = (pointer.y - centerY) * MAGNET_STRENGTH;
      moveX(centerX + dx);
      moveY(centerY + dy);

      if (target.hasAttribute("data-magnetic")) {
        magnet = target;
        gsap.to(target, { x: dx, y: dy, duration: 0.3, ease: "power3.out", overwrite: "auto" });
      }
    };

    const hitTest = () => seatTarget(document.elementFromPoint(pointer.x, pointer.y));

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      gsap.to(element, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      seat(seatTarget(event.target as Element | null));
      track();
    };

    const onScroll = () => {
      seat(hitTest());
      track();
    };

    const onDown = () => {
      gsap.to(socketElement, { rotation: "+=60", duration: 0.5, ease: "back.out(3)", transformOrigin: "50% 50%" });
      gsap.fromTo(
        rippleElement,
        { scale: 1, opacity: 0.9 },
        { scale: 2.4, opacity: 0, duration: 0.6, ease: "power2.out", transformOrigin: "50% 50%" },
      );
    };

    const onLeave = () => {
      gsap.to(element, { autoAlpha: 0, duration: 0.2 });
      seat(null);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      releaseMagnet();
      gsap.killTweensOf([element, socketElement, rippleElement]);
    };
  }, []);

  return (
    <div
      ref={cursor}
      aria-hidden="true"
      className="pointer-events-none invisible fixed top-0 left-0 z-50 size-7 text-white opacity-0 mix-blend-difference"
    >
      <svg ref={socket} viewBox="0 0 28 28" className="size-full overflow-visible">
        <polygon
          ref={ripple}
          points="14,1 25.3,7.5 25.3,20.5 14,27 2.7,20.5 2.7,7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="14,1 25.3,7.5 25.3,20.5 14,27 2.7,20.5 2.7,7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
