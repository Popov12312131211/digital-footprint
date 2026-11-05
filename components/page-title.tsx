export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-2">{description}</p>
      </div>
      {action}
    </div>
  );
}
