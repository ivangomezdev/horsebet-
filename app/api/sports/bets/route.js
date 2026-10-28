import { accountAccess } from "../../../../lib/account/server";
import { authConfigured } from "../../../../lib/auth/config";
import {
  ApiError,
  failure,
  requireSameOrigin,
} from "../../../../lib/auth/security";

export async function POST(request) {
  try {
    if (!authConfigured())
      throw new ApiError("Debes estar registrado para realizar apuestas.", 401);
    requireSameOrigin(request);
    await accountAccess();
    // Fail closed until an authorized sportsbook can accept and settle wagers.
    // Do not write a local receipt or alter balances for unaccepted selections.
    throw new ApiError(
      "El servicio de apuestas deportivas todavía no está habilitado. No se ha realizado ninguna apuesta.",
      503,
    );
  } catch (error) {
    if (error.status === 401)
      return failure(
        new ApiError("Debes estar registrado para realizar apuestas.", 401),
      );
    return failure(error);
  }
}
