import type { ComponentPropsWithoutRef, ElementType } from "react";

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export function Container<T extends ElementType = "div">({
  as,
  className = "",
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? "div") as ElementType<{ className?: string }>;

  return (
    <Component
      className={`mx-auto w-full max-w-content px-gutter ${className}`}
      {...props}
    />
  );
}
