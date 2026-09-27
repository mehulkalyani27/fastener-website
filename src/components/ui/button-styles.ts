export const buttonVariants = {
  primary: "bg-primary text-primary-foreground shadow-card hover:bg-primary-hover",
  secondary: "border border-border bg-background text-foreground hover:border-muted/40 hover:bg-surface",
  outline: "border border-ink-accent/60 text-ink-foreground hover:border-ink-accent hover:bg-ink-border",
};

export type ButtonVariant = keyof typeof buttonVariants;

export function buttonClassName(variant: ButtonVariant, className = "") {
  return `inline-flex min-h-12 items-center justify-center rounded-control px-6 text-sm font-semibold tracking-[0.01em] whitespace-nowrap transition-[background-color,border-color,color,scale] duration-200 ease-standard active:scale-[0.97] ${buttonVariants[variant]} ${className}`;
}
