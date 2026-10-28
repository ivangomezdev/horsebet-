import { authConfigured } from "../../../../lib/auth/config";
import { response } from "../../../../lib/auth/security";
import { countryCodes } from "../../../../lib/auth/validation";
export function GET(request) {
  const inferred =
    process.env.VERCEL === "1"
      ? request.headers.get("x-vercel-ip-country")
      : process.env.NODE_ENV !== "production"
        ? process.env.DEV_COUNTRY
        : null;
  const country = countryCodes.includes(inferred) ? inferred : null;
  return response({
    configured: authConfigured(),
    googleEnabled:
      authConfigured() && process.env.AUTH_GOOGLE_ENABLED === "true",
    emailEnabled: authConfigured() && process.env.AUTH_EMAIL_ENABLED === "true",
    country,
    countrySource: country ? "location" : null,
  });
}
