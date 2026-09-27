import type { ReactNode } from "react";
import { formatIndex } from "@/lib/format";

type CardProps = {
  title: string;
  description?: string;
  index?: number;
  children?: ReactNode;
};

export function Card({ title, description, index, children }: CardProps) {
  return (
    <article
      data-reveal
      className="flex w-full flex-col rounded-card border border-border bg-background p-6 shadow-card transition-[border-color,box-shadow] duration-300 ease-standard hover:border-primary/20 hover:shadow-raised sm:p-7"
    >
      {index !== undefined && (
        <span aria-hidden="true" className="mb-6 text-xs font-semibold tracking-[0.2em] text-muted tabular-nums">
          {formatIndex(index)}
        </span>
      )}
      <h3 className="text-lg font-semibold tracking-[-0.01em]">{title}</h3>
      {description && <p className="mt-2 leading-relaxed text-muted">{description}</p>}
      {children}
    </article>
  );
}
