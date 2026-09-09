import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { disconnectGoogle } from "@/lib/google";

function baseUrl(request: Request): string {
  return process.env.NEXTAUTH_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  const user = await requireSession();

  await disconnectGoogle(user.id);

  return NextResponse.redirect(new URL("/interviews?google=disconnected", baseUrl(request)));
}
