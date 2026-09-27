import type { ReactNode } from "react";

/** Full-width stacked buttons on phones, inline from small screens up. */
export function ButtonGroup({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>{children}</div>;
}
