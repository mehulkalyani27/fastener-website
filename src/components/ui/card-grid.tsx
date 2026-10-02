import type { ReactNode } from "react";

const columnClasses = {
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
  /** Rows of three from laptop width, where items use `balancedItemClass` to fill a short last row. */
  balanced: "sm:grid-cols-2 lg:grid-cols-6",
};

type CardGridProps = {
  children: ReactNode;
  columns?: keyof typeof columnClasses;
  className?: string;
};

/**
 * Item classes for a `balanced` grid: rows of three, with a final short row (1 or 2 items)
 * stretched across the full width instead of leaving an empty cell; in the two-column layout
 * a lone last item spans both columns.
 */
export function balancedItemClass(index: number, total: number) {
  const remainder = total % 3;
  const inShortRow = remainder > 0 && index >= total - remainder;
  const span = !inShortRow ? "lg:col-span-2" : remainder === 1 ? "lg:col-span-6" : "lg:col-span-3";
  return `${span} sm:max-lg:last:odd:col-span-2`;
}

export function CardGrid({ children, columns = 3, className = "" }: CardGridProps) {
  return <ul className={`mt-block grid gap-4 sm:gap-6 ${columnClasses[columns]} ${className}`}>{children}</ul>;
}
