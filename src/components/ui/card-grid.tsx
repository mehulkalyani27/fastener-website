import type { ReactNode } from "react";

const columnClasses = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
};

type CardGridProps = {
  children: ReactNode;
  columns?: keyof typeof columnClasses;
  className?: string;
};

export function CardGrid({ children, columns = 3, className = "" }: CardGridProps) {
  return <ul className={`mt-block grid gap-4 sm:gap-6 ${columnClasses[columns]} ${className}`}>{children}</ul>;
}
