import { NextRequest, NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await requireApiSession();
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (!q) {
      return NextResponse.json({ jobs: [], candidates: [], companies: [] });
    }

    const [jobs, candidates, companies] = await Promise.all([
      db.job.findMany({
        where: {
          organizationId: session.organizationId,
          archived: false,
          OR: [
            { title: { contains: q } },
            { company: { name: { contains: q } } },
            { location: { contains: q } },
          ],
        },
        select: {
          id: true,
          title: true,
          company: { select: { name: true } },
        },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      db.candidate.findMany({
        where: {
          organizationId: session.organizationId,
          archived: false,
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { skills: { contains: q } },
            { city: { contains: q } },
            { desiredRole: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          desiredRole: true,
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      }),
      db.company.findMany({
        where: {
          organizationId: session.organizationId,
          OR: [
            { name: { contains: q } },
            { name: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({ jobs, candidates, companies });
  } catch {
    return NextResponse.json({ jobs: [], candidates: [], companies: [] });
  }
}