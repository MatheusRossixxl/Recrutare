"use client";

import { useRouter } from "next/navigation";
import type { Company, Job } from "@prisma/client";

export function JobFilter({ jobs, activeJobId }: { jobs: (Job & { company: Company })[]; activeJobId: string }) {
  const router = useRouter();

  return (
    <select
      value={activeJobId}
      onChange={(e) => router.push(`/pipeline?jobId=${e.target.value}`)}
      className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
    >
      {jobs.map((job) => (
        <option key={job.id} value={job.id}>
          {job.title} — {job.company.name}
        </option>
      ))}
    </select>
  );
}
