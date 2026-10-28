export const SUPPORT_REPLY =
  "Gracias por contactar con el soporte de HorseBet. Un agente de soporte se pondrá en contacto contigo pronto. Agradecemos tu paciencia y la espera.";
export const SUPPORT_GREETING =
  "¡Hola! Soy el asistente de HorseBet. Cuéntanos en qué podemos ayudarte.";
export function cleanSupportDraft(value) {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}
export function restoreSupportMessages(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        ["user", "automatic"].includes(item.sender) &&
        typeof item.text === "string" &&
        item.text.length <= 2000 &&
        typeof item.created_at === "string" &&
        Number.isFinite(Date.parse(item.created_at)),
    )
    .slice(-60);
}
