import { accountAccess } from "../../../../lib/account/server";
import { adminClient } from "../../../../lib/auth/server";
import { settingsSchema } from "../../../../lib/account/validation";
import { normalizedPhone } from "../../../../lib/auth/validation";
import {
  requireSameOrigin,
  readBody,
  response,
  failure,
  ApiError,
  rateLimit,
} from "../../../../lib/auth/security";
export async function POST(request) {
  try {
    requireSameOrigin(request);
    const input = await readBody(request, settingsSchema);
    const { user } = await accountAccess();
    const admin = adminClient();
    await rateLimit(admin, request, "settings", user.id);
    const { section, ...data } = input;
    if (section === "phone")
      data.phone = normalizedPhone(data.phone, data.country);
    const { error } = await admin.rpc("save_account_settings", {
      p_user_id: user.id,
      p_section: section,
      p_data: data,
    });
    if (error)
      throw new ApiError(
        error.code === "23505"
          ? "Ese usuario ya está ocupado."
          : "No se pudieron guardar los cambios.",
        409,
      );
    return response({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
