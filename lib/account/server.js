import "server-only";
import { authClient, verifiedUser } from "../auth/server";
import { ApiError } from "../auth/security";
export async function accountAccess() {
  const client = await authClient();
  const user = await verifiedUser(client);
  if (!user) throw new ApiError("Inicia sesión para acceder a tu cuenta.", 401);
  const { data: profile, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) throw new Error("PROFILE_UNAVAILABLE");
  if (profile.account_status !== "active")
    throw new ApiError("Esta cuenta no está disponible.", 403);
  return { client, user, profile };
}
