import { type ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { controlClassName, FieldError } from "@/components/ui/form-field";
import { callingCodeOf, COUNTRY_OPTIONS, DEFAULT_COUNTRY, flagEmoji } from "@/features/contact/countries";

/**
 * A native select, so touch devices get their own picker and keyboards work as usual. Its list shows
 * flag, name and code; the closed control shows only flag and code, drawn over the (transparent)
 * select text.
 */
function CountrySelect({ defaultCountry }: { defaultCountry: string }) {
  const [selected, setSelected] = useState(defaultCountry);
  const select = useRef<HTMLSelectElement>(null);

  // A form reset (after a successful send) puts the select back to its default without a change event.
  useEffect(() => {
    const form = select.current?.form;
    const reset = () => setSelected(defaultCountry);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultCountry]);

  return (
    <div className="relative w-[5.75rem] shrink-0 sm:w-28">
      <select
        ref={select}
        id="phoneCountry"
        name="phoneCountry"
        aria-label="Country"
        defaultValue={defaultCountry}
        onChange={(event) => setSelected(event.target.value)}
        className={`min-h-12 w-full cursor-pointer appearance-none pr-8 text-transparent ${controlClassName}`}
      >
        {COUNTRY_OPTIONS.map(({ code, name, callingCode }) => (
          <option key={code} value={code} className="bg-background text-foreground">
            {flagEmoji(code)} {name} (+{callingCode})
          </option>
        ))}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-4 flex items-center gap-1.5 text-base whitespace-nowrap text-foreground"
      >
        <span>{flagEmoji(selected)}</span>
        <span>+{callingCodeOf(selected)}</span>
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 6l5 5 5-5" />
      </svg>
    </div>
  );
}

type PhoneFieldProps = Omit<ComponentPropsWithoutRef<"input">, "id" | "name" | "type"> & {
  className?: string;
  error?: string;
  defaultCountry?: string;
};

/** A phone number with its country: the number is checked against that country's numbering rules. */
export function PhoneField({ className = "", error, defaultCountry = DEFAULT_COUNTRY, ...props }: PhoneFieldProps) {
  return (
    <div className={className}>
      <label htmlFor="phone" className="block text-sm font-medium">
        Phone
      </label>
      <div className="mt-2 flex gap-2">
        <CountrySelect key={defaultCountry} defaultCountry={defaultCountry} />
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={`min-h-12 min-w-0 flex-1 ${controlClassName}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "phone-error" : undefined}
          {...props}
        />
      </div>
      <FieldError id="phone" error={error} />
    </div>
  );
}
