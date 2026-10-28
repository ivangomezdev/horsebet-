import { adminClient } from "../../../lib/auth/server";
import { accountAccess } from "../../../lib/account/server";
import { decryptKyc } from "../../../lib/account/encryption";
import { ApiError, response, failure } from "../../../lib/auth/security";
export async function GET() {
  try {
    const { client, user, profile } = await accountAccess();
    const admin = adminClient();
    const [wallets, kyc, draft, files, sessions] = await Promise.all([
      client.rpc("get_my_wallets"),
      client
        .from("kyc_status")
        .select("status,updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin.rpc("read_kyc_draft", { p_user_id: user.id }),
      admin.rpc("list_account_files", { p_user_id: user.id }),
      client.rpc("list_user_sessions"),
    ]);
    if (
      wallets.error ||
      kyc.error ||
      draft.error ||
      files.error ||
      sessions.error
    )
      throw new Error("ACCOUNT_UNAVAILABLE");
    return response({
      profile,
      email: user.email,
      wallets: wallets.data,
      kyc: kyc.data || { status: "not_started" },
      kycDraft: decryptKyc(draft.data, user.id),
      files: files.data.map(({ object_path, ...file }) => file),
      sessions: sessions.data,
    });
  } catch (error) {
    return failure(error);
  }
}
