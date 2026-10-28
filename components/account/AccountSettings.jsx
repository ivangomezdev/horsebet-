"use client";
import { useState } from "react";
import {
  Mail,
  Phone,
  Pencil,
  BadgeCheck,
  LockKeyhole,
  Shield,
} from "lucide-react";
import { FeatureDialog } from "../features/Shared";
import CountryField from "../auth/CountryField";
import { apiRequest } from "../auth/AuthProvider";

function AccountRow({ title, description, children }) {
  return (
    <section className="account-row">
      <div className="account-row__description">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="account-row__controls">{children}</div>
    </section>
  );
}
export function HorseAvatar({ variant = "red", className = "" }) {
  return (
    <span
      className={`horse-avatar horse-avatar--${variant} ${className}`}
      aria-hidden="true"
    />
  );
}
export default function AccountSettings({ data, canEdit, onSaved }) {
  const [editing, setEditing] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [country, setCountry] = useState(""),
    [avatar, setAvatar] = useState("red");
  const profile = data?.profile;
  const open = (section) => {
    setEditing(section);
    setError("");
    setCountry(profile?.country_code || "");
    setAvatar(profile?.avatar || "red");
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    let body,
      path = "/api/account/settings/";
    if (editing === "profile")
      body = { section: "profile", username: form.get("username"), avatar };
    if (editing === "phone")
      body = { section: "phone", country, phone: form.get("phone") };
    if (editing === "email") {
      path = "/api/account/security/";
      body = { action: "email", email: form.get("email") };
    }
    if (editing === "password") {
      path = "/api/account/security/";
      body = {
        action: "password",
        currentPassword: form.get("currentPassword"),
        password: form.get("password"),
      };
      if (body.password !== form.get("confirmation")) {
        setError("Las contraseñas no coinciden.");
        setBusy(false);
        return;
      }
    }
    try {
      const result = await apiRequest(path, body);
      setEditing(null);
      await onSaved(result.message);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  const preference = async (name, checked) => {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/api/account/settings/", {
        section: "preferences",
        emailPromotions: profile.email_promotions,
        smsPromotions: profile.sms_promotions,
        [name]: checked,
      });
      await onSaved("Preferencias guardadas.");
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {error && !editing && (
        <p className="account-message account-message--error" role="alert">
          {error}
        </p>
      )}
      <AccountRow
        title="Información del perfil"
        description="Configura tu avatar y apodo para personalizar tu identidad en la plataforma."
      >
        <div className="account-profile">
          <button
            className="button button--secondary"
            disabled={!canEdit}
            onClick={() => open("profile")}
          >
            Editar
          </button>
          <span>
            <HorseAvatar variant={profile?.avatar} />
            <strong>{profile?.username || "Tu usuario"}</strong>
          </span>
        </div>
      </AccountRow>
      <AccountRow
        title="Email"
        description="Configura el correo electrónico para acceder a tu cuenta desde cualquier dispositivo."
      >
        <div className="account-field-heading">
          <span>Email</span>
          {data && (
            <span className="account-status account-status--success">
              <BadgeCheck size={14} /> Verificado
            </span>
          )}
        </div>
        <div className="account-input-display">
          <Mail size={17} />
          <span>{data?.email || "Tu correo electrónico"}</span>
          <button disabled={!canEdit} onClick={() => open("email")}>
            Cambiar
          </button>
        </div>
        <label className="account-checkbox">
          <input
            type="checkbox"
            disabled={!canEdit || busy}
            checked={profile?.email_promotions || false}
            onChange={(event) =>
              preference("emailPromotions", event.target.checked)
            }
          />
          Recibir promociones por correo electrónico
        </label>
      </AccountRow>
      <AccountRow
        title="Número de teléfono"
        description="Administra tu número de contacto. Cambiarlo restablece su estado de verificación."
      >
        <div className="account-field-heading">
          <span>Número de teléfono</span>
          <span
            className={`account-status ${profile?.phone_verified_at ? "account-status--success" : "account-status--pending"}`}
          >
            {profile?.phone_verified_at ? "Verificado" : "Sin verificar"}
          </span>
        </div>
        <div className="account-input-display">
          <Phone size={17} />
          <span>{profile?.phone_e164 || "Añade tu número de teléfono"}</span>
          <button
            disabled={!canEdit}
            aria-label="Editar teléfono"
            onClick={() => open("phone")}
          >
            <Pencil size={16} />
          </button>
        </div>
        <label className="account-checkbox">
          <input
            type="checkbox"
            disabled={!canEdit || busy}
            checked={profile?.sms_promotions || false}
            onChange={(event) =>
              preference("smsPromotions", event.target.checked)
            }
          />
          Recibir promociones por SMS
        </label>
      </AccountRow>
      <AccountRow
        title="Contraseña"
        description="Usa una contraseña única para proteger el acceso a tu cuenta."
      >
        <div className="account-input-display">
          <LockKeyhole size={17} />
          <span>••••••••••••</span>
          <button disabled={!canEdit} onClick={() => open("password")}>
            Cambiar contraseña
          </button>
        </div>
        <p className="account-note">
          Si accedes con Google, puedes crear una contraseña usando la
          recuperación por correo.
        </p>
      </AccountRow>
      <AccountRow
        title="Seguridad de la cuenta"
        description="Gestiona tus dispositivos y consulta el estado de tu verificación."
      >
        <div className="account-security-links">
          <a className="button button--secondary" href="/es/sessions/">
            <Shield size={17} /> Ver sesiones
          </a>
          <a className="button button--secondary" href="/es/kyc/">
            <BadgeCheck size={17} /> Verificación KYC
          </a>
        </div>
      </AccountRow>
      {editing && (
        <FeatureDialog
          title={
            {
              profile: "Editar perfil",
              phone: "Número de teléfono",
              email: "Cambiar email",
              password: "Cambiar contraseña",
            }[editing]
          }
          onClose={() => setEditing(null)}
        >
          <form className="feature-form" onSubmit={submit}>
            {editing === "profile" && (
              <>
                <div className="avatar-options" aria-label="Elige tu avatar">
                  {["red", "gold", "blue"].map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      className={
                        variant === avatar
                          ? "avatar-options__choice avatar-options__choice--active"
                          : "avatar-options__choice"
                      }
                      aria-label={`Caballo ${variant === "red" ? "rojo" : variant === "gold" ? "dorado" : "azul"}`}
                      aria-pressed={variant === avatar}
                      onClick={() => setAvatar(variant)}
                    >
                      <HorseAvatar variant={variant} />
                    </button>
                  ))}
                </div>
                <label>
                  Nombre de usuario
                  <input
                    name="username"
                    defaultValue={profile.username}
                    minLength={3}
                    maxLength={24}
                    pattern="[a-zA-Z0-9][a-zA-Z0-9_]{2,23}"
                    required
                    autoComplete="username"
                  />
                </label>
              </>
            )}
            {editing === "phone" && (
              <>
                <CountryField value={country} onChange={setCountry} />
                <label>
                  Teléfono
                  <input
                    name="phone"
                    defaultValue={profile.phone_e164 || ""}
                    type="tel"
                    autoComplete="tel"
                    required
                    maxLength={30}
                  />
                </label>
                <small>Guardar el número no lo marca como verificado.</small>
              </>
            )}
            {editing === "email" && (
              <>
                <label>
                  Nuevo email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
                <p>
                  Recibirás instrucciones para confirmar el cambio. Tu correo
                  actual seguirá activo hasta completarlo.
                </p>
              </>
            )}
            {editing === "password" && (
              <>
                <label>
                  Contraseña actual
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                  />
                </label>
                <label>
                  Nueva contraseña
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
                <label>
                  Repite la nueva contraseña
                  <input
                    name="confirmation"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                </label>
              </>
            )}
            {error && (
              <p className="auth-form-new__error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button button--primary"
              disabled={busy}
              type="submit"
            >
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </FeatureDialog>
      )}
    </>
  );
}
