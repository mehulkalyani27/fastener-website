import { LOGO_MARK_PATHS } from "@/components/layout/logo-mark-paths";
import { SectionLink } from "@/features/navigation/components/section-link";
import { siteConfig } from "@/data/site";

type LogoProps = {
  tone?: "light" | "dark";
  className?: string;
};

const tones = {
  light: { mark: "text-ink-foreground", subline: "text-ink-accent" },
  dark: { mark: "text-primary", subline: "text-muted" },
};

/** Mark paths from public/metacore-horizontal-navy.svg; the wordmark is live Inter text. */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 208" aria-hidden="true" fill="currentColor" className={className}>
      {LOGO_MARK_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Logo({ tone = "light", className = "" }: LogoProps) {
  const [primary, ...rest] = siteConfig.name.split(" ");
  const colors = tones[tone];

  return (
    <SectionLink href="/" className={`inline-flex items-center gap-2.5 ${colors.mark} ${className}`}>
      <LogoMark className="h-8 w-auto sm:h-9" />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-[0.02em] uppercase sm:text-xl">{primary}</span>
        <span className={`mt-1 text-[0.5625rem] font-medium tracking-[0.3em] uppercase ${colors.subline}`}>
          {rest.join(" ")}
        </span>
      </span>
    </SectionLink>
  );
}
