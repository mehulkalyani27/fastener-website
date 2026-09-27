import type { ComponentPropsWithoutRef } from "react";

const controlClassName =
  "w-full rounded-control border border-border bg-background px-4 text-base text-foreground shadow-card placeholder:text-muted/60 transition-[border-color] duration-200 hover:border-muted/50 focus:border-primary";

type FieldProps = {
  id: string;
  label: string;
  className?: string;
};

export function TextField({
  id,
  label,
  className = "",
  type = "text",
  ...props
}: FieldProps & Omit<ComponentPropsWithoutRef<"input">, "id" | "className">) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input id={id} name={id} type={type} className={`mt-2 min-h-12 ${controlClassName}`} {...props} />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  className = "",
  rows = 4,
  ...props
}: FieldProps & Omit<ComponentPropsWithoutRef<"textarea">, "id" | "className">) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className={`mt-2 min-h-32 resize-y py-3 ${controlClassName}`}
        {...props}
      />
    </div>
  );
}
