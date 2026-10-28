import { z } from "zod";
import {
  usernameSchema,
  countryCodes,
  normalizedPhone,
} from "../auth/validation.js";
export const settingsSchema = z.discriminatedUnion("section", [
  z
    .object({
      section: z.literal("profile"),
      username: usernameSchema,
      avatar: z.enum(["red", "gold", "blue"]),
    })
    .strict(),
  z
    .object({
      section: z.literal("preferences"),
      emailPromotions: z.boolean(),
      smsPromotions: z.boolean(),
    })
    .strict(),
  z
    .object({
      section: z.literal("phone"),
      country: z.enum(countryCodes),
      phone: z.string().min(5).max(30),
    })
    .strict()
    .refine((value) => Boolean(normalizedPhone(value.phone, value.country)), {
      message: "Introduce un teléfono válido.",
      path: ["phone"],
    }),
]);
export function validAdultBirthDate(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return false;
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  if (
    now.getUTCMonth() < date.getUTCMonth() ||
    (now.getUTCMonth() === date.getUTCMonth() &&
      now.getUTCDate() < date.getUTCDate())
  )
    age--;
  return age >= 18 && age <= 120;
}
export const kycSchema = z
  .object({
    fullName: z.string().trim().min(3).max(120),
    birthDate: z
      .string()
      .refine(
        (value) => validAdultBirthDate(value),
        "Debes tener al menos 18 años e indicar una fecha válida.",
      ),
    country: z.enum(countryCodes),
    address: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(100),
    postalCode: z.string().trim().min(2).max(20),
    politicallyExposed: z.boolean(),
  })
  .strict();
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    password: z.string().min(12).max(128),
  })
  .strict();
export const emailChangeSchema = z
  .object({ email: z.string().trim().toLowerCase().email().max(254) })
  .strict();
export function formatAtomic(value, decimals = 6, precision = 2) {
  try {
    const amount = BigInt(value);
    const negative = amount < 0n;
    const abs = negative ? -amount : amount;
    const base = 10n ** BigInt(decimals);
    const whole = (abs / base).toLocaleString("es-MX");
    const fraction = (abs % base)
      .toString()
      .padStart(decimals, "0")
      .slice(0, precision)
      .padEnd(precision, "0");
    return `${negative ? "-" : ""}${whole}${precision ? "." + fraction : ""}`;
  } catch {
    return "—";
  }
}
