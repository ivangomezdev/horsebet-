import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function keyFrom(value) {
  const key = Buffer.from(value || "", "base64");
  if (key.length !== 32) throw new Error("KYC_KEY_NOT_CONFIGURED");
  return key;
}
export function encryptKyc(
  value,
  userId,
  key = process.env.KYC_ENCRYPTION_KEY,
) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFrom(key), iv);
  cipher.setAAD(Buffer.from(userId));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64"),
    cipher.getAuthTag().toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}
export function decryptKyc(
  value,
  userId,
  key = process.env.KYC_ENCRYPTION_KEY,
) {
  if (!value) return null;
  const [version, iv, tag, data] = value.split(".");
  if (version !== "v1") throw new Error("INVALID_KYC_VERSION");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    keyFrom(key),
    Buffer.from(iv, "base64"),
  );
  decipher.setAAD(Buffer.from(userId));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return JSON.parse(
    Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8"),
  );
}
