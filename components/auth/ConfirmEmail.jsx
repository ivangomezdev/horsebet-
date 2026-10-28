"use client";
import { useState } from "react";
import Brand from "../Brand";
import { apiRequest } from "./AuthProvider";
export default function ConfirmEmail({ tokenHash, type }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const verify = async () => {
    setBusy(true);
    try {
      const result = await apiRequest("/api/auth/verify/", { tokenHash, type });
      window.location.replace(result.next);
    } catch (problem) {
      setError(problem.message);
      setBusy(false);
    }
  };
  return (
    <main className="auth-confirm">
      <Brand />
      <section>
        <h1>
          {type === "recovery" ? "Recupera tu cuenta" : "Confirma tu correo"}
        </h1>
        <p>Continúa para validar tu enlace seguro de HorseBet.</p>
        {error && <p role="alert">{error}</p>}
        <button
          className="button button--primary"
          disabled={busy || !tokenHash}
          onClick={verify}
        >
          {busy ? "Validando…" : "Continuar"}
        </button>
        <a href="/es/?modal=LoginRegistration&data=tab-1">Volver al inicio</a>
      </section>
    </main>
  );
}
