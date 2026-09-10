import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { disconnectGoogle } from "@/lib/google";

function baseUrl(request: Request): string {
  return process.env.NEXTAUTH_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  try {
    const user = await requireApiSession();

    await disconnectGoogle(user.id);

    return NextResponse.redirect(new URL("/interviews?google=disconnected", baseUrl(request)));
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.redirect(new URL("/login", baseUrl(request)));
    }
    throw err;
  }
}
