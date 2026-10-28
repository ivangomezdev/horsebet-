import { z } from "zod";
import { accountAccess } from "../../../lib/account/server";
import {
  ApiError,
  response,
  failure,
  readBody,
  requireSameOrigin,
} from "../../../lib/auth/security";
import { currencyByCode } from "../../../data/currencies";
import { parseCurrencyAmount } from "../../../lib/account/member";
const coin = z.enum(Object.keys(currencyByCode));
const schema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("preferences"),
      currency: coin,
      hideZero: z.boolean(),
      includeVault: z.boolean(),
    })
    .strict(),
  z.object({ action: z.literal("read"), id: z.uuid().nullable() }).strict(),
  z
    .object({
      action: z.literal("vault"),
      currency: coin,
      amount: z.string().max(40),
      direction: z.enum(["in", "out"]),
      key: z.uuid(),
    })
    .strict(),
]);
export async function GET() {
  try {
    const { client } = await accountAccess();
    const { data, error } = await client.rpc("get_member_overview");
    if (error) throw error;
    return response(data);
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request) {
  try {
    requireSameOrigin(request);
    const input = await readBody(request, schema);
    const { client } = await accountAccess();
    let result;
    if (input.action === "preferences")
      result = await client.rpc("save_member_preferences", {
        p_currency: input.currency,
        p_hide_zero: input.hideZero,
        p_include_vault: input.includeVault,
      });
    if (input.action === "read")
      result = await client.rpc("read_member_notifications", {
        p_id: input.id,
      });
    if (input.action === "vault") {
      let amount;
      try {
        amount = parseCurrencyAmount(input.amount, input.currency);
      } catch (error) {
        throw new ApiError(error.message);
      }
      result = await client.rpc("move_vault_funds", {
        p_currency: input.currency,
        p_amount: amount,
        p_direction: input.direction,
        p_key: input.key,
      });
    }
    if (result.error?.message?.includes("Insufficient balance"))
      throw new ApiError("Saldo insuficiente.");
    if (result.error) throw result.error;
    return response({ ok: true });
  } catch (error) {
    return failure(error);
  }
}
