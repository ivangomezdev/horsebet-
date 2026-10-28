import { accountAccess } from "../../../../lib/account/server";
import { response, failure, ApiError } from "../../../../lib/auth/security";
export async function GET(request) {
  try {
    const { client } = await accountAccess();
    const params = new URL(request.url).searchParams;
    const type = params.get("type") || "transactions";
    const offset = Number(params.get("offset") || 0);
    if (!Number.isInteger(offset) || offset < 0 || offset > 10000)
      throw new ApiError("Página no válida.");
    let result;
    if (type === "transactions") {
      const from = params.get("from"),
        to = params.get("to"),
        kind = params.get("kind") || "all";
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(from || "") ||
        !/^\d{4}-\d{2}-\d{2}$/.test(to || "") ||
        !["all", "credit", "debit"].includes(kind)
      )
        throw new ApiError("Filtros no válidos.");
      const start = new Date(from + "T00:00:00Z"),
        end = new Date(to + "T00:00:00Z");
      end.setUTCDate(end.getUTCDate() + 1);
      if (
        !Number.isFinite(start.getTime()) ||
        !Number.isFinite(end.getTime()) ||
        start >= end
      )
        throw new ApiError("Revisa el intervalo de fechas.");
      result = await client.rpc("my_transactions", {
        p_from: start.toISOString(),
        p_to: end.toISOString(),
        p_type: kind,
        p_offset: offset,
      });
    } else if (type === "games") {
      const category = params.get("category") || "all",
        game = params.get("game") || "all";
      if (category.length > 80 || game.length > 80)
        throw new ApiError("Filtro no válido.");
      result = await client.rpc("my_game_history", {
        p_category: category,
        p_game: game,
        p_offset: offset,
      });
    } else throw new ApiError("Historial no válido.");
    if (result.error) throw new Error("HISTORY_UNAVAILABLE");
    return response({
      items: result.data.slice(0, 20),
      hasMore: result.data.length > 20,
    });
  } catch (error) {
    return failure(error);
  }
}
