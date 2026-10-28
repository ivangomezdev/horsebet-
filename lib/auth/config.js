import "server-only";
export function authConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_PUBLISHABLE_KEY &&
    process.env.SUPABASE_SECRET_KEY &&
    process.env.AUTH_RATE_LIMIT_SECRET?.length >= 32 &&
    process.env.APP_URL,
  );
}
export function authConfig() {
  if (!authConfigured()) throw new Error("AUTH_NOT_CONFIGURED");
  const origin = new URL(process.env.APP_URL).origin;
  if (
    process.env.NODE_ENV === "production" &&
    !origin.startsWith("https://") &&
    !origin.startsWith("http://127.0.0.1:") &&
    !origin.startsWith("http://localhost:")
  )
    throw new Error("AUTH_INVALID_ORIGIN");
  return {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_PUBLISHABLE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    origin,
    secure: origin.startsWith("https://"),
    pepper: process.env.AUTH_RATE_LIMIT_SECRET,
    google: process.env.AUTH_GOOGLE_ENABLED === "true",
    emailEnabled: process.env.AUTH_EMAIL_ENABLED === "true",
  };
}
