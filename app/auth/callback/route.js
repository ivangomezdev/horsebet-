import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authClient } from "../../../lib/auth/server";
import { authConfig, authConfigured } from "../../../lib/auth/config";
import { safeReturnTo } from "../../../lib/auth/validation";
export async function GET(request) {
  if (!authConfigured())
    return NextResponse.json(
      { error: "La autenticación todavía no está configurada." },
      { status: 503, headers: { "Cache-Control": "private, no-store" } },
    );
  const config = authConfig();
  const code = new URL(request.url).searchParams.get("code");
  let destination = "/es/?auth=error";
  if (code) {
    try {
      const client = await authClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (!error) {
        const store = await cookies();
        destination = safeReturnTo(store.get("hb-auth-next")?.value);
        store.delete("hb-auth-next");
      }
    } catch {}
  }
  const result = NextResponse.redirect(new URL(destination, config.origin));
  result.headers.set("Cache-Control", "private, no-store");
  return result;
}
