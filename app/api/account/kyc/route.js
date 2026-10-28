import { z } from "zod";
import { accountAccess } from "../../../../lib/account/server";
import { adminClient } from "../../../../lib/auth/server";
import { kycSchema } from "../../../../lib/account/validation";
import { encryptKyc } from "../../../../lib/account/encryption";
import {
  requireSameOrigin,
  readBody,
  response,
  failure,
  ApiError,
  rateLimit,
} from "../../../../lib/auth/security";
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), data: kycSchema }).strict(),
  z.object({ action: z.literal("submit") }).strict(),
]);
export async function POST(request) {
  try {
    requireSameOrigin(request);
    const input = await readBody(request, schema);
    const { user, profile } = await accountAccess();
    if (!profile.onboarding_completed)
      throw new ApiError("Completa tu perfil antes de continuar.", 403);
    const admin = adminClient();
    await rateLimit(admin, request, "kyc", user.id);
    const args =
      input.action === "save"
        ? { p_user_id: user.id, p_payload: encryptKyc(input.data, user.id) }
        : { p_user_id: user.id };
    const { error } = await admin.rpc(
      input.action === "save" ? "save_kyc_draft" : "submit_kyc",
      args,
    );
    if (error)
      throw new ApiError(
        "No se pudo guardar. Revisa los documentos requeridos y el estado de tu verificación.",
        409,
      );
    return response({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
