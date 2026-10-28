import { z } from "zod";
import { accountAccess } from "../../../../lib/account/server";
import { adminClient } from "../../../../lib/auth/server";
import { authConfig } from "../../../../lib/auth/config";
import {
  passwordChangeSchema,
  emailChangeSchema,
} from "../../../../lib/account/validation";
import {
  requireSameOrigin,
  readBody,
  response,
  failure,
  ApiError,
  rateLimit,
} from "../../../../lib/auth/security";
const schema = z.discriminatedUnion("action", [
  passwordChangeSchema.extend({ action: z.literal("password") }),
  emailChangeSchema.extend({ action: z.literal("email") }),
  z.object({ action: z.literal("revoke-others") }),
  z.object({ action: z.literal("logout-all") }),
]);
export async function POST(request) {
  try {
    requireSameOrigin(request);
    const input = await readBody(request, schema);
    const { user, client } = await accountAccess();
    await rateLimit(adminClient(), request, "security", user.id);
    if (input.action === "password") {
      const { error } = await client.auth.updateUser({
        password: input.password,
        current_password: input.currentPassword,
      });
      if (error)
        throw new ApiError(
          "Revisa tu contraseña actual y elige una nueva de al menos 12 caracteres.",
          400,
        );
      const revoked = await client.rpc("revoke_user_sessions", {
        p_all: false,
      });
      if (revoked.error) throw new Error("SESSION_REVOKE_FAILED");
      await client.auth.signOut({ scope: "others" });
      return response({
        ok: true,
        message: "Contraseña actualizada. Se cerraron tus otras sesiones.",
      });
    }
    if (input.action === "email") {
      if (!authConfig().emailEnabled)
        throw new ApiError(
          "El cambio de correo estará disponible cuando se habilite el envío de correos.",
          503,
        );
      const { error } = await client.auth.updateUser(
        { email: input.email },
        { emailRedirectTo: `${authConfig().origin}/auth/confirm/` },
      );
      if (error)
        throw new ApiError("No se pudo solicitar el cambio de correo.", 400);
      return response({
        ok: true,
        message: "Revisa tu correo actual y el nuevo para confirmar el cambio.",
      });
    }
    const all = input.action === "logout-all";
    const { error } = await client.rpc("revoke_user_sessions", { p_all: all });
    if (error) throw new Error("SESSION_REVOKE_FAILED");
    await client.auth.signOut({ scope: all ? "global" : "others" });
    return response({
      ok: true,
      message: all ? "Sesiones cerradas." : "Tus otras sesiones se cerraron.",
    });
  } catch (error) {
    return failure(error);
  }
}
