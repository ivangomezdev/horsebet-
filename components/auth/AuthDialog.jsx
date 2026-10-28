"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  X,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  UserRound,
  ChevronDown,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import Brand from "../Brand";
import CountryField from "./CountryField";
import { apiRequest } from "./AuthProvider";
import { countryFromLocale } from "../../lib/auth/validation";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.03v2.52h3.23c1.89-1.74 2.99-4.31 2.99-7.38Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.61-2.39l-3.23-2.52c-.89.6-2.03.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.93A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.93V7.48H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.52l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.48l3.34 2.59C7.2 7.71 9.4 5.95 12 5.95Z"
      />
    </svg>
  );
}
export default function AuthDialog({
  mode,
  onMode,
  onClose,
  onAuthenticated,
  notice,
}) {
  const dialog = useRef(null),
    id = useId();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [fields, setFields] = useState({}),
    [message, setMessage] = useState(notice),
    [showPassword, setShowPassword] = useState(false),
    [legal, setLegal] = useState(false);
  const [config, setConfig] = useState(null),
    [country, setCountry] = useState(""),
    [manualCountry, setManualCountry] = useState(false),
    [countryHint, setCountryHint] = useState("");
  const registration = mode === "register",
    complete = mode === "complete",
    profileFields = registration || complete,
    recovery = mode === "recover" || mode === "resend",
    reset = mode === "reset";
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    let active = true;
    apiRequest("/api/auth/config/", undefined, "GET")
      .then((data) => {
        if (!active) return;
        setConfig(data);
        if (!manualCountry) {
          const detected =
            data.country || countryFromLocale(navigator.language);
          setCountry(detected || "");
          setCountryHint(
            data.country
              ? "País sugerido por tu ubicación aproximada."
              : detected
                ? "País sugerido por el idioma del navegador."
                : "Selecciona el país de tu teléfono.",
          );
        }
      })
      .catch(() => {
        if (active) setConfig({ configured: false });
      });
    return () => {
      active = false;
    };
  }, [manualCountry]);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setFields({});
    setMessage("");
    const form = new FormData(event.currentTarget);
    let action = mode,
      body;
    if (profileFields) {
      body = {
        username: form.get("username"),
        country,
        phone: form.get("phone") || "",
        referral: form.get("referral") || "",
        accepted: form.get("accepted") === "on",
      };
      if (registration) {
        body.email = form.get("email");
        body.password = form.get("password");
      } else action = "complete-profile";
    } else if (recovery) body = { email: form.get("email") };
    else if (reset) {
      action = "password";
      body = { password: form.get("password") };
      if (body.password !== form.get("confirmation")) {
        setError("Las contraseñas no coinciden.");
        setBusy(false);
        return;
      }
    } else
      body = {
        identifier: form.get("identifier"),
        password: form.get("password"),
      };
    try {
      const result = await apiRequest(`/api/auth/${action}/`, body);
      if (registration && result.authenticated) {
        await onAuthenticated();
      } else if (registration || recovery) {
        setMessage(result.message);
        event.target.reset();
      } else if (reset) {
        await onAuthenticated();
        onMode("login");
      } else await onAuthenticated();
    } catch (problem) {
      setError(problem.message);
      setFields(problem.fields || {});
    } finally {
      setBusy(false);
    }
  };
  const google = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await apiRequest("/api/auth/oauth/", {
        next: window.location.pathname,
      });
      window.location.assign(result.url);
    } catch (problem) {
      setError(problem.message);
      setBusy(false);
    }
  };
  const errorFor = (name) =>
    fields[name] && (
      <small className="auth-field__error" id={`${id}-${name}-error`}>
        {fields[name]}
      </small>
    );
  const title = complete
    ? "Completa tu perfil"
    : reset
      ? "Nueva contraseña"
      : recovery
        ? mode === "resend"
          ? "Confirmar tu correo"
          : "Recuperar contraseña"
        : registration
          ? "Crear cuenta"
          : "Iniciar sesión";
  return (
    <dialog
      className="auth-modal"
      ref={dialog}
      aria-labelledby={`${id}-title`}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== dialog.current) return;
        const box = dialog.current.getBoundingClientRect();
        if (
          event.clientX < box.left ||
          event.clientX > box.right ||
          event.clientY < box.top ||
          event.clientY > box.bottom
        )
          onClose();
      }}
    >
      <button
        className="auth-modal__close"
        onClick={onClose}
        aria-label="Cerrar acceso"
      >
        <X size={19} />
      </button>
      <aside className="auth-modal__visual">
        <Brand />
        <div className="auth-modal__illustration" />
        <div className="auth-modal__pitch">
          <span>BIENVENIDO A HORSEBET</span>
          <h2>
            Tu próxima
            <br />
            gran aventura.
          </h2>
          <p>
            Un mundo de juegos,
            <br />
            una cuenta para explorarlo.
          </p>
          <span className="auth-modal__badge">JUEGA A TU MANERA</span>
        </div>
      </aside>
      <div className="auth-modal__panel">
        {!complete && !reset && !recovery ? (
          <div
            className="auth-modal__tabs"
            role="tablist"
            aria-label="Acceso a HorseBet"
          >
            <button
              role="tab"
              aria-selected={!registration}
              className={
                !registration
                  ? "auth-modal__tab auth-modal__tab--active"
                  : "auth-modal__tab"
              }
              onClick={() => onMode("login")}
            >
              Iniciar sesión
            </button>
            <button
              role="tab"
              aria-selected={registration}
              className={
                registration
                  ? "auth-modal__tab auth-modal__tab--active"
                  : "auth-modal__tab"
              }
              onClick={() => onMode("register")}
            >
              Regístrate
            </button>
          </div>
        ) : null}
        <h2
          id={`${id}-title`}
          className={
            !complete && !reset && !recovery ? "auth-modal__sr-title" : ""
          }
        >
          {title}
        </h2>
        {complete && (
          <p className="auth-modal__intro">
            Elige tu usuario y completa los datos de acceso.
          </p>
        )}
        {recovery && (
          <p className="auth-modal__intro">
            {config?.emailEnabled
              ? "Te enviaremos un enlace seguro a tu correo."
              : "El envío de correos todavía no está disponible. Contacta con soporte si necesitas recuperar tu cuenta."}
          </p>
        )}
        {config && !config.configured && (
          <div className="auth-modal__notice">
            El acceso estará disponible cuando se conecte el servicio de
            autenticación.
          </div>
        )}
        {message && (
          <div className="auth-modal__success" role="status">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}
        <form className="auth-form-new" onSubmit={submit}>
          {profileFields && (
            <label className="auth-field">
              Usuario
              <span className="auth-field__control">
                <UserRound size={17} />
                <input
                  name="username"
                  autoComplete="username"
                  placeholder="Elige tu nombre de usuario"
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[A-Za-z0-9][A-Za-z0-9_]{2,23}"
                  aria-invalid={!!fields.username}
                />
              </span>
              {errorFor("username")}
            </label>
          )}
          {(registration || recovery) && (
            <label className="auth-field">
              Email
              <span className="auth-field__control">
                <Mail size={17} />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Introduce tu email"
                  required
                  maxLength={254}
                  aria-invalid={!!fields.email}
                />
              </span>
              {errorFor("email")}
            </label>
          )}
          {mode === "login" && (
            <label className="auth-field">
              Usuario o email
              <span className="auth-field__control">
                <UserRound size={17} />
                <input
                  name="identifier"
                  autoComplete="username"
                  placeholder="Introduce tu usuario o email"
                  required
                  maxLength={254}
                />
              </span>
            </label>
          )}
          {!recovery && !complete && (
            <label className="auth-field">
              {reset ? "Nueva contraseña" : "Contraseña"}
              <span className="auth-field__control">
                <LockKeyhole size={17} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    registration || reset ? "new-password" : "current-password"
                  }
                  placeholder="Introduce tu contraseña"
                  required
                  minLength={registration || reset ? 12 : 1}
                  maxLength={128}
                  aria-invalid={!!fields.password}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
              {(registration || reset) && (
                <small>Al menos 12 caracteres. Puedes usar una frase.</small>
              )}
              {errorFor("password")}
            </label>
          )}
          {reset && (
            <label className="auth-field">
              Repite tu contraseña
              <span className="auth-field__control">
                <LockKeyhole size={17} />
                <input
                  name="confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={12}
                  maxLength={128}
                />
              </span>
            </label>
          )}
          {profileFields && (
            <>
              <div className="auth-phone">
                <span>Número de teléfono (opcional)</span>
                <div>
                  <CountryField
                    label="País y prefijo"
                    id={`${id}-country`}
                    phonePrefix
                    value={country}
                    onChange={(value) => {
                      setManualCountry(true);
                      setCountry(value);
                    }}
                  />
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel-national"
                    placeholder="Tu número de teléfono"
                    aria-label="Número de teléfono"
                    maxLength={30}
                  />
                </div>
                <small>{countryHint}</small>
                {errorFor("country")}
                {errorFor("phone")}
              </div>
              <details className="auth-referral">
                <summary>
                  Ingresa el código de referencia/promocional{" "}
                  <ChevronDown size={14} />
                </summary>
                <input
                  name="referral"
                  placeholder="Código (opcional)"
                  maxLength={40}
                  aria-label="Código de referencia"
                />
                {errorFor("referral")}
              </details>
              <label className="auth-consent">
                <input name="accepted" type="checkbox" required />
                <span>
                  Confirmo que tengo 18 años y he leído las{" "}
                  <button type="button" onClick={() => setLegal(!legal)}>
                    Condiciones del servicio y privacidad
                  </button>
                  .
                </span>
              </label>
              {legal && (
                <p className="auth-legal">
                  Esta versión permite gestionar tu cuenta y probar la interfaz.
                  No procesa apuestas ni depósitos reales. Los datos de acceso
                  se almacenan en Supabase; tus archivos y datos personales solo
                  son accesibles a tu cuenta y al servicio autorizado. La
                  aprobación KYC requiere revisión independiente. Condiciones de
                  la versión de desarrollo, octubre de 2026.
                </p>
              )}
              {errorFor("accepted")}
            </>
          )}
          {mode === "login" && (
            <button
              className="auth-form-new__forgot"
              type="button"
              onClick={() => onMode("recover")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
          {error && (
            <p className="auth-form-new__error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button--primary auth-form-new__submit"
            disabled={
              busy || !config?.configured || (recovery && !config?.emailEnabled)
            }
            type="submit"
          >
            {busy ? <LoaderCircle className="auth-spinner" size={18} /> : null}
            {complete
              ? "Guardar y continuar"
              : reset
                ? "Guardar contraseña"
                : recovery
                  ? "Enviar enlace"
                  : registration
                    ? "Crear cuenta"
                    : "Iniciar sesión"}
          </button>
        </form>
        {!complete && !reset && !recovery && config?.googleEnabled && (
          <>
            <div className="auth-modal__separator">
              <span />o<span />
            </div>
            <button
              className="auth-modal__google"
              disabled={busy || !config?.googleEnabled}
              onClick={google}
            >
              <GoogleMark /> Continuar con Google
            </button>
            {config?.configured && !config.googleEnabled && (
              <small className="auth-modal__hint">
                Google estará disponible cuando se configure el proveedor.
              </small>
            )}
          </>
        )}
        {mode === "login" && config?.emailEnabled && (
          <button className="auth-modal__text" onClick={() => onMode("resend")}>
            Reenviar correo de confirmación
          </button>
        )}
        {(recovery || reset) && (
          <button className="auth-modal__text" onClick={() => onMode("login")}>
            Volver a iniciar sesión
          </button>
        )}
      </div>
    </dialog>
  );
}
