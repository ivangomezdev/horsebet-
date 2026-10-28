import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

if (existsSync(".env.local")) loadEnvFile(".env.local");
const issues = [];
const env = process.env;
for (const name of [
  "APP_URL",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "AUTH_RATE_LIMIT_SECRET",
  "KYC_ENCRYPTION_KEY",
]) {
  if (!env[name]) issues.push(`Falta ${name}.`);
}
for (const name of ["APP_URL", "SUPABASE_URL"]) {
  if (!env[name]) continue;
  try {
    const url = new URL(env[name]);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== "/"
    )
      throw new Error();
    if (
      url.protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(url.hostname)
    )
      throw new Error();
  } catch {
    issues.push(`${name} debe ser un origen HTTPS (HTTP solo para localhost).`);
  }
}
if (env.AUTH_RATE_LIMIT_SECRET && env.AUTH_RATE_LIMIT_SECRET.length < 32)
  issues.push("AUTH_RATE_LIMIT_SECRET necesita al menos 32 caracteres.");
if (
  env.KYC_ENCRYPTION_KEY &&
  (Buffer.from(env.KYC_ENCRYPTION_KEY, "base64").length !== 32 ||
    Buffer.from(env.KYC_ENCRYPTION_KEY, "base64").toString("base64") !==
      env.KYC_ENCRYPTION_KEY)
)
  issues.push(
    "KYC_ENCRYPTION_KEY debe codificar exactamente 32 bytes en base64.",
  );
if (
  env.AUTH_GOOGLE_ENABLED &&
  !["true", "false"].includes(env.AUTH_GOOGLE_ENABLED)
)
  issues.push("AUTH_GOOGLE_ENABLED debe ser true o false.");
if (
  env.SUPABASE_SECRET_KEY &&
  env.SUPABASE_SECRET_KEY === env.SUPABASE_PUBLISHABLE_KEY
)
  issues.push(
    "Las claves publicable y secreta de Supabase deben ser distintas.",
  );
if (issues.length) {
  console.error(
    "Configuración pendiente (no se muestran valores):\n" +
      issues.map((item) => `- ${item}`).join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    "Formato de variables correcto. Comprueba las migraciones, SMTP y Google en Supabase; este comando no valida credenciales ni conectividad.",
  );
}
