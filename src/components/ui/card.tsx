import type { ReactNode } from "react";

type CardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function Card({ title, description, children }: CardProps) {
  return (
    <article className="flex w-full flex-col rounded-lg border border-border bg-background p-6">
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-muted">{description}</p>}
      {children}
    </article>
  );
}
