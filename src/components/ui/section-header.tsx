type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ id, title, description, className = "" }: SectionHeaderProps) {
  return (
    <div data-reveal className={`max-w-3xl ${className}`}>
      <h2 id={id} className="text-heading font-semibold">
        {title}
      </h2>
      {description && (
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{description}</p>
      )}
    </div>
  );
}
