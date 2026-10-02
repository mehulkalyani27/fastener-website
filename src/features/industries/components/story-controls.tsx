type StoryControlsProps = {
  names: readonly string[];
  chapter: number;
  onGo: (index: number) => void;
};

/** Step indicator: one clickable segment per industry; the fill of the current one is driven by the clock. */
export function StoryControls({ names, chapter, onGo }: StoryControlsProps) {
  return (
    <ol aria-label="Industries" className="flex gap-1.5">
      {names.map((name, index) => (
        <li key={name} className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onGo(index)}
            aria-label={`Show ${name}`}
            aria-current={index === chapter ? "step" : undefined}
            className="flex h-10 w-full items-center"
          >
            <span className="block h-0.5 w-full bg-foreground/15">
              <span data-chapter-bar={index} className="block h-full origin-left scale-x-0 bg-primary" />
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
