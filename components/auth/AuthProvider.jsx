"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import AuthDialog from "./AuthDialog";

const AuthContext = createContext(null);
export async function apiRequest(path, body, method = "POST") {
  const result = await fetch(path, {
    method,
    credentials: "same-origin",
    cache: "no-store",
    headers:
      body instanceof FormData
        ? undefined
        : { "Content-Type": "application/json" },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });
  let data;
  try {
    data = await result.json();
  } catch {
    throw new Error("El servidor no está disponible. Inténtalo de nuevo.");
  }
  if (!result.ok) {
    const error = new Error(data.error || "No se pudo completar la solicitud.");
    error.fields = data.fields;
    error.status = result.status;
    throw error;
  }
  return data;
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [configured, setConfigured] = useState(false),
    [mode, setMode] = useState(null),
    [notice, setNotice] = useState("");
  const pending = useRef(null);
  const generation = useRef(0);
  const pathname = usePathname();
  const refresh = useCallback(() => {
    if (pending.current) return pending.current;
    const requestGeneration = generation.current;
    pending.current = apiRequest("/api/auth/session/", undefined, "GET")
      .then((data) => {
        if (requestGeneration !== generation.current) return null;
        setUser(data.user);
        setConfigured(data.configured);
        if (data.user && !data.user.onboardingCompleted) setMode("complete");
        return data.user;
      })
      .catch(() => {
        if (requestGeneration !== generation.current) return null;
        setUser(null);
        return null;
      })
      .finally(() => {
        if (requestGeneration !== generation.current) return;
        setLoading(false);
        pending.current = null;
      });
    return pending.current;
  }, []);
  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 240000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(timer);
    };
  }, [refresh]);
  useEffect(() => {
    const url = new URL(window.location.href);
    const action = url.searchParams.get("auth");
    if (url.searchParams.get("modal") === "LoginRegistration")
      setMode(url.searchParams.get("data") === "tab-2" ? "register" : "login");
    if (action === "reset") setMode("reset");
    if (action === "confirmed") {
      setNotice("Correo confirmado. Ya puedes acceder a tu cuenta.");
      refresh();
    }
    if (action === "email-updated") {
      setNotice(
        "Enlace confirmado. Si solicitaste cambiar el correo, confirma también el enlace enviado a la otra dirección.",
      );
      setMode("login");
      refresh();
    }
    if (action === "error") {
      setMode("login");
      setNotice("No se pudo completar el acceso. Vuelve a intentarlo.");
    }
    if (action || url.searchParams.has("modal")) {
      ["auth", "modal", "data"].forEach((key) => url.searchParams.delete(key));
      window.history.replaceState(
        null,
        "",
        url.pathname + url.search + url.hash,
      );
    }
  }, [pathname, refresh]);
  const openAuth = useCallback((next) => {
    setNotice("");
    setMode(next);
  }, []);
  const logout = async () => {
    await apiRequest("/api/auth/logout/", {});
    generation.current++;
    pending.current = null;
    setUser(null);
    setMode(null);
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, configured, refresh, openAuth, logout }}
    >
      {children}
      {mode && (
        <AuthDialog
          key={mode}
          mode={mode}
          notice={notice}
          onMode={setMode}
          onClose={() => {
            setMode(null);
            setNotice("");
          }}
          onAuthenticated={async () => {
            generation.current++;
            pending.current = null;
            const current = await refresh();
            if (current?.onboardingCompleted) setMode(null);
          }}
        />
      )}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
