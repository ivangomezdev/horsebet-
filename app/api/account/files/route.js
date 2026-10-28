import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { z } from "zod";
import { accountAccess } from "../../../../lib/account/server";
import { adminClient } from "../../../../lib/auth/server";
import {
  requireSameOrigin,
  readBody,
  response,
  failure,
  ApiError,
  rateLimit,
} from "../../../../lib/auth/security";
export const runtime = "nodejs";
const maxBytes = 3 * 1024 * 1024;
export async function POST(request) {
  try {
    requireSameOrigin(request, true);
    const { user, profile } = await accountAccess();
    if (!profile.onboarding_completed)
      throw new ApiError("Completa tu perfil antes de continuar.", 403);
    const admin = adminClient();
    await rateLimit(admin, request, "files", user.id);
    const reader = request.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > maxBytes + 16384) {
        await reader.cancel();
        throw new ApiError("La imagen debe pesar menos de 3 MB.", 413);
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") },
    }).formData();
    const file = form.get("file"),
      kind = form.get("kind");
    if (
      !["identity_front", "identity_back", "proof_address"].includes(kind) ||
      !file ||
      typeof file === "string" ||
      !["image/jpeg", "image/png"].includes(file.type) ||
      file.size > maxBytes ||
      file.size === 0
    )
      throw new ApiError("Selecciona una imagen JPG o PNG de hasta 3 MB.", 422);
    let image;
    try {
      image = await sharp(Buffer.from(await file.arrayBuffer()), {
        limitInputPixels: 20000000,
      })
        .rotate()
        .resize({
          width: 2400,
          height: 2400,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 90 })
        .toBuffer();
    } catch {
      throw new ApiError("La imagen no es válida o es demasiado grande.", 422);
    }
    if (image.length > maxBytes)
      throw new ApiError("La imagen procesada excede el límite.", 413);
    const path = `${user.id}/${randomUUID()}.webp`;
    const stored = await admin.storage
      .from("account-documents")
      .upload(path, image, {
        contentType: "image/webp",
        cacheControl: "0",
        upsert: false,
      });
    if (stored.error) throw new Error("STORAGE_UNAVAILABLE");
    const recorded = await admin.rpc("register_account_file", {
      p_user_id: user.id,
      p_kind: kind,
      p_path: path,
      p_size: image.length,
    });
    if (recorded.error) {
      await admin.storage.from("account-documents").remove([path]);
      throw new ApiError(
        "No se pudo registrar la imagen. Guarda primero tus datos y revisa el estado del KYC.",
        409,
      );
    }
    return response({ ok: true, id: recorded.data });
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request) {
  try {
    requireSameOrigin(request);
    const { id } = await readBody(
      request,
      z.object({ id: z.string().uuid() }).strict(),
    );
    const { user } = await accountAccess();
    const admin = adminClient();
    const { data, error } = await admin.rpc("list_account_files", {
      p_user_id: user.id,
    });
    if (error) throw new Error("FILES_UNAVAILABLE");
    const file = data.find((item) => item.id === id);
    if (!file) throw new ApiError("Archivo no encontrado.", 404);
    const signed = await admin.storage
      .from("account-documents")
      .createSignedUrl(file.object_path, 60);
    if (signed.error) throw new Error("LINK_UNAVAILABLE");
    return response({ url: signed.data.signedUrl });
  } catch (error) {
    return failure(error);
  }
}
