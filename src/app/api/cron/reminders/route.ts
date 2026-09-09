import { NextResponse } from "next/server";
import { checkAndSendReminders } from "@/services/notification-service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("x-cron-secret");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || authHeader !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notificationsCreated = await checkAndSendReminders();

  return NextResponse.json({ checked: true, notificationsCreated });
}
