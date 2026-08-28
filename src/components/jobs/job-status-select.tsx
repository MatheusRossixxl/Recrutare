"use client";

import { useTransition } from "react";
import { updateJobStatus } from "@/lib/actions";
import { JOB_STATUS_LABELS } from "@/lib/constants";

export function JobStatusSelect({ jobId, status }: { jobId: string; status: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => startTransition(() => updateJobStatus(jobId, e.target.value))}
      className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm disabled:opacity-60"
    >
      {Object.entries(JOB_STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
