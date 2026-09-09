export default function DashboardLoading() {
  return (
    <div className="animate-page space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-neutral-100" />
          <div className="h-7 w-48 rounded bg-neutral-100" />
          <div className="h-4 w-64 rounded bg-neutral-100" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-neutral-100" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-xl bg-neutral-100" />
              <div className="h-5 w-12 rounded bg-neutral-100" />
            </div>
            <div className="mt-6 space-y-2">
              <div className="h-3 w-20 rounded bg-neutral-100" />
              <div className="h-8 w-16 rounded bg-neutral-100" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="h-[320px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-2" />
        <div className="h-[320px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" />
      </div>

      {/* Period filter + activity skeleton */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="h-[200px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm xl:col-span-2" />
        <div className="h-[200px] rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm" />
      </div>
    </div>
  );
}
