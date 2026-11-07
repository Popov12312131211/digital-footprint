export default function Loading() {
  return (
    <div className="space-y-5" role="status" aria-label="Loading">
      <div className="h-24 animate-pulse rounded-[24px] bg-white/5" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-[24px] bg-white/5" />
        ))}
      </div>
    </div>
  );
}
