import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { authConfig } from "./config";

export async function authClient() {
  const config = authConfig();
  const store = await cookies();
  return createServerClient(config.url, config.key, {
    cookieOptions: {
      httpOnly: true,
      secure: config.secure,
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values)
          store.set(name, value, {
            ...options,
            httpOnly: true,
            secure: config.secure,
            sameSite: "lax",
            path: "/",
          });
      },
    },
  });
}
export function adminClient() {
  const config = authConfig();
  return createClient(config.url, config.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export async function verifiedUser(client) {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user?.email_confirmed_at) return null;
  const { data: active, error: sessionError } =
    await client.rpc("touch_user_session");
  if (sessionError) throw new Error("SESSION_CHECK_UNAVAILABLE");
  return active ? data.user : null;
}
