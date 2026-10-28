import { z } from "zod";
import { accountAccess } from "../../../lib/account/server";
import {
  ApiError,
  response,
  failure,
  readBody,
  requireSameOrigin,
} from "../../../lib/auth/security";

const schema = z
  .object({ id: z.uuid(), message: z.string().trim().min(1).max(2000) })
  .strict();
const publicMessage = ({ id, sender, text, created_at }) => ({
  id,
  sender,
  text,
  created_at,
});
export async function GET() {
  try {
    const { client, user } = await accountAccess();
    const { data, error } = await client
      .from("support_messages")
      .select("id,sender,text,created_at")
      .eq("user_id", user.id)
      .order("message_order", { ascending: false })
      .limit(100);
    if (error) throw new Error("SUPPORT_UNAVAILABLE");
    return response({ messages: data.reverse() });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request) {
  try {
    requireSameOrigin(request);
    const input = await readBody(request, schema);
    const { client } = await accountAccess();
    const { data, error } = await client.rpc("send_support_message", {
      p_request_id: input.id,
      p_text: input.message,
    });
    if (error?.message?.includes("SUPPORT_RATE_LIMIT"))
      throw new ApiError(
        "Has enviado muchos mensajes. Espera unos minutos antes de continuar.",
        429,
      );
    if (error) throw new Error("SUPPORT_UNAVAILABLE");
    return response({ messages: data.map(publicMessage) });
  } catch (error) {
    return failure(error);
  }
}
