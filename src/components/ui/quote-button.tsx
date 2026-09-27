import type { ComponentPropsWithoutRef } from "react";
import { SectionLink } from "@/features/navigation/components/section-link";

const sizes = {
  sm: "h-10 gap-2 pr-4 pl-3 text-[0.8125rem]",
  md: "h-12 gap-2.5 pr-5 pl-4 text-sm",
};

type QuoteButtonProps = ComponentPropsWithoutRef<typeof SectionLink> & {
  size?: keyof typeof sizes;
};

/** Signature "Request a Quote" control for navy surfaces; styling lives in `torque-ring`. */
export function QuoteButton({ size = "md", className = "", children, ...props }: QuoteButtonProps) {
  return (
    <SectionLink
      data-magnetic
      className={`torque-ring group inline-flex items-center justify-center rounded-control font-semibold tracking-[0.01em] whitespace-nowrap text-ink-foreground transition-[color,scale] duration-300 ease-standard hover:text-primary focus-visible:text-primary active:scale-[0.97] ${sizes[size]} ${className}`}
      {...props}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-4 shrink-0 transition-[rotate] duration-500 ease-spring group-hover:rotate-60 group-focus-visible:rotate-60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M8 1.2 13.9 4.6v6.8L8 14.8 2.1 11.4V4.6z" />
        <circle cx="8" cy="8" r="2.3" />
      </svg>
      <span>{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-3.5 shrink-0 transition-transform duration-300 ease-standard group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </SectionLink>
  );
}
