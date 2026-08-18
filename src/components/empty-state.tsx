export function EmptyState({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[4px] border border-dashed border-card-border p-10 px-5 text-center text-[13.5px] text-ink-dim">
      <b className="mb-1.5 block font-display text-[22px] tracking-wide text-ink">
        {title}
      </b>
      {children}
    </div>
  );
}
