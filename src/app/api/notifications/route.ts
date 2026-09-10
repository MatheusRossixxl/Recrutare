import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireApiSession();

    const notifications = await db.notification.findMany({
      where: {
        organizationId: user.organizationId,
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json(
      notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 401 }
    );
  }
}
