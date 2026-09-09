import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

export async function GET() {
  const user = await requireSession();
  const url = getGoogleAuthUrl(user.id);
  return NextResponse.redirect(url);
}
