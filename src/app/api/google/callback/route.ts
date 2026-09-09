import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeCodeForTokens } from "@/lib/google";

function baseUrl(request: Request): string {
  return process.env.NEXTAUTH_URL || new URL(request.url).origin;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // userId
  const origin = baseUrl(request);

  if (!code || !state) {
    return NextResponse.redirect(new URL("/interviews?google=error", origin));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.access_token) {
      return NextResponse.redirect(new URL("/interviews?google=error", origin));
    }

    await db.user.update({
      where: { id: state },
      data: {
        googleAccessToken: tokens.access_token,
        // Google só retorna refresh_token no primeiro consentimento;
        // preserva o existente se não vier um novo.
        ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
        googleConnectedAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL("/interviews?google=connected", origin));
  } catch {
    return NextResponse.redirect(new URL("/interviews?google=error", origin));
  }
}
