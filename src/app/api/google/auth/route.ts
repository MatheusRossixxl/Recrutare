import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { getGoogleAuthUrl } from "@/lib/google";

export async function GET() {
  try {
    const user = await requireApiSession();
    const url = getGoogleAuthUrl(user.id);
    return NextResponse.redirect(url);
  } catch {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
  }
}
