export default function MenuSkeleton() {
  return (
    <div className="min-h-screen px-3 pt-3 animate-fadeIn">
      <div className="mx-auto max-w-xl rounded-full bg-ink/10 h-14 animate-pulse" />
      <div className="mt-4 h-40 rounded-xl2 bg-ink/10 animate-pulse" />
      <div className="mt-5 flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 w-16 rounded-full bg-ink/10 animate-pulse shrink-0" />
        ))}
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-ink/10 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
