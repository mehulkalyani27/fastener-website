import type { ComponentPropsWithoutRef } from "react";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  tone?: "default" | "surface";
};

const tones = {
  default: "",
  surface: "bg-surface",
};

export function Section({ tone = "default", className = "", ...props }: SectionProps) {
  return <section className={`py-section ${tones[tone]} ${className}`} {...props} />;
}
