export default function ReportsLoading() {
  return (
    <div className="animate-page space-y-7">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="space-y-2">
          <div className="h-3 w-36 rounded bg-neutral-100" />
          <div className="h-7 w-32 rounded bg-neutral-100" />
          <div className="h-4 w-72 rounded bg-neutral-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-48 rounded-xl bg-neutral-100" />
          <div className="h-9 w-28 rounded-xl bg-neutral-100" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-neutral-100" />
                <div className="h-8 w-16 rounded bg-neutral-100" />
                <div className="h-3 w-28 rounded bg-neutral-100" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="h-[320px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" />
        <div className="h-[320px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" />
      </div>

      {/* Timeline skeleton */}
      <div className="h-[200px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" />
    </div>
  );
}
