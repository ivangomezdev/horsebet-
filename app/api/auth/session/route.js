import { authConfigured } from "../../../../lib/auth/config";
import { authClient, verifiedUser } from "../../../../lib/auth/server";
import { response, failure } from "../../../../lib/auth/security";
export async function GET() {
  if (!authConfigured()) return response({ user: null, configured: false });
  try {
    const client = await authClient();
    const user = await verifiedUser(client);
    if (!user) return response({ user: null, configured: true });
    const { data: profile, error } = await client
      .from("profiles")
      .select("username,onboarding_completed,account_status")
      .eq("id", user.id)
      .single();
    if (error) throw new Error("PROFILE_UNAVAILABLE");
    if (profile.account_status !== "active") {
      await client.auth.signOut({ scope: "local" });
      return response(
        { user: null, error: "Esta cuenta no está disponible." },
        403,
      );
    }
    return response({
      user: {
        id: user.id,
        email: user.email,
        username: profile.username,
        onboardingCompleted: profile.onboarding_completed,
      },
      configured: true,
    });
  } catch (error) {
    return failure(error);
  }
}
