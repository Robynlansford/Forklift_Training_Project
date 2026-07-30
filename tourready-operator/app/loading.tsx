export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-[var(--color-surface-2)]" />
      <div className="mt-3 h-5 w-80 animate-pulse rounded-lg bg-[var(--color-surface-2)]/60" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-[var(--radius-card)] border border-[var(--color-border)]/50 bg-[var(--color-surface)]"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
