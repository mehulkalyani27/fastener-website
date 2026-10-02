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

type SelectFieldProps = FieldProps &
  Omit<ComponentPropsWithoutRef<"select">, "id" | "className" | "children"> & {
    options: readonly string[];
    placeholder: string;
  };

export function SelectField({ id, label, className = "", options, placeholder, ...props }: SelectFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-2">
        <select
          id={id}
          name={id}
          defaultValue=""
          className={`min-h-12 appearance-none pr-11 [&:has(option[value='']:checked)]:text-muted/70 ${controlClassName}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-foreground">
              {option}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 6l5 5 5-5" />
        </svg>
      </div>
    </div>
  );
}
