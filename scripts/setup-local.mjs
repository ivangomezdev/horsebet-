import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const target = new URL("../.env.local", import.meta.url);
let template = await readFile(
  new URL("../.env.example", import.meta.url),
  "utf8",
);
template = template
  .replace(
    /^AUTH_RATE_LIMIT_SECRET=$/m,
    `AUTH_RATE_LIMIT_SECRET=${randomBytes(32).toString("hex")}`,
  )
  .replace(
    /^KYC_ENCRYPTION_KEY=$/m,
    `KYC_ENCRYPTION_KEY=${randomBytes(32).toString("base64")}`,
  );
try {
  await writeFile(target, template, { flag: "wx", mode: 0o600 });
  console.log(
    ".env.local creado. Las claves locales se generaron sin mostrarlas. Completa las tres variables de Supabase siguiendo docs/auth-and-vercel.md.",
  );
} catch (error) {
  if (error.code !== "EEXIST") throw error;
  console.log(".env.local ya existe; se conserva sin cambios.");
}
