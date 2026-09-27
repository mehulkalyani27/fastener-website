import type { ComponentPropsWithoutRef } from "react";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  tone?: "default" | "surface" | "ink";
};

const tones = {
  default: "",
  surface: "bg-surface",
  ink: "surface-ink",
};

export function Section({ tone = "default", className = "", ...props }: SectionProps) {
  return <section className={`py-section ${tones[tone]} ${className}`} {...props} />;
}
