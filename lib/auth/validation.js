import { z } from "zod";
import {
  getCountries,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

export const countryCodes = getCountries();
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9][a-z0-9_]{2,23}$/,
    "Usa entre 3 y 24 letras, números o guiones bajos.",
  );
export const passwordSchema = z
  .string()
  .min(12, "Usa al menos 12 caracteres.")
  .max(128, "Usa un máximo de 128 caracteres.");
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .email("Introduce un correo válido.");
const profileFields = {
  username: usernameSchema,
  country: z.enum(countryCodes, { error: "Selecciona tu país." }),
  phone: z.string().trim().max(30).optional().default(""),
  referral: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9_-]*$/, "Código no válido.")
    .optional()
    .default(""),
  accepted: z.literal(true, {
    error: "Confirma que tienes 18 años y acepta las condiciones.",
  }),
};
function validatePhone(value, ctx) {
  if (!value.phone) return;
  const phone = parsePhoneNumberFromString(value.phone, value.country);
  if (!phone?.isValid() || (phone.country && phone.country !== value.country))
    ctx.addIssue({
      code: "custom",
      path: ["phone"],
      message: "Revisa el teléfono y el país seleccionado.",
    });
}
export const profileSchema = z
  .object(profileFields)
  .strict()
  .superRefine(validatePhone);
export const registerSchema = z
  .object({ ...profileFields, email: emailSchema, password: passwordSchema })
  .strict()
  .superRefine(validatePhone);
export const loginSchema = z
  .object({
    identifier: z.string().trim().min(3).max(254).toLowerCase(),
    password: z.string().min(1).max(128),
  })
  .strict();
export const emailRequestSchema = z.object({ email: emailSchema }).strict();
export const resetSchema = z.object({ password: passwordSchema }).strict();
export const verificationSchema = z
  .object({
    tokenHash: z
      .string()
      .min(20)
      .max(512)
      .regex(/^[a-zA-Z0-9_-]+$/),
    type: z.enum(["signup", "recovery", "email", "email_change"]),
  })
  .strict();
export const oauthSchema = z
  .object({ next: z.string().max(500).optional() })
  .strict();
export function normalizedPhone(phone, country) {
  const parsed = phone ? parsePhoneNumberFromString(phone, country) : null;
  return parsed?.isValid() && (!parsed.country || parsed.country === country)
    ? parsed.number
    : null;
}
export function safeReturnTo(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/es/";
  try {
    const url = new URL(value, "https://horsebet.invalid");
    if (
      url.origin !== "https://horsebet.invalid" ||
      !/^\/(es(\/|$)|$)/.test(url.pathname)
    )
      return "/es/";
    return url.pathname;
  } catch {
    return "/es/";
  }
}
export function countryFromLocale(locale) {
  try {
    const region = new Intl.Locale(locale).region;
    return countryCodes.includes(region) ? region : null;
  } catch {
    return null;
  }
}
