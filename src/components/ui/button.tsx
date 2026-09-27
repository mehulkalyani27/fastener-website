import type { ComponentPropsWithoutRef } from "react";
import { type ButtonVariant, buttonClassName } from "@/components/ui/button-styles";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      data-magnetic
      type={type}
      className={buttonClassName(variant, className)}
      {...props}
    />
  );
}
