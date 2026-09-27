import type { ComponentPropsWithoutRef } from "react";
import { SectionLink } from "@/features/navigation/components/section-link";
import { type ButtonVariant, buttonClassName } from "@/components/ui/button-styles";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof SectionLink> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <SectionLink data-magnetic className={buttonClassName(variant, className)} {...props} />;
}
