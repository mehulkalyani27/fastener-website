import { HexCursor } from "@/features/experience/components/hex-cursor";
import { ScrollReveal } from "@/features/experience/components/scroll-reveal";
import { SmoothScroll } from "@/features/experience/components/smooth-scroll";
import { TorqueDial } from "@/features/experience/components/torque-dial";

export function ExperienceLayer() {
  return (
    <>
      <SmoothScroll />
      <ScrollReveal />
      <HexCursor />
      <TorqueDial />
    </>
  );
}
