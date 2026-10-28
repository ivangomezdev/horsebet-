import { cookies } from "next/headers";
import { z } from "zod";
import { authConfig } from "../../../../lib/auth/config";
import {
  authClient,
  adminClient,
  verifiedUser,
} from "../../../../lib/auth/server";
import {
  ApiError,
  response,
  failure,
  requireSameOrigin,
  readBody,
  rateLimit,
  markRecovery,
  requireRecovery,
  clearRecovery,
} from "../../../../lib/auth/security";
import {
  registerSchema,
  profileSchema,
  loginSchema,
  emailRequestSchema,
  resetSchema,
  verificationSchema,
  oauthSchema,
  normalizedPhone,
  safeReturnTo,
} from "../../../../lib/auth/validation";

const schemas = {
  register: registerSchema,
  login: loginSchema,
  recover: emailRequestSchema,
  resend: emailRequestSchema,
  password: resetSchema,
  verify: verificationSchema,
  oauth: oauthSchema,
  logout: z.object({}).strict(),
  "complete-profile": profileSchema,
};
async function completeProfile(admin, id, input) {
  const { error } = await admin.rpc("complete_user_profile", {
    p_user_id: id,
    p_username: input.username,
    p_country: input.country,
    p_phone: normalizedPhone(input.phone, input.country),
    p_referral: input.referral || null,
  });
  if (error)
    throw new ApiError(
      error.code === "23505"
        ? "Ese nombre de usuario no está disponible. Elige otro."
        : "No se pudo guardar el perfil. Inténtalo de nuevo.",
      409,
    );
}
export async function POST(request, { params }) {
  try {
    const { action } = await params;
    if (!schemas[action])
      return response({ error: "Ruta no encontrada." }, 404);
    requireSameOrigin(request);
    const input = await readBody(request, schemas[action]);
    const config = authConfig();
    const client = await authClient();
    const admin = adminClient();
    if (action !== "logout")
      await rateLimit(
        admin,
        request,
        action,
        input.identifier || input.email || "",
      );
    if (action === "register") {
      const { data, error } = await client.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${config.origin}/auth/confirm/`,
          data: { username: input.username },
        },
      });
      if (error)
        throw new ApiError(
          error.code === "weak_password"
            ? "Elige una contraseña más segura."
            : "No se pudo crear la cuenta. Revisa los datos y prueba con otro usuario.",
          400,
        );
      try {
        if (data.user?.identities?.length)
          await completeProfile(admin, data.user.id, input);
        if (data.session) {
          const user = await verifiedUser(client);
          if (!user) throw new Error("SESSION_CHECK_UNAVAILABLE");
          await clearRecovery();
          return response({ ok: true, authenticated: true });
        }
      } catch (error) {
        if (data.session) await client.auth.signOut({ scope: "local" });
        throw error;
      }
      return response({
        ok: true,
        message:
          "Revisa tu correo para confirmar la cuenta. Si ya existe, puedes iniciar sesión o recuperar la contraseña.",
      });
    }
    if (action === "login") {
      let email = input.identifier;
      if (!email.includes("@")) {
        const { data, error } = await admin.rpc("resolve_login_email", {
          p_username: email,
        });
        if (error) throw new Error("LOGIN_UNAVAILABLE");
        email = data || "unknown-user@invalid.example";
      }
      const { error } = await client.auth.signInWithPassword({
        email,
        password: input.password,
      });
      if (error)
        throw new ApiError(
          "Usuario o contraseña incorrectos, o correo pendiente de confirmar.",
          401,
        );
      const user = await verifiedUser(client);
      if (!user) {
        await client.auth.signOut({ scope: "local" });
        throw new ApiError("Confirma tu correo antes de iniciar sesión.", 401);
      }
      const { data: profile, error: profileError } = await client
        .from("profiles")
        .select("account_status")
        .eq("id", user.id)
        .single();
      if (profileError || profile.account_status !== "active") {
        await client.auth.signOut({ scope: "local" });
        throw new ApiError("No se puede acceder a esta cuenta.", 403);
      }
      await clearRecovery();
      return response({ ok: true });
    }
    if (action === "logout") {
      const {
        data: { user: current },
      } = await client.auth.getUser();
      if (current) {
        const revoked = await client.rpc("revoke_current_session");
        if (revoked.error) throw new Error("SESSION_REVOKE_FAILED");
      }
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw new Error("SIGNOUT_FAILED");
      await clearRecovery();
      return response({ ok: true });
    }
    if (action === "recover" || action === "resend") {
      if (!config.emailEnabled)
        throw new ApiError(
          "El envío de correos todavía no está disponible. Contacta con soporte si necesitas recuperar tu cuenta.",
          503,
        );
      const options = { redirectTo: `${config.origin}/auth/confirm/` };
      const result =
        action === "recover"
          ? await client.auth.resetPasswordForEmail(input.email, options)
          : await client.auth.resend({
              type: "signup",
              email: input.email,
              options: { emailRedirectTo: options.redirectTo },
            });
      if (result.error && result.error.status >= 500)
        throw new Error("MAIL_UNAVAILABLE");
      if (result.error?.status === 429)
        throw new ApiError(
          "Espera unos minutos antes de solicitar otro correo.",
          429,
        );
      return response({
        ok: true,
        message:
          "Si el correo corresponde a una cuenta, recibirás las instrucciones. Revisa también la carpeta de spam.",
      });
    }
    if (action === "oauth") {
      if (!config.google)
        throw new ApiError(
          "El acceso con Google todavía no está disponible.",
          503,
        );
      const store = await cookies();
      store.set("hb-auth-next", safeReturnTo(input.next), {
        httpOnly: true,
        secure: config.secure,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      });
      const { data, error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${config.origin}/auth/callback/`,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error || !data.url) throw new Error("GOOGLE_UNAVAILABLE");
      return response({ url: data.url });
    }
    if (action === "verify") {
      const { data, error } = await client.auth.verifyOtp({
        token_hash: input.tokenHash,
        type: input.type,
      });
      if (error || (!data.user && input.type !== "email_change"))
        throw new ApiError(
          "Este enlace caducó o ya fue utilizado. Solicita uno nuevo.",
          400,
        );
      if (input.type === "recovery") await markRecovery(data.user.id);
      else await clearRecovery();
      return response({
        ok: true,
        next:
          input.type === "recovery"
            ? "/es/?auth=reset"
            : input.type === "email_change"
              ? "/es/account/?auth=email-updated"
              : "/es/?auth=confirmed",
      });
    }
    const user = await verifiedUser(client);
    if (!user) throw new ApiError("Inicia sesión para continuar.", 401);
    if (action === "password") {
      await requireRecovery(user.id);
      const { error } = await client.auth.updateUser({
        password: input.password,
      });
      if (error)
        throw new ApiError(
          "No se pudo cambiar la contraseña. Elige una contraseña nueva y segura.",
          400,
        );
      const revoked = await client.rpc("revoke_user_sessions", { p_all: true });
      if (revoked.error) throw new Error("SESSION_REVOKE_FAILED");
      await clearRecovery();
      await client.auth.signOut({ scope: "global" });
      return response({
        ok: true,
        message: "Contraseña actualizada. Vuelve a iniciar sesión.",
      });
    }
    if (action === "complete-profile") {
      await completeProfile(admin, user.id, input);
      return response({ ok: true });
    }
    return response({ error: "Ruta no encontrada." }, 404);
  } catch (error) {
    return failure(error);
  }
}
