type SectionHeaderProps = {
  id: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeader({ id, title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <h2 id={id} className="text-heading font-semibold">
        {title}
      </h2>
      {description && <p className="mt-4 text-lg text-muted">{description}</p>}
    </div>
  );
}
