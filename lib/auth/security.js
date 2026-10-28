import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { authConfig } from "./config";

export class ApiError extends Error {
  constructor(message, status = 400, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export function response(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Cookie",
      Pragma: "no-cache",
    },
  });
}
export function failure(error) {
  if (error instanceof ApiError)
    return response(
      { error: error.message, fields: error.fields },
      error.status,
    );
  // Never return provider errors, tokens or submitted values to the browser/logs.
  return response(
    {
      error:
        error.message === "AUTH_NOT_CONFIGURED"
          ? "El acceso todavía no está configurado. Inténtalo más tarde."
          : "No se pudo completar la solicitud. Inténtalo de nuevo.",
    },
    503,
  );
}
export function requireSameOrigin(request, multipart = false) {
  const expected = authConfig().origin;
  if (
    request.headers.get("origin") !== expected ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError("Solicitud no permitida.", 403);
  if (
    !request.headers
      .get("content-type")
      ?.startsWith(multipart ? "multipart/form-data" : "application/json")
  )
    throw new ApiError("Formato de solicitud no permitido.", 415);
}
export async function readBody(request, schema) {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Solicitud vacía.");
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new ApiError("Solicitud demasiado grande.", 413);
    }
    chunks.push(value);
  }
  let input;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ApiError("Solicitud no válida.");
  }
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] || "form";
      fields[key] ??= issue.message;
    }
    throw new ApiError("Revisa los campos indicados.", 422, fields);
  }
  return result.data;
}
function digest(value) {
  return createHmac("sha256", authConfig().pepper).update(value).digest("hex");
}
export async function rateLimit(admin, request, action, identifier = "") {
  const rawIp =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
      : "local-development";
  const buckets = [
    {
      key: digest(`ip:${rawIp || "unknown"}:${action}`),
      limit: action === "login" ? 30 : 12,
    },
  ];
  if (identifier)
    buckets.push({
      key: digest(`identity:${identifier}:${action}`),
      limit: action === "login" ? 10 : 5,
    });
  for (const bucket of buckets) {
    const { data, error } = await admin.rpc("consume_auth_limit", {
      p_key: bucket.key,
      p_limit: bucket.limit,
      p_seconds: 900,
    });
    if (error) throw new Error("RATE_LIMIT_UNAVAILABLE");
    if (!data)
      throw new ApiError(
        "Demasiados intentos. Espera 15 minutos y vuelve a probar.",
        429,
      );
  }
}
export async function markRecovery(userId) {
  const config = authConfig();
  const value = `${userId}.${Date.now() + 15 * 60 * 1000}`;
  (await cookies()).set("hb-recovery", `${value}.${digest(value)}`, {
    httpOnly: true,
    secure: config.secure,
    sameSite: "strict",
    path: "/",
    maxAge: 900,
  });
}
export async function requireRecovery(userId) {
  const value = (await cookies()).get("hb-recovery")?.value || "";
  const [id, expires, signature] = value.split(".");
  const expected = Buffer.from(digest(`${id}.${expires}`));
  const actual = Buffer.from(signature || "");
  if (
    id !== userId ||
    !Number.isFinite(Number(expires)) ||
    Number(expires) < Date.now() ||
    actual.length !== expected.length ||
    !timingSafeEqual(expected, actual)
  )
    throw new ApiError(
      "Abre un enlace de recuperación válido para cambiar la contraseña.",
      403,
    );
}
export async function clearRecovery() {
  (await cookies()).delete("hb-recovery");
}
