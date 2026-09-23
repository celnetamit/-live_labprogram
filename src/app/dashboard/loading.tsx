/**
 * Skeleton for the dashboard segment.
 *
 * Every page under /dashboard is `force-dynamic` and queries the learner's own
 * rows, so there is a real wait on a cold request. Without this the segment
 * showed nothing at all until the server finished — the shell would sit empty
 * and the page looked broken rather than busy. The shapes match the real
 * layout's rhythm so the content does not jump when it arrives.
 */
function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl pb-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your dashboard…</span>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Block className="h-7 w-56" />
          <Block className="h-4 w-40" />
        </div>
        <Block className="h-4 w-40" />
      </div>

      <Block className="mb-8 h-48 w-full rounded-xl" />

      <div className="mb-8 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <Block key={i} className="h-[86px] rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Block key={i} className="h-[340px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
